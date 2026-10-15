import { useEffect, useState, useRef } from 'react';
import { getEvent } from '../lib/api';
import { queryClient } from '../lib/queryClient';
import { runAfterLoadAndIdle } from '../lib/idle';
import type { EventSummary, EventDetail } from '../lib/types';

export interface UsePrizePoolResult {
  total: number | null;
  isPartial: boolean;
  isLoading: boolean;
  isComplete: boolean;
  status: 'idle' | 'computing' | 'persisted' | 'partial' | 'complete' | 'failed';
  extraRequests: number;
  totalTimeMs: number;
}

const STORAGE_KEY = 'strange:prize-pool';
const STALE_TIME = 30 * 60 * 1000; // 30 minutes
const CONCURRENCY_LIMIT = 3;

interface PersistedData {
  total: number;
  eventCount: number;
  at: number;
}

function getStoredPool(): PersistedData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedData;
    if (typeof data?.total === 'number' && Number.isFinite(data.total) && data.total >= 0) {
      return data;
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

/**
 * usePrizePool hook:
 * Background idle fetches all ACTIVE events with a small concurrency queue of 3.
 * Total = sum of finite prize.amount values across active events.
 *
 * Included events:
 * Strictly events where event_status === 'ACTIVE' from the live event list,
 * summing valid numeric prize amounts (rank rewards) from event detail responses.
 */
export function usePrizePool(events: EventSummary[]): UsePrizePoolResult {
  const [state, setState] = useState<{
    total: number | null;
    isPartial: boolean;
    status: 'idle' | 'computing' | 'persisted' | 'partial' | 'complete' | 'failed';
    extraRequests: number;
    totalTimeMs: number;
  }>(() => {
    const persisted = getStoredPool();
    if (persisted) {
      return {
        total: persisted.total,
        isPartial: false,
        status: 'persisted',
        extraRequests: 0,
        totalTimeMs: 0,
      };
    }
    return {
      total: null,
      isPartial: false,
      status: 'computing',
      extraRequests: 0,
      totalTimeMs: 0,
    };
  });

  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || events.length === 0 || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    let cancelled = false;

    const executeBackgroundFetch = async () => {
      // Filter strictly ACTIVE events
      const activeEvents = events.filter((e) => e.event_status === 'ACTIVE');
      if (activeEvents.length === 0) {
        setState((prev) => ({
          ...prev,
          status: prev.total !== null ? 'persisted' : 'failed',
        }));
        return;
      }

      // Check data-saver or slow network
      const nav = navigator as unknown as {
        connection?: { saveData?: boolean; effectiveType?: string };
      };
      if (
        nav.connection?.saveData === true ||
        nav.connection?.effectiveType === '2g' ||
        nav.connection?.effectiveType === 'slow-2g'
      ) {
        // Respect user bandwidth: skip background prefetch, rely on persisted value
        const stored = getStoredPool();
        if (stored) {
          setState({
            total: stored.total,
            isPartial: false,
            status: 'persisted',
            extraRequests: 0,
            totalTimeMs: 0,
          });
        }
        return;
      }

      const startTime = performance.now();
      let extraRequestsCount = 0;

      const resultsMap = new Map<string, EventDetail | null>();
      const failedIds = new Set<string>();

      // Concurrency queue runner (limit to 3 concurrent requests)
      const queue = [...activeEvents];
      const runWorker = async () => {
        while (queue.length > 0 && !cancelled) {
          const item = queue.shift();
          if (!item) break;

          try {
            // Check if already in TanStack Query cache
            const cached = queryClient.getQueryData<EventDetail>(['event', item.id]);
            if (!cached) {
              extraRequestsCount++;
            }

            const detail = await queryClient.fetchQuery({
              queryKey: ['event', item.id],
              queryFn: () => getEvent(item.id),
              staleTime: STALE_TIME,
            });

            resultsMap.set(item.id, detail);
          } catch {
            failedIds.add(item.id);
            resultsMap.set(item.id, null);
          }
        }
      };

      // Launch 3 concurrent workers
      const workers = Array.from(
        { length: Math.min(CONCURRENCY_LIMIT, activeEvents.length) },
        () => runWorker()
      );
      await Promise.all(workers);

      if (cancelled) return;

      // Compute total prize sum across all loaded active events
      const calculateSum = () => {
        let sum = 0;
        let successCount = 0;
        resultsMap.forEach((detail) => {
          if (detail) {
            successCount++;
            if (Array.isArray(detail.prizes)) {
              for (const p of detail.prizes) {
                if (typeof p.amount === 'number' && Number.isFinite(p.amount) && p.amount > 0) {
                  sum += p.amount;
                }
              }
            }
          }
        });
        return { sum, successCount };
      };

      const { sum: initialSum, successCount: initialSuccessCount } = calculateSum();
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      if (failedIds.size === 0) {
        // All active events resolved successfully
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              total: initialSum,
              eventCount: activeEvents.length,
              at: Date.now(),
            })
          );
        } catch {
          // Ignore localStorage errors
        }

        setState({
          total: initialSum,
          isPartial: false,
          status: 'complete',
          extraRequests: extraRequestsCount,
          totalTimeMs: elapsed,
        });
      } else if (initialSuccessCount > 0) {
        // Some succeeded, some failed -> show partial sum with + and schedule single retry
        setState({
          total: initialSum,
          isPartial: true,
          status: 'partial',
          extraRequests: extraRequestsCount,
          totalTimeMs: elapsed,
        });

        // Retry failed ones once later (after 3.5s)
        setTimeout(async () => {
          if (cancelled) return;
          const retryIds = Array.from(failedIds);
          let retrySuccess = true;

          for (const fid of retryIds) {
            try {
              extraRequestsCount++;
              const redetail = await queryClient.fetchQuery({
                queryKey: ['event', fid],
                queryFn: () => getEvent(fid),
                staleTime: STALE_TIME,
              });
              resultsMap.set(fid, redetail);
              failedIds.delete(fid);
            } catch {
              retrySuccess = false;
            }
          }

          if (cancelled) return;
          const { sum: finalSum } = calculateSum();

          if (retrySuccess && failedIds.size === 0) {
            try {
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                  total: finalSum,
                  eventCount: activeEvents.length,
                  at: Date.now(),
                })
              );
            } catch {
              // Ignore
            }

            setState({
              total: finalSum,
              isPartial: false,
              status: 'complete',
              extraRequests: extraRequestsCount,
              totalTimeMs: Math.round(performance.now() - startTime),
            });
          } else {
            setState((prev) => ({
              ...prev,
              total: finalSum,
              isPartial: true,
              extraRequests: extraRequestsCount,
            }));
          }
        }, 3500);
      } else {
        // All active event queries failed
        const stored = getStoredPool();
        if (stored) {
          setState({
            total: stored.total,
            isPartial: false,
            status: 'persisted',
            extraRequests: extraRequestsCount,
            totalTimeMs: elapsed,
          });
        } else {
          setState({
            total: null,
            isPartial: false,
            status: 'failed',
            extraRequests: extraRequestsCount,
            totalTimeMs: elapsed,
          });
        }
      }
    };

    // Schedule background queue strictly after window load + browser idle
    const cancelIdle = runAfterLoadAndIdle(() => {
      executeBackgroundFetch();
    }, 2500);

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [events]);

  return {
    total: state.total,
    isPartial: state.isPartial,
    isLoading: state.status === 'computing' && state.total === null,
    isComplete: state.status === 'complete',
    status: state.status,
    extraRequests: state.extraRequests,
    totalTimeMs: state.totalTimeMs,
  };
}
