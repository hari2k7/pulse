import type {
  ApiErrorKind,
  EventDetail,
  EventSummary,
  GetEventOptions,
  GetEventsOptions,
  GetEventsResult,
} from './types';
import { checkDevSimulation, getSimMode, SimulatedApiError } from './sim';

export const API_BASE_URL = 'https://render72.pages.dev';
export const LOCAL_STORAGE_KEY = 'strange_events_cache';
const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2; // Initial attempt + up to 2 retries = 3 attempts total

// Circuit breaker parameters per Section 7 & Task 1
const CIRCUIT_THRESHOLD = 3;
const CIRCUIT_COOLDOWN_MS = 15000;

let consecutiveFailures = 0;
let circuitOpenUntil = 0;

export function isCircuitOpen(): boolean {
  return Date.now() < circuitOpenUntil;
}

export function recordSuccess(): void {
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
}

export function recordFailure(): void {
  consecutiveFailures++;
  if (consecutiveFailures >= CIRCUIT_THRESHOLD) {
    circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
  }
}

export function resetCircuitBreaker(): void {
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
}

export function getCircuitBreakerState(): { isOpen: boolean; failures: number; openUntil: number } {
  return {
    isOpen: isCircuitOpen(),
    failures: consecutiveFailures,
    openUntil: circuitOpenUntil,
  };
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(message: string, kind: ApiErrorKind, status?: number, cause?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.cause = cause;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// UUID validation regex: standard 8-4-4-4-12 hex format
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(id: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id.trim());
}

interface MemoryCache {
  events: EventSummary[];
  fetchedAt: number;
}

// Module-level session cache and in-flight request tracking
let memoryCache: MemoryCache | null = null;
let inFlightGetEvents: Promise<GetEventsResult> | null = null;

export function clearSessionCache(): void {
  memoryCache = null;
  inFlightGetEvents = null;
}

export function clearLocalStorageCache(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error is eligible for retry per Task 1:
 * Retry ONLY: network, timeout, 5xx, 408, 429.
 * Never retry other 4xx (400, 401, 403, 404, etc.).
 */
function isRetryableError(err: ApiError): boolean {
  if (err.kind === 'network' || err.kind === 'timeout') return true;
  if (err.kind === 'http' && err.status) {
    if (err.status >= 500 && err.status <= 599) return true;
    if (err.status === 408 || err.status === 429) return true;
  }
  return false;
}

async function fetchWithRetry(url: string): Promise<Response> {
  // If circuit breaker is active, fail-fast without network call
  if (isCircuitOpen()) {
    throw new ApiError(
      'Circuit breaker active: service resting for 15s following repeated failures',
      'circuit_open',
      503
    );
  }

  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Internal 8s timeout controller
    const attemptController = new AbortController();
    let isTimedOut = false;

    const timeoutTimer = setTimeout(() => {
      isTimedOut = true;
      attemptController.abort();
    }, TIMEOUT_MS);

    let response: Response | null = null;

    try {
      const simulatedResponse = await checkDevSimulation(url);
      response =
        simulatedResponse ?? (await fetch(url, { signal: attemptController.signal }));

      // Content-Type validation: HTML or non-JSON returns "invalid"
      const contentType = response.headers.get('content-type') || '';
      const isJson =
        contentType.includes('application/json') ||
        contentType.includes('application/problem+json');

      if (contentType.includes('text/html') || (!isJson && response.ok)) {
        throw new ApiError(
          'Invalid response Content-Type: expected JSON payload',
          'invalid',
          response.status
        );
      }

      if (!response.ok) {
        const status = response.status;
        if (status === 404) {
          throw new ApiError(`Resource not found at ${url}`, 'notfound', 404);
        }
        if (status === 429) {
          throw new ApiError('Too many requests, temporal rate limit active', 'ratelimit', 429);
        }
        if (status >= 500) {
          throw new ApiError(`Server error (${status}): ${response.statusText}`, 'http', status);
        }
        throw new ApiError(`HTTP error (${status}): ${response.statusText}`, 'http', status);
      }

      return response;
    } catch (err: unknown) {
      let apiError: ApiError;

      if (err instanceof ApiError) {
        apiError = err;
      } else if (err instanceof SimulatedApiError) {
        apiError = new ApiError(err.message, err.kind, err.status);
      } else if (isTimedOut) {
        apiError = new ApiError(`Request timed out after ${TIMEOUT_MS}ms`, 'timeout');
      } else if (
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err instanceof Error && err.name === 'AbortError') ||
        (typeof err === 'object' && err !== null && (err as { name?: string }).name === 'AbortError')
      ) {
        if (isTimedOut) {
          apiError = new ApiError(`Request timed out after ${TIMEOUT_MS}ms`, 'timeout');
        } else {
          apiError = new ApiError('Connection interrupted, retrying...', 'network', undefined, err);
        }
      } else if (err instanceof TypeError) {
        apiError = new ApiError(err.message || 'Network connection failed', 'network', undefined, err);
      } else {
        apiError = new ApiError(
          err instanceof Error ? err.message : 'Unknown network failure',
          'network',
          undefined,
          err
        );
      }

      lastError = apiError;

      // Fail-fast on non-retryable errors
      if (!isRetryableError(apiError)) {
        throw apiError;
      }

      // If attempts remain, apply exponential backoff with jitter and honor Retry-After
      if (attempt < MAX_RETRIES) {
        let retryAfterMs: number | null = null;
        if (response) {
          const retryHeader = response.headers.get('retry-after');
          if (retryHeader) {
            const parsed = parseFloat(retryHeader);
            if (!isNaN(parsed) && parsed > 0) {
              retryAfterMs = Math.min(5000, parsed * 1000);
            }
          }
        }

        const jitter = Math.random() * 200;
        const backoffMs =
          retryAfterMs ?? Math.min(5000, 500 * Math.pow(2, attempt) + jitter);
        await sleep(backoffMs);
      }
    } finally {
      clearTimeout(timeoutTimer);
    }
  }

  throw lastError ?? new ApiError('Request failed after retries', 'network');
}

