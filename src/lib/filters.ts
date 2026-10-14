import type { EventSummary } from './types';
import { getThemeForCategory, isUpcomingEvent } from './themes';

export type EventSortOption = 'soonest' | 'price-asc' | 'price-desc';
export type PriceFilterOption = 'all' | 'free' | 'paid';

export interface EventFilterState {
  search: string;
  theme: string; // ThemeId | 'all'
  mode: string; // 'all' | 'OFFLINE' | 'ONLINE'
  type: string; // 'all' | 'EVENT' | 'WORKSHOP'
  price: PriceFilterOption; // 'all' | 'free' | 'paid'
  status: string; // 'all' | 'OPEN' | 'CLOSED' | 'SOLD_OUT'
  technicalOnly: boolean;
  showPast: boolean;
  sort: EventSortOption;
}

export const DEFAULT_FILTERS: Readonly<EventFilterState> = {
  search: '',
  theme: 'all',
  mode: 'all',
  type: 'all',
  price: 'all',
  status: 'all',
  technicalOnly: false,
  showPast: false,
  sort: 'soonest',
};

/**
 * Returns whether an event is in the past:
 * Past = COMPLETED, event_status CLOSED, or registration_status CLOSED.
 */
export function isPastEvent(event?: Partial<EventSummary> | null): boolean {
  if (!event) return false;
  return !isUpcomingEvent(event);
}

/**
 * Checks if an event matches a search query.
 * Case-insensitive across name, blurb, raw category, and tags.
 */
export function matchesSearch(event: EventSummary, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  if (event.name && event.name.toLowerCase().includes(query)) {
    return true;
  }

  if (event.blurb && event.blurb.toLowerCase().includes(query)) {
    return true;
  }

  if (event.category && event.category.toLowerCase().includes(query)) {
    return true;
  }

  if (Array.isArray(event.tags)) {
    for (const tag of event.tags) {
      if (typeof tag === 'string' && tag.toLowerCase().includes(query)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Pure function: Filters events according to the filter state.
 */
export function filterEvents(
  events: EventSummary[],
  filters: EventFilterState
): EventSummary[] {
  return events.filter((event) => {
    // 1. Past events check (default hidden unless showPast is true)
    if (!filters.showPast && isPastEvent(event)) {
      return false;
    }

    // 2. Search query
    if (filters.search && !matchesSearch(event, filters.search)) {
      return false;
    }

    // 3. Theme filter (from themes.ts)
    if (filters.theme && filters.theme !== 'all') {
      const eventTheme = getThemeForCategory(event.category);
      if (eventTheme !== filters.theme) {
        return false;
      }
    }

    // 4. Mode filter (OFFLINE | ONLINE)
    if (filters.mode && filters.mode !== 'all') {
      if (event.event_mode !== filters.mode) {
        return false;
      }
    }

    // 5. Type filter (EVENT | WORKSHOP)
    if (filters.type && filters.type !== 'all') {
      if (event.event_type !== filters.type) {
        return false;
      }
    }

    // 6. Price filter (free | paid)
    if (filters.price === 'free') {
      if (event.price !== 0) return false;
    } else if (filters.price === 'paid') {
      if (typeof event.price !== 'number' || event.price <= 0) return false;
    }

    // 7. Registration status (OPEN | CLOSED | SOLD_OUT)
    if (filters.status && filters.status !== 'all') {
      if (event.registration_status !== filters.status) {
        return false;
      }
    }

    // 8. Technical only
    if (filters.technicalOnly) {
      if (!event.is_technical) return false;
    }

    return true;
  });
}

/**
 * Pure function: Sorts events by soonest (start date/time), price-asc, or price-desc.
 */
export function sortEvents(
  events: EventSummary[],
  sortOption: EventSortOption
): EventSummary[] {
  const shallowCopy = [...events];

  if (sortOption === 'price-asc') {
    return shallowCopy.sort((a, b) => {
      const priceA = typeof a.price === 'number' ? a.price : 0;
      const priceB = typeof b.price === 'number' ? b.price : 0;
      return priceA - priceB;
    });
  }

  if (sortOption === 'price-desc') {
    return shallowCopy.sort((a, b) => {
      const priceA = typeof a.price === 'number' ? a.price : 0;
      const priceB = typeof b.price === 'number' ? b.price : 0;
      return priceB - priceA;
    });
  }

  // Default: soonest start date & time (IST)
  return shallowCopy.sort((a, b) => {
    const startA = a.schedule_summary?.start_date
      ? new Date(`${a.schedule_summary.start_date}T${a.schedule_summary.start_time || '00:00'}:00+05:30`).getTime()
      : Infinity;
    const startB = b.schedule_summary?.start_date
      ? new Date(`${b.schedule_summary.start_date}T${b.schedule_summary.start_time || '00:00'}:00+05:30`).getTime()
      : Infinity;

    return startA - startB;
  });
}

/**
 * Pure function: Filters and sorts events in one pipeline.
 */
export function filterAndSortEvents(
  events: EventSummary[],
  filters: EventFilterState
): EventSummary[] {
  const filtered = filterEvents(events, filters);
  return sortEvents(filtered, filters.sort);
}

/**
 * Parses query parameters from URLSearchParams into EventFilterState.
 */
export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams
): EventFilterState {
  const sortParam = searchParams.get('sort');
  const validSort: EventSortOption =
    sortParam === 'price-asc' || sortParam === 'price-desc' ? sortParam : 'soonest';

  const priceParam = searchParams.get('price');
  const validPrice: PriceFilterOption =
    priceParam === 'free' || priceParam === 'paid' ? priceParam : 'all';

  return {
    search: searchParams.get('q') || searchParams.get('search') || '',
    theme: searchParams.get('theme') || 'all',
    mode: searchParams.get('mode') || 'all',
    type: searchParams.get('type') || 'all',
    price: validPrice,
    status: searchParams.get('status') || 'all',
    technicalOnly: searchParams.get('tech') === 'true',
    showPast: searchParams.get('past') === 'true',
    sort: validSort,
  };
}

/**
 * Converts EventFilterState into clean URLSearchParams (omitting default values).
 */
export function filtersToSearchParams(filters: EventFilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set('q', filters.search.trim());
  }

  if (filters.theme && filters.theme !== 'all') {
    params.set('theme', filters.theme);
  }

  if (filters.mode && filters.mode !== 'all') {
    params.set('mode', filters.mode);
  }

  if (filters.type && filters.type !== 'all') {
    params.set('type', filters.type);
  }

  if (filters.price && filters.price !== 'all') {
    params.set('price', filters.price);
  }

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }

  if (filters.technicalOnly) {
    params.set('tech', 'true');
  }

  if (filters.showPast) {
    params.set('past', 'true');
  }

  if (filters.sort && filters.sort !== 'soonest') {
    params.set('sort', filters.sort);
  }

  return params;
}

/**
 * Checks whether any non-default filters are active.
 */
export function hasActiveFilters(filters: EventFilterState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.theme !== 'all' ||
    filters.mode !== 'all' ||
    filters.type !== 'all' ||
    filters.price !== 'all' ||
    filters.status !== 'all' ||
    filters.technicalOnly ||
    filters.showPast
  );
}

