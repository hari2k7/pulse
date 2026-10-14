import type { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvent } from '../hooks/useEvents';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/states/ErrorState';
import { NotFound } from '../components/states/NotFound';
import { getOptimizedImageUrl, getImageSrcSet, FALLBACK_IMAGE_DATA_URI } from '../lib/images';

export const EventDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { status, event, error, isPlaceholder, retry } = useEvent(id);

  useDocumentMeta({
    title: event ? `${event.name} — PULSE` : 'Event Detail — PULSE',
    description: event?.blurb || 'Event schedule, tickets, and detail.',
  });

  if (status === 'error') {
    if (error?.kind === 'notfound' || error?.status === 404) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16">
          <NotFound
            title="Event Not Found"
            message="The event you requested does not exist or may have been removed."
          />
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Failed to Load Event Detail"
          message={error?.message || 'An error occurred while fetching this event.'}
          errorKind={error?.kind}
          onRetry={retry}
        />
      </div>
    );
  }

  if (status === 'loading' && !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <Skeleton variant="rect" height={360} className="w-full aspect-[16/9]" />
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="80%" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {isPlaceholder && (
        <div
          className="bg-[#1c1c1c] border border-white/10 rounded-[4px] px-4 py-2 text-xs text-[#b3b3b3] flex items-center justify-between"
          role="status"
        >
          <span>Loading full details (schedule, FAQs, prizes)...</span>
          <span className="w-3 h-3 border-2 border-white/20 border-t-[#e50914] rounded-full animate-spin" />
        </div>
      )}

      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[4px] overflow-hidden bg-[#181818] border border-white/10">
        <img
          src={getOptimizedImageUrl(event.banner_image_url || event.cover_image_url, 1200, 600)}
          srcSet={
            getImageSrcSet(event.banner_image_url || event.cover_image_url, [600, 900, 1200, 1600], 0.5) ||
            undefined
          }
          sizes="(max-width: 1024px) 100vw, 1024px"
          alt={event.banner_image_alt || event.cover_image_alt || event.name}
          width="1200"
          height="600"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE_DATA_URI;
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2 items-center">
          <Badge variant="surface">{event.category}</Badge>
          <StatusBadge type="event" status={event.event_status} size="sm" />
          <StatusBadge type="registration" status={event.registration_status} size="sm" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-display font-normal tracking-wide text-white">
          {event.name}
        </h1>
        <p className="text-base md:text-lg text-[#b3b3b3] leading-relaxed">
          {event.blurb}
        </p>

        {event.description && (
          <div className="pt-6 border-t border-white/10 space-y-4 text-sm md:text-base text-[#d1d5db] leading-relaxed">
            {event.description.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-white/10 flex items-center justify-between">
        <Link to="/events">
          <Button variant="secondary" size="md">
            &larr; Back to Events
          </Button>
        </Link>
        <span className="text-lg font-bold text-white">
          {event.price === 0 ? 'Free' : `₹${event.price}`}
          <span className="text-xs text-[#b3b3b3] ml-1">
            {event.is_per_head ? 'per person' : 'per team'}
          </span>
        </span>
      </div>
    </div>
  );
};
