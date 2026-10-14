import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvents, usePrefetchEvent } from '../hooks/useEvents';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { EventsGridSkeleton } from '../components/events/EventsGridSkeleton';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { Button } from '../components/ui/Button';
import { getOptimizedImageUrl, getImageSrcSet, FALLBACK_IMAGE_DATA_URI } from '../lib/images';
import type { EventSummary } from '../lib/types';

const EventCard: FC<{ event: EventSummary; priority?: boolean }> = ({ event, priority = false }) => {
  const { handlers } = usePrefetchEvent(event.id);
  const optimizedUrl = getOptimizedImageUrl(event.cover_image_url, 500, 333);
  const srcSet = getImageSrcSet(event.cover_image_url, [380, 500, 680, 900], 2 / 3);

  return (
    <Link
      to={`/events/${event.id}`}
      {...handlers}
      className="group flex flex-col bg-[#181818] rounded-[4px] border border-white/5 overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
    >
      <div className="relative aspect-[3/2] w-full bg-[#222222] overflow-hidden">
        <img
          src={optimizedUrl}
          srcSet={srcSet || undefined}
          sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 32px), (max-width: 1280px) calc(33vw - 32px), 300px"
          alt={event.cover_image_alt || event.name}
          width="500"
          height="333"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE_DATA_URI;
          }}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <Badge variant="surface" size="sm">
            {event.category}
          </Badge>
          {event.is_featured && (
            <Badge variant="accent" size="sm">
              Featured
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white group-hover:text-[#e50914] transition-colors line-clamp-1">
            {event.name}
          </h2>
          <p className="text-xs text-[#b3b3b3] line-clamp-2 mt-1">{event.blurb}</p>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <StatusBadge type="registration" status={event.registration_status} size="sm" />
          <span className="font-semibold text-white">
            {event.price === 0 ? 'Free' : `₹${event.price}`}
          </span>
        </div>
      </div>
    </Link>
  );
};

export const EventsPage: FC = () => {
  useDocumentMeta({
    title: 'Events — PULSE',
    description: "Feel what's happening. Browse upcoming events, workshops and competitions.",
  });

  const { status, events, stale, error, retry } = useEvents();

  if (status === 'loading') {
    return <EventsGridSkeleton />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8 min-h-[60vh]">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl md:text-5xl font-display font-normal tracking-wide text-white">
          DISCOVER EVENTS
        </h1>
        <p className="text-sm md:text-base text-[#b3b3b3] mt-2">
          Filter and explore workshops, competitions, and challenges.
        </p>
      </div>

      {stale && (
        <div
          className="bg-[#1c1c1c] border border-amber-500/30 rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          role="status"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs sm:text-sm text-white">
              <strong className="text-amber-400">Showing saved data:</strong> The live network call could not be completed.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {status === 'error' && (
        <ErrorState
          title="Failed to Load Events"
          message={error?.message || 'Unable to retrieve events from the server.'}
          errorKind={error?.kind}
          onRetry={retry}
        />
      )}

      {status === 'success' && events.length === 0 && (
        <EmptyState
          title="No Events Found"
          description="There are currently no events matching this view."
        />
      )}

      {status === 'success' && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} priority={index < 2} />
          ))}
        </div>
      )}
    </div>
  );
};
