import { useEffect, useState, lazy, Suspense, type FC, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { OfflineBanner } from './OfflineBanner';

// Lazy-load cursor after first paint so it never blocks LCP or hydration
const StrangeCursor = lazy(() =>
  import('../strange/StrangeCursor').then((m) => ({ default: m.StrangeCursor }))
);

// Lazy-load BackToTop button after first paint (Home and /events only)
const BackToTop = lazy(() =>
  import('../strange/BackToTop').then((m) => ({ default: m.BackToTop }))
);

import { runAfterLoadAndIdle } from '../../lib/idle';
import { SectionErrorBoundary } from '../common/SectionErrorBoundary';

export interface LayoutProps {
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mountCursor, setMountCursor] = useState(false);
  const showBackToTop = location.pathname === '/' || location.pathname === '/events';

  useEffect(() => {
    // Mount cursor and back-to-top strictly after window load + idle
    return runAfterLoadAndIdle(() => {
      setMountCursor(true);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#07060D] text-[#F3EFE8]">
      {/* Accessible skip link for keyboard/screen-reader users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#FF7A1A] focus:text-[#07060D] focus:rounded-md focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#F5B642] font-bold text-xs uppercase tracking-wider"
      >
        Skip to main content
      </a>

      {/* Primary Sticky Header */}
      <Navbar />

      {/* Global Offline Resilience Banner */}
      <OfflineBanner />

      {/* Main Landmark */}
      <main id="main" className="w-full flex-1 flex flex-col outline-none">
        {children ?? <Outlet />}
      </main>

      {/* Footer Landmark */}
      <Footer />

      {/* Lazy-loaded atmospheric interactive cursor */}
      {mountCursor && (
        <SectionErrorBoundary sectionName="cursor">
          <Suspense fallback={null}>
            <StrangeCursor />
          </Suspense>
        </SectionErrorBoundary>
      )}

      {/* Lazy-loaded Back to Top Cloak Button (Home and /events only) */}
      {mountCursor && showBackToTop && (
        <SectionErrorBoundary sectionName="back-to-top">
          <Suspense fallback={null}>
            <BackToTop />
          </Suspense>
        </SectionErrorBoundary>
      )}
    </div>
  );
};