/**
 * Tolerant Event Validation:
 * Verify item has valid string id and name. Drop malformed items.
 * Sanitize all fields so undefined/null is never passed down.
 */
function isValidEventItem(raw: unknown): raw is Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== 'string' || obj.id.trim().length === 0) return false;
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) return false;
  return true;
}

function sanitizeEventSummary(raw: Record<string, unknown>): EventSummary {
  const s = raw.schedule_summary as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    name: String(raw.name),
    blurb: typeof raw.blurb === 'string' ? raw.blurb : '',
    cover_image_url: typeof raw.cover_image_url === 'string' ? raw.cover_image_url : '',
    cover_image_alt:
      typeof raw.cover_image_alt === 'string' ? raw.cover_image_alt : String(raw.name),
    category: typeof raw.category === 'string' && raw.category ? raw.category : 'General',
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === 'string') : [],
    event_type: raw.event_type === 'WORKSHOP' ? 'WORKSHOP' : 'EVENT',
    event_mode: raw.event_mode === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
    event_status:
      raw.event_status === 'COMPLETED'
        ? 'COMPLETED'
        : raw.event_status === 'CLOSED'
        ? 'CLOSED'
        : 'ACTIVE',
    is_featured: Boolean(raw.is_featured),
    is_technical: Boolean(raw.is_technical),
    price:
      typeof raw.price === 'number' && Number.isFinite(raw.price) && raw.price >= 0
        ? raw.price
        : 0,
    is_per_head: raw.is_per_head !== false,
    min_teamsize:
      typeof raw.min_teamsize === 'number' && raw.min_teamsize > 0 ? raw.min_teamsize : 1,
    max_teamsize:
      typeof raw.max_teamsize === 'number' && raw.max_teamsize > 0 ? raw.max_teamsize : 1,
    total_seats:
      typeof raw.total_seats === 'number' && raw.total_seats >= 0 ? raw.total_seats : 0,
    seats_filled:
      typeof raw.seats_filled === 'number' && raw.seats_filled >= 0 ? raw.seats_filled : 0,
    registration_status:
      raw.registration_status === 'CLOSED'
        ? 'CLOSED'
        : raw.registration_status === 'SOLD_OUT'
        ? 'SOLD_OUT'
        : 'OPEN',
    registration_deadline:
      typeof raw.registration_deadline === 'string' ? raw.registration_deadline : '',
    schedule_summary: {
      start_date: typeof s?.start_date === 'string' ? s.start_date : '',
      start_time: typeof s?.start_time === 'string' ? s.start_time : '',
      end_date: typeof s?.end_date === 'string' ? s.end_date : '',
      end_time: typeof s?.end_time === 'string' ? s.end_time : '',
    },
  };
}

