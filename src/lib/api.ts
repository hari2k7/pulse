import type {
  ApiErrorKind,
  EventDetail,
  EventSummary,
  GetEventOptions,
  GetEventsOptions,
  GetEventsResult,
} from './types';
import { checkDevSimulation, SimulatedApiError } from './sim';

export const API_BASE_URL = 'https://render72.pages.dev';
export const LOCAL_STORAGE_KEY = 'strange_events_cache';
const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2; // Initial attempt + up to 2 retries = 3 attempts total

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

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // The API layer owns the AbortController, used ONLY for the 8s timeout
    const attemptController = new AbortController();
    let isTimedOut = false;

    const timeoutTimer = setTimeout(() => {
      isTimedOut = true;
      attemptController.abort();
    }, TIMEOUT_MS);

    try {
      const simulatedResponse = await checkDevSimulation(url);
      const response =
        simulatedResponse ?? (await fetch(url, { signal: attemptController.signal }));

      if (!response.ok) {
        const status = response.status;
        if (status === 404) {
          throw new ApiError(`Resource not found at ${url}`, 'notfound', 404);
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
          // Convert any other AbortError into a retryable ApiError, not a raw DOMException message
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

      // 404 is permanent: never retry
      if (apiError.kind === 'notfound') {
        throw apiError;
      }

      // If more attempts remain, perform exponential backoff
      if (attempt < MAX_RETRIES) {
        const backoffMs = 500 * Math.pow(2, attempt);
        await sleep(backoffMs);
      }
    } finally {
      clearTimeout(timeoutTimer);
    }
  }

  throw lastError ?? new ApiError('Request failed after retries', 'network');
}

export function getEvents(options: GetEventsOptions = {}): Promise<GetEventsResult> {
  const { force = false } = options;

  if (force) {
    memoryCache = null;
    inFlightGetEvents = null;
  } else {
    if (memoryCache) {
      return Promise.resolve({
        events: memoryCache.events,
        stale: false,
        fetchedAt: memoryCache.fetchedAt,
      });
    }

    if (inFlightGetEvents) {
      return inFlightGetEvents;
    }
  }

  const fetchPromise = (async (): Promise<GetEventsResult> => {
    try {
      let events: EventSummary[] | null = null;
      if (!force && typeof window !== 'undefined') {
        const earlyEvents = (window as unknown as { __EARLY_EVENTS__?: EventSummary[] }).__EARLY_EVENTS__;
        if (earlyEvents && Array.isArray(earlyEvents) && earlyEvents.length > 0) {
          events = earlyEvents;
        } else {
          const earlyPromise = (
            window as unknown as { __EARLY_EVENTS_PROMISE__?: Promise<{ events?: EventSummary[] }> }
          ).__EARLY_EVENTS_PROMISE__;
          if (earlyPromise) {
            try {
              const res = await earlyPromise;
              if (res?.events && Array.isArray(res.events) && res.events.length > 0) {
                events = res.events;
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

        events = (data as { events: EventSummary[] }).events;
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
            timestamp: now,
          })
        );
      } catch {
        // Ignore localStorage quota or private-browsing errors
      }

      return {
        events,
        stale: false,
        fetchedAt: now,
      };
    } catch (err: unknown) {
      // If live call fails and cache exists in localStorage, return cached data as stale
      try {
        const cachedRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw) as {
            events?: unknown;
            timestamp?: unknown;
          };
          if (parsed && Array.isArray(parsed.events) && parsed.events.length > 0) {
            const cachedEvents = parsed.events as EventSummary[];
            const timestamp = typeof parsed.timestamp === 'number' ? parsed.timestamp : null;

            return {
              events: cachedEvents,
              stale: true,
              fetchedAt: timestamp,
            };
          }
        }
      } catch {
        // Parsing or reading localStorage failed
      }

      // Never cache a failed result in session cache!
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
      // Clear the in-flight reference in .finally() so a failed or aborted promise is never reused
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
  if (typeof window !== 'undefined') {
    const earlyEvent = (window as unknown as { __EARLY_EVENT__?: EventDetail }).__EARLY_EVENT__;
    if (earlyEvent && earlyEvent.id === id) {
      return earlyEvent;
    }
    const earlyPromise = (
      window as unknown as { __EARLY_EVENT_PROMISE__?: Promise<{ event?: EventDetail }> }
    ).__EARLY_EVENT_PROMISE__;
    if (earlyPromise) {
      try {
        const res = await earlyPromise;
        if (res?.event && res.event.id === id) {
          return res.event;
        }
      } catch {
        // Fall back to regular fetch
      }
    }
  }

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
    typeof (data as { event: unknown }).event !== 'object' ||
    (data as { event: unknown }).event === null
  ) {
    throw new ApiError(
      'Malformed event detail response: expected an object with an "event" object',
      'invalid',
      response.status
    );
  }

  return (data as { event: EventDetail }).event;
}

// Dev browser console testing hook
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  const apiObj = {
    getEvents,
    getEvent,
    clearSessionCache,
    clearLocalStorageCache,
    getMemoryCache: () => memoryCache,
  };
  (window as unknown as { __strangeApi?: unknown }).__strangeApi = apiObj;
}
