import type { EventSummary, ScheduleSummary } from './types';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Formats a price into Indian currency format (e.g. "Free", "₹499 / person", "₹1,200 / team").
 * Never returns "undefined" or NaN.
 */
export function formatPrice(price?: number | null, isPerHead = true): string {
  if (price === 0 || price === null || price === undefined) {
    return 'Free';
  }

  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return 'Free';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(price);

  const suffix = isPerHead ? ' / person' : ' / team';
  return `₹${formatted}${suffix}`;
}

interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

function parseYMD(dateStr?: string | null): DateParts | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  // Match YYYY-MM-DD
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { year, month, day };
}

/**
 * Formats an event date or schedule summary in Indian Standard Time (IST).
 * Safe helper that never returns "undefined" or "Invalid Date" — returns "TBA" on missing/invalid input.
 */
export function formatDateIST(
  summary?: ScheduleSummary | { start_date?: string; end_date?: string } | string | null
): string {
  if (!summary) return 'TBA';

  // If summary is a string, attempt to parse YYYY-MM-DD or ISO string
  if (typeof summary === 'string') {
    const ymd = parseYMD(summary);
    if (ymd) {
      const monthName = MONTH_NAMES[ymd.month - 1];
      return `${ymd.day} ${monthName} ${ymd.year}`;
    }
    const parsed = new Date(summary);
    if (isNaN(parsed.getTime())) return 'TBA';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(parsed);
    } catch {
      return 'TBA';
    }
  }

  const start = parseYMD(summary.start_date);
  if (!start) return 'TBA';

  const startMonthName = MONTH_NAMES[start.month - 1];
  const end = parseYMD(summary.end_date);

  // If no end date or start equals end
  if (!end || (start.year === end.year && start.month === end.month && start.day === end.day)) {
    return `${start.day} ${startMonthName} ${start.year}`;
  }

  const endMonthName = MONTH_NAMES[end.month - 1];

  // Same month and year: "13 – 14 Nov 2026"
  if (start.year === end.year && start.month === end.month) {
    return `${start.day} – ${end.day} ${startMonthName} ${start.year}`;
  }

  // Different month, same year: "30 Nov – 2 Dec 2026"
  if (start.year === end.year) {
    return `${start.day} ${startMonthName} – ${end.day} ${endMonthName} ${start.year}`;
  }

  // Different year: "31 Dec 2026 – 2 Jan 2027"
  return `${start.day} ${startMonthName} ${start.year} – ${end.day} ${endMonthName} ${end.year}`;
}

/**
 * Calculates remaining seats: total_seats - seats_filled.
 * Only valid when both are numbers, clamped at 0.
 * Returns null if either value is not a valid number.
 */
export function seatsLeft(total?: number | null, filled?: number | null): number | null {
  if (
    typeof total !== 'number' ||
    typeof filled !== 'number' ||
    isNaN(total) ||
    isNaN(filled)
  ) {
    return null;
  }
  return Math.max(0, total - filled);
}

/**
 * Calculates the percentage of seats filled (0-100), clamped safely.
 */
export function seatsPercentage(total?: number | null, filled?: number | null): number {
  if (typeof total !== 'number' || isNaN(total) || total <= 0) return 0;
  const validFilled = typeof filled === 'number' && !isNaN(filled) ? filled : 0;
  return Math.min(100, Math.max(0, Math.round((validFilled / total) * 100)));
}

/**
 * Formats seats text in accordance with PROJECT.md rules:
 * - Completed events: "Completed"
 * - Sold out: "Sold out"
 * - Team slots: "team slots left" vs "seats left"
 * - 5 or fewer: "Only N left"
 */
export function formatSeatsText(
  event?: Partial<EventSummary> | {
    total_seats?: number | null;
    seats_filled?: number | null;
    is_per_head?: boolean;
    event_status?: string;
    registration_status?: string;
  } | null
): string {
  if (!event) return '';

  if (event.event_status === 'COMPLETED') {
    return 'Completed';
  }

  if (event.registration_status === 'CLOSED') {
    return 'Registration closed';
  }

  if (event.registration_status === 'SOLD_OUT') {
    return 'Sold out';
  }

  const remaining = seatsLeft(event.total_seats, event.seats_filled);
  if (remaining === null) {
    return '';
  }

  if (remaining === 0) {
    return 'Sold out';
  }

  const unit = event.is_per_head === false ? 'team slots' : 'seats';

  if (remaining <= 5) {
    return `Only ${remaining} ${unit} left`;
  }

  return `${remaining} ${unit} left`;
}

/**
 * Checks if an event is closing soon:
 * registration_status === "OPEN" and has a future registration_deadline.
 */
export function isClosingSoon(event?: Partial<EventSummary> | null): boolean {
  if (!event || event.registration_status !== 'OPEN' || !event.registration_deadline) {
    return false;
  }

  const deadline = new Date(event.registration_deadline).getTime();
  if (isNaN(deadline)) return false;

  return deadline > Date.now();
}
