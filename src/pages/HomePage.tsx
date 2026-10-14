import { useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvents } from '../hooks/useEvents';
import { Row, RowSkeleton } from '../components/events/Row';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { formatPrice, formatDateIST } from '../lib/format';
import { getOptimizedImageUrl, getImageSrcSet } from '../lib/images';
import { downloadIcs } from '../lib/calendar';
import {
  THEMES,
  THEME_SUBTITLES,
  getClosingSoonEvents,
  groupUpcomingEventsByTheme,
  isUpcomingEvent,
  type ThemeId,
} from '../lib/themes';
import type { EventSummary } from '../lib/types';

export const HomePage: FC = () => {
  useDocumentMeta({
    title: 'STRANGE — A Tech Fest Beyond Reality',
    description:
      'A Tech Fest Beyond Reality. Step through the Sling Ring into alternate dimensions of code, engineering, and innovation.',
  });

  const { status, events, stale, fetchedAt, error, retry } = useEvents();

  // Billboard hero event selection:
  // First event that is is_featured AND ACTIVE AND registration OPEN
  // (fallback: earliest ACTIVE + OPEN event)
  const heroEvent = useMemo<EventSummary | null>(() => {
    if (!events || events.length === 0) return null;

    const featuredActiveOpen = events.find(
      (e) => e.is_featured && e.event_status === 'ACTIVE' && e.registration_status === 'OPEN'
    );
    if (featuredActiveOpen) return featuredActiveOpen;

    const earliestActiveOpen = events.find(
      (e) => e.event_status === 'ACTIVE' && e.registration_status === 'OPEN'
    );
    if (earliestActiveOpen) return earliestActiveOpen;

    return events[0] ?? null;
  }, [events]);

  // Derived row datasets (filtering out COMPLETED and CLOSED events)
  const upcomingEvents = useMemo(() => {
    return events.filter(isUpcomingEvent);
  }, [events]);

  const featuredEvents = useMemo(() => {
    return upcomingEvents.filter((e) => e.is_featured);
  }, [upcomingEvents]);

  const closingSoonEvents = useMemo(() => {
    return getClosingSoonEvents(events);
  }, [events]);

  const freeEvents = useMemo(() => {
    return upcomingEvents.filter((e) => e.price === 0);
  }, [upcomingEvents]);

  const workshops = useMemo(() => {
    return upcomingEvents.filter((e) => e.event_type === 'WORKSHOP');
  }, [upcomingEvents]);

  const themeRows = useMemo(() => {
    const grouped = groupUpcomingEventsByTheme(events);
    const rows: { theme: ThemeId; events: EventSummary[]; subtitle: string }[] = [];

    for (const theme of THEMES) {
      const themeEvents = grouped[theme] || [];
      // Rule: Hide any row with fewer than 3 events
      if (themeEvents.length >= 3) {
        rows.push({
          theme,
          events: themeEvents,
          subtitle: THEME_SUBTITLES[theme],
        });
      }
    }

    return rows;
  }, [events]);

  // Loading skeleton state
  if (status === 'loading') {
    return <HomeLoadingSkeleton />;
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Failed to Load Events"
          message={error?.message || 'Unable to retrieve event listings from the server.'}
          errorKind={error?.kind}
          onRetry={retry}
        />
      </div>
    );
  }

  // Empty state
  if (status === 'success' && events.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="No Events Found"
          description="There are currently no events scheduled on the platform."
          action={
            <Button variant="secondary" size="sm" onClick={retry}>
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  const formattedFetchedAt = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <div className="w-full flex flex-col">
      {/* -------------------------------------------------------------
          Billboard Hero Section (LCP Optimized)
          ------------------------------------------------------------- */}
      {heroEvent && (
        <section
          className="relative w-full -mt-16 md:-mt-18 pt-16 md:pt-18 min-h-[560px] sm:min-h-[640px] md:min-h-[700px] lg:h-[82vh] max-h-[860px] flex items-end pb-12 sm:pb-16 md:pb-20 overflow-hidden"
          aria-labelledby="billboard-heading"
        >
          {/* Full-bleed background image with responsive srcset and eager/fetchpriority=high for LCP */}
          <div className="absolute inset-0 z-0">
            <img
              src={getOptimizedImageUrl(heroEvent.cover_image_url, 1920, 1080)}
              srcSet={getImageSrcSet(heroEvent.cover_image_url, [640, 1024, 1440, 1920], 9 / 16)}
              sizes="100vw"
              alt={heroEvent.cover_image_alt || heroEvent.name}
              width="1920"
              height="1080"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="w-full h-full object-cover object-center"
            />
            {/* Dark gradients for text legibility and smooth page transition */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/85 sm:via-[#141414]/65 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
          </div>

          {/* Billboard Content Overlay */}
          <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5 sm:space-y-4">
            {/* Small uppercase category label */}
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#e50914]">
              <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" aria-hidden="true" />
              <span>FEATURED {heroEvent.category ? `• ${heroEvent.category}` : ''}</span>
            </div>

            {/* Large Title - Static zero-JS-animation dependency for instant LCP */}
            <h1
              id="billboard-heading"
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-normal uppercase tracking-wide text-white leading-[0.92] max-w-4xl drop-shadow-lg"
            >
              {heroEvent.name}
            </h1>

            {/* Blurb */}
            {heroEvent.blurb && (
              <p className="text-sm sm:text-base md:text-lg text-[#b3b3b3] max-w-2xl line-clamp-3 leading-relaxed drop-shadow">
                {heroEvent.blurb}
              </p>
            )}

            {/* Badges: Mode, Registration Status, Price */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {heroEvent.event_mode && (
                <Badge variant="outline" size="sm">
                  {heroEvent.event_mode}
                </Badge>
              )}
              {heroEvent.registration_status && (
                <StatusBadge type="registration" status={heroEvent.registration_status} size="sm" />
              )}
              <Badge variant={heroEvent.price === 0 ? 'muted' : 'surface'} size="sm">
                {formatPrice(heroEvent.price, heroEvent.is_per_head)}
              </Badge>
              {heroEvent.schedule_summary && (
                <span className="font-mono text-xs text-[#b3b3b3] px-2 py-0.5 rounded-[4px] bg-black/50 border border-white/10 hidden sm:inline-flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-[#e50914]"
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
                  <span>{formatDateIST(heroEvent.schedule_summary)}</span>
                </span>
              )}
            </div>

            {/* Action Buttons: Details and Add to calendar / More info */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to={`/events/${heroEvent.id}`}>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                >
                  Details
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => downloadIcs(heroEvent)}
                leftIcon={
                  <svg
                    className="w-5 h-5 text-[#b3b3b3]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              >
                Add to calendar
              </Button>
              <Link to={`/events/${heroEvent.id}`}>
                <Button variant="ghost" size="lg">
                  More info &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          Rows Section & Dynamic Thematic Carousels
          ------------------------------------------------------------- */}
      <div className="space-y-10 sm:space-y-12 md:space-y-14 pb-16 relative z-20 -mt-6 sm:-mt-8 md:-mt-12">
        {/* Stale Cache Notice */}
        {stale && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="bg-[#1c1c1c] border border-amber-500/40 rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
              role="status"
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <p className="text-xs sm:text-sm text-white">
                  <strong className="text-amber-400">Showing saved data</strong>
                  {formattedFetchedAt ? ` (cached ${formattedFetchedAt})` : ''}: The live network call
                  could not be completed.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={retry}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* 1. Featured Events Row */}
        {featuredEvents.length >= 3 && (
          <Row
            title="Featured Events"
            subtitle="Curated high-impact hackathons, masterclasses, and robotics competitions."
            events={featuredEvents}
          />
        )}

        {/* 2. Closing Soon Row (OPEN + future deadline, nearest first) */}
        {closingSoonEvents.length >= 3 && (
          <Row
            title="Closing Soon"
            subtitle="Registration deadlines approaching shortly. Lock in your slot before capacity fills."
            events={closingSoonEvents}
          />
        )}

        {/* 3. Free to Join Row */}
        {freeEvents.length >= 3 && (
          <Row
            title="Free to Join"
            subtitle="Zero entry fee challenges, masterclasses, and open community jams."
            events={freeEvents}
          />
        )}

        {/* 4. Workshops Row */}
        {workshops.length >= 3 && (
          <Row
            title="Workshops & Masterclasses"
            subtitle="Hands-on learning sessions led by engineering and design mentors."
            events={workshops}
          />
        )}

        {/* 5. Theme Rows with >= 3 upcoming events */}
        {themeRows.map(({ theme, events: themeEventList, subtitle }) => (
          <Row
            key={theme}
            title={theme}
            subtitle={subtitle}
            events={themeEventList}
          />
        ))}

        {/* "Browse All Events" Link CTA */}
        <section className="px-4 sm:px-6 lg:px-8 pt-6" aria-label="Browse full catalogue">
          <div className="max-w-7xl mx-auto rounded-[6px] bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-white/10 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-display font-normal text-white uppercase tracking-wide">
                Looking for more events?
              </h2>
              <p className="text-sm text-[#b3b3b3] max-w-xl">
                Explore search filters, technical tags, past event archives, or view the complete catalogue of 30 events.
              </p>
            </div>
            <Link to="/events" className="shrink-0">
              <Button variant="primary" size="lg">
                Browse All Events
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

/**
 * Loading Skeleton matching the Billboard Hero + Horizontal Rows layout
 */
const HomeLoadingSkeleton: FC = () => {
  return (
    <div className="w-full flex flex-col" aria-busy="true" aria-label="Loading events">
      {/* Billboard Hero Skeleton */}
      <div className="relative w-full -mt-16 md:-mt-18 pt-16 md:pt-18 min-h-[560px] sm:min-h-[640px] md:min-h-[700px] lg:h-[82vh] max-h-[860px] bg-[#181818] flex items-end pb-12 sm:pb-16 md:pb-20 overflow-hidden animate-pulse motion-reduce:animate-none">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-4 w-36 bg-[#2a2a2a] rounded-[4px]" />
          <div className="space-y-2">
            <div className="h-12 sm:h-16 md:h-20 w-4/5 sm:w-2/3 bg-[#262626] rounded-[4px]" />
            <div className="h-12 sm:h-16 md:h-20 w-3/5 sm:w-1/2 bg-[#262626] rounded-[4px]" />
          </div>
          <div className="h-4 sm:h-5 w-4/5 max-w-xl bg-[#222222] rounded-[4px]" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 bg-[#2a2a2a] rounded-[4px]" />
            <div className="h-6 w-28 bg-[#2a2a2a] rounded-[4px]" />
            <div className="h-6 w-24 bg-[#2a2a2a] rounded-[4px]" />
          </div>
          <div className="flex gap-3 pt-3">
            <div className="h-11 w-32 bg-[#e50914]/40 rounded-[4px]" />
            <div className="h-11 w-32 bg-[#2a2a2a] rounded-[4px]" />
          </div>
        </div>
      </div>

      {/* Row Skeletons */}
      <div className="space-y-10 sm:space-y-12 md:space-y-14 pb-16 relative z-20 -mt-6 sm:-mt-8 md:-mt-12">
        <RowSkeleton title="Featured Events" count={5} />
        <RowSkeleton title="Closing Soon" count={5} />
        <RowSkeleton title="Workshops & Masterclasses" count={5} />
        <RowSkeleton title="Tech & Code" count={5} />
      </div>
    </div>
  );
};
