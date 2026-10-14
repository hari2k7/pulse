import type { EventSummary } from './types';
import { getThemeForCategory, isUpcomingEvent, THEMES, type ThemeId } from './themes';

export type EventSortOption = 'soonest' | 'price-asc' | 'price-desc';

export interface EventFilterState {
  search: string;
  themes: ThemeId[];
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
  themes: [],
  modes: [],
  types: [],
  prices: [],
  statuses: [],
  technical: [],
  showPast: false,
  sort: 'soonest',
};

// Theme slug mapping for clean URL parameters (?theme=tech,design)
const THEME_SLUG_MAP: Record<string, ThemeId> = {
  tech: 'Tech & Code',
  'tech-code': 'Tech & Code',
  robotics: 'Robotics & Engineering',
  'robotics-engineering': 'Robotics & Engineering',
  design: 'Design & Visual Arts',
  'design-visual-arts': 'Design & Visual Arts',
  performing: 'Performing & Music',
  'performing-music': 'Performing & Music',
  words: 'Words & Culture',
  'words-culture': 'Words & Culture',
  science: 'Science & Startups',
  'science-startups': 'Science & Startups',
  more: 'More',
};

const THEME_TO_SLUG: Record<ThemeId, string> = {
  'Tech & Code': 'tech',
  'Robotics & Engineering': 'robotics',
  'Design & Visual Arts': 'design',
  'Performing & Music': 'performing',
  'Words & Culture': 'words',
  'Science & Startups': 'science',
  More: 'more',
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
 * Pure function: Filters events according to the multi-select filter state.
 * Within a group use OR logic, across groups use AND logic.
 * Free/Paid together means all.
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

    // 3. Theme filter (OR logic within group)
    if (filters.themes.length > 0) {
      const eventTheme = getThemeForCategory(event.category);
      if (!filters.themes.includes(eventTheme)) {
        return false;
      }
    }

    // 4. Delivery Mode filter (OR logic within group)
    if (filters.modes.length > 0) {
      if (!event.event_mode || !filters.modes.includes(event.event_mode as 'OFFLINE' | 'ONLINE')) {
        return false;
      }
    }

    // 5. Type filter (OR logic within group)
    if (filters.types.length > 0) {
      if (!event.event_type || !filters.types.includes(event.event_type as 'EVENT' | 'WORKSHOP')) {
        return false;
      }
    }

    // 6. Price filter: Free/Paid together means all
    if (filters.prices.length === 1) {
      const p = filters.prices[0];
      if (p === 'free' && event.price !== 0) {
        return false;
      }
      if (p === 'paid' && (typeof event.price !== 'number' || event.price <= 0)) {
        return false;
      }
    }

    // 7. Registration status (OR logic within group)
    if (filters.statuses.length > 0) {
      if (
        !event.registration_status ||
        !filters.statuses.includes(event.registration_status as 'OPEN' | 'CLOSED' | 'SOLD_OUT')
      ) {
        return false;
      }
    }

    // 8. Technical track filter: Both together means all
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
  filters: EventFilterState
): EventSummary[] {
  const filtered = filterEvents(events, filters);
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

  // 1. Themes (accepts slug e.g. 'tech,design' or full name e.g. 'Tech & Code')
  const themeParam = searchParams.get('theme') || searchParams.get('themes');
  const themes = parseCommaSeparated(themeParam, (item) => {
    if (THEME_SLUG_MAP[item]) return THEME_SLUG_MAP[item];
    const match = THEMES.find((t) => t.toLowerCase() === item);
    return match || null;
  });

  // 2. Modes ('online', 'offline')
  const modeParam = searchParams.get('mode') || searchParams.get('modes');
  const modes = parseCommaSeparated(modeParam, (item) => {
    if (item === 'offline') return 'OFFLINE';
    if (item === 'online') return 'ONLINE';
    return null;
  });

  // 3. Types ('event', 'workshop')
  const typeParam = searchParams.get('type') || searchParams.get('types');
  const types = parseCommaSeparated(typeParam, (item) => {
    if (item === 'event') return 'EVENT';
    if (item === 'workshop') return 'WORKSHOP';
    return null;
  });

  // 4. Prices ('free', 'paid')
  const priceParam = searchParams.get('price') || searchParams.get('prices');
  const prices = parseCommaSeparated(priceParam, (item) => {
    if (item === 'free') return 'free';
    if (item === 'paid') return 'paid';
    return null;
  });

  // 5. Statuses ('open', 'closed', 'sold_out')
  const statusParam = searchParams.get('status') || searchParams.get('statuses') || searchParams.get('registration_status');
  const statuses = parseCommaSeparated(statusParam, (item) => {
    if (item === 'open') return 'OPEN';
    if (item === 'closed') return 'CLOSED';
    if (item === 'sold_out' || item === 'soldout') return 'SOLD_OUT';
    return null;
  });

  // 6. Technical track ('technical', 'non-technical', 'tech', 'non-tech', 'true', 'false')
  const techParam = searchParams.get('tech') || searchParams.get('technical');
  const technical = parseCommaSeparated(techParam, (item) => {
    if (item === 'technical' || item === 'tech' || item === 'true') return 'technical';
    if (item === 'non-technical' || item === 'non-tech' || item === 'false') return 'non-technical';
    return null;
  });

  return {
    search: searchParams.get('q') || searchParams.get('search') || '',
    themes,
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

  if (filters.themes.length > 0) {
    const slugs = filters.themes.map((t) => THEME_TO_SLUG[t] || t.toLowerCase());
    params.set('theme', slugs.join(','));
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
    filters.themes.length > 0 ||
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
