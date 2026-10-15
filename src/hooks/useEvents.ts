import { useCallback, useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError, getEvent, getEvents, getStoredEventsCache } from '../lib/api';
import { queryClient } from '../lib/queryClient';
import { getSimMode } from '../lib/sim';
import type { EventDetail, EventSummary, GetEventsResult } from '../lib/types';

export type EventsStatus = 'loading' | 'success' | 'error';

export interface UseEventsResult {
  status: EventsStatus;
  events: EventSummary[];
  stale: boolean;
  fetchedAt: number | null;
  error: ApiError | null;
  retry: () => void;
}

export interface UseEventResult {
  status: EventsStatus;
  event: EventDetail | null;
  error: ApiError | null;
  isPlaceholder: boolean;
  retry: () => void;
}

interface EventsState {
  status: EventsStatus;
  events: EventSummary[];
  stale: boolean;
  fetchedAt: number | null;
  error: ApiError | null;
}

// Module-level guard: strictly max 1 hover prefetch in flight at a time
let globalPrefetchInFlight = false;

function canPrefetch(): boolean {
  if (typeof window === 'undefined') return false;
  // None on saveData
  const nav = navigator as unknown as {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (nav.connection?.saveData === true) return false;
  if (window.matchMedia('(save-data: on)').matches) return false;
  // None on coarse pointer (touch devices)
  if (window.matchMedia('(pointer: coarse)').matches) return false;
  if (!window.matchMedia('(pointer: fine)').matches) return false;
  return true;
}

/**
 * useEvents hook with Stale-While-Revalidate caching:
 * - Uses persisted localStorage cache as initialData so repeat visits render immediately with 0 latency.
 * - Silent background revalidation: the "Showing saved data" banner appears ONLY if the live call fails.
 */
export function useEvents(options?: { enabled?: boolean }): UseEventsResult {
  const enabled = options?.enabled !== false;
  const [state, setState] = useState<EventsState>(() => {
    const isSim = Boolean(getSimMode());
    if (!isSim) {
      // 1. Check in-memory query cache
      const cached = queryClient.getQueryData<GetEventsResult>(['events']);
      if (cached) {
        return {
          status: 'success',
          events: cached.events,
          stale: cached.stale,
          fetchedAt: cached.fetchedAt,
          error: null,
        };
      }

      // 2. Check 24h localStorage cache for instant render on repeat visits
      const stored = getStoredEventsCache();
      if (stored) {
        return {
          status: 'success',
          events: stored.events,
          stale: false, // Do NOT show banner during silent revalidation!
          fetchedAt: stored.timestamp,
          error: null,
        };
      }
    }

    return {
      status: 'loading',
      events: [],
      stale: false,
      fetchedAt: null,
      error: null,
    };
  });
  const [reloadIndex, setReloadIndex] = useState<number>(0);

  const retry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'loading',
      error: null,
    }));
    setReloadIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let ignore = false;
    const isForce = reloadIndex > 0;

    getEvents({ force: isForce })
      .then((result) => {
        if (ignore) return;
        queryClient.setQueryData(['events'], result);
        setState({
          status: 'success',
          events: result.events,
          stale: result.stale,
          fetchedAt: result.fetchedAt,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (ignore) return;

        // If live call fails and stored data exists, serve stored data as stale (unless simulating)
        const stored = getStoredEventsCache();
        if (stored && !getSimMode()) {
          setState({
            status: 'success',
            events: stored.events,
            stale: true,
            fetchedAt: stored.timestamp,
            error: null,
          });
          return;
        }

        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(
                err instanceof Error ? err.message : 'Failed to load events',
                'network',
                undefined,
                err
              );
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: apiError,
        }));
      });

    return () => {
      ignore = true;
    };
  }, [reloadIndex, enabled]);

  return {
    status: state.status,
    events: state.events,
    stale: state.stale,
    fetchedAt: state.fetchedAt,
    error: state.error,
    retry,
  };
}

/**
 * useEvent hook:
 * Detail queries stay in memory with a 30 min staleTime.
 * Fast placeholderData populated from existing events summary cache.
 */
export function useEvent(id?: string): UseEventResult {
  const query = useQuery<EventDetail, ApiError>({
    queryKey: ['event', id],
    queryFn: () => {
      if (!id) throw new Error('Event ID is required');
      return getEvent(id);
    },
    enabled: Boolean(id),
    staleTime: 30 * 60 * 1000, // 30 minutes in memory per Task 4
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false, // No refetch on focus per Task 4
    refetchInterval: false, // No polling per Task 4
    retry: (_failureCount, error) => {
      if (error?.kind === 'notfound' || error?.status === 404) {
        return false;
      }
      return false; // api.ts already handles retries
    },
    placeholderData: () => {
      if (!id) return undefined;
      const cachedList = queryClient.getQueryData<GetEventsResult>(['events']);
      const summary = cachedList?.events.find((e) => e.id === id);
      if (summary) {
        return { ...summary } as EventDetail;
      }
      const stored = getStoredEventsCache();
      const storedSummary = stored?.events.find((e) => e.id === id);
      if (storedSummary) {
        return { ...storedSummary } as EventDetail;
      }
      return undefined;
    },
  });

  const status: EventsStatus = query.isLoading
    ? 'loading'
    : query.isError
    ? 'error'
    : 'success';

  return {
    status,
    event: query.data ?? null,
    error: query.error ?? null,
    isPlaceholder: query.isPlaceholderData,
    retry: () => {
      query.refetch();
    },
  };
}

/**
 * usePrefetchEvent hook:
 * Hover prefetch with max 1 request in flight, completely disabled on saveData or coarse pointer.
 */
export function usePrefetchEvent(id?: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetch = useCallback(
    (targetId?: string) => {
      const eventId = targetId ?? id;
      if (!eventId || !canPrefetch() || globalPrefetchInFlight) return;

      // Skip if already in memory
      const cached = queryClient.getQueryData(['event', eventId]);
      if (cached) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 150ms debounce so fast sweeps do not trigger unnecessary network requests
      timerRef.current = setTimeout(() => {
        if (globalPrefetchInFlight || !canPrefetch()) return;
        globalPrefetchInFlight = true;

        queryClient
          .prefetchQuery({
            queryKey: ['event', eventId],
            queryFn: () => getEvent(eventId),
            staleTime: 30 * 60 * 1000,
          })
          .finally(() => {
            globalPrefetchInFlight = false;
          });
      }, 150);
    },
    [id]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    prefetch,
    cancel,
    handlers: {
      onMouseEnter: () => prefetch(),
      onMouseLeave: cancel,
      onFocus: () => prefetch(),
      onBlur: cancel,
    },
  };
}
