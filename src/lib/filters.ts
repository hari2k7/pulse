import type { EventSummary } from './types';
import { isUpcomingEvent } from './themes';
import { realmIdOf, isRealmId, type RealmId } from './realms';

export type EventSortOption = 'soonest' | 'price-asc' | 'price-desc';
export type DatePreset = 'all' | 'today' | 'this_week' | 'this_month';

export interface EventFilterState {
  search: string;
  realms: RealmId[];
  datePreset: DatePreset;
  savedOnly: boolean;
  modes: ('OFFLINE' | 'ONLINE')[];
  types: ('EVENT' | 'WORKSHOP')[];
  prices: ('free' | 'paid')[];
  statuses: ('OPEN' | 'CLOSED' | 'SOLD_OUT')[];
  technical: ('technical' | 'non-technical')[];
  showPast: boolean;
  sort: EventSortOption;
}

export const DEFAULT_FILTERS: Readonly<EventFilterState> = {
  search: '',
  realms: [],
  datePreset: 'all',
  savedOnly: false,
  modes: [],
  types: [],
  prices: [],
  statuses: [],
  technical: [],
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
 * Date helper for IST (+05:30) date comparisons
 */
export function getIstDateInfo(): { todayStr: string; weekStartStr: string; weekEndStr: string; monthStr: string } {
  const now = new Date();
  // IST is UTC + 5.5 hours
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);

  const y = istDate.getUTCFullYear();
  const m = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(istDate.getUTCDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  const monthStr = `${y}-${m}`;

  // Current day of week in IST (0 is Sunday)
  const dayOfWeek = istDate.getUTCDay();
  // Monday as week start
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayDate = new Date(istDate.getTime() + diffToMonday * 24 * 60 * 60 * 1000);
  const sundayDate = new Date(mondayDate.getTime() + 6 * 24 * 60 * 60 * 1000);

  const weekStartStr = `${mondayDate.getUTCFullYear()}-${String(mondayDate.getUTCMonth() + 1).padStart(2, '0')}-${String(mondayDate.getUTCDate()).padStart(2, '0')}`;
  const weekEndStr = `${sundayDate.getUTCFullYear()}-${String(sundayDate.getUTCMonth() + 1).padStart(2, '0')}-${String(sundayDate.getUTCDate()).padStart(2, '0')}`;

  return { todayStr, weekStartStr, weekEndStr, monthStr };
}

/**
 * Pure function: Filters events according to the multi-select filter state.
 * Within a group use OR logic, across groups use AND logic.
 */
export function filterEvents(
  events: EventSummary[],
  filters: EventFilterState,
  favoriteIds?: string[]
): EventSummary[] {
  const ist = getIstDateInfo();

  return events.filter((event) => {
    // 1. Past events check (default hidden unless showPast is true)
    if (!filters.showPast && isPastEvent(event)) {
      return false;
    }

    // 2. Search query
    if (filters.search && !matchesSearch(event, filters.search)) {
      return false;
    }

    // 3. Realm filter (OR logic within group)
    if (filters.realms.length > 0) {
      const eventRealm = realmIdOf(event);
      if (!filters.realms.includes(eventRealm)) {
        return false;
      }
    }

    // 4. Date presets (in IST)
    if (filters.datePreset && filters.datePreset !== 'all') {
      const startDate = event.schedule_summary?.start_date;
      if (!startDate) return false;

      if (filters.datePreset === 'today') {
        if (startDate !== ist.todayStr) return false;
      } else if (filters.datePreset === 'this_week') {
        if (startDate < ist.weekStartStr || startDate > ist.weekEndStr) return false;
      } else if (filters.datePreset === 'this_month') {
        if (!startDate.startsWith(ist.monthStr)) return false;
      }
    }

    // 5. Saved only (favorites)
    if (filters.savedOnly && favoriteIds) {
      if (!favoriteIds.includes(event.id)) {
        return false;
      }
    }

    // 6. Delivery Mode filter (OR logic within group)
    if (filters.modes.length > 0) {
      if (!event.event_mode || !filters.modes.includes(event.event_mode as 'OFFLINE' | 'ONLINE')) {
        return false;
      }
    }

    // 7. Type filter (OR logic within group)
    if (filters.types.length > 0) {
      if (!event.event_type || !filters.types.includes(event.event_type as 'EVENT' | 'WORKSHOP')) {
        return false;
      }
    }

    // 8. Price filter: Free/Paid together means all
    if (filters.prices.length === 1) {
      const p = filters.prices[0];
      if (p === 'free' && event.price !== 0) {
        return false;
      }
      if (p === 'paid' && (typeof event.price !== 'number' || event.price <= 0)) {
        return false;
      }
    }

    // 9. Registration status (OR logic within group)
    if (filters.statuses.length > 0) {
      if (
        !event.registration_status ||
        !filters.statuses.includes(event.registration_status as 'OPEN' | 'CLOSED' | 'SOLD_OUT')
      ) {
        return false;
      }
    }

    // 10. Technical track filter: Both together means all
    if (filters.technical.length === 1) {
      const t = filters.technical[0];
      if (t === 'technical' && !event.is_technical) {
        return false;
      }
      if (t === 'non-technical' && event.is_technical) {
        return false;
      }
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
  filters: EventFilterState,
  favoriteIds?: string[]
): EventSummary[] {
  const filtered = filterEvents(events, filters, favoriteIds);
  return sortEvents(filtered, filters.sort);
}

/**
 * Parses comma-separated string into validated array of items, ignoring unknown values.
 */
function parseCommaSeparated<T extends string>(
  val: string | null,
  validator: (item: string) => T | null
): T[] {
  if (!val) return [];
  const items = val.split(',').map((s) => s.trim().toLowerCase());
  const result = new Set<T>();

  for (const item of items) {
    if (!item) continue;
    const validated = validator(item);
    if (validated) {
      result.add(validated);
    }
  }

  return Array.from(result);
}

/**
 * Parses query parameters from URLSearchParams into multi-select EventFilterState.
 */
export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams
): EventFilterState {
  const sortParam = searchParams.get('sort');
  const validSort: EventSortOption =
    sortParam === 'price-asc' || sortParam === 'price-desc' ? sortParam : 'soonest';

  // 1. Realms (?realm=tech,challenge)
  const realmParam = searchParams.get('realm') || searchParams.get('realms');
  const realms = parseCommaSeparated(realmParam, (item) => {
    return isRealmId(item) ? item : null;
  });

  // 2. Date preset (?date=today|this_week|this_month|all)
  const dateParam = searchParams.get('date');
  const datePreset: DatePreset =
    dateParam === 'today' || dateParam === 'this_week' || dateParam === 'this_month'
      ? dateParam
      : 'all';

  // 3. Saved only (?saved=true)
  const savedOnly = searchParams.get('saved') === 'true';

  // 4. Modes ('online', 'offline')
  const modeParam = searchParams.get('mode') || searchParams.get('modes');
  const modes = parseCommaSeparated(modeParam, (item) => {
    if (item === 'offline') return 'OFFLINE';
    if (item === 'online') return 'ONLINE';
    return null;
  });

  // 5. Types ('event', 'workshop')
  const typeParam = searchParams.get('type') || searchParams.get('types');
  const types = parseCommaSeparated(typeParam, (item) => {
    if (item === 'event') return 'EVENT';
    if (item === 'workshop') return 'WORKSHOP';
    return null;
  });

  // 6. Prices ('free', 'paid')
  const priceParam = searchParams.get('price') || searchParams.get('prices');
  const prices = parseCommaSeparated(priceParam, (item) => {
    if (item === 'free') return 'free';
    if (item === 'paid') return 'paid';
    return null;
  });

  // 7. Statuses ('open', 'closed', 'sold_out')
  const statusParam = searchParams.get('status') || searchParams.get('statuses') || searchParams.get('registration');
  const statuses = parseCommaSeparated(statusParam, (item) => {
    if (item === 'open') return 'OPEN';
    if (item === 'closed') return 'CLOSED';
    if (item === 'sold_out' || item === 'soldout') return 'SOLD_OUT';
    return null;
  });

  // 8. Technical track ('technical', 'non-technical', 'tech', 'non-tech', 'true', 'false')
  const techParam = searchParams.get('tech') || searchParams.get('technical');
  const technical = parseCommaSeparated(techParam, (item) => {
    if (item === 'technical' || item === 'tech' || item === 'true') return 'technical';
    if (item === 'non-technical' || item === 'non-tech' || item === 'false') return 'non-technical';
    return null;
  });

  return {
    search: searchParams.get('q') || searchParams.get('search') || '',
    realms,
    datePreset,
    savedOnly,
    modes,
    types,
    prices,
    statuses,
    technical,
    showPast: searchParams.get('past') === 'true',
    sort: validSort,
  };
}

/**
 * Converts EventFilterState into clean URLSearchParams (comma-separated, omitting defaults).
 */
export function filtersToSearchParams(filters: EventFilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set('q', filters.search.trim());
  }

  if (filters.realms.length > 0) {
    params.set('realm', filters.realms.join(','));
  }

  if (filters.datePreset && filters.datePreset !== 'all') {
    params.set('date', filters.datePreset);
  }

  if (filters.savedOnly) {
    params.set('saved', 'true');
  }

  if (filters.modes.length > 0) {
    params.set('mode', filters.modes.map((m) => m.toLowerCase()).join(','));
  }

  if (filters.types.length > 0) {
    params.set('type', filters.types.map((t) => t.toLowerCase()).join(','));
  }

  if (filters.prices.length > 0) {
    params.set('price', filters.prices.join(','));
  }

  if (filters.statuses.length > 0) {
    params.set('status', filters.statuses.map((s) => s.toLowerCase()).join(','));
  }

  if (filters.technical.length > 0) {
    params.set('tech', filters.technical.join(','));
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
    filters.realms.length > 0 ||
    filters.datePreset !== 'all' ||
    filters.savedOnly ||
    filters.modes.length > 0 ||
    filters.types.length > 0 ||
    filters.prices.length > 0 ||
    filters.statuses.length > 0 ||
    filters.technical.length > 0 ||
    filters.showPast
  );
}

/**
 * Toggles an item in an array (adding if absent, removing if present).
 */
export function toggleArrayItem<T>(array: readonly T[], item: T): T[] {
  if (array.includes(item)) {
    return array.filter((i) => i !== item);
  }
  return [...array, item];
}