/**
 * Groups events by their start_date (IST) for Timeline view.
 */
export interface DateGroup {
  dateKey: string;
  formattedDate: string;
  events: EventSummary[];
}

export function groupEventsByDate(events: EventSummary[]): DateGroup[] {
  const map = new Map<string, EventSummary[]>();

  for (const event of events) {
    const dateKey = event.schedule_summary?.start_date || 'TBA';
    const group = map.get(dateKey) || [];
    group.push(event);
    map.set(dateKey, group);
  }

  const groups: DateGroup[] = [];
  for (const [dateKey, groupEvents] of map.entries()) {
    groups.push({
      dateKey,
      formattedDate: dateKey === 'TBA' ? 'Dates To Be Announced' : dateKey,
      events: groupEvents,
    });
  }

  return groups;
}

/* =========================================================================
   Unit-Style Verification Cases
   =========================================================================
   1. matchesSearch:
      - matchesSearch({ name: 'CodeCurrent' }, 'code') => true
      - matchesSearch({ tags: ['AI', 'Robotics'] }, 'robotics') => true
      - matchesSearch({ category: 'Photography' }, 'photo') => true
      - matchesSearch({ name: 'SpanCraft' }, 'xyz') => false

   2. isPastEvent:
      - { event_status: 'COMPLETED' } => true
      - { registration_status: 'CLOSED' } => true
      - { event_status: 'ACTIVE', registration_status: 'OPEN' } => false

   3. filterEvents:
      - Excludes past events when showPast=false
      - Includes past events when showPast=true
      - Filters by theme correctly mapping raw category to ThemeId
      - Filters by technicalOnly and price accurately

   4. sortEvents:
      - soonest: orders 2026-11-13 before 2026-11-15
      - price-asc: 0 before 500 before 1000
      - price-desc: 1000 before 500 before 0
   ========================================================================= */
