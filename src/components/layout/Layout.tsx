import { useEffect, useState, lazy, Suspense, type FC, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

// Lazy-load cursor after first paint so it never blocks LCP or hydration
const StrangeCursor = lazy(() =>
  import('../strange/StrangeCursor').then((m) => ({ default: m.StrangeCursor }))
);

export interface LayoutProps {
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [mountCursor, setMountCursor] = useState(false);

  useEffect(() => {
    // Mount cursor after first paint
    if ('requestIdleCallback' in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(() => {
        setMountCursor(true);
      });
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(() => setMountCursor(true), 250);
      return () => clearTimeout(timer);
    }
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

      {/* Main Landmark */}
      <main id="main" className="w-full flex-1 flex flex-col outline-none">
        {children ?? <Outlet />}
      </main>

      {/* Footer Landmark */}
      <Footer />

      {/* Lazy-loaded atmospheric interactive cursor */}
      {mountCursor && (
        <Suspense fallback={null}>
          <StrangeCursor />
        </Suspense>
      )}
    </div>
  );
};
