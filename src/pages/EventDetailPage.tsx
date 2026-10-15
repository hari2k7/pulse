import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  type FC,
} from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvent, useEvents } from '../hooks/useEvents';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EventCard } from '../components/events/EventCard';
import { ErrorState } from '../components/states/ErrorState';
import { NotFound } from '../components/states/NotFound';
import { downloadIcs } from '../lib/calendar';
import {
  formatDateIST,
  formatPrice,
  formatSeatsText,
  seatsPercentage,
  seatsLeft,
} from '../lib/format';
import {
  getOptimizedImageUrl,
  getImageSrcSet,
  FALLBACK_IMAGE_DATA_URI,
} from '../lib/images';
import { useFavorites } from '../lib/favorites';
import { getThemeForCategory, isUpcomingEvent } from '../lib/themes';
import { EventDetailSkeleton } from '../components/events/EventDetailSkeleton';
import { runAfterLoadAndIdle } from '../lib/idle';

const GalleryLightbox = lazy(() =>
  import('../components/events/GalleryLightbox').then((m) => ({ default: m.GalleryLightbox }))
);

export const EventDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { status, event, error, isPlaceholder, retry } = useEvent(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = event ? isFavorite(event.id) : false;

  const [shareFeedback, setShareFeedback] = useState<string>('');
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true });
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTriggerId, setActiveTriggerId] = useState<string>('');
  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const bannerImgRef = useRef<HTMLImageElement>(null);
  const [isDrifting, setIsDrifting] = useState(true);
  const [cloakRemoved, setCloakRemoved] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [cloakSwept, setCloakSwept] = useState(false);

  // One-time cloak reveal on load (sweeps off in 700ms then removed from DOM)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const animTimer = setTimeout(() => {
      setCloakSwept(true);
    }, 50);

    const removeTimer = setTimeout(() => {
      setCloakRemoved(true);
    }, 750);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(removeTimer);
    };
  }, [event?.id]);

  // Ken Burns drift pausing when tab is hidden or offscreen
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleVisibility = () => {
      setIsDrifting(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let observer: IntersectionObserver | null = null;
    if (bannerContainerRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        setIsDrifting(entry.isIntersecting && document.visibilityState === 'visible');
      });
      observer.observe(bannerContainerRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      observer?.disconnect();
    };
  }, [event?.id]);

  // Subtle parallax on scroll (image translateY at most 40px) via GSAP ScrollTrigger
  // Starts after load + idle; disabled on non-fine pointer or saveData to protect LCP
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mmRef: { revert: () => void } | null = null;

    const initParallax = async () => {
      if (
        (typeof navigator !== 'undefined' &&
          Boolean((navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData)) ||
        !window.matchMedia('(pointer: fine)').matches
      ) {
        return;
      }

      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        const mm = gsap.matchMedia();

        mm.add('(prefers-reduced-motion: no-preference)', () => {
          if (bannerImgRef.current && bannerContainerRef.current) {
            gsap.to(bannerImgRef.current, {
              y: 40,
              ease: 'none',
              scrollTrigger: {
                trigger: bannerContainerRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            });
          }
        });

        mmRef = mm;
      } catch {
        // Ignore
      }
    };

    const cancelIdle = runAfterLoadAndIdle(initParallax);
    return () => {
      cancelIdle();
      mmRef?.revert();
    };
  }, [event?.id]);

  // SEO metadata per route pattern: "{event name} — STRANGE"
  useDocumentMeta({
    title: event?.name ? `${event.name} — STRANGE` : 'Event Detail — STRANGE',
    description: event?.blurb || 'Event schedule, tickets, and detail.',
  });

  // Share handler
  const handleShare = async () => {
    if (!event) return;

    const shareData = {
      title: `${event.name} — STRANGE`,
      text: event.blurb || `Check out ${event.name} at STRANGE`,
      url: window.location.href,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareFeedback('Link copied to clipboard!');
      setTimeout(() => setShareFeedback(''), 3000);
    } catch {
      setShareFeedback('Failed to copy link');
      setTimeout(() => setShareFeedback(''), 3000);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const [loadRelated, setLoadRelated] = useState(false);
  useEffect(() => {
    return runAfterLoadAndIdle(() => setLoadRelated(true));
  }, []);
  const { events: allEvents } = useEvents({ enabled: loadRelated });
  const moreTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const theme = event ? getThemeForCategory(event.category) : 'More';

  const moreEvents = useMemo(() => {
    if (!event || theme === 'More' || !allEvents || allEvents.length === 0) {
      return [];
    }
    return allEvents
      .filter((e) => e.id !== event.id && getThemeForCategory(e.category) === theme)
      .sort((a, b) => {
        const aUpcoming = a.event_status === 'ACTIVE' || isUpcomingEvent(a);
        const bUpcoming = b.event_status === 'ACTIVE' || isUpcomingEvent(b);
        if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
        const dateA = a.schedule_summary?.start_date ? new Date(a.schedule_summary.start_date).getTime() : Infinity;
        const dateB = b.schedule_summary?.start_date ? new Date(b.schedule_summary.start_date).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [event, theme, allEvents]);

  const checkMoreScroll = useCallback(() => {
    const el = moreTrackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkMoreScroll();
    const el = moreTrackRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkMoreScroll, { passive: true });
    window.addEventListener('resize', checkMoreScroll);
    return () => {
      el.removeEventListener('scroll', checkMoreScroll);
      window.removeEventListener('resize', checkMoreScroll);
    };
  }, [checkMoreScroll, moreEvents]);

  const handleMoreScroll = (direction: 'left' | 'right') => {
    const el = moreTrackRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth : 280;
    const gap = 24;
    const scrollAmount = cardWidth + gap;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMoreKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== moreTrackRef.current) return;
    if (e.key === 'ArrowLeft') {
      handleMoreScroll('left');
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      handleMoreScroll('right');
      e.preventDefault();
    }
  };

  // Loading skeleton state
  if (status === 'loading') {
    return <EventDetailSkeleton />;
  }

  // Not found state
  if (error?.kind === 'notfound' || (!event && status === 'success')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-20 min-h-[60vh] flex items-center justify-center">
        <NotFound
          title="Event Not Found"
          message="The event you are looking for does not exist or has been removed."
        />
      </div>
    );
  }

  // Error state
  if (status === 'error' || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-20 min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Failed to Load Event"
          message={error?.message || 'Unable to retrieve event details. Please try again.'}
          errorKind={error?.kind}
          onRetry={retry}
        />
      </div>
    );
  }

  // Derived event properties
  const bannerUrl = event.banner_image_url || event.cover_image_url;
  const hasValidImage = Boolean(bannerUrl && !imageFailed);
  const optimizedBanner = hasValidImage
    ? getOptimizedImageUrl(bannerUrl, 1920, 1080)
    : FALLBACK_IMAGE_DATA_URI;
  const bannerSrcSet = hasValidImage
    ? getImageSrcSet(bannerUrl, [380, 600, 900, 1400, 1920], 9 / 16)
    : undefined;

  const remaining = seatsLeft(event.total_seats, event.seats_filled);
  const seatsPct = seatsPercentage(event.total_seats, event.seats_filled);
  const isPerHead = event.is_per_head !== false;
  const seatsText = formatSeatsText(event);

  // Venue from schedules array
  const scheduleVenue = event.schedules?.[0]?.venue || '';

  const isOpen = event.registration_status === 'OPEN';

  // Section presence flags for full-width auto-span
  const hasSchedule = Boolean(event.schedules?.length || event.schedule_summary?.start_date);
  const hasPrizes = !isPlaceholder && Boolean(event.prizes && event.prizes.length > 0);
  const hasExpect = Boolean(event.what_to_expect && event.what_to_expect.length > 0);
  const hasEligibility = !isPlaceholder && Boolean(
    (event.eligibility && event.eligibility.length > 0) ||
    (event.prerequisites && event.prerequisites.length > 0)
  );
  const hasRules = !isPlaceholder && Boolean(event.rules && event.rules.length > 0);
  const hasFaqs = !isPlaceholder && Boolean(event.faqs && event.faqs.length > 0);
  const hasGallery = !isPlaceholder && Boolean(event.gallery_images && event.gallery_images.length > 0);
  const coordinators = event.coordinators || [];
  const organizers = event.organizers || [];
  const hasContacts = !isPlaceholder && (coordinators.length > 0 || organizers.length > 0);

  return (
    <div className="w-full flex flex-col bg-[#07060D] text-[#F3EFE8] pt-16 sm:pt-20">
      {/* -------------------------------------------------------------
          1. TOP BANNER IMAGE: Clear area showing image at full brightness
          Desktop: ~55vh (min 280px, max 560px), Mobile: ~240px
          ------------------------------------------------------------- */}
      <section
        ref={bannerContainerRef}
        aria-label="Event Banner"
        className="relative w-full h-[240px] md:h-[55vh] md:min-h-[280px] md:max-h-[560px] bg-[#07060D] overflow-hidden select-none"
      >
        {/* Banner Image with Ken Burns drift & Parallax (full brightness, no dark overlay across middle) */}
        <img
          ref={bannerImgRef}
          src={optimizedBanner}
          srcSet={bannerSrcSet}
          sizes="100vw"
          alt={event.banner_image_alt || event.cover_image_alt || event.name}
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          style={{
            viewTransitionName: `event-img-${event.id}`,
            animationPlayState: isDrifting ? 'running' : 'paused',
          }}
          className="w-full h-full object-cover object-center md:animate-ken-burns motion-reduce:transform-none"
        />

        {/* The ONLY scrim: light gradient at the very bottom edge (last ~25%) blending into page bg */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#07060D] via-[#07060D]/50 to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* One large, faint orange portal ring partly cropped at right edge (rotating 60s+, low opacity) */}
        <div
          className="absolute -right-20 -top-20 w-[340px] h-[340px] md:w-[460px] md:h-[460px] z-10 pointer-events-none opacity-20 select-none overflow-visible"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full md:motion-safe:animate-[spin_75s_linear_infinite] motion-reduce:animate-none"
            fill="none"
          >
            <circle cx="100" cy="100" r="92" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="100" cy="100" r="80" stroke="#F5B642" strokeWidth="1" strokeDasharray="12 6" />
            <circle cx="100" cy="100" r="68" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="4 8" opacity="0.6" />
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="8"
                x2="100"
                y2="18"
                stroke="#F5B642"
                strokeWidth="1.5"
                transform={`rotate(${i * 30} 100 100)`}
              />
            ))}
          </svg>
        </div>

        {/* One-time cloak reveal on load (deep red fabric texture sweeps off in 700ms then removed from DOM) */}
        {!cloakRemoved && (
          <div
            className={`absolute inset-0 z-30 pointer-events-none transition-transform duration-700 ease-out motion-reduce:hidden ${
              cloakSwept ? '-translate-x-full' : 'translate-x-0'
            }`}
            style={{
              background: `repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 2px, transparent 2px, transparent 6px), linear-gradient(135deg, #42060B 0%, #6E0B15 45%, #8B0E1B 65%, #380509 100%)`,
              boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.9)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Thin double gold line with center diamond ornament at bottom edge of banner */}
        <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-none">
          <div className="w-full h-[1px] bg-[#F5B642]/60 shadow-[0_0_6px_rgba(245,182,66,0.5)]" />
          <div className="w-full h-[1px] mt-[1px] bg-[#FF7A1A]/80 shadow-[0_0_8px_rgba(255,122,26,0.6)]" />
          <div
            className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-[#F5B642] border border-[#FF7A1A] shadow-[0_0_8px_#FF7A1A]"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. HERO CONTENT: Sits BELOW the image area on page background
          On desktop the title block overlaps the image bottom edge by max 48px
          ------------------------------------------------------------- */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-12 space-y-5 w-full">
        {/* Navigation Breadcrumb & Category/Mode Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/events"
            className="text-xs uppercase tracking-wider font-semibold text-[#FF7A1A] hover:text-[#F5B642] transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#07060D]/95 border border-white/10 shadow-md backdrop-blur-xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Events</span>
          </Link>
          <span className="text-white/20">•</span>
          {event.category && (
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-[#07060D]/95 border border-white/15 text-[#F3EFE8] shadow-md backdrop-blur-xs">
              {event.category}
            </span>
          )}
          {event.is_featured && <Badge variant="accent">Featured</Badge>}
          {event.event_mode && <Badge variant="outline">{event.event_mode}</Badge>}
        </div>

        {/* Title & Blurb on solid page background with AA contrast */}
        <div className="space-y-3 pt-1">
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#F3EFE8] leading-tight max-w-4xl drop-shadow-sm">
            {event.name}
          </h1>

          {event.blurb && (
            <p className="text-sm sm:text-base text-[#B8B3C7] max-w-3xl leading-relaxed">
              {event.blurb}
            </p>
          )}
        </div>

        {/* Compact Horizontal Facts Strip with Primary Action Beside It & 48px Heart */}
        <div className="p-4 rounded-xl bg-[#0D1020] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <div>
              <span className="text-[#B8B3C7] block text-[10px] uppercase font-semibold">Date & Time</span>
              <span className="font-mono text-[#F3EFE8] font-medium">{formatDateIST(event.schedule_summary)}</span>
            </div>
            {scheduleVenue && (
              <div>
                <span className="text-[#B8B3C7] block text-[10px] uppercase font-semibold">Venue</span>
                <span className="text-[#F3EFE8] font-medium">{scheduleVenue}</span>
              </div>
            )}
            {event.min_teamsize && event.max_teamsize && (
              <div>
                <span className="text-[#B8B3C7] block text-[10px] uppercase font-semibold">Team Size</span>
                <span className="text-[#F3EFE8] font-medium">
                  {event.min_teamsize === event.max_teamsize
                    ? `${event.min_teamsize} Member${event.min_teamsize > 1 ? 's' : ''}`
                    : `${event.min_teamsize} – ${event.max_teamsize} Members`}
                </span>
              </div>
            )}
            {event.registration_deadline && (
              <div>
                <span className="text-[#B8B3C7] block text-[10px] uppercase font-semibold">Deadline</span>
                <span className="font-mono text-[#F3EFE8] font-medium">{formatDateIST(event.registration_deadline)}</span>
              </div>
            )}
            <div>
              <span className="text-[#B8B3C7] block text-[10px] uppercase font-semibold">Status</span>
              {event.registration_status && (
                <StatusBadge type="registration" status={event.registration_status} size="sm" />
              )}
            </div>
          </div>

          {/* Primary Action Button beside facts strip + Heart Toggle */}
          <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 flex items-center gap-2">
            {isOpen ? (
              <a
                href="#summary-card"
                className="inline-flex items-center justify-center uppercase tracking-wider font-bold text-xs px-5 py-2.5 rounded-md bg-[#FF7A1A] text-[#07060D] hover:bg-[#F5B642] transition-colors active:scale-95 shadow-md"
              >
                Register
              </a>
            ) : (
              <span className="inline-block px-2.5 py-1 rounded-[4px] border border-white/10 bg-[#141416] text-[12px] font-semibold font-sans normal-case text-[#9CA3AF]">
                {event.registration_status === 'SOLD_OUT'
                  ? 'Sold out'
                  : event.event_status === 'COMPLETED'
                  ? 'Completed'
                  : 'Registration closed'}
              </span>
            )}

            {/* Heart Toggle Button: 48px visual & hit area with 24px icon */}
            <button
              type="button"
              onClick={() => event && toggleFavorite(event.id)}
              aria-pressed={isFav}
              aria-label={isFav ? `Remove ${event.name} from favorites` : `Add ${event.name} to favorites`}
              className={`w-12 h-12 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border bg-[#0D1020] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] active:scale-95 motion-reduce:active:scale-100 ${
                isFav
                  ? 'border-[#FF7A1A]/60 text-[#FF7A1A]'
                  : 'border-white/15 text-[#B8B3C7] hover:text-[#FF7A1A] hover:border-[#FF7A1A]/40'
              }`}
            >
              <svg
                className={`w-6 h-6 transition-transform ${
                  isFav ? 'fill-[#FF7A1A] text-[#FF7A1A] scale-105' : 'fill-none text-[#B8B3C7]'
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          COMPOSED 12-COLUMN MAIN LAYOUT
          ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full">
        {/* ROW 1: Overview (Wide) + Sticky Summary Card (Narrow) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Summary Card: On mobile appears right under the hero; on desktop is sticky in the narrow column */}
          <aside id="summary-card" className="order-1 lg:order-2 lg:col-span-4 lg:sticky lg:top-28 space-y-4">
            <div className="p-5 sm:p-6 rounded-xl bg-[#0D1020] border border-white/10 shadow-xl space-y-5">
              {/* Price */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#B8B3C7] block">
                  Registration Entry
                </span>
                <div className="font-display font-bold text-3xl text-[#F3EFE8]">
                  {formatPrice(event.price, event.is_per_head)}
                </div>
                <p className="text-xs text-[#B8B3C7] mt-0.5">
                  {isPerHead ? 'Individual pass' : 'Full team pass'}
                </p>
              </div>

              {/* Seats remaining bar */}
              {remaining !== null && event.event_status === 'ACTIVE' && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#B8B3C7]">Capacity</span>
                    <span className={`font-semibold ${remaining <= 5 ? 'text-[#FF7A1A]' : 'text-[#F3EFE8]'}`}>
                      {seatsText}
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full bg-[#07060D] overflow-hidden"
                    role="progressbar"
                    aria-valuenow={seatsPct ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`h-full transition-all duration-500 ${
                        remaining <= 5 ? 'bg-[#FF7A1A]' : 'bg-[#3DDC97]'
                      }`}
                      style={{ width: `${seatsPct ?? 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Registration status & deadline */}
              <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#B8B3C7]">Registration</span>
                  {event.registration_status && (
                    <StatusBadge type="registration" status={event.registration_status} size="sm" />
                  )}
                </div>
                {event.registration_deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#B8B3C7]">Closes</span>
                    <span className="text-[#F3EFE8] font-mono">{formatDateIST(event.registration_deadline)}</span>
                  </div>
                )}
              </div>

              {/* Primary action & honest registration notice */}
              <div className="pt-2 space-y-2">
                <div
                  className={`w-full py-2.5 px-3 rounded-lg text-center text-xs font-bold uppercase tracking-wider ${
                    isOpen
                      ? 'bg-gradient-to-r from-[#FF7A1A] to-[#F5B642] text-[#07060D] border border-[#FF7A1A]'
                      : 'bg-white/5 border border-white/10 text-[#B8B3C7]'
                  }`}
                >
                  {isOpen
                    ? 'REGISTER'
                    : event.registration_status === 'SOLD_OUT'
                    ? 'SOLD OUT'
                    : event.event_status === 'COMPLETED'
                    ? 'COMPLETED'
                    : 'REGISTRATION CLOSED'}
                </div>
                {isOpen && (
                  <p className="text-[11px] text-[#B8B3C7] text-center leading-normal">
                    Registration is open on-campus at event desks until{' '}
                    <span className="font-mono text-[#F5B642]">
                      {event.registration_deadline ? formatDateIST(event.registration_deadline) : 'start time'}
                    </span>
                    .
                  </p>
                )}
              </div>

              {/* Calendar & Share Utilities */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold"
                  onClick={() => downloadIcs(event)}
                >
                  Add to Calendar (.ics)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-[#B8B3C7] font-semibold"
                  onClick={handleShare}
                >
                  Share Event
                </Button>
                {shareFeedback && (
                  <p className="text-[11px] text-[#3DDC97] text-center font-medium">
                    {shareFeedback}
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Overview Content in Wide Column */}
          <section className="order-2 lg:order-1 lg:col-span-8 space-y-6">
            <div className="p-6 rounded-xl bg-[#0D1020] border border-white/10 space-y-5">
              <h2 className="text-xl font-display font-bold text-[#F3EFE8] uppercase tracking-wide">
                Overview
              </h2>

              {event.description ? (
                <div className="space-y-4 text-sm sm:text-base text-[#B8B3C7] leading-relaxed">
                  {event.description.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#B8B3C7]">{event.blurb}</p>
              )}

              {event.highlights && event.highlights.length > 0 && (
                <div className="p-4 rounded-lg bg-[#07060D] border border-[#FF7A1A]/30 space-y-2.5 mt-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#F5B642]">
                    Key Highlights
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#B8B3C7]">
                    {event.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#FF7A1A] font-bold shrink-0">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ROW 2: Schedule & Prizes side by side as two panels (stack on mobile) */}
        {(hasSchedule || hasPrizes) && (
          <div className={`grid grid-cols-1 ${hasSchedule && hasPrizes ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
            {hasSchedule && (
              <section className="p-6 rounded-xl bg-[#0D1020] border border-white/10 space-y-4">
                <h2 className="text-xl font-display font-bold text-[#F3EFE8] uppercase tracking-wide">
                  Schedule
                </h2>
                <div className="space-y-3">
                  {event.schedules && event.schedules.length > 0 ? (
                    event.schedules.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg bg-[#07060D] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-mono text-xs text-[#FF7A1A] font-bold block">
                            Day {idx + 1} • {item.event_date ? formatDateIST(item.event_date) : 'TBA'}
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-[#F3EFE8] mt-0.5">
                            {item.start_time || '09:00'} – {item.end_time || '17:00'} IST
                          </p>
                        </div>
                        {(item.venue || scheduleVenue) && (
                          <div className="text-xs text-[#B8B3C7]">
                            {item.venue || scheduleVenue}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-lg bg-[#07060D] border border-white/10 text-xs">
                      <p className="text-[#F3EFE8] font-semibold">
                        {formatDateIST(event.schedule_summary)}
                      </p>
                      {scheduleVenue && (
                        <p className="text-[#B8B3C7] mt-1">{scheduleVenue}</p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {hasPrizes && (
              <section className="p-6 rounded-xl bg-[#0D1020] border border-[#F5B642]/30 space-y-4">
                <h2 className="text-xl font-display font-bold text-[#F5B642] uppercase tracking-wide">
                  Prizes & Rewards
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.prizes?.map((prize, idx) => {
                    const isGold = prize.rank === 1 || idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border flex flex-col justify-between space-y-2 ${
                          isGold
                            ? 'bg-[#1A1030] border-[#F5B642]/50'
                            : 'bg-[#07060D] border-white/10'
                        }`}
                      >
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isGold ? 'text-[#F5B642]' : 'text-[#B8B3C7]'}`}>
                            {prize.rank ? `Rank #${prize.rank}` : 'Prize'}
                          </span>
                          <h3 className="font-display font-bold text-sm text-[#F3EFE8] mt-0.5">
                            {prize.title || (isGold ? 'Winner' : 'Runner Up')}
                          </h3>
                          {prize.description && (
                            <p className="text-xs text-[#B8B3C7] mt-1">{prize.description}</p>
                          )}
                        </div>
                        {typeof prize.amount === 'number' && prize.amount > 0 && (
                          <div className="font-mono text-xl font-bold text-[#F5B642] pt-2 border-t border-white/5">
                            ₹{prize.amount.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ROW 3: What to Expect & Eligibility/Prerequisites side by side */}
        {(hasExpect || hasEligibility) && (
          <div className={`grid grid-cols-1 ${hasExpect && hasEligibility ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
            {hasExpect && (
              <section className="p-6 rounded-xl bg-[#0D1020] border border-white/10 space-y-4">
                <h2 className="text-xl font-display font-bold text-[#3BA3FF] uppercase tracking-wide">
                  What to Expect
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#B8B3C7]">
                  {event.what_to_expect?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[#3BA3FF] font-bold shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {hasEligibility && (
              <section className="p-6 rounded-xl bg-[#0D1020] border border-white/10 space-y-4">
                <h2 className="text-xl font-display font-bold text-[#F3EFE8] uppercase tracking-wide">
                  Eligibility & Prerequisites
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-[#B8B3C7]">
                  {event.eligibility && event.eligibility.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5B642]">
                        Eligibility
                      </h3>
                      <ul className="space-y-1.5">
                        {event.eligibility.map((el, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <svg className="w-3.5 h-3.5 text-[#3DDC97] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{el}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {event.prerequisites && event.prerequisites.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#3BA3FF]">
                        Prerequisites
                      </h3>
                      <ul className="space-y-1.5">
                        {event.prerequisites.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#3BA3FF] shrink-0">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ROW 4: Rules & FAQs side by side (FAQs as accordion, rules as numbered list) */}
        {(hasRules || hasFaqs) && (
          <div className={`grid grid-cols-1 ${hasRules && hasFaqs ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
            {hasRules && (
              <section className="p-6 rounded-xl bg-[#0D1020] border border-white/10 space-y-4">
                <h2 className="text-xl font-display font-bold text-[#F3EFE8] uppercase tracking-wide">
                  Rules & Guidelines
                </h2>
                <ol className="space-y-2.5">
                  {event.rules?.map((rule, idx) => (
                    <li
                      key={idx}
                      className="p-3.5 rounded-lg bg-[#07060D] border border-white/10 text-xs sm:text-sm text-[#B8B3C7] flex items-start gap-3"
                    >
                      <span className="font-mono font-bold text-[#FF7A1A] shrink-0">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {hasFaqs && (
              <section className="p-6 rounded-xl bg-[#0D1020] border border-white/10 space-y-4">
                <h2 className="text-xl font-display font-bold text-[#F3EFE8] uppercase tracking-wide">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2.5">
                  {event.faqs?.map((faq, idx) => {
                    const isOpenState = Boolean(openFaqs[idx]);
                    return (
                      <div
                        key={idx}
                        className="rounded-lg bg-[#07060D] border border-white/10 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(idx)}
                          aria-expanded={isOpenState}
                          aria-controls={`faq-answer-${idx}`}
                          className="w-full p-3.5 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-[#F3EFE8] hover:text-[#FF7A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
                        >
                          <span>{faq.question}</span>
                          <svg
                            className={`w-4 h-4 text-[#FF7A1A] shrink-0 transition-transform duration-200 ${isOpenState ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isOpenState && (
                          <div
                            id={`faq-answer-${idx}`}
                            className="px-3.5 pb-3.5 text-xs text-[#B8B3C7] leading-relaxed border-t border-white/5 pt-2.5"
                          >
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ROW 5: Gallery Mosaic & Contacts */}
        {hasGallery && (
          <section className="p-6 rounded-xl bg-[#0D1020] border border-white/10 space-y-4">
            <h2 className="text-xl font-display font-bold text-[#F3EFE8] uppercase tracking-wide">
              Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {event.gallery_images?.map((imgUrl, i) => (
                <button
                  key={i}
                  id={`gallery-thumb-${i}`}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(i);
                    setActiveTriggerId(`gallery-thumb-${i}`);
                    setLightboxOpen(true);
                  }}
                  aria-label={`Open image ${i + 1} of ${event.gallery_images?.length ?? 0}`}
                  className="aspect-[4/3] rounded-lg overflow-hidden bg-[#07060D] border border-white/10 hover:border-[#FF7A1A]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] block w-full text-left cursor-pointer group"
                >
                  <img
                    src={getOptimizedImageUrl(imgUrl, 400, 300)}
                    alt={`${event.name} photo ${i + 1}`}
                    width={400}
                    height={300}
                    loading="lazy"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </div>

            {/* Lightbox Dialog (Lazy Loaded) */}
            {lightboxOpen && event.gallery_images && (
              <Suspense fallback={null}>
                <GalleryLightbox
                  images={event.gallery_images}
                  initialIndex={activeImageIndex}
                  eventName={event.name}
                  isOpen={lightboxOpen}
                  onClose={() => setLightboxOpen(false)}
                  triggerButtonId={activeTriggerId}
                />
              </Suspense>
            )}
          </section>
        )}

        {hasContacts && (
          <section className="p-6 rounded-xl bg-[#0D1020] border border-white/10 space-y-4">
            <h2 className="text-xl font-display font-bold text-[#F3EFE8] uppercase tracking-wide">
              Contacts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {coordinators.map((coord, idx) => {
                const contact = coord.contact || '';
                const isEmail = contact.includes('@');
                const isPhone = !isEmail && /^\+?[0-9\s\-()]+$/.test(contact);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-[#07060D] border border-white/10 space-y-1.5"
                  >
                    <p className="font-display font-bold text-sm text-[#F3EFE8]">
                      {coord.name}
                    </p>
                    {coord.role && (
                      <p className="text-xs text-[#B8B3C7]">{coord.role}</p>
                    )}
                    {contact && (
                      <div className="pt-2 text-xs">
                        {isEmail ? (
                          <a
                            href={`mailto:${contact}`}
                            className="text-[#FF7A1A] hover:underline inline-flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <rect width="20" height="16" x="2" y="4" rx="2" strokeWidth={2}/>
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeWidth={2}/>
                            </svg>
                            <span>{contact}</span>
                          </a>
                        ) : isPhone ? (
                          <a
                            href={`tel:${contact.replace(/\s+/g, '')}`}
                            className="text-[#FF7A1A] hover:underline inline-flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeWidth={2}/>
                            </svg>
                            <span>{contact}</span>
                          </a>
                        ) : (
                          <span className="text-[#B8B3C7]">{contact}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ROW 6: "More in {theme}" Row */}
        {theme !== 'More' && moreEvents.length > 0 && (
          <section aria-labelledby="more-theme-heading" className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="more-theme-heading"
                className="text-xl font-display font-bold text-[#F3EFE8] uppercase tracking-wide"
              >
                More in {theme}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoreScroll('left')}
                  disabled={!canScrollLeft}
                  tabIndex={canScrollLeft ? 0 : -1}
                  aria-label="Scroll more events left"
                  className={`w-11 h-11 rounded-full bg-[#0D1020] hover:bg-white/10 text-[#F3EFE8] flex items-center justify-center border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] cursor-pointer ${
                    canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoreScroll('right')}
                  disabled={!canScrollRight}
                  tabIndex={canScrollRight ? 0 : -1}
                  aria-label="Scroll more events right"
                  className={`w-11 h-11 rounded-full bg-[#0D1020] hover:bg-white/10 text-[#F3EFE8] flex items-center justify-center border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] cursor-pointer ${
                    canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              ref={moreTrackRef}
              tabIndex={0}
              role="region"
              aria-label={`More in ${theme} track. Use arrow keys or scroll buttons to navigate.`}
              onKeyDown={handleMoreKeyDown}
              className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full max-w-full"
            >
              {moreEvents.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-[260px] sm:w-[280px] md:w-[320px] snap-start"
                >
                  <EventCard event={item} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

