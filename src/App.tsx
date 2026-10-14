import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { StyleguidePage } from './pages/StyleguidePage';
import { NotFoundPage } from './pages/NotFoundPage';

import { EventsGridSkeleton } from './components/events/EventsGridSkeleton';

// Lazy load discovery and detail routes per PROJECT.md Section 3
const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((m) => ({ default: m.EventsPage }))
);
const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);
const SchedulePage = lazy(() =>
  import('./pages/SchedulePage').then((m) => ({ default: m.SchedulePage }))
);

// Dynamic import of ReactQueryDevtools strictly in development on-demand via ?devtools=true
// Tree-shaken in production. In dev, avoids downloading 3MB devtools payload during audits unless requested.
const isDevtoolsRequested =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('devtools');

const ReactQueryDevtools = isDevtoolsRequested
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      }))
    )
  : null;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/events"
              element={
                <Suspense fallback={<EventsGridSkeleton />}>
                  <EventsPage />
                </Suspense>
              }
            />
            <Route
              path="/schedule"
              element={
                <Suspense
                  fallback={
                    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8 min-h-[60vh]">
                      <div className="h-10 w-64 bg-[#0D1020] rounded animate-pulse" />
                      <div className="h-24 w-full bg-[#0D1020] rounded-xl animate-pulse" />
                      <div className="h-32 w-full bg-[#0D1020] rounded-xl animate-pulse" />
                    </div>
                  }
                >
                  <SchedulePage />
                </Suspense>
              }
            />
            <Route
              path="/events/:id"
              element={
                <Suspense
                  fallback={
                    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[60vh]">
                      <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[4px] bg-[#222222] animate-pulse motion-reduce:animate-none" />
                      <div className="h-10 w-2/3 bg-[#222222] rounded-[4px] animate-pulse motion-reduce:animate-none" />
                      <div className="h-5 w-full bg-[#222222] rounded-[4px] animate-pulse motion-reduce:animate-none" />
                      <div className="h-5 w-4/5 bg-[#222222] rounded-[4px] animate-pulse motion-reduce:animate-none" />
                    </div>
                  }
                >
                  <EventDetailPage />
                </Suspense>
              }
            />
            {import.meta.env.DEV && (
              <Route
                path="/styleguide"
                element={
                  <Suspense fallback={<div className="w-full min-h-[60vh]" />}>
                    <StyleguidePage />
                  </Suspense>
                }
              />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}

export default App;
