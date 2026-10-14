import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { StyleguidePage } from './pages/StyleguidePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Lazy load discovery and detail routes per PROJECT.md Section 3
const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((m) => ({ default: m.EventsPage }))
);
const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense
          fallback={
            <div
              className="flex-1 flex items-center justify-center p-16"
              role="status"
              aria-live="polite"
            >
              <span
                className="w-8 h-8 border-2 border-white/20 border-t-[#e50914] rounded-full animate-spin"
                aria-label="Loading page"
              />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            {import.meta.env.DEV && (
              <Route path="/styleguide" element={<StyleguidePage />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
