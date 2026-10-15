import { useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvents } from '../hooks/useEvents';
import { useFavorites } from '../lib/favorites';
import { EventCard, EventCardSkeleton } from '../components/events/EventCard';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';

export const FavoritesPage: FC = () => {
  useDocumentMeta({
    title: 'Favorites — STRANGE',
    description: 'Your saved favorite multiverse events and hackathons.',
  });

  const { status, events, stale, error, retry } = useEvents();
  const { favorites } = useFavorites();

  // Filter events from useEvents() by saved ids in favorites (ignore obsolete ids)
  const favoriteEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    const favSet = new Set(favorites);
    return events.filter((e) => favSet.has(e.id));
  }, [events, favorites]);

  // Error state with retry
  if (status === 'error' && favorites.length > 0 && favoriteEvents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-16 min-h-[60vh] flex items-center justify-center">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-12 md:pb-16 space-y-8 bg-[#07060D] text-[#F3EFE8] min-h-[70vh]">
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8]">
              FAVORITES
            </h1>
            <span
              aria-live="polite"
              className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#FF7A1A]/20 border border-[#FF7A1A]/40 text-[#F5B642]"
            >
              {isLoading ? favorites.length : favoriteEvents.length}
            </span>
          </div>
          <p className="text-sm text-[#B8B3C7]">
            Your curated collection of bookmarked dimensions and competitions.
          </p>
        </div>

        <Link
          to="/events"
          className="text-xs font-bold uppercase tracking-wider text-[#F5B642] hover:text-[#FF7A1A] transition-colors self-start sm:self-auto"
        >
          Explore More Events
        </Link>
      </div>

      {/* Empty State vs Uniform Shared EventCard Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {Array.from({ length: Math.min(favorites.length, 6) }).map((_, i) => (
            <div key={i} className="h-full">
              <EventCardSkeleton className="animate-pulse h-full" />
            </div>
          ))}
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {favoriteEvents.map((event) => (
            <div key={event.id} className="h-full">
              <EventCard event={event} className="h-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
