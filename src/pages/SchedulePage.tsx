import { useState, useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { formatDateIST, formatPrice } from '../lib/format';
import { getEventDimension } from '../lib/dimensions';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getOptimizedImageUrl } from '../lib/images';
import { SanctumSeal } from '../components/strange/SanctumSeal';
import type { EventSummary } from '../lib/types';

interface DayGroup {
  dateKey: string;
  formattedDate: string;
  events: EventSummary[];
}

export const SchedulePage: FC = () => {
  useDocumentMeta({
    title: 'Festival Schedule — STRANGE',
    description: 'Complete chronological schedule of all technical competitions, hackathons, workshops, and multiverse events.',
  });

  const { status, events, error, retry } = useEvents();

  const [search, setSearch] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<string>('all');
  const [showPast, setShowPast] = useState(false);

  // Filter events
  const filteredEvents = useMemo(() => {
    return (events || []).filter((ev: EventSummary) => {
      // Past event filtering
      const isPast =
        ev.event_status === 'COMPLETED' ||
        ev.event_status === 'CLOSED' ||
        ev.registration_status === 'CLOSED';

      if (!showPast && isPast) return false;

      // Dimension filtering
      const dim = getEventDimension({
        category: ev.category,
        event_type: ev.event_type,
        is_technical: ev.is_technical,
      });

      if (selectedDimension !== 'all' && dim.id !== selectedDimension) {
        return false;
      }

      // Search query filtering
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = ev.name?.toLowerCase().includes(q);
        const matchesCategory = ev.category?.toLowerCase().includes(q);
        const matchesBlurb = ev.blurb?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesBlurb) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedDimension, showPast, search]);

  // Group filtered events by date
  const dayGroups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, EventSummary[]>();

    for (const ev of filteredEvents) {
      const dateKey = ev.schedule_summary?.start_date || 'TBA';
      const list = map.get(dateKey) || [];
      list.push(ev);
      map.set(dateKey, list);
    }

    // Sort chronologically
    const sortedKeys = Array.from(map.keys()).sort((a, b) => {
      if (a === 'TBA') return 1;
      if (b === 'TBA') return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((dateKey) => {
      const dayEvents = map.get(dateKey) || [];
      dayEvents.sort((a, b) => {
        const timeA = a.schedule_summary?.start_time || '00:00';
        const timeB = b.schedule_summary?.start_time || '00:00';
        return timeA.localeCompare(timeB);
      });

      return {
        dateKey,
        formattedDate: dateKey === 'TBA' ? 'Dates To Be Announced' : formatDateIST(dateKey),
        events: dayEvents,
      };
    });
  }, [filteredEvents]);

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#07060D] text-[#F3EFE8] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Seal */}
      <div
        className="fixed -top-40 -right-40 opacity-10 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <SanctumSeal size={600} glow={false} />
      </div>

      <div className="max-w-6xl w-full mx-auto relative z-10 space-y-10">
        {/* Header */}
        <header className="space-y-4 text-center sm:text-left border-b border-[#FF7A1A]/20 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 text-xs font-mono font-bold tracking-widest text-[#FF7A1A] uppercase">
            <span>●</span> Temporal Index
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase text-[#F3EFE8]">
            Festival Schedule
          </h1>
          <p className="text-sm sm:text-base text-[#B8B3C7] max-w-2xl leading-relaxed">
            All dimensional events, workshops, hackathons, and keynote challenges
            synchronized in Indian Standard Time (IST).
          </p>
        </header>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0D1020] border border-white/10 shadow-lg">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search timeline by event name or keyword..."
              className="w-full bg-[#1A1030]/60 border border-white/10 rounded-lg px-4 py-2 text-sm text-[#F3EFE8] placeholder-[#B8B3C7]/50 focus:outline-none focus:border-[#FF7A1A] focus:ring-1 focus:ring-[#FF7A1A]"
              aria-label="Search schedule"
            />
          </div>

          {/* Dimension pill filters */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Dimensions' },
              { id: 'technical', label: 'Technical' },
              { id: 'hackathon', label: 'Hackathons' },
              { id: 'workshop', label: 'Workshops' },
              { id: 'non-technical', label: 'Non-Technical' },
            ].map((dim) => {
              const active = selectedDimension === dim.id;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => setSelectedDimension(dim.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    active
                      ? 'bg-[#FF7A1A] text-[#07060D] font-bold shadow-md shadow-[#FF7A1A]/20'
                      : 'bg-[#1A1030]/80 text-[#B8B3C7] hover:text-[#F3EFE8] hover:bg-[#1A1030]'
                  }`}
                >
                  {dim.label}
                </button>
              );
            })}
          </div>

          {/* Past toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#B8B3C7] select-none hover:text-[#F3EFE8] shrink-0">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="rounded bg-[#1A1030] border-white/20 text-[#FF7A1A] focus:ring-[#FF7A1A]"
            />
            <span>Show past events</span>
          </label>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="space-y-8" aria-label="Loading schedule">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-4">
                <div className="h-8 w-48 bg-[#0D1020] rounded animate-pulse" />
                <div className="space-y-3 pl-4 border-l-2 border-white/10 ml-2">
                  <div className="h-24 bg-[#0D1020] rounded-lg animate-pulse" />
                  <div className="h-24 bg-[#0D1020] rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="p-8 rounded-xl bg-[#0D1020] border border-[#C8102E]/40 text-center space-y-4">
            <h2 className="font-display text-xl text-[#F3EFE8]">
              Temporal Rift Disrupted
            </h2>
            <p className="text-sm text-[#B8B3C7] max-w-md mx-auto">
              {error?.message || 'Failed to synchronize schedule timelines.'}
            </p>
            <button
              type="button"
              onClick={retry}
              className="px-5 py-2 rounded-md bg-[#C8102E] text-[#F3EFE8] font-bold text-xs uppercase tracking-wider hover:bg-[#C8102E]/80 transition-all"
            >
              Recalibrate Timeline
            </button>
          </div>
        )}

        {/* Empty State */}
        {status === 'success' && dayGroups.length === 0 && (
          <div className="p-12 rounded-xl bg-[#0D1020] border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#1A1030] flex items-center justify-center text-[#F5B642]">
              ✧
            </div>
            <h3 className="font-display text-lg text-[#F3EFE8]">
              No Events Located in This Time Stream
            </h3>
            <p className="text-sm text-[#B8B3C7] max-w-md mx-auto">
              Try adjusting your search terms, switching dimensions, or enabling
              past events.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedDimension('all');
                setShowPast(true);
              }}
              className="text-xs text-[#FF7A1A] underline hover:text-[#F5B642]"
            >
              Reset Schedule Filters
            </button>
          </div>
        )}

        {/* Chronological Schedule Stream */}
        {status === 'success' && dayGroups.length > 0 && (
          <div className="space-y-12" role="region" aria-label="Schedule Timeline">
            <ol className="space-y-12">
              {dayGroups.map((group) => (
                <li key={group.dateKey} className="space-y-4">
                  {/* Date Heading */}
                  <div className="sticky top-16 md:top-20 z-20 bg-[#07060D]/95 backdrop-blur-md py-3.5 border-b border-[#FF7A1A]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full bg-[#FF7A1A] shadow-[0_0_12px_rgba(255,122,26,0.9)]"
                        aria-hidden="true"
                      />
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F3EFE8] tracking-wider uppercase">
                        {group.formattedDate}
                      </h2>
                    </div>
                    <span className="font-mono text-xs text-[#B8B3C7] px-2.5 py-1 rounded bg-[#1A1030] border border-white/10">
                      {group.events.length}{' '}
                      {group.events.length === 1 ? 'event' : 'events'}
                    </span>
                  </div>

                  {/* Events on this day */}
                  <ul className="space-y-3.5 pl-3 sm:pl-5 border-l-2 border-[#FF7A1A]/20 ml-1.5 sm:ml-2">
                    {group.events.map((ev) => {
                      const startTime = ev.schedule_summary?.start_time;
                      const endTime = ev.schedule_summary?.end_time;
                      const timeString = startTime
                        ? endTime
                          ? `${startTime} – ${endTime} IST`
                          : `${startTime} IST`
                        : 'Time TBA';

                      const dimension = getEventDimension({
                        category: ev.category,
                        event_type: ev.event_type,
                        is_technical: ev.is_technical,
                      });

                      const isClosed =
                        ev.event_status === 'COMPLETED' ||
                        ev.event_status === 'CLOSED' ||
                        ev.registration_status === 'CLOSED';

                      return (
                        <li key={ev.id}>
                          <Link
                            to={`/events/${ev.id}`}
                            className={`group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] ${
                              isClosed
                                ? 'bg-[#0D1020]/50 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20'
                                : 'bg-[#0D1020] border-white/10 hover:border-[#FF7A1A]/50 hover:bg-[#1A1030]/80 shadow-md'
                            }`}
                          >
                            {/* Left: Thumbnail & Details */}
                            <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                              {/* Thumbnail */}
                              <div className="w-20 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden bg-[#07060D] shrink-0 border border-white/10">
                                <img
                                  src={getOptimizedImageUrl(ev.cover_image_url, 180, 120)}
                                  alt={ev.cover_image_alt || ev.name}
                                  width="180"
                                  height="120"
                                  loading="lazy"
                                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                                    isClosed ? 'grayscale' : ''
                                  }`}
                                />
                              </div>

                              {/* Text info */}
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs text-[#FF7A1A] font-bold">
                                    {timeString}
                                  </span>
                                  {ev.category && (
                                    <span
                                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                                      style={{
                                        backgroundColor: `${dimension.colorHex}20`,
                                        color: dimension.colorHex,
                                      }}
                                    >
                                      {ev.category}
                                    </span>
                                  )}
                                  {ev.event_type && (
                                    <span className="text-[10px] uppercase font-mono text-[#B8B3C7] bg-white/5 px-1.5 py-0.5 rounded">
                                      {ev.event_type}
                                    </span>
                                  )}
                                </div>

                                <h3 className="font-display font-bold text-base sm:text-lg text-[#F3EFE8] group-hover:text-[#FF7A1A] transition-colors truncate">
                                  {ev.name}
                                </h3>

                                {ev.blurb && (
                                  <p className="text-xs text-[#B8B3C7] line-clamp-1">
                                    {ev.blurb}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: Badges & CTA */}
                            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                              {ev.event_mode && (
                                <Badge variant="outline" size="sm">
                                  {ev.event_mode}
                                </Badge>
                              )}
                              {ev.registration_status && (
                                <StatusBadge
                                  type="registration"
                                  status={ev.registration_status}
                                  size="sm"
                                />
                              )}
                              <span className="font-mono text-xs sm:text-sm font-bold text-[#F3EFE8]">
                                {formatPrice(ev.price, ev.is_per_head)}
                              </span>
                              <span className="text-xs font-bold text-[#FF7A1A] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                View ↗
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