function sanitizeEventDetail(raw: Record<string, unknown>): EventDetail {
  const summary = sanitizeEventSummary(raw);
  return {
    ...summary,
    description: typeof raw.description === 'string' ? raw.description : '',
    banner_image_url:
      typeof raw.banner_image_url === 'string' ? raw.banner_image_url : undefined,
    banner_image_alt:
      typeof raw.banner_image_alt === 'string' ? raw.banner_image_alt : undefined,
    gallery_images: Array.isArray(raw.gallery_images)
      ? raw.gallery_images.filter((img): img is string => typeof img === 'string')
      : [],
    highlights: Array.isArray(raw.highlights)
      ? raw.highlights.filter((h): h is string => typeof h === 'string')
      : [],
    what_to_expect: Array.isArray(raw.what_to_expect)
      ? raw.what_to_expect.filter((w): w is string => typeof w === 'string')
      : [],
    eligibility: Array.isArray(raw.eligibility)
      ? raw.eligibility.filter((e): e is string => typeof e === 'string')
      : [],
    prerequisites: Array.isArray(raw.prerequisites)
      ? raw.prerequisites.filter((p): p is string => typeof p === 'string')
      : [],
    rules: Array.isArray(raw.rules)
      ? raw.rules.filter((r): r is string => typeof r === 'string')
      : [],
    prizes: Array.isArray(raw.prizes)
      ? raw.prizes.filter((p) => p && typeof p === 'object')
      : [],
    faqs: Array.isArray(raw.faqs)
      ? raw.faqs.filter((f) => f && typeof f === 'object')
      : [],
    schedules: Array.isArray(raw.schedules)
      ? raw.schedules.filter((s) => s && typeof s === 'object')
      : [],
    organizers: Array.isArray(raw.organizers)
      ? raw.organizers.filter((o) => o && typeof o === 'object')
      : [],
    coordinators: Array.isArray(raw.coordinators)
      ? raw.coordinators.filter((c) => c && typeof c === 'object')
      : [],
  };
}

export const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours max age per Task 4

export function getStoredEventsCache(): { events: EventSummary[]; timestamp: number } | null {
  try {
    const cachedRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cachedRaw) return null;
    const parsed = JSON.parse(cachedRaw) as {
      events?: unknown;
      at?: unknown;
      timestamp?: unknown;
    };
    if (parsed && Array.isArray(parsed.events)) {
      const at =
        typeof parsed.at === 'number'
          ? parsed.at
          : typeof parsed.timestamp === 'number'
          ? parsed.timestamp
          : 0;

      // Enforce 24h max age
      if (at > 0 && Date.now() - at > MAX_CACHE_AGE_MS) {
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch {
          // Ignore
        }
        return null;
      }

      const validEvents = parsed.events.filter(isValidEventItem).map(sanitizeEventSummary);
      if (validEvents.length > 0) {
        return { events: validEvents, timestamp: at || Date.now() };
      }
    }
  } catch {
    // Parsing error
  }
  return null;
}

export function getEvents(options: GetEventsOptions = {}): Promise<GetEventsResult> {
  const { force = false } = options;

  if (force) {
    memoryCache = null;
    inFlightGetEvents = null;
  } else {
    // If circuit breaker is open, immediately serve stale cache if available
    if (isCircuitOpen()) {
      const stored = getStoredEventsCache();
      if (stored) {
        return Promise.resolve({
          events: stored.events,
          stale: true,
          fetchedAt: stored.timestamp,
        });
      }
      return Promise.reject(
        new ApiError(
          'Circuit breaker active: service resting for 15s',
          'circuit_open',
          503
        )
      );
    }

    if (memoryCache && !getSimMode()) {
      return Promise.resolve({
        events: memoryCache.events,
        stale: false,
        fetchedAt: memoryCache.fetchedAt,
      });
    }

    if (inFlightGetEvents && !getSimMode()) {
      return inFlightGetEvents;
    }
  }

  const fetchPromise = (async (): Promise<GetEventsResult> => {
    try {
      let events: EventSummary[] | null = null;
      if (!force && !getSimMode() && typeof window !== 'undefined') {
        const earlyEvents = (
          window as unknown as { __EARLY_EVENTS__?: unknown[] }
        ).__EARLY_EVENTS__;
        if (earlyEvents && Array.isArray(earlyEvents) && earlyEvents.length > 0) {
          const validEarly = earlyEvents.filter(isValidEventItem).map(sanitizeEventSummary);
          if (validEarly.length > 0) {
            events = validEarly;
          }
        } else {
          const earlyPromise = (
            window as unknown as { __EARLY_EVENTS_PROMISE__?: Promise<{ events?: unknown }> }
          ).__EARLY_EVENTS_PROMISE__;
          if (earlyPromise) {
            try {
              const res = await earlyPromise;
              if (res?.events && Array.isArray(res.events) && res.events.length > 0) {
                const validEarly = res.events.filter(isValidEventItem).map(sanitizeEventSummary);
                if (validEarly.length > 0) {
                  events = validEarly;
                }
              }
            } catch {
              // Fall through to regular fetch
            }
          }
        }
      }

      if (!events) {
        const response = await fetchWithRetry(`${API_BASE_URL}/api/test/events`);

        let data: unknown;
        try {
          data = await response.json();
        } catch (jsonErr) {
          throw new ApiError('Failed to parse events JSON response', 'invalid', response.status, jsonErr);
        }

        if (
          !data ||
          typeof data !== 'object' ||
          !('events' in data) ||
          !Array.isArray((data as { events: unknown }).events)
        ) {
          throw new ApiError(
            'Malformed events response: expected an object with an "events" array',
            'invalid',
            response.status
          );
        }

        const rawList = (data as { events: unknown[] }).events;
        const validList = rawList.filter(isValidEventItem).map(sanitizeEventSummary);

        // If the array had items but all of them were malformed, throw invalid
        if (rawList.length > 0 && validList.length === 0) {
          throw new ApiError(
            'No valid events found in API response',
            'invalid',
            response.status
          );
        }

        events = validList;
      }

      const now = Date.now();
      memoryCache = {
        events,
        fetchedAt: now,
      };

      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            events,
            at: now,
            timestamp: now,
          })
        );
      } catch {
        // Ignore localStorage quota errors
      }

      recordSuccess();

      return {
        events,
        stale: false,
        fetchedAt: now,
      };
    } catch (err: unknown) {
      recordFailure();

      // If live call fails and cache exists in localStorage, return cached data as stale (unless simulating)
      const stored = getStoredEventsCache();
      if (stored && !getSimMode()) {
        return {
          events: stored.events,
          stale: true,
          fetchedAt: stored.timestamp,
        };
      }

      memoryCache = null;

      if (err instanceof ApiError) {
        throw err;
      }

      const isAbortError =
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err instanceof Error && err.name === 'AbortError') ||
        (typeof err === 'object' && err !== null && (err as { name?: string }).name === 'AbortError');

      if (isAbortError) {
        throw new ApiError('Connection interrupted, retrying...', 'network', undefined, err);
      }

      throw new ApiError(
        err instanceof Error ? err.message : 'Failed to fetch events',
        'network',
        undefined,
        err
      );
    } finally {
      inFlightGetEvents = null;
    }
  })();

  if (!force) {
    inFlightGetEvents = fetchPromise;
  }

  return fetchPromise;
}

