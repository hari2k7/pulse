import type { EventDetail } from './types';

/**
 * Escapes characters for iCalendar text values (RFC 5545).
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Formats a Date object into UTC iCalendar timestamp: YYYYMMDDTHHMMSSZ.
 */
function formatUtcTimestamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

/**
 * Converts IST (UTC+5:30) date & time strings into a UTC Date object.
 */
function parseIstToUtc(dateStr: string, timeStr = '09:00'): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // IST offset is +05:30 (330 minutes)
  const istTimeMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
  const utcMs = istTimeMs - (5 * 60 + 30) * 60 * 1000;
  return new Date(utcMs);
}

/**
 * Generates valid iCalendar (.ics) RFC 5545 string.
 * Generates one VEVENT per schedules item (falling back to schedule_summary).
 * Converts IST to UTC with Z timestamps.
 */
export function generateIcs(event: Partial<EventDetail> & { id: string; name: string }): string {
  const now = new Date();
  const dtstamp = formatUtcTimestamp(now);

  const vevents: string[] = [];

  if (Array.isArray(event.schedules) && event.schedules.length > 0) {
    event.schedules.forEach((schedule, index) => {
      const dateStr = schedule.event_date || event.schedule_summary?.start_date;
      if (!dateStr) return;

      const startTimeStr = schedule.start_time || '09:00';
      const endTimeStr = schedule.end_time || '17:00';

      const startDateUtc = parseIstToUtc(dateStr, startTimeStr);
      let endDateUtc = parseIstToUtc(dateStr, endTimeStr);

      // Ensure end time is strictly after start time
      if (endDateUtc <= startDateUtc) {
        endDateUtc = new Date(startDateUtc.getTime() + 2 * 60 * 60 * 1000);
      }

      const venue = schedule.venue || 'Campus Venue, Pune';

      vevents.push(
        [
          'BEGIN:VEVENT',
          `UID:${event.id}-${index}@strange.events`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART:${formatUtcTimestamp(startDateUtc)}`,
          `DTEND:${formatUtcTimestamp(endDateUtc)}`,
          `SUMMARY:${escapeIcsText(event.name)}`,
          `DESCRIPTION:${escapeIcsText(event.blurb || event.name)}`,
          `LOCATION:${escapeIcsText(venue)}`,
          'STATUS:CONFIRMED',
          'END:VEVENT',
        ].join('\r\n')
      );
    });
  }

  // Fallback to schedule_summary if no schedules array or schedules were empty
  if (vevents.length === 0 && event.schedule_summary?.start_date) {
    const summary = event.schedule_summary;
    const startDateStr = summary.start_date;
    const endDateStr = summary.end_date || summary.start_date;
    const startTimeStr = summary.start_time || '09:00';
    const endTimeStr = summary.end_time || '17:00';

    const startDateUtc = parseIstToUtc(startDateStr, startTimeStr);
    let endDateUtc = parseIstToUtc(endDateStr, endTimeStr);

    if (endDateUtc <= startDateUtc) {
      endDateUtc = new Date(startDateUtc.getTime() + 2 * 60 * 60 * 1000);
    }

    vevents.push(
      [
        'BEGIN:VEVENT',
        `UID:${event.id}-0@strange.events`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${formatUtcTimestamp(startDateUtc)}`,
        `DTEND:${formatUtcTimestamp(endDateUtc)}`,
        `SUMMARY:${escapeIcsText(event.name)}`,
        `DESCRIPTION:${escapeIcsText(event.blurb || event.name)}`,
        'LOCATION:Campus Venue\\, Pune',
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n')
    );
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//STRANGE//Fest Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers a client-side .ics file download via Blob.
 */
export function downloadIcs(event: Partial<EventDetail> & { id: string; name: string }): void {
  const icsContent = generateIcs(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const cleanName = event.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${cleanName || 'event'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
