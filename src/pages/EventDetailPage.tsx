import {
  useState,
  useMemo,
  useEffect,
  type FC,
} from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvent } from '../hooks/useEvents';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/states/ErrorState';
import { NotFound } from '../components/states/NotFound';
import { Glyph, type GlyphType } from '../components/strange/DimensionalGlyphs';
import { downloadIcs } from '../lib/calendar';
import { getEventDimension } from '../lib/dimensions';
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

type SectionKey = 'overview' | 'schedule' | 'prizes' | 'rules' | 'faqs' | 'contacts' | 'gallery';

interface SectionConfig {
  key: SectionKey;
  label: string;
  glyph: GlyphType;
}

export const EventDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { status, event, error, isPlaceholder, retry } = useEvent(id);

  const [shareFeedback, setShareFeedback] = useState<string>('');
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true });
  const [activeSection, setActiveSection] = useState<SectionKey>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '') as SectionKey;
      return hash || 'overview';
    }
    return 'overview';
  });

  // SEO metadata per route pattern: "{event name} — STRANGE"
  useDocumentMeta({
    title: event?.name ? `${event.name} — STRANGE` : 'Event Detail — STRANGE',
    description: event?.blurb || 'Event schedule, tickets, and detail.',
  });

  const dimension = getEventDimension({
    category: event?.category,
    event_type: event?.event_type,
    is_technical: event?.is_technical,
  });

  // Calculate available sections based on non-empty data (hides detail sections while only summary data exists)
  const availableSections = useMemo<SectionConfig[]>(() => {
    if (!event) return [];
    const list: SectionConfig[] = [];

    // 1. Overview
    if (
      event.description ||
      (event.highlights && event.highlights.length > 0) ||
      (event.what_to_expect && event.what_to_expect.length > 0)
    ) {
      list.push({ key: 'overview', label: 'Overview', glyph: 'overview' });
    }

    // 2. Schedule
    if (
      (event.schedules && event.schedules.length > 0) ||
      event.schedule_summary?.start_date
    ) {
      list.push({ key: 'schedule', label: 'Schedule', glyph: 'schedule' });
    }

    // 3. Prizes (strictly if non-empty detail data)
    if (!isPlaceholder && event.prizes && event.prizes.length > 0) {
      list.push({ key: 'prizes', label: 'Prizes & Rewards', glyph: 'prizes' });
    }

    // 4. Rules & Eligibility
    if (
      !isPlaceholder &&
      ((event.eligibility && event.eligibility.length > 0) ||
        (event.prerequisites && event.prerequisites.length > 0) ||
        (event.rules && event.rules.length > 0))
    ) {
      list.push({ key: 'rules', label: 'Rules & Protocols', glyph: 'rules' });
    }

    // 5. FAQs
    if (!isPlaceholder && event.faqs && event.faqs.length > 0) {
      list.push({ key: 'faqs', label: 'FAQs', glyph: 'faqs' });
    }

    // 6. Contacts
    if (
      !isPlaceholder &&
      ((event.organizers && event.organizers.length > 0) ||
        (event.coordinators && event.coordinators.length > 0))
    ) {
      list.push({ key: 'contacts', label: 'Contacts', glyph: 'contacts' });
    }

    // 7. Gallery
    if (!isPlaceholder && event.gallery_images && event.gallery_images.length > 0) {
      list.push({ key: 'gallery', label: 'Gallery', glyph: 'overview' });
    }

    return list;
  }, [event, isPlaceholder]);

  // Scroll to hash on mount/hash change
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  // Sync active section when user changes hash directly or via browser history
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as SectionKey;
      if (hash && availableSections.some((s) => s.key === hash)) {
        setActiveSection(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [availableSections]);

  // IntersectionObserver to highlight current active section during scroll
  useEffect(() => {
    if (availableSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = entry.target.id as SectionKey;
            setActiveSection(key);
            // Replace hash without triggering scroll jump
            if (window.history.replaceState) {
              window.history.replaceState(null, '', `#${key}`);
            }
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    availableSections.forEach((sec) => {
      const el = document.getElementById(sec.key);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [availableSections]);

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
      setShareFeedback('Link copied to astral clipboard!');
      setTimeout(() => setShareFeedback(''), 3000);
    } catch {
      setShareFeedback('Failed to copy link');
      setTimeout(() => setShareFeedback(''), 3000);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Loading skeleton state
  if (status === 'loading') {
    return <EventDetailSkeleton />;
  }

  // Not found state
  if (error?.kind === 'notfound' || (!event && status === 'success')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex items-center justify-center">
        <NotFound
          title="Dimensional Event Not Found"
          message="The event coordinate you are trying to reach does not exist or has dissolved into the multiverse."
        />
      </div>
    );
  }

  // Error state
  if (status === 'error' || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Portal Transmission Error"
          message={error?.message || 'Failed to retrieve dimensional event details.'}
          errorKind={error?.kind}
          onRetry={retry}
        />
      </div>
    );
  }

  // Derived event properties
  const bannerUrl = event.banner_image_url || event.cover_image_url;
  const optimizedBanner = bannerUrl
    ? getOptimizedImageUrl(bannerUrl, 1920, 1080)
    : FALLBACK_IMAGE_DATA_URI;
  const bannerSrcSet = bannerUrl
    ? getImageSrcSet(bannerUrl, [640, 1024, 1440, 1920], 9 / 16)
    : undefined;

  const remaining = seatsLeft(event.total_seats, event.seats_filled);
  const seatsPct = seatsPercentage(event.total_seats, event.seats_filled);
  const isPerHead = event.is_per_head !== false;
  const seatsText = formatSeatsText(event);

  // Venue from schedules array
  const scheduleVenue = event.schedules?.[0]?.venue || 'Sanctum Campus Venue, Pune';

  const isOpen = event.registration_status === 'OPEN';

  return (
    <div className="w-full flex flex-col bg-[#07060D] text-[#F3EFE8] overflow-x-hidden">
      {/* -------------------------------------------------------------
          1. Large Cinematic Banner Hero
          ------------------------------------------------------------- */}
      <section className="relative w-full min-h-[500px] sm:min-h-[580px] lg:h-[70vh] flex items-end pb-12 sm:pb-16 overflow-hidden">
        {/* Full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={optimizedBanner}
            srcSet={bannerSrcSet}
            sizes="100vw"
            alt={event.banner_image_alt || event.cover_image_alt || event.name}
            width="1920"
            height="1080"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            style={{ viewTransitionName: `event-img-${event.id}` }}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07060D] via-[#07060D]/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07060D] via-[#07060D]/70 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#07060D]/90 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/events"
              className="text-xs uppercase tracking-wider font-semibold text-[#FF7A1A] hover:text-[#F5B642] transition-colors inline-flex items-center gap-1"
            >
              <span>← Multiverse Index</span>
            </Link>
            <span className="text-white/20">•</span>
            {event.category && (
              <span
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                style={{
                  backgroundColor: `${dimension.colorHex}20`,
                  borderColor: `${dimension.colorHex}60`,
                  color: dimension.colorHex,
                }}
              >
                {event.category}
              </span>
            )}
            {event.is_featured && <Badge variant="accent">Featured</Badge>}
            {event.event_mode && <Badge variant="outline">{event.event_mode}</Badge>}
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-[#F3EFE8] leading-tight max-w-4xl drop-shadow-lg">
            {event.name}
          </h1>

          {event.blurb && (
            <p className="text-sm sm:text-base md:text-lg text-[#B8B3C7] max-w-3xl leading-relaxed">
              {event.blurb}
            </p>
          )}

          {/* Quick Logistic Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#B8B3C7] pt-2">
            <span>📅 {formatDateIST(event.schedule_summary)}</span>
            <span>📍 {scheduleVenue}</span>
            {event.min_teamsize && event.max_teamsize && (
              <span>
                👥 Team Size: {event.min_teamsize} - {event.max_teamsize}
              </span>
            )}
            {event.registration_status && (
              <StatusBadge type="registration" status={event.registration_status} size="sm" />
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. Dimensional Main Grid: Index Rail + Sections + Sticky Card
          ------------------------------------------------------------- */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Vertical Dimensional Index Rail (Sticky Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
            <nav
              aria-label="Dimensional Index"
              className="p-4 rounded-xl bg-[#0D1020] border border-[#FF7A1A]/20 shadow-xl space-y-1"
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] font-display text-[#F5B642] px-3 py-2 border-b border-white/5 mb-2">
                Dimensional Index
              </h2>
              {availableSections.map((sec) => {
                const isActive = activeSection === sec.key;
                return (
                  <a
                    key={sec.key}
                    href={`#${sec.key}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-[#FF7A1A] text-[#07060D] font-bold shadow-md shadow-[#FF7A1A]/30'
                        : 'text-[#B8B3C7] hover:text-[#F3EFE8] hover:bg-[#1A1030]'
                    }`}
                  >
                    <Glyph type={sec.glyph} size={16} />
                    <span>{sec.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* Quick Share / Calendar utility */}
            <div className="p-4 rounded-xl bg-[#0D1020]/70 border border-white/5 space-y-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => downloadIcs(event)}
              >
                Add To Calendar (.ics)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-[#B8B3C7]"
                onClick={handleShare}
              >
                Share Reality Link ↗
              </Button>
              {shareFeedback && (
                <p className="text-[11px] text-[#3DDC97] text-center font-medium">
                  {shareFeedback}
                </p>
              )}
            </div>
          </aside>

          {/* Middle Column: Editorial Content Sections */}
          <main className="lg:col-span-5 space-y-16">
            {/* 1. Overview Section */}
            <section id="overview" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#FF7A1A]/20 pb-3">
                <Glyph type="overview" size={22} className="text-[#FF7A1A]" />
                <h2 className="text-2xl font-display font-bold text-[#F3EFE8]">OVERVIEW</h2>
              </div>

              {event.description && (
                <div className="space-y-4 text-sm sm:text-base text-[#B8B3C7] leading-relaxed">
                  {event.description.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              {event.highlights && event.highlights.length > 0 && (
                <div className="p-5 rounded-lg bg-[#0D1020] border border-white/10 space-y-3">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#F5B642]">
                    Key Highlights
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#B8B3C7]">
                    {event.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#FF7A1A] mt-0.5">✦</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.what_to_expect && event.what_to_expect.length > 0 && (
                <div className="p-5 rounded-lg bg-[#0D1020] border border-white/10 space-y-3">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#3BA3FF]">
                    What To Expect
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#B8B3C7]">
                    {event.what_to_expect.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#3BA3FF] mt-0.5">►</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* 2. Schedule Section */}
            {(event.schedules?.length || event.schedule_summary?.start_date) && (
              <section id="schedule" className="scroll-mt-24 space-y-6">
                <div className="flex items-center gap-3 border-b border-[#FF7A1A]/20 pb-3">
                  <Glyph type="schedule" size={22} className="text-[#3BA3FF]" />
                  <h2 className="text-2xl font-display font-bold text-[#F3EFE8]">
                    TEMPORAL TIMELINE
                  </h2>
                </div>

                <div className="space-y-4">
                  {event.schedules && event.schedules.length > 0 ? (
                    event.schedules.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-[#0D1020] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <span className="font-mono text-xs text-[#FF7A1A] font-bold">
                            Day {idx + 1} • {item.event_date ? formatDateIST(item.event_date) : 'TBA'}
                          </span>
                          <p className="text-sm font-semibold text-[#F3EFE8]">
                            {item.start_time || '09:00'} – {item.end_time || '17:00'} IST
                          </p>
                        </div>
                        <div className="text-xs text-[#B8B3C7]">
                          📍 {item.venue || scheduleVenue}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-[#0D1020] border border-white/10">
                      <p className="text-sm text-[#F3EFE8] font-semibold">
                        {formatDateIST(event.schedule_summary)}
                      </p>
                      <p className="text-xs text-[#B8B3C7] mt-1">📍 {scheduleVenue}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3. Prizes Section (Tiered Podium Panels) */}
            {!isPlaceholder && event.prizes && event.prizes.length > 0 && (
              <section id="prizes" className="scroll-mt-24 space-y-6">
                <div className="flex items-center gap-3 border-b border-[#FF7A1A]/20 pb-3">
                  <Glyph type="prizes" size={22} className="text-[#F5B642]" />
                  <h2 className="text-2xl font-display font-bold text-[#F3EFE8]">
                    PODIUM REWARDS
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.prizes.map((prize, idx) => {
                    const isGold = prize.rank === 1 || idx === 0;
                    const isSilver = prize.rank === 2 || idx === 1;
                    const isBronze = prize.rank === 3 || idx === 2;

                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-xl border flex flex-col justify-between space-y-3 ${
                          isGold
                            ? 'bg-[#1A1030] border-[#F5B642]/60 shadow-lg shadow-[#F5B642]/10'
                            : isSilver
                            ? 'bg-[#0D1020] border-white/30'
                            : isBronze
                            ? 'bg-[#0D1020] border-[#FF7A1A]/30'
                            : 'bg-[#0D1020] border-white/10'
                        }`}
                      >
                        <div className="space-y-1">
                          <span
                            className={`text-[11px] font-bold uppercase tracking-widest ${
                              isGold
                                ? 'text-[#F5B642]'
                                : isSilver
                                ? 'text-zinc-300'
                                : 'text-[#FF7A1A]'
                            }`}
                          >
                            {prize.rank ? `Rank #${prize.rank}` : `Podium Position`}
                          </span>
                          <h3 className="font-display font-bold text-lg text-[#F3EFE8]">
                            {prize.title || (isGold ? 'Grand Champion' : 'Runner Up')}
                          </h3>
                          {prize.description && (
                            <p className="text-xs text-[#B8B3C7] leading-relaxed">
                              {prize.description}
                            </p>
                          )}
                        </div>

                        {typeof prize.amount === 'number' && prize.amount > 0 && (
                          <div className="font-mono text-2xl font-bold text-[#F5B642] pt-2 border-t border-white/5">
                            ₹{prize.amount.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. Rules & Eligibility */}
            {!isPlaceholder &&
              ((event.rules && event.rules.length > 0) ||
                (event.eligibility && event.eligibility.length > 0) ||
                (event.prerequisites && event.prerequisites.length > 0)) && (
                <section id="rules" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#FF7A1A]/20 pb-3">
                    <Glyph type="rules" size={22} className="text-[#FF7A1A]" />
                    <h2 className="text-2xl font-display font-bold text-[#F3EFE8]">
                      RULES & PROTOCOLS
                    </h2>
                  </div>

                  {event.eligibility && event.eligibility.length > 0 && (
                    <div className="p-4 rounded-lg bg-[#0D1020] border border-white/10 space-y-2">
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#3BA3FF]">
                        Eligibility Criteria
                      </h3>
                      <ul className="space-y-1.5 text-xs text-[#B8B3C7]">
                        {event.eligibility.map((el, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#3BA3FF]">✓</span>
                            <span>{el}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {event.rules && event.rules.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#F3EFE8]">
                        Mandatory Guidelines
                      </h3>
                      <ol className="space-y-2.5">
                        {event.rules.map((rule, idx) => (
                          <li
                            key={idx}
                            className="p-3.5 rounded-lg bg-[#0D1020] border border-white/10 text-xs sm:text-sm text-[#B8B3C7] flex items-start gap-3"
                          >
                            <span className="font-mono font-bold text-[#FF7A1A] shrink-0">
                              {String(idx + 1).padStart(2, '0')}.
                            </span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </section>
              )}

            {/* 5. FAQs Accordion */}
            {!isPlaceholder && event.faqs && event.faqs.length > 0 && (
              <section id="faqs" className="scroll-mt-24 space-y-6">
                <div className="flex items-center gap-3 border-b border-[#FF7A1A]/20 pb-3">
                  <Glyph type="faqs" size={22} className="text-[#3DDC97]" />
                  <h2 className="text-2xl font-display font-bold text-[#F3EFE8]">
                    FREQUENTLY ASKED QUERIES
                  </h2>
                </div>

                <div className="space-y-3">
                  {event.faqs.map((faq, idx) => {
                    const isOpenState = Boolean(openFaqs[idx]);
                    return (
                      <div
                        key={idx}
                        className="rounded-lg bg-[#0D1020] border border-white/10 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(idx)}
                          aria-expanded={isOpenState}
                          aria-controls={`faq-answer-${idx}`}
                          className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#F3EFE8] hover:text-[#FF7A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
                        >
                          <span>{faq.question}</span>
                          <span className="font-mono text-base text-[#FF7A1A] shrink-0">
                            {isOpenState ? '−' : '+'}
                          </span>
                        </button>
                        {isOpenState && (
                          <div
                            id={`faq-answer-${idx}`}
                            className="px-4 pb-4 text-xs sm:text-sm text-[#B8B3C7] leading-relaxed border-t border-white/5 pt-3"
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

            {/* 6. Contacts Section */}
            {!isPlaceholder &&
              ((event.organizers && event.organizers.length > 0) ||
                (event.coordinators && event.coordinators.length > 0)) && (
                <section id="contacts" className="scroll-mt-24 space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#FF7A1A]/20 pb-3">
                    <Glyph type="contacts" size={22} className="text-[#A66BFF]" />
                    <h2 className="text-2xl font-display font-bold text-[#F3EFE8]">
                      SANCTUM CONDUITS
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.coordinators?.map((coord, idx) => {
                      const contact = coord.contact || '';
                      const isEmail = contact.includes('@');
                      const isPhone = !isEmail && /^\+?[0-9\s\-()]+$/.test(contact);

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-[#0D1020] border border-white/10 space-y-1.5"
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
                                  className="text-[#FF7A1A] hover:underline"
                                >
                                  ✉ {contact}
                                </a>
                              ) : isPhone ? (
                                <a
                                  href={`tel:${contact.replace(/\s+/g, '')}`}
                                  className="text-[#FF7A1A] hover:underline"
                                >
                                  📞 {contact}
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

            {/* 7. Gallery Section */}
            {!isPlaceholder && event.gallery_images && event.gallery_images.length > 0 && (
              <section id="gallery" className="scroll-mt-24 space-y-6">
                <div className="flex items-center gap-3 border-b border-[#FF7A1A]/20 pb-3">
                  <Glyph type="overview" size={22} className="text-[#F5B642]" />
                  <h2 className="text-2xl font-display font-bold text-[#F3EFE8]">
                    ASTRAL GALLERY
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {event.gallery_images.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg overflow-hidden bg-[#0D1020] border border-white/10"
                    >
                      <img
                        src={getOptimizedImageUrl(imgUrl, 400, 300)}
                        alt={`Gallery photograph ${i + 1}`}
                        width={400}
                        height={300}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Right Column: Sticky Summary & Registration Card */}
          <aside className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="p-6 rounded-xl bg-[#0D1020] border border-[#FF7A1A]/30 shadow-2xl space-y-6">
              {/* Pricing Header */}
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-[#B8B3C7]">
                  Registration Pass
                </span>
                <div className="font-display font-bold text-3xl sm:text-4xl text-[#F3EFE8]">
                  {formatPrice(event.price, event.is_per_head)}
                </div>
                <p className="text-xs text-[#B8B3C7]">
                  {isPerHead ? 'Individual participant ticket' : 'Full team admission ticket'}
                </p>
              </div>

              {/* Seats Remaining Bar */}
              {remaining !== null && event.event_status === 'ACTIVE' && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#B8B3C7]">Capacity</span>
                    <span
                      className={`font-bold ${
                        remaining <= 5 ? 'text-[#FF7A1A]' : 'text-[#F3EFE8]'
                      }`}
                    >
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

              {/* Honest Registration Block per Constraint 2 */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B8B3C7]">Status</span>
                  {event.registration_status && (
                    <StatusBadge type="registration" status={event.registration_status} size="sm" />
                  )}
                </div>

                {event.registration_deadline && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#B8B3C7]">Deadline</span>
                    <span className="text-[#F3EFE8] font-mono">
                      {formatDateIST(event.registration_deadline)}
                    </span>
                  </div>
                )}

                {/* Primary Action Button: No fake form/payment per Constraint 2 */}
                {isOpen ? (
                  <div className="space-y-2 pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full uppercase tracking-wider text-sm font-bold"
                      onClick={() => {
                        alert(
                          `Registration coordinate locked for ${event.name}.\nOfficial portal link or desk entry will open at ${scheduleVenue}.`
                        );
                      }}
                    >
                      Confirm Registration Entry
                    </Button>
                    <p className="text-[11px] text-center text-[#B8B3C7]">
                      Entry verified at sanctum check-in
                    </p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="w-full py-3 rounded-md bg-[#1A1030] text-center text-xs uppercase tracking-wider font-semibold text-[#B8B3C7] border border-white/10">
                      Registration Concluded
                    </div>
                  </div>
                )}
              </div>

              {/* Utility Actions */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => downloadIcs(event)}
                >
                  📅 Add to Calendar (.ics)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-[#B8B3C7]"
                  onClick={handleShare}
                >
                  🔗 Share with Team
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const EventDetailSkeleton: FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#07060D] animate-pulse space-y-12">
      <div className="w-full h-[50vh] bg-[#0D1020]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="hidden lg:block lg:col-span-3 h-64 rounded-xl bg-[#0D1020]" />
        <div className="lg:col-span-5 space-y-6">
          <div className="h-8 w-48 rounded bg-[#0D1020]" />
          <div className="h-24 w-full rounded bg-[#0D1020]" />
          <div className="h-40 w-full rounded bg-[#0D1020]" />
        </div>
        <div className="lg:col-span-4 h-96 rounded-xl bg-[#0D1020]" />
      </div>
    </div>
  );
};
