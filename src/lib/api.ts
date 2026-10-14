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
export const LOCAL_STORAGE_KEY = 'pulse_events_cache';
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

let memoryCache: MemoryCache | null = null;
let inFlightGetEvents: Promise<GetEventsResult> | null = null;

export function clearSessionCache(): void {
  memoryCache = null;
}

export function clearLocalStorageCache(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }
}

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new DOMException('Request aborted by caller', 'AbortError'));
        },
        { once: true }
      );
    }
  });
}

async function fetchWithRetry(
  url: string,
  options: { signal?: AbortSignal } = {}
): Promise<Response> {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (options.signal?.aborted) {
      throw new DOMException('Request aborted by caller', 'AbortError');
    }

    const attemptController = new AbortController();
    let isTimedOut = false;

    const timeoutTimer = setTimeout(() => {
      isTimedOut = true;
      attemptController.abort();
    }, TIMEOUT_MS);

    const onExternalAbort = () => {
      attemptController.abort();
    };

    if (options.signal) {
      options.signal.addEventListener('abort', onExternalAbort, { once: true });
    }

    try {
      const simulatedResponse = await checkDevSimulation(url, attemptController.signal);
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
      if (options.signal?.aborted) {
        throw err;
      }

      let apiError: ApiError;
      if (err instanceof ApiError) {
        apiError = err;
      } else if (err instanceof SimulatedApiError) {
        apiError = new ApiError(err.message, err.kind, err.status);
      } else if (isTimedOut) {
        apiError = new ApiError(`Request timed out after ${TIMEOUT_MS}ms`, 'timeout');
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        if (isTimedOut) {
          apiError = new ApiError(`Request timed out after ${TIMEOUT_MS}ms`, 'timeout');
        } else {
          throw err;
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
        await sleep(backoffMs, options.signal);
      }
    } finally {
      clearTimeout(timeoutTimer);
      if (options.signal) {
        options.signal.removeEventListener('abort', onExternalAbort);
      }
    }
  }

  throw lastError ?? new ApiError('Request failed after retries', 'network');
}

export async function getEvents(options: GetEventsOptions = {}): Promise<GetEventsResult> {
  const { force = false, signal } = options;

  if (!force && memoryCache) {
    return {
      events: memoryCache.events,
      stale: false,
      fetchedAt: memoryCache.fetchedAt,
    };
  }

  if (!force && inFlightGetEvents) {
    return inFlightGetEvents;
  }

  const fetchPromise = (async (): Promise<GetEventsResult> => {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/test/events`, { signal });

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

      const events = (data as { events: EventSummary[] }).events;
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
      if (signal?.aborted) {
        throw err;
      }

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

            memoryCache = {
              events: cachedEvents,
              fetchedAt: timestamp ?? Date.now(),
            };

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

      if (err instanceof ApiError) {
        throw err;
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

export async function getEvent(id: string, options: GetEventOptions = {}): Promise<EventDetail> {
  const { signal } = options;
  const url = `${API_BASE_URL}/api/test/events/${encodeURIComponent(id)}`;
  const response = await fetchWithRetry(url, { signal });

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
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __pulseApi?: unknown }).__pulseApi = {
    getEvents,
    getEvent,
    clearSessionCache,
    clearLocalStorageCache,
    getMemoryCache: () => memoryCache,
  };
}
