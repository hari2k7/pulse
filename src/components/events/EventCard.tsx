import { useState, type FC, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrefetchEvent } from '../../hooks/useEvents';
import {
  getOptimizedImageUrl,
  getImageSrcSet,
  FALLBACK_IMAGE_DATA_URI,
} from '../../lib/images';
import { formatPrice, formatDateIST } from '../../lib/format';
import type { EventSummary } from '../../lib/types';

export interface EventCardProps {
  event: Partial<EventSummary> & { id: string };
  priority?: boolean;
  className?: string;
}

export const EventCard: FC<EventCardProps> = ({
  event,
  priority = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const { handlers } = usePrefetchEvent(event.id);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const rawImageUrl = event.cover_image_url;
  const hasValidImage = Boolean(rawImageUrl && !imageFailed);
  const optimizedUrl = hasValidImage
    ? getOptimizedImageUrl(rawImageUrl, 500, 333)
    : FALLBACK_IMAGE_DATA_URI;
  const srcSet = hasValidImage
    ? getImageSrcSet(rawImageUrl, [380, 500, 680, 900], 2 / 3)
    : undefined;

  const title = event.name || 'Untitled Event';
  const category = event.category;
  const dateFormatted = formatDateIST(event.schedule_summary);
  const priceFormatted = formatPrice(event.price, event.is_per_head);

  // Dynamic slot calculation: total_seats - seats_filled
  const hasSlotData =
    typeof event.total_seats === 'number' && typeof event.seats_filled === 'number';
  const remainingSlots = hasSlotData
    ? Math.max(0, (event.total_seats as number) - (event.seats_filled as number))
    : null;

  // Determine Active vs Closed state per PROJECT.md Section 6
  // Never show registration open unless registration_status === 'OPEN'
  const isRegistrationClosed =
    event.registration_status === 'CLOSED' ||
    event.registration_status === 'SOLD_OUT' ||
    event.event_status === 'COMPLETED' ||
    (remainingSlots !== null && remainingSlots === 0) ||
    event.registration_status !== 'OPEN';

  const isOpen = !isRegistrationClosed;

  const handleActionClick = (e: MouseEvent, targetTab?: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/events/${event.id}${targetTab ? `?tab=${targetTab}` : ''}`);
  };

  /* =========================================================================
     REFERENCE 1: Active / Registration Open State (Doctor Strange Fire Portal)
     ========================================================================= */
  if (isOpen) {
    return (
      <Link
        to={`/events/${event.id}`}
        {...handlers}
        className={`group relative flex flex-col bg-gradient-to-b from-zinc-950 via-black to-zinc-950 rounded-[6px] border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 card-3d focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 p-3 overflow-hidden ${className}`}
      >
        {/* Floating Red Fire Ember Spark Dots (ignite on hover) */}
        <span
          className="ember left-[12%] bottom-6 [animation-delay:0s]"
          aria-hidden="true"
        />
        <span
          className="ember left-[38%] bottom-10 [animation-delay:1.1s]"
          aria-hidden="true"
        />
        <span
          className="ember left-[68%] bottom-4 [animation-delay:0.5s]"
          aria-hidden="true"
        />
        <span
          className="ember left-[88%] bottom-8 [animation-delay:1.8s]"
          aria-hidden="true"
        />
        <span
          className="ember left-[52%] bottom-2 [animation-delay:2.3s]"
          aria-hidden="true"
        />

        {/* Doctor Strange "Sling Ring" Portal Image Frame */}
        <div className="relative w-full aspect-[3/2] portal-spark-ring shrink-0">
          <div className="portal-spark-inner">
            <img
              src={optimizedUrl}
              srcSet={srcSet}
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 32px), (max-width: 1280px) calc(33vw - 32px), 300px"
              alt={event.cover_image_alt || title}
              width="500"
              height="333"
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding={priority ? 'sync' : 'async'}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />

            {/* Dark gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

            {/* Category Badge on Top-Left */}
            {category && (
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-100 bg-black/85 backdrop-blur-md border border-red-900/70 px-2.5 py-1 rounded-[4px] shadow-sm">
                  {category}
                </span>
              </div>
            )}

            {/* Dynamic Remaining Slots Badge on Top-Right Corner */}
            {remainingSlots !== null && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <span
                  className={`font-mono text-xs font-bold tracking-wider px-2.5 py-1 rounded-[4px] backdrop-blur-md border shadow-md ${
                    remainingSlots <= 5
                      ? 'text-red-300 bg-black/90 border-red-500/80 shadow-[0_0_12px_rgba(255,0,0,0.45)]'
                      : 'text-red-400 bg-black/85 border-red-900/70 shadow-[0_0_8px_rgba(255,0,0,0.25)]'
                  }`}
                >
                  {`${remainingSlots} SLOTS LEFT`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card Content Body */}
        <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between gap-3 relative z-10">
          <div className="space-y-2">
            {/* Date Badge with Calendar Icon */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-red-400 bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded-[4px] w-fit">
              <svg
                className="w-3.5 h-3.5 text-red-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="tracking-wide">{dateFormatted}</span>
            </div>

            {/* Event Title - Multi-line support up to 2 lines without red hover shift */}
            <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug min-h-[2.5rem] sm:min-h-[2.85rem]">
              {title}
            </h3>

            {/* Pricing Info */}
            <div className="flex items-baseline gap-1 text-sm font-mono font-bold text-zinc-100">
              <span className="text-red-400 text-xs font-sans">ENTRY:</span>
              <span>{priceFormatted}</span>
            </div>
          </div>

          {/* Full-Width REGISTER Action Button */}
          <div className="pt-2 border-t border-red-950/40">
            <button
              type="button"
              onClick={(e) => handleActionClick(e, 'register')}
              className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-900 hover:from-red-500 hover:via-red-600 hover:to-red-800 text-white font-bold rounded-[4px] py-2 px-4 text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_24px_rgba(239,68,68,0.85)] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <span>REGISTER</span>
            </button>
          </div>
        </div>
      </Link>
    );
  }

  /* =========================================================================
     REFERENCE 2: Closed / Registration Ended State (Shadowed Ash-Grey Embers)
     ========================================================================= */
  return (
    <Link
      to={`/events/${event.id}`}
      {...handlers}
      className={`group relative flex flex-col bg-gradient-to-b from-zinc-950 via-black to-zinc-950 rounded-[6px] border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(39,39,42,0.5)] card-3d focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 p-3 overflow-hidden ${className}`}
    >
      {/* Floating Whitish-Grey Ash/Dust Ember Particles (ignite on hover) */}
      <span
        className="ash-ember left-[15%] bottom-5 [animation-delay:0s]"
        aria-hidden="true"
      />
      <span
        className="ash-ember left-[35%] bottom-8 [animation-delay:0.9s]"
        aria-hidden="true"
      />
      <span
        className="ash-ember left-[65%] bottom-4 [animation-delay:1.5s]"
        aria-hidden="true"
      />
      <span
        className="ash-ember left-[85%] bottom-7 [animation-delay:0.4s]"
        aria-hidden="true"
      />

      {/* Static Shadowed Frame (No revolving fire ring, desaturated image) */}
      <div className="relative w-full aspect-[3/2] rounded-[8px] p-[3px] bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shrink-0">
        <div className="relative w-full h-full rounded-[5px] overflow-hidden bg-zinc-950">
          <img
            src={optimizedUrl}
            srcSet={srcSet}
            sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 32px), (max-width: 1280px) calc(33vw - 32px), 300px"
            alt={event.cover_image_alt || title}
            width="500"
            height="333"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover grayscale opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500 ease-out"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Category Badge on Top-Left */}
          {category && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 bg-black/90 backdrop-blur-md border border-zinc-700/80 px-2.5 py-1 rounded-[4px] shadow-sm">
                {category}
              </span>
            </div>
          )}

          {/* Registration Closed Badge on Top-Right Corner */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="font-mono text-xs font-bold tracking-wider text-zinc-200 bg-black/90 backdrop-blur-md border border-zinc-700/80 px-2.5 py-1 rounded-[4px] shadow-sm">
              REGISTRATION CLOSED
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between gap-3 relative z-10">
        <div className="space-y-2">
          {/* Muted Date Badge with Calendar Icon */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 px-2 py-0.5 rounded-[4px] w-fit">
            <svg
              className="w-3.5 h-3.5 text-zinc-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="tracking-wide">{dateFormatted}</span>
          </div>

          {/* Event Title - Multi-line support up to 2 lines */}
          <h3 className="text-base sm:text-lg font-bold text-zinc-300 group-hover:text-white transition-colors duration-200 line-clamp-2 leading-snug min-h-[2.5rem] sm:min-h-[2.85rem]">
            {title}
          </h3>

          {/* Pricing Info */}
          <div className="flex items-baseline gap-1 text-sm font-mono font-bold text-zinc-400">
            <span className="text-zinc-500 text-xs font-sans">ENTRY:</span>
            <span>{priceFormatted}</span>
          </div>
        </div>

        {/* Full-Width EXPLORE Action Button */}
        <div className="pt-2 border-t border-zinc-900/80">
          <button
            type="button"
            onClick={(e) => handleActionClick(e)}
            className="w-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 hover:border-zinc-600 rounded-[4px] py-2 px-4 text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <span>EXPLORE</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export const EventCardSkeleton: FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col bg-gradient-to-b from-zinc-950 via-black to-zinc-950 rounded-[6px] border border-red-950/50 p-3 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* 3:2 Image placeholder with portal border styling */}
      <div className="relative aspect-[3/2] w-full bg-zinc-900 rounded-[5px] border border-red-950/60 animate-pulse motion-reduce:animate-none overflow-hidden shrink-0" />

      {/* Card Body Skeleton */}
      <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-red-950/40 rounded-[3px] animate-pulse motion-reduce:animate-none" />
          <div className="space-y-1.5 min-h-[2.5rem] sm:min-h-[2.85rem]">
            <div className="h-4.5 w-4/5 bg-zinc-800 rounded-[3px] animate-pulse motion-reduce:animate-none" />
            <div className="h-3.5 w-3/5 bg-zinc-800/60 rounded-[3px] animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="h-4 w-24 bg-zinc-800 rounded-[3px] animate-pulse motion-reduce:animate-none" />
        </div>

        {/* Full-width button placeholder */}
        <div className="pt-2 border-t border-red-950/40">
          <div className="w-full h-8 bg-zinc-900 rounded-[4px] animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
};
