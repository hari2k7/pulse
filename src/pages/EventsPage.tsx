import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  type FC,
  type ChangeEvent,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/events/EventCard';
import { EventsGridSkeleton } from '../components/events/EventsGridSkeleton';
import { EventFilters } from '../components/events/EventFilters';
import { FilterDrawer } from '../components/events/FilterDrawer';
import { EventTimeline } from '../components/events/EventTimeline';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { Button } from '../components/ui/Button';
import { getThemeForCategory } from '../lib/themes';
import {
  filterAndSortEvents,
  filtersToSearchParams,
  hasActiveFilters,
  isPastEvent,
  parseFiltersFromSearchParams,
  type EventFilterState,
  type EventSortOption,
} from '../lib/filters';

export const EventsPage: FC = () => {
  useDocumentMeta({
    title: 'Events — STRANGE',
    description: 'Multiverse Events Index. Search, filter, and traverse hackathons, technical challenges, and workshops at STRANGE.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { status, events, stale, fetchedAt, error, retry } = useEvents();

  // Active view: grid | timeline (synced to query param)
  const view = (searchParams.get('view') === 'timeline' ? 'timeline' : 'grid') as 'grid' | 'timeline';

  // Parse filters from URL search params
  const filters = useMemo(() => {
    return parseFiltersFromSearchParams(searchParams);
  }, [searchParams]);

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Search input local state for instant responsiveness + 250ms debounce
  const [searchInput, setSearchInput] = useState(filters.search);

  // React pattern: adjust state during render when props/external state change
  const [prevFilterSearch, setPrevFilterSearch] = useState(filters.search);
  if (prevFilterSearch !== filters.search) {
    setPrevFilterSearch(filters.search);
    setSearchInput(filters.search);
  }

  // Helper to update filters in URLSearchParams
  const updateFilters = useCallback(
    (partial: Partial<EventFilterState>) => {
      const updated: EventFilterState = { ...filters, ...partial };
      const newParams = filtersToSearchParams(updated);
      if (view === 'timeline') {
        newParams.set('view', 'timeline');
      }
      setSearchParams(newParams, { replace: true });
    },
    [filters, view, setSearchParams]
  );

  // Debounce search input by 250ms to update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilters({ search: searchInput });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, updateFilters]);

  const handleResetFilters = () => {
    setSearchInput('');
    const newParams = new URLSearchParams();
    if (view === 'timeline') {
      newParams.set('view', 'timeline');
    }
    setSearchParams(newParams, { replace: true });
  };

  const setView = (newView: 'grid' | 'timeline') => {
    const newParams = filtersToSearchParams(filters);
    if (newView === 'timeline') {
      newParams.set('view', 'timeline');
    }
    setSearchParams(newParams, { replace: true });
  };

  // Compute theme counts for filter chips
  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const event of events) {
      if (!filters.showPast && isPastEvent(event)) continue;
      const theme = getThemeForCategory(event.category);
      counts[theme] = (counts[theme] || 0) + 1;
    }
    return counts;
  }, [events, filters.showPast]);

  // Filter and sort events pipeline
  const filteredEvents = useMemo(() => {
    return filterAndSortEvents(events, filters);
  }, [events, filters]);

  const activeFiltersPresent = hasActiveFilters(filters);

  // Count active filter tags for the mobile button badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.theme !== 'all') count++;
    if (filters.mode !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.price !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.technicalOnly) count++;
    if (filters.showPast) count++;
    return count;
  }, [filters]);

  const formattedFetchedAt = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  // 1. Loading State
  if (status === 'loading') {
    return <EventsGridSkeleton count={8} />;
  }

  // 2. Error State
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 min-h-[70vh]">
      {/* -------------------------------------------------------------
          Page Header & Search Bar
          ------------------------------------------------------------- */}
      <div className="space-y-6 border-b border-white/10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-normal tracking-wide text-white">
              DISCOVER EVENTS
            </h1>
            <p className="text-sm md:text-base text-[#b3b3b3] mt-1">
              Search and filter competitions, workshops, and exhibitions across campus.
            </p>
          </div>

          {/* View Toggle (Grid | Timeline) */}
          <div
            className="flex items-center bg-zinc-900 border border-zinc-800 rounded-[6px] p-1 self-start md:self-auto"
            role="group"
            aria-label="View layout switcher"
          >
            <button
              type="button"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-colors ${
                view === 'grid'
                  ? 'bg-[#e50914] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span>Grid</span>
            </button>
            <button
              type="button"
              aria-pressed={view === 'timeline'}
              onClick={() => setView('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-colors ${
                view === 'timeline'
                  ? 'bg-[#e50914] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Timeline</span>
            </button>
          </div>
        </div>

        {/* Search Bar + Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input (250ms debounced) */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="search"
              value={searchInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              placeholder="Search by event name, blurb, category, or tags..."
              aria-label="Search events"
              className="w-full bg-[#181818] border border-white/10 rounded-[6px] pl-10 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:border-transparent transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ search: '' });
                }}
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Selector Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="events-sort-select" className="text-xs text-zinc-400 font-medium hidden sm:inline">
              Sort:
            </label>
            <select
              id="events-sort-select"
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value as EventSortOption })}
              aria-label="Sort events by"
              className="bg-[#181818] border border-white/10 rounded-[6px] px-3 py-2 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#e50914] cursor-pointer"
            >
              <option value="soonest">Soonest Date First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {/* Mobile Filter Trigger Button */}
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-expanded={mobileDrawerOpen}
              aria-label="Open filter drawer"
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-[6px] text-xs font-semibold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#e50914] text-[10px] text-white font-bold flex items-center justify-center font-mono">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Chips & Live Result Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Visible Result Count with aria-live="polite" */}
          <div
            aria-live="polite"
            className="text-xs sm:text-sm font-mono text-zinc-300 font-semibold"
          >
            Showing <span className="text-white font-bold">{filteredEvents.length}</span>{' '}
            {filteredEvents.length === 1 ? 'event' : 'events'}
          </div>

          {/* Active Filter Removable Tags */}
          {activeFiltersPresent && (
            <div className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-zinc-900 border border-white/10 text-xs text-white">
                  <span>Search: "{filters.search}"</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateFilters({ search: '' });
                    }}
                    aria-label="Remove search filter"
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.theme !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-zinc-900 border border-white/10 text-xs text-white">
                  <span>Theme: {filters.theme}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ theme: 'all' })}
                    aria-label="Remove theme filter"
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.mode !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-zinc-900 border border-white/10 text-xs text-white">
                  <span>Mode: {filters.mode}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ mode: 'all' })}
                    aria-label="Remove mode filter"
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.type !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-zinc-900 border border-white/10 text-xs text-white">
                  <span>Format: {filters.type}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ type: 'all' })}
                    aria-label="Remove format filter"
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.price !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-zinc-900 border border-white/10 text-xs text-white">
                  <span>Admission: {filters.price}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ price: 'all' })}
                    aria-label="Remove price filter"
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-zinc-900 border border-white/10 text-xs text-white">
                  <span>Status: {filters.status}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ status: 'all' })}
                    aria-label="Remove status filter"
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.technicalOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-zinc-900 border border-white/10 text-xs text-white">
                  <span>Technical only</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ technicalOnly: false })}
                    aria-label="Remove technical filter"
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.showPast && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-zinc-900 border border-white/10 text-xs text-white">
                  <span>Including past events</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ showPast: false })}
                    aria-label="Remove past events filter"
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#e50914] hover:text-[#f40612] font-semibold underline underline-offset-2 ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stale Cache Notice */}
      {stale && (
        <div
          className="bg-[#1c1c1c] border border-amber-500/40 rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
          role="status"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <p className="text-xs sm:text-sm text-white">
              <strong className="text-amber-400">Showing saved data</strong>
              {formattedFetchedAt ? ` (cached ${formattedFetchedAt})` : ''}: The live network call could not be completed.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {/* -------------------------------------------------------------
          Main Content: Desktop Filter Sidebar + Event Display Area
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar (Hidden on mobile/tablet) */}
        <aside className="hidden lg:block lg:col-span-1 bg-[#181818]/80 border border-white/10 rounded-[6px] p-5 sticky top-24">
          <EventFilters
            filters={filters}
            onChange={updateFilters}
            onReset={handleResetFilters}
            hasActive={activeFiltersPresent}
            themeCounts={themeCounts}
          />
        </aside>

        {/* Events Display Container (Grid or Timeline) */}
        <main className="lg:col-span-3 space-y-6">
          {/* Empty State */}
          {filteredEvents.length === 0 ? (
            <div className="py-12 bg-[#181818]/40 border border-white/5 rounded-[6px] flex items-center justify-center">
              <EmptyState
                title="No Events Found"
                description="We couldn't find any events matching your selected filter criteria. Try clearing some filters or searching for another term."
                action={
                  activeFiltersPresent ? (
                    <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                      Reset all filters
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : view === 'timeline' ? (
            /* Timeline View */
            <EventTimeline events={filteredEvents} />
          ) : (
            /* Grid View: 1 col on mobile (375px), 2 on tablet (768px), 3 on desktop (1280px) */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} priority={index < 4} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* -------------------------------------------------------------
          Mobile Filter Drawer (Focus Trap & Scroll Lock)
          ------------------------------------------------------------- */}
      <FilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        triggerRef={filterButtonRef}
      >
        <EventFilters
          filters={filters}
          onChange={updateFilters}
          onReset={handleResetFilters}
          hasActive={activeFiltersPresent}
          themeCounts={themeCounts}
        />
      </FilterDrawer>
    </div>
  );
};
