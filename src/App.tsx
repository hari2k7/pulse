import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { StyleguidePage } from './pages/StyleguidePage';
import { NotFoundPage } from './pages/NotFoundPage';

import { EventsGridSkeleton } from './components/events/EventsGridSkeleton';
import { EventDetailSkeleton } from './components/events/EventDetailSkeleton';
import { FavoritesSkeleton } from './components/events/FavoritesSkeleton';

// Lazy load discovery and detail routes per PROJECT.md Section 3
const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((m) => ({ default: m.EventsPage }))
);
const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);
const FavoritesPage = lazy(() =>
  import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage }))
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
        <ScrollToTop />
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
              path="/favorites"
              element={
                <Suspense fallback={<FavoritesSkeleton />}>
                  <FavoritesPage />
                </Suspense>
              }
            />
            <Route
              path="/events/:id"
              element={
                <Suspense fallback={<EventDetailSkeleton />}>
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
