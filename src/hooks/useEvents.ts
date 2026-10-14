import { useCallback, useEffect, useState } from 'react';
import { ApiError, getEvents } from '../lib/api';
import type { EventSummary } from '../lib/types';

export type EventsStatus = 'loading' | 'success' | 'error';

export interface UseEventsResult {
  status: EventsStatus;
  events: EventSummary[];
  stale: boolean;
  fetchedAt: number | null;
  error: ApiError | null;
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
    const controller = new AbortController();
    let isMounted = true;

    // If reloadIndex > 0, bypass memory cache for explicit retry
    const isForce = reloadIndex > 0;

    getEvents({ force: isForce, signal: controller.signal })
      .then((result) => {
        if (!isMounted) return;
        setState({
          status: 'success',
          events: result.events,
          stale: result.stale,
          fetchedAt: result.fetchedAt,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (!isMounted || controller.signal.aborted) {
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
      isMounted = false;
      controller.abort();
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
