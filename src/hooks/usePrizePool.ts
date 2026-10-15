import { useEffect, useState, useRef } from 'react';
import { getEvent, isCircuitOpen } from '../lib/api';
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
const MAX_POOL_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours max age per Task 4
const STALE_TIME = 30 * 60 * 1000; // 30 minutes in memory
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
      // Enforce 12h max age per Task 4
      if (typeof data.at === 'number' && Date.now() - data.at > MAX_POOL_AGE_MS) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore
        }
        return null;
      }
      return data;
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

/**
 * usePrizePool hook:
 * - Starts ONLY when the stats section is in view (IntersectionObserver) AND after window load + idle.
 * - Max 3 concurrent requests.
 * - Persists result for 12 hours in "strange:prize-pool".
 * - Skips network requests on saveData / 2g.
 * - Respects the circuit breaker (fails fast if active).
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
      status: 'idle',
      extraRequests: 0,
      totalTimeMs: 0,
    };
  });

  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || events.length === 0 || isFetchingRef.current) {
      return;
    }

    // If fresh persisted value within 12h exists, no background fetch needed
    if (getStoredPool()) {
      return;
    }

    let cancelled = false;
    let cancelIdle: () => void = () => {};
    let observer: IntersectionObserver | null = null;

    const executeBackgroundFetch = async () => {
      if (cancelled || isFetchingRef.current) return;
      isFetchingRef.current = true;

      // 1. Respect Circuit Breaker per Task 4
      if (isCircuitOpen()) {
        const stored = getStoredPool();
        setState({
          total: stored ? stored.total : null,
          isPartial: false,
          status: stored ? 'persisted' : 'failed',
          extraRequests: 0,
          totalTimeMs: 0,
        });
        isFetchingRef.current = false;
        return;
      }

      // 2. Filter strictly ACTIVE events
      const activeEvents = events.filter((e) => e.event_status === 'ACTIVE');
      if (activeEvents.length === 0) {
        setState((prev) => ({
          ...prev,
          status: prev.total !== null ? 'persisted' : 'failed',
        }));
        isFetchingRef.current = false;
        return;
      }

      // 3. Check saveData or 2G network per Task 4
      const nav = navigator as unknown as {
        connection?: { saveData?: boolean; effectiveType?: string };
      };
      if (
        nav.connection?.saveData === true ||
        nav.connection?.effectiveType === '2g' ||
        nav.connection?.effectiveType === 'slow-2g'
      ) {
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
        isFetchingRef.current = false;
        return;
      }

      setState((prev) => ({ ...prev, status: 'computing' }));

      const startTime = performance.now();
      let extraRequestsCount = 0;

      const resultsMap = new Map<string, EventDetail | null>();
      const failedIds = new Set<string>();

      // Concurrency queue runner: max 3 concurrent requests per Task 4
      const queue = [...activeEvents];
      const runWorker = async () => {
        while (queue.length > 0 && !cancelled) {
          // Check circuit breaker before each request
          if (isCircuitOpen()) {
            break;
          }

          const item = queue.shift();
          if (!item) break;

          try {
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

      if (failedIds.size === 0 && initialSuccessCount > 0) {
        // All active events resolved successfully -> persist for 12 hours
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
          // Ignore storage quota errors
        }

        setState({
          total: initialSum,
          isPartial: false,
          status: 'complete',
          extraRequests: extraRequestsCount,
          totalTimeMs: elapsed,
        });
      } else if (initialSuccessCount > 0) {
        // Partial success -> show partial sum with + and schedule single retry
        setState({
          total: initialSum,
          isPartial: true,
          status: 'partial',
          extraRequests: extraRequestsCount,
          totalTimeMs: elapsed,
        });

        setTimeout(async () => {
          if (cancelled || isCircuitOpen()) return;
          const retryIds = Array.from(failedIds);
          let retrySuccess = true;

          for (const fid of retryIds) {
            if (isCircuitOpen()) {
              retrySuccess = false;
              break;
            }
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
        // All failed
        const stored = getStoredPool();
        setState({
          total: stored ? stored.total : null,
          isPartial: false,
          status: stored ? 'persisted' : 'failed',
          extraRequests: extraRequestsCount,
          totalTimeMs: elapsed,
        });
      }

      isFetchingRef.current = false;
    };

    // Task 4: Start ONLY when stats section is in view (IntersectionObserver) AND after window load + idle
    const startWhenReady = () => {
      cancelIdle = runAfterLoadAndIdle(() => {
        executeBackgroundFetch();
      }, 1500);
    };

    if (typeof IntersectionObserver !== 'undefined') {
      const statsTarget =
        document.getElementById('festival-stats') ||
        document.querySelector('[aria-label="Festival Statistics"]');

      if (statsTarget) {
        observer = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry && entry.isIntersecting) {
              observer?.disconnect();
              observer = null;
              startWhenReady();
            }
          },
          { rootMargin: '200px 0px' }
        );
        observer.observe(statsTarget);
      } else {
        // Fallback if target element isn't present immediately
        startWhenReady();
      }
    } else {
      startWhenReady();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
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
