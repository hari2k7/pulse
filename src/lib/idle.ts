/**
 * Utility to schedule non-critical tasks strictly after the window load event
 * and during browser idle periods (requestIdleCallback).
 * Prevents non-critical scripts and animations from competing with initial paint / LCP.
 */
export function runAfterLoadAndIdle(callback: () => void, timeout = 2500): () => void {
  if (typeof window === 'undefined') return () => {};

  let cancelled = false;
  let idleId: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const runTask = () => {
    if (cancelled) return;
    if ('requestIdleCallback' in window) {
      idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(() => {
          if (!cancelled) callback();
        }, { timeout });
    } else {
      timeoutId = setTimeout(() => {
        if (!cancelled) callback();
      }, 150);
    }
  };

  if (document.readyState === 'complete') {
    runTask();
  } else {
    window.addEventListener('load', runTask, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener('load', runTask);
    if (idleId !== null && 'cancelIdleCallback' in window) {
      (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
    }
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  };
}