export async function getEvent(id: string, options?: GetEventOptions): Promise<EventDetail> {
  void options;

  // Step 1 requirement: validate the id is UUID-shaped before any request. If not, return notfound without network call.
  if (!isValidUuid(id)) {
    throw new ApiError('Event not found: invalid ID format', 'notfound', 404);
  }

  // If circuit breaker is active, check localStorage fallback or fail-fast
  if (isCircuitOpen()) {
    const stored = getStoredEventsCache();
    const fallbackSummary = stored?.events.find((e) => e.id === id);
    if (fallbackSummary) {
      return { ...fallbackSummary } as EventDetail;
    }
    throw new ApiError(
      'Circuit breaker active: service resting for 15s',
      'circuit_open',
      503
    );
  }

  if (!getSimMode() && typeof window !== 'undefined') {
    const earlyEvent = (window as unknown as { __EARLY_EVENT__?: Record<string, unknown> })
      .__EARLY_EVENT__;
    if (earlyEvent && earlyEvent.id === id && isValidEventItem(earlyEvent)) {
      return sanitizeEventDetail(earlyEvent);
    }
    const earlyPromise = (
      window as unknown as {
        __EARLY_EVENT_PROMISE__?: Promise<{ event?: Record<string, unknown> }>;
      }
    ).__EARLY_EVENT_PROMISE__;
    if (earlyPromise) {
      try {
        const res = await earlyPromise;
        if (res?.event && res.event.id === id && isValidEventItem(res.event)) {
          return sanitizeEventDetail(res.event);
        }
      } catch {
        // Fall back to regular fetch
      }
    }
  }

  try {
    const url = `${API_BASE_URL}/api/test/events/${encodeURIComponent(id)}`;
    const response = await fetchWithRetry(url);

    let data: unknown;
    try {
      data = await response.json();
    } catch (jsonErr) {
      throw new ApiError('Failed to parse event detail JSON response', 'invalid', response.status, jsonErr);
    }

    if (
      !data ||
      typeof data !== 'object' ||
      !('event' in data) ||
      !isValidEventItem((data as { event: unknown }).event)
    ) {
      throw new ApiError(
        'Malformed event detail response: expected valid event object',
        'invalid',
        response.status
      );
    }

    recordSuccess();
    return sanitizeEventDetail((data as { event: Record<string, unknown> }).event);
  } catch (err) {
    recordFailure();
    throw err;
  }
}

// Dev browser console testing hook
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  const apiObj = {
    getEvents,
    getEvent,
    clearSessionCache,
    clearLocalStorageCache,
    getMemoryCache: () => memoryCache,
    isCircuitOpen,
    resetCircuitBreaker,
    getCircuitBreakerState,
  };
  (window as unknown as { __strangeApi?: unknown }).__strangeApi = apiObj;
}
