import {
  useState,
  useMemo,
  useRef,
  type FC,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvent } from '../hooks/useEvents';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
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

type TabKey =
  | 'overview'
  | 'schedule'
  | 'rules'
  | 'prizes'
  | 'faqs'
  | 'contacts'
  | 'gallery';

interface TabConfig {
  key: TabKey;
  label: string;
}

export const EventDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { status, event, error, isPlaceholder, retry } = useEvent(id);

  // Share feedback state
  const [shareFeedback, setShareFeedback] = useState<string>('');

  // Accordion state for FAQs
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true });

  const tabListRef = useRef<HTMLDivElement>(null);

  // SEO metadata per route pattern: "{event name} — STRANGE"
  useDocumentMeta({
    title: event?.name ? `${event.name} — STRANGE` : 'Event Detail — STRANGE',
    description: event?.blurb || 'Event schedule, tickets, and detail.',
  });

  // Calculate available tabs based on non-empty data
  const availableTabs = useMemo<TabConfig[]>(() => {
    if (!event) return [];

    const tabs: TabConfig[] = [];

    // 1. Overview Tab: Description or highlights or what_to_expect
    if (
      event.description ||
      (event.highlights && event.highlights.length > 0) ||
      (event.what_to_expect && event.what_to_expect.length > 0)
    ) {
      tabs.push({ key: 'overview', label: 'Overview' });
    }

    // 2. Schedule Tab
    if (
      (event.schedules && event.schedules.length > 0) ||
      event.schedule_summary?.start_date
    ) {
      tabs.push({ key: 'schedule', label: 'Schedule' });
    }

    // 3. Eligibility & Rules Tab
    if (
      (event.eligibility && event.eligibility.length > 0) ||
      (event.prerequisites && event.prerequisites.length > 0) ||
      (event.rules && event.rules.length > 0)
    ) {
      tabs.push({ key: 'rules', label: 'Eligibility & Rules' });
    }

    // 4. Prizes Tab
    if (event.prizes && event.prizes.length > 0) {
      tabs.push({ key: 'prizes', label: 'Prizes' });
    }

    // 5. FAQs Tab
    if (event.faqs && event.faqs.length > 0) {
      tabs.push({ key: 'faqs', label: 'FAQs' });
    }

    // 6. Contacts Tab
    if (
      (event.organizers && event.organizers.length > 0) ||
      (event.coordinators && event.coordinators.length > 0)
    ) {
      tabs.push({ key: 'contacts', label: 'Contacts' });
    }

    // 7. Gallery Tab
    if (event.gallery_images && event.gallery_images.length > 0) {
      tabs.push({ key: 'gallery', label: 'Gallery' });
    }

    return tabs;
  }, [event]);

  // Read active tab from URL query param, defaulting to first available tab
  const requestedTab = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = useMemo(() => {
    if (requestedTab && availableTabs.some((t) => t.key === requestedTab)) {
      return requestedTab;
    }
    return availableTabs[0]?.key || 'overview';
  }, [requestedTab, availableTabs]);

  const setActiveTab = (tab: TabKey) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  };

  // Keyboard navigation for tablist (WAI-ARIA: Left/Right arrows, Home, End)
  const handleTabKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (availableTabs.length === 0) return;

    let targetIndex = -1;
    if (e.key === 'ArrowRight') {
      targetIndex = (currentIndex + 1) % availableTabs.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (currentIndex - 1 + availableTabs.length) % availableTabs.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = availableTabs.length - 1;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      const targetTab = availableTabs[targetIndex];
      setActiveTab(targetTab.key);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[targetIndex]?.focus();
    }
  };

  // Share handler: Web Share API with clipboard fallback
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
        // User cancelled or dismissed share window
      }
    }

    // Fallback: Copy link to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShareFeedback('Link copied to clipboard!');
        setTimeout(() => setShareFeedback(''), 3000);
      }
    } catch {
      setShareFeedback('Unable to copy link.');
      setTimeout(() => setShareFeedback(''), 3000);
    }
  };

  // Handle Add to Calendar
  const handleAddToCalendar = () => {
    if (!event) return;
    downloadIcs(event);
  };

  // Toggle FAQ item
  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Error State: 404 vs network/http error
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

  // Loading Skeleton State
  if (status === 'loading' && !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse motion-reduce:animate-none">
        <div className="w-full aspect-[21/9] min-h-[300px] bg-zinc-900 rounded-[6px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton variant="text" width="70%" height={40} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="rect" height={200} className="w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton variant="rect" height={380} className="w-full rounded-[6px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  // Summary card calculations
  const remainingSlots = seatsLeft(event.total_seats, event.seats_filled);
  const seatsText = formatSeatsText(event);
  const seatsBarPercent = seatsPercentage(event.total_seats, event.seats_filled);
  const primaryVenue = event.schedules?.[0]?.venue || 'Campus Venue, Pune';

  // Team size string
  const teamSizeText = (() => {
    if (event.min_teamsize === 1 && event.max_teamsize === 1) {
      return 'Individual participation (1 person)';
    }
    if (event.min_teamsize && event.max_teamsize) {
      if (event.min_teamsize === event.max_teamsize) {
        return `${event.min_teamsize} members per team`;
      }
      return `${event.min_teamsize} – ${event.max_teamsize} members per team`;
    }
    return event.is_per_head === false ? 'Team event' : 'Individual';
  })();

  // Format deadline string
  const deadlineFormatted = event.registration_deadline
    ? formatDateIST(event.registration_deadline)
    : 'TBA';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Placeholder loading banner if initial summary is cached while full details load */}
      {isPlaceholder && (
        <div
          className="bg-zinc-900/90 border border-white/10 rounded-[4px] px-4 py-2.5 text-xs text-zinc-300 flex items-center justify-between shadow-md"
          role="status"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
            <span>Loading full event schedule, prizes, and coordinator info...</span>
          </div>
          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-[#e50914] rounded-full animate-spin" />
        </div>
      )}

      {/* -------------------------------------------------------------
          Full Banner Section
          ------------------------------------------------------------- */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[300px] sm:min-h-[380px] rounded-[6px] overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl">
        <img
          src={getOptimizedImageUrl(event.banner_image_url || event.cover_image_url, 1920, 1080)}
          srcSet={
            getImageSrcSet(
              event.banner_image_url || event.cover_image_url,
              [600, 900, 1200, 1600, 1920],
              9 / 16
            ) || undefined
          }
          sizes="(max-width: 1280px) 100vw, 1280px"
          alt={event.banner_image_alt || event.cover_image_alt || event.name}
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE_DATA_URI;
          }}
          className="w-full h-full object-cover object-center"
        />

        {/* Cinematic dark gradients for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Overlay Content */}
        <div className="absolute bottom-6 left-6 right-6 space-y-3 z-10">
          {/* Badges: Category, Mode, Event Status, Registration Status */}
          <div className="flex flex-wrap gap-2 items-center">
            {event.category && (
              <Badge variant="accent" size="sm">
                {event.category}
              </Badge>
            )}
            {event.event_mode && (
              <Badge variant="outline" size="sm">
                {event.event_mode}
              </Badge>
            )}
            {event.event_status && (
              <StatusBadge type="event" status={event.event_status} size="sm" />
            )}
            {event.registration_status && (
              <StatusBadge
                type="registration"
                status={event.registration_status}
                size="sm"
              />
            )}
          </div>

          {/* Heading 1 Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-normal uppercase tracking-wide text-white leading-tight drop-shadow-lg">
            {event.name}
          </h1>

          {/* Quick Schedule summary line */}
          {event.schedule_summary && (
            <p className="text-xs sm:text-sm font-mono text-zinc-300 flex items-center gap-2">
              <span className="text-[#e50914]">●</span>
              <span>{formatDateIST(event.schedule_summary)}</span>
              {primaryVenue && <span className="hidden sm:inline text-zinc-400">| {primaryVenue}</span>}
            </p>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          Two-Column Responsive Layout
          Desktop: Left = Content, Right = Sticky Summary Card
          Mobile: Summary above Content, stacked
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Mobile-only Sticky Summary Card (Rendered on top for mobile) */}
        <div className="block lg:hidden">
          <SummaryCard
            event={event}
            seatsText={seatsText}
            seatsBarPercent={seatsBarPercent}
            remainingSlots={remainingSlots}
            teamSizeText={teamSizeText}
            deadlineFormatted={deadlineFormatted}
            primaryVenue={primaryVenue}
            onAddToCalendar={handleAddToCalendar}
            onShare={handleShare}
            shareFeedback={shareFeedback}
          />
        </div>

        {/* Left Column: Accessible Tabs & Structured Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation List (WAI-ARIA accessible tablist) */}
          {availableTabs.length > 0 && (
            <div
              ref={tabListRef}
              role="tablist"
              aria-label="Event Information Tabs"
              className="flex items-center gap-1 overflow-x-auto border-b border-white/10 pb-1 scrollbar-none"
            >
              {availableTabs.map((tab, index) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    id={`tab-${tab.key}`}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.key}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.key)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-[4px] uppercase tracking-wider transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] ${
                      isActive
                        ? 'bg-[#e50914] text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab Panels */}
          <div className="pt-2">
            {/* 1. Overview Tab Panel */}
            {activeTab === 'overview' && (
              <section
                id="panel-overview"
                role="tabpanel"
                aria-labelledby="tab-overview"
                tabIndex={0}
                className="space-y-6 focus-visible:outline-none"
              >
                {/* Blurb */}
                {event.blurb && (
                  <p className="text-base sm:text-lg text-zinc-200 font-medium leading-relaxed">
                    {event.blurb}
                  </p>
                )}

                {/* Description paragraphs split on \n\n */}
                {event.description && (
                  <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed pt-2">
                    {event.description.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}

                {/* Highlights */}
                {event.highlights && event.highlights.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Event Highlights
                    </h3>
                    <ul className="space-y-2">
                      {event.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-zinc-300">
                          <span className="text-[#e50914] shrink-0 mt-0.5 font-bold">✓</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What to Expect */}
                {event.what_to_expect && event.what_to_expect.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      What to Expect
                    </h3>
                    <ul className="space-y-2">
                      {event.what_to_expect.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-zinc-300">
                          <span className="text-zinc-500 shrink-0 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="pt-4 border-t border-white/10 flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-zinc-400 font-mono">Tags:</span>
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 2. Schedule Tab Panel */}
            {activeTab === 'schedule' && (
              <section
                id="panel-schedule"
                role="tabpanel"
                aria-labelledby="tab-schedule"
                tabIndex={0}
                className="space-y-4 focus-visible:outline-none"
              >
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Event Schedule & Timeline
                </h3>

                {Array.isArray(event.schedules) && event.schedules.length > 0 ? (
                  <div className="space-y-3">
                    {event.schedules.map((schedule, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-[6px] bg-zinc-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="font-mono text-xs font-semibold text-[#e50914] uppercase tracking-wider">
                            {schedule.event_date ? formatDateIST(schedule.event_date) : 'Day Schedule'}
                          </div>
                          <div className="text-sm font-bold text-white">
                            {schedule.start_time || '09:00'} – {schedule.end_time || '17:00'} IST
                          </div>
                        </div>
                        {schedule.venue && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono bg-zinc-950 px-2.5 py-1.5 rounded-[4px] border border-white/5">
                            <span className="text-zinc-500">Venue:</span>
                            <span>{schedule.venue}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : event.schedule_summary ? (
                  <div className="p-4 rounded-[6px] bg-zinc-900/80 border border-white/10 space-y-2">
                    <div className="font-mono text-xs text-[#e50914] font-semibold">
                      {formatDateIST(event.schedule_summary)}
                    </div>
                    <div className="text-sm text-white font-bold">
                      {event.schedule_summary.start_time} – {event.schedule_summary.end_time} IST
                    </div>
                    <div className="text-xs text-zinc-400">
                      Venue: {primaryVenue}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">Schedule details to be announced.</p>
                )}
              </section>
            )}

            {/* 3. Eligibility & Rules Tab Panel */}
            {activeTab === 'rules' && (
              <section
                id="panel-rules"
                role="tabpanel"
                aria-labelledby="tab-rules"
                tabIndex={0}
                className="space-y-6 focus-visible:outline-none"
              >
                {/* Eligibility */}
                {event.eligibility && event.eligibility.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Eligibility
                    </h3>
                    <ul className="space-y-2">
                      {event.eligibility.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-zinc-300">
                          <span className="text-[#e50914] shrink-0 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prerequisites */}
                {event.prerequisites && event.prerequisites.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Prerequisites & What to Bring
                    </h3>
                    <ul className="space-y-2">
                      {event.prerequisites.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-zinc-300">
                          <span className="text-zinc-400 shrink-0">!</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Official Rules */}
                {event.rules && event.rules.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Competition & Workshop Rules
                    </h3>
                    <ol className="space-y-2.5 list-decimal list-inside text-sm text-zinc-300 leading-relaxed">
                      {event.rules.map((rule, index) => (
                        <li key={index} className="pl-1">
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </section>
            )}

            {/* 4. Prizes Tab Panel */}
            {activeTab === 'prizes' && (
              <section
                id="panel-prizes"
                role="tabpanel"
                aria-labelledby="tab-prizes"
                tabIndex={0}
                className="space-y-4 focus-visible:outline-none"
              >
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Awards & Cash Prizes
                </h3>
                {event.prizes && event.prizes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.prizes.map((prize, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-[6px] bg-zinc-900/90 border border-white/10 space-y-2.5 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e50914] bg-[#e50914]/10 px-2 py-0.5 rounded">
                            {prize.rank === 1
                              ? '1st Place'
                              : prize.rank === 2
                              ? '2nd Place'
                              : prize.rank === 3
                              ? '3rd Place'
                              : `Rank ${prize.rank}`}
                          </span>
                          {typeof prize.amount === 'number' && (
                            <span className="font-mono text-lg font-bold text-emerald-400">
                              ₹{prize.amount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {prize.title && (
                          <h4 className="text-base font-bold text-white">{prize.title}</h4>
                        )}

                        {prize.description && (
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {prize.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">Prize details to be announced.</p>
                )}
              </section>
            )}

            {/* 5. FAQs Tab Panel (Accessible Accordion) */}
            {activeTab === 'faqs' && (
              <section
                id="panel-faqs"
                role="tabpanel"
                aria-labelledby="tab-faqs"
                tabIndex={0}
                className="space-y-4 focus-visible:outline-none"
              >
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Frequently Asked Questions
                </h3>
                {event.faqs && event.faqs.length > 0 ? (
                  <div className="space-y-2.5">
                    {event.faqs.map((faq, index) => {
                      const isOpen = Boolean(openFaqs[index]);
                      return (
                        <div
                          key={index}
                          className="rounded-[6px] border border-white/10 overflow-hidden bg-zinc-900/60"
                        >
                          <button
                            type="button"
                            id={`faq-btn-${index}`}
                            aria-expanded={isOpen}
                            aria-controls={`faq-ans-${index}`}
                            onClick={() => toggleFaq(index)}
                            className="w-full flex items-center justify-between p-4 text-left font-medium text-white hover:bg-zinc-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
                          >
                            <span className="text-sm sm:text-base font-semibold pr-4">
                              {faq.question}
                            </span>
                            <svg
                              className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                                isOpen ? 'rotate-180 text-white' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {isOpen && (
                            <div
                              id={`faq-ans-${index}`}
                              role="region"
                              aria-labelledby={`faq-btn-${index}`}
                              className="px-4 pb-4 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 bg-zinc-950/40"
                            >
                              <p>{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">No FAQs currently available for this event.</p>
                )}
              </section>
            )}

            {/* 6. Contacts Tab Panel (Organizers & Coordinators) */}
            {activeTab === 'contacts' && (
              <section
                id="panel-contacts"
                role="tabpanel"
                aria-labelledby="tab-contacts"
                tabIndex={0}
                className="space-y-6 focus-visible:outline-none"
              >
                {/* Organizers */}
                {event.organizers && event.organizers.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Organizing Bodies
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {event.organizers.map((org) => (
                        <div
                          key={org.id || org.name}
                          className="p-3.5 rounded-[4px] bg-zinc-900/80 border border-white/10 space-y-1"
                        >
                          <div className="text-sm font-bold text-white">{org.name}</div>
                          {org.org_type && (
                            <span className="text-[11px] font-mono text-[#e50914] uppercase tracking-wider">
                              Type: {org.org_type}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coordinators */}
                {event.coordinators && event.coordinators.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Student & Faculty Coordinators
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {event.coordinators.map((coord, index) => {
                        const contact = coord.contact?.trim();
                        const isEmail = contact?.includes('@');
                        const isPhone = contact && !isEmail && contact.replace(/\D/g, '').length >= 7;

                        return (
                          <div
                            key={coord.id || index}
                            className="p-3.5 rounded-[4px] bg-zinc-900/80 border border-white/10 space-y-1"
                          >
                            <div className="text-sm font-bold text-white">{coord.name}</div>
                            {coord.role && (
                              <div className="text-xs text-zinc-400">{coord.role}</div>
                            )}
                            {contact && (
                              <div className="pt-1">
                                {isEmail ? (
                                  <a
                                    href={`mailto:${contact}`}
                                    className="text-xs font-mono text-[#e50914] hover:text-[#f40612] underline underline-offset-2"
                                  >
                                    {contact}
                                  </a>
                                ) : isPhone ? (
                                  <a
                                    href={`tel:${contact.replace(/\s+/g, '')}`}
                                    className="text-xs font-mono text-[#e50914] hover:text-[#f40612] underline underline-offset-2"
                                  >
                                    {contact}
                                  </a>
                                ) : (
                                  <span className="text-xs font-mono text-zinc-400">{contact}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 7. Gallery Tab Panel */}
            {activeTab === 'gallery' && (
              <section
                id="panel-gallery"
                role="tabpanel"
                aria-labelledby="tab-gallery"
                tabIndex={0}
                className="space-y-4 focus-visible:outline-none"
              >
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Event Gallery
                </h3>
                {event.gallery_images && event.gallery_images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.gallery_images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-[16/9] rounded-[6px] overflow-hidden bg-zinc-900 border border-white/10"
                      >
                        <img
                          src={getOptimizedImageUrl(imgUrl, 700, 400)}
                          alt={`${event.name} gallery image ${index + 1}`}
                          width="700"
                          height="400"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">No gallery images available.</p>
                )}
              </section>
            )}
          </div>

          {/* Back to Events Navigation Link */}
          <div className="pt-8 border-t border-white/10">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <span>&larr;</span>
              <span>Back to all events</span>
            </Link>
          </div>
        </div>

        {/* Desktop Sticky Summary Card (Rendered in right column) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <SummaryCard
            event={event}
            seatsText={seatsText}
            seatsBarPercent={seatsBarPercent}
            remainingSlots={remainingSlots}
            teamSizeText={teamSizeText}
            deadlineFormatted={deadlineFormatted}
            primaryVenue={primaryVenue}
            onAddToCalendar={handleAddToCalendar}
            onShare={handleShare}
            shareFeedback={shareFeedback}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable Summary Card component (Desktop sidebar and mobile stack)
 */
interface SummaryCardProps {
  event: Parameters<typeof EventDetailPage>[0] extends never ? never : NonNullable<ReturnType<typeof useEvent>['event']>;
  seatsText: string;
  seatsBarPercent: number;
  remainingSlots: number | null;
  teamSizeText: string;
  deadlineFormatted: string;
  primaryVenue: string;
  onAddToCalendar: () => void;
  onShare: () => void;
  shareFeedback: string;
}

const SummaryCard: FC<SummaryCardProps> = ({
  event,
  seatsText,
  seatsBarPercent,
  remainingSlots,
  teamSizeText,
  deadlineFormatted,
  primaryVenue,
  onAddToCalendar,
  onShare,
  shareFeedback,
}) => {
  return (
    <div className="bg-[#181818] border border-white/10 rounded-[6px] p-6 space-y-6 shadow-2xl">
      {/* Price Header */}
      <div className="space-y-1 pb-4 border-b border-white/10">
        <div className="text-xs uppercase tracking-wider text-zinc-400 font-mono">
          Entry Fee
        </div>
        <div className="text-3xl font-display font-normal text-white flex items-baseline gap-2">
          <span>{formatPrice(event.price, event.is_per_head)}</span>
        </div>
      </div>

      {/* Registration & Seat Capacity Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 uppercase tracking-wider">Capacity</span>
          <span
            className={`font-bold ${
              remainingSlots !== null && remainingSlots <= 5
                ? 'text-[#e50914]'
                : 'text-zinc-200'
            }`}
          >
            {seatsText}
          </span>
        </div>
        {event.total_seats && event.seats_filled !== undefined && (
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-[#e50914] rounded-full transition-all duration-300"
              style={{ width: `${seatsBarPercent}%` }}
              role="progressbar"
              aria-valuenow={seatsBarPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Seats filled percentage"
            />
          </div>
        )}
      </div>

      {/* Meta Specifications List */}
      <div className="space-y-3.5 text-xs font-mono pt-2 border-t border-white/10">
        <div className="flex items-start justify-between gap-2">
          <span className="text-zinc-400">Team Size:</span>
          <span className="text-white text-right font-sans font-medium">{teamSizeText}</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-zinc-400">Deadline:</span>
          <span className="text-white text-right">{deadlineFormatted}</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-zinc-400">Venue:</span>
          <span className="text-white text-right font-sans font-medium">{primaryVenue}</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-zinc-400">Status:</span>
          <StatusBadge type="registration" status={event.registration_status} size="sm" />
        </div>
      </div>

      {/* Notice: No register button per PROJECT.md rule */}
      <div className="text-[11px] text-zinc-400 leading-normal bg-zinc-950 p-2.5 rounded-[4px] border border-white/5">
        ℹ Registrations are managed on-site or via respective host societies. Add to your calendar to stay notified.
      </div>

      {/* Action Buttons: Add to Calendar & Share */}
      <div className="space-y-2.5 pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={onAddToCalendar}
          className="w-full"
          leftIcon={
            <svg
              className="w-4 h-4"
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
          Add to calendar (.ics)
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={onShare}
          className="w-full"
          leftIcon={
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          }
        >
          Share Event
        </Button>

        {/* Aria-live feedback message */}
        <div aria-live="polite" className="text-center">
          {shareFeedback && (
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              {shareFeedback}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
