import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop: Enforces immediate top scroll on route changes (pathname change only).
 * Preserves browser scroll restoration on back/forward (POP) navigation.
 * Handles in-page anchor hash navigation if hash is present.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  const prevPathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    // Only react to pathname changes, NOT search param updates (e.g. ?theme=... on /events)
    const isPathnameChanged = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    if (!isPathnameChanged) {
      return;
    }

    // If an anchor hash exists, scroll target into view
    if (hash) {
      const targetId = hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'auto' });
      } else {
        requestAnimationFrame(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'auto' });
        });
      }
      return;
    }

    // Back/forward navigation (POP) should preserve browser's restored scroll position
    if (navType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      // Extra frame safeguard for lazy-loaded route Suspense resolutions & View Transitions
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      });
    }
  }, [pathname, hash, navType]);

  return null;
}
