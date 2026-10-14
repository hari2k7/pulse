import { useCallback, useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError, getEvent, getEvents } from '../lib/api';
import { queryClient } from '../lib/queryClient';
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

export function useEvents(): UseEventsResult {
  const [state, setState] = useState<EventsState>({
    status: 'loading',
    events: [],
    stale: false,
    fetchedAt: null,
    error: null,
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
  }, [reloadIndex]);

  return {
    status: state.status,
    events: state.events,
    stale: state.stale,
    fetchedAt: state.fetchedAt,
    error: state.error,
    retry,
  };
}

export function useEvent(id?: string): UseEventResult {
  const query = useQuery<EventDetail, ApiError>({
    queryKey: ['event', id],
    queryFn: () => {
      if (!id) throw new Error('Event ID is required');
      return getEvent(id);
    },
    enabled: Boolean(id),
    retry: (_failureCount, error) => {
      // Never retry 404/notfound
      if (error?.kind === 'notfound' || error?.status === 404) {
        return false;
      }
      return false; // api.ts already handles retries
    },
    placeholderData: () => {
      if (!id) return undefined;
      const cachedList = queryClient.getQueryData<GetEventsResult>(['events']);
      const summary = cachedList?.events.find((e) => e.id === id);
      if (!summary) return undefined;
      return {
        ...summary,
      } as EventDetail;
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

export function usePrefetchEvent(id?: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetch = useCallback(
    (targetId?: string) => {
      const eventId = targetId ?? id;
      if (!eventId) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 150ms delay so quick mouse sweeps do not trigger unnecessary requests
      timerRef.current = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ['event', eventId],
          queryFn: () => getEvent(eventId),
          staleTime: 5 * 60 * 1000,
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
