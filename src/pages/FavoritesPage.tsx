import { useState, useEffect, useRef, useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvents } from '../hooks/useEvents';
import { useFavorites } from '../lib/favorites';
import { EventGrid, EventGridSkeleton } from '../components/events/EventGrid';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';

export const FavoritesPage: FC = () => {
  useDocumentMeta({
    title: 'Favorites — STRANGE',
    description: 'Your saved favorite multiverse events and hackathons.',
  });

  const { status, events, stale, error, retry } = useEvents();
  const { favorites } = useFavorites();

  // Pagination: 12 initial, +12 via scroll sentinel or button
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [announceText, setAnnounceText] = useState<string>('');
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isAutoLoadingRef = useRef<boolean>(false);

  // Filter events from useEvents() by saved ids in favorites (ignore obsolete ids)
  const favoriteEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    const favSet = new Set(favorites);
    return events.filter((e) => favSet.has(e.id));
  }, [events, favorites]);

  // Visible batched favorite events
  const visibleEvents = useMemo(() => {
    return favoriteEvents.slice(0, visibleCount);
  }, [favoriteEvents, visibleCount]);

  const remainingCount = favoriteEvents.length - visibleCount;

  // Auto-load sentinel via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (isAutoLoadingRef.current) return;

        setVisibleCount((prev) => {
          const remaining = favoriteEvents.length - prev;
          if (remaining <= 0) return prev;
          isAutoLoadingRef.current = true;
          setTimeout(() => { isAutoLoadingRef.current = false; }, 400);
          const next = prev + 12;
          const shown = Math.min(next, favoriteEvents.length);
          setAnnounceText(`Showing ${shown} of ${favoriteEvents.length} saved events`);
          return next;
        });
      },
      { rootMargin: '400px' }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [favoriteEvents.length]);

  // Error state with retry
  if (status === 'error' && favorites.length > 0 && favoriteEvents.length === 0) {
    return (
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-16 min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Multiverse Portal Disrupted"
          message={error?.message || 'Unable to load your saved favorites at this time.'}
          errorKind={error?.kind}
          onRetry={retry}
        />
      </div>
    );
  }

  const isLoading = status === 'loading' && favorites.length > 0;

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-12 md:pb-16 space-y-8 bg-[#07060D] text-[#F3EFE8] min-h-[calc(100vh-var(--navbar-height,72px))]">
      {/* Stale Cache Notice Banner */}
      {stale && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-lg bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 text-xs text-[#F5B642]"
        >
          <span>Showing saved events from temporal memory. Reconnecting to live coordinates...</span>
          <button
            type="button"
            onClick={retry}
            className="font-bold underline hover:text-[#F3EFE8] transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header with Title and Live Count */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#FF7A1A]/20 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8]">
            FAVORITES
          </h1>
          <p className="text-sm text-[#B8B3C7]">
            {isLoading
              ? 'Loading your saved events...'
              : `${favoriteEvents.length} saved ${
                  favoriteEvents.length === 1 ? 'event' : 'events'
                }. Your curated collection of bookmarked dimensions and competitions.`}
          </p>
        </div>

        <Link
          to="/events"
          className="text-xs font-bold uppercase tracking-wider text-[#F5B642] hover:text-[#FF7A1A] transition-colors self-start sm:self-auto"
        >
          Explore More Events
        </Link>
      </div>

      {/* Shared EventGrid with 3-column favorites layout (Task 1) */}
      {isLoading ? (
        <EventGridSkeleton count={Math.min(favorites.length, 6)} variant="favorites" />
      ) : favoriteEvents.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title="No Favorites Yet"
            description="Explore the multiverse index and click the heart icon on any event card to save it to your Sanctum archives."
            action={
              <Link
                to="/events"
                className="inline-flex items-center justify-center font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-md bg-[#FF7A1A] text-[#07060D] hover:bg-[#F5B642] transition-colors active:scale-95"
              >
                Explore Events
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Shared EventGrid — variant="favorites" gives 3-col fixed desktop layout */}
          <EventGrid
            events={visibleEvents}
            priorityCount={2}
            batchKey="favorites"
            variant="favorites"
          />

          {/* Auto-load sentinel */}
          <div ref={sentinelRef} aria-hidden="true" className="h-1" />

          {/* Viewing count + fallback button */}
          <div className="flex flex-col items-center justify-center pt-2 pb-4 gap-2">
            <span aria-live="polite" className="text-[11px] font-mono text-[#B8B3C7]">
              {announceText || `Viewing ${visibleEvents.length} of ${favoriteEvents.length} saved events`}
            </span>

            {remainingCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  const next = Math.min(favoriteEvents.length, visibleCount + 12);
                  setVisibleCount(next);
                  setAnnounceText(`Showing ${next} of ${favoriteEvents.length} saved events`);
                }}
                className="px-6 py-3 rounded-[4px] bg-[#0D1020] hover:bg-[#1A1030] text-[#F3EFE8] hover:text-[#FF7A1A] font-display font-semibold text-sm tracking-wider uppercase border border-[#FF7A1A]/40 transition-all hover:border-[#FF7A1A] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] cursor-pointer"
              >
                Show 12 more
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
