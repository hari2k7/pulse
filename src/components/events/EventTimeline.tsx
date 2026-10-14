import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { EventSummary } from '../../lib/types';
import { formatDateIST, formatPrice } from '../../lib/format';
import { getEventDimension } from '../../lib/dimensions';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { getOptimizedImageUrl } from '../../lib/images';

export interface EventTimelineProps {
  events: EventSummary[];
}

interface DateGroup {
  dateKey: string;
  formattedDate: string;
  events: EventSummary[];
}

function groupEventsChronologically(events: EventSummary[]): DateGroup[] {
  const map = new Map<string, EventSummary[]>();

  for (const event of events) {
    const dateKey = event.schedule_summary?.start_date || 'TBA';
    const group = map.get(dateKey) || [];
    group.push(event);
    map.set(dateKey, group);
  }

  // Sort groups chronologically
  const sortedKeys = Array.from(map.keys()).sort((a, b) => {
    if (a === 'TBA') return 1;
    if (b === 'TBA') return -1;
    return a.localeCompare(b);
  });

  return sortedKeys.map((dateKey) => {
    const groupEvents = map.get(dateKey) || [];
    // Sort events within the same day by start_time
    groupEvents.sort((a, b) => {
      const timeA = a.schedule_summary?.start_time || '00:00';
      const timeB = b.schedule_summary?.start_time || '00:00';
      return timeA.localeCompare(timeB);
    });

    return {
      dateKey,
      formattedDate: dateKey === 'TBA' ? 'Dates To Be Announced' : formatDateIST(dateKey),
      events: groupEvents,
    };
  });
}

export const EventTimeline: FC<EventTimelineProps> = ({ events }) => {
  const groups = groupEventsChronologically(events);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-10" role="region" aria-label="Events Timeline">
      <ol className="space-y-12">
        {groups.map((group) => (
          <li key={group.dateKey} className="space-y-4">
            {/* Date Group Heading */}
            <div className="sticky top-16 md:top-20 z-20 bg-[#07060D]/95 backdrop-blur-md py-3 border-b border-[#FF7A1A]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#FF7A1A] shadow-[0_0_10px_rgba(255,122,26,0.8)]" aria-hidden="true" />
                <h3 className="text-lg sm:text-xl font-display font-bold text-[#F3EFE8] uppercase tracking-wider">
                  {group.formattedDate}
                </h3>
              </div>
              <span className="font-mono text-xs text-[#B8B3C7]">
                {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {/* Event Items in this Date Group */}
            <ul className="space-y-3 pl-2 sm:pl-4 border-l-2 border-[#FF7A1A]/20 ml-1.5 sm:ml-2">
              {group.events.map((event) => {
                const startTime = event.schedule_summary?.start_time;
                const endTime = event.schedule_summary?.end_time;
                const timeString = startTime
                  ? endTime
                    ? `${startTime} – ${endTime} IST`
                    : `${startTime} IST`
                  : 'Time TBA';

                const dimension = getEventDimension({
                  category: event.category,
                  event_type: event.event_type,
                  is_technical: event.is_technical,
                });

                const isClosed =
                  event.event_status === 'COMPLETED' ||
                  event.event_status === 'CLOSED' ||
                  event.registration_status === 'CLOSED';

                return (
                  <li key={event.id}>
                    <Link
                      to={`/events/${event.id}`}
                      className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] ${
                        isClosed
                          ? 'bg-[#0D1020]/50 border-white/5 opacity-75 hover:border-white/15'
                          : 'bg-[#0D1020] border-white/10 hover:border-[#FF7A1A]/50 hover:bg-[#1A1030]/60'
                      }`}
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        {/* Thumbnail image */}
                        <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-md overflow-hidden bg-[#07060D] shrink-0 border border-white/10">
                          <img
                            src={getOptimizedImageUrl(event.cover_image_url, 150, 100)}
                            alt=""
                            width="150"
                            height="100"
                            loading="lazy"
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              isClosed ? 'grayscale' : ''
                            }`}
                          />
                        </div>

                        {/* Text info */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#FF7A1A] font-semibold">
                              {timeString}
                            </span>
                            {event.category && (
                              <span
                                className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${dimension.colorHex}15`,
                                  color: dimension.colorHex,
                                }}
                              >
                                {event.category}
                              </span>
                            )}
                          </div>

                          <h4 className="font-display font-bold text-sm sm:text-base text-[#F3EFE8] group-hover:text-[#FF7A1A] transition-colors truncate">
                            {event.name}
                          </h4>

                          {event.blurb && (
                            <p className="text-xs text-[#B8B3C7] line-clamp-1 hidden sm:block">
                              {event.blurb}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Badges & Price */}
                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-end sm:self-center">
                        {event.event_mode && (
                          <Badge variant="outline" size="sm">
                            {event.event_mode}
                          </Badge>
                        )}
                        {event.registration_status && (
                          <StatusBadge
                            type="registration"
                            status={event.registration_status}
                            size="sm"
                          />
                        )}
                        <span className="font-mono text-xs sm:text-sm font-bold text-[#F3EFE8]">
                          {formatPrice(event.price, event.is_per_head)}
                        </span>
                        <span className="text-xs text-[#FF7A1A] font-bold group-hover:translate-x-1 transition-transform">
                          →
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
  );
};
