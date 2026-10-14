import { useState, useMemo, useRef, type FC, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/events/EventCard';
import { EventFilters } from '../components/events/EventFilters';
import { EventTimeline } from '../components/events/EventTimeline';
import { FilterDrawer } from '../components/events/FilterDrawer';
import { EventsGridSkeleton } from '../components/events/EventsGridSkeleton';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { Button } from '../components/ui/Button';
import {
  filterAndSortEvents,
  type EventFilterState,
  type EventSortOption,
} from '../lib/filters';
import { getThemeForCategory } from '../lib/themes';

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
  const filters = useMemo<EventFilterState>(() => {
    return {
      search: searchParams.get('q') || '',
      theme: searchParams.get('theme') || 'all',
      mode: (searchParams.get('mode') as EventFilterState['mode']) || 'all',
      type: (searchParams.get('type') as EventFilterState['type']) || 'all',
      price: (searchParams.get('price') as EventFilterState['price']) || 'all',
      status: (searchParams.get('status') as EventFilterState['status']) || 'all',
      technicalOnly: searchParams.get('tech') === 'true',
      showPast: searchParams.get('past') === 'true',
      sort: (searchParams.get('sort') as EventSortOption) || 'soonest',
    };
  }, [searchParams]);

  // Local state for immediate debounced search input feedback
  const [searchInput, setSearchInput] = useState<string>(filters.search);

  // Mobile filter drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Update URL search parameters when filters change
  const updateFilters = (updated: Partial<EventFilterState>) => {
    const next = { ...filters, ...updated };
    const params = new URLSearchParams();

    if (view === 'timeline') params.set('view', 'timeline');
    if (next.search) params.set('q', next.search);
    if (next.theme !== 'all') params.set('theme', next.theme);
    if (next.mode !== 'all') params.set('mode', next.mode);
    if (next.type !== 'all') params.set('type', next.type);
    if (next.price !== 'all') params.set('price', next.price);
    if (next.status !== 'all') params.set('status', next.status);
    if (next.technicalOnly) params.set('tech', 'true');
    if (next.showPast) params.set('past', 'true');
    if (next.sort !== 'soonest') params.set('sort', next.sort);

    setSearchParams(params, { replace: true });
  };

  const setView = (newView: 'grid' | 'timeline') => {
    const params = new URLSearchParams(searchParams);
    if (newView === 'timeline') {
      params.set('view', 'timeline');
    } else {
      params.delete('view');
    }
    setSearchParams(params, { replace: true });
  };

  // Debounced search sync (250ms)
  const searchTimeoutRef = useRef<number | null>(null);
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      updateFilters({ search: val });
    }, 250);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    const params = new URLSearchParams();
    if (view === 'timeline') params.set('view', 'timeline');
    setSearchParams(params, { replace: true });
  };

  // Filtered and sorted event collection
  const filteredEvents = useMemo(() => {
    return filterAndSortEvents(events, filters);
  }, [events, filters]);

  // Counts for each theme based on upcoming active events
  const themeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of events) {
      if (!filters.showPast && (e.event_status === 'COMPLETED' || e.event_status === 'CLOSED')) continue;
      const theme = getThemeForCategory(e.category);
      map[theme] = (map[theme] || 0) + 1;
    }
    return map;
  }, [events, filters.showPast]);

  // Active filter detection for UI chips
  const activeFiltersPresent = Boolean(
    filters.search ||
      filters.theme !== 'all' ||
      filters.mode !== 'all' ||
      filters.type !== 'all' ||
      filters.price !== 'all' ||
      filters.status !== 'all' ||
      filters.technicalOnly ||
      filters.showPast
  );

  const activeFiltersCount = [
    Boolean(filters.search),
    filters.theme !== 'all',
    filters.mode !== 'all',
    filters.type !== 'all',
    filters.price !== 'all',
    filters.status !== 'all',
    filters.technicalOnly,
    filters.showPast,
  ].filter(Boolean).length;

  const formattedFetchedAt = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  // Loading skeleton state
  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-12 md:pb-16 space-y-8">
        <div className="h-10 w-72 bg-[#1A1030]/60 rounded-md animate-pulse" />
        <div className="h-12 w-full bg-[#1A1030]/40 rounded-md animate-pulse" />
        <EventsGridSkeleton count={9} />
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-16 min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Multiverse Portal Disrupted"
          message={error?.message || 'Unable to load event listings across these dimensional coordinates.'}
          errorKind={error?.kind}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-12 md:pb-16 space-y-8 bg-[#07060D] text-[#F3EFE8]">
      {/* -------------------------------------------------------------
          Header & Multiverse Search Bar
          ------------------------------------------------------------- */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#FF7A1A]/20 pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8]">
              EVENTS
            </h1>
            <p className="text-sm text-[#B8B3C7] max-w-2xl leading-relaxed">
              Explore 30+ competitions, hackathons, and masterclasses across alternate reality tracks.
            </p>
          </div>

          {/* Grid vs Timeline View Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-[#0D1020] border border-white/10 self-start md:self-auto shrink-0" role="group" aria-label="View format">
            <button
              type="button"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                view === 'grid'
                  ? 'bg-[#FF7A1A] text-[#07060D] shadow-md'
                  : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                view === 'timeline'
                  ? 'bg-[#FF7A1A] text-[#07060D] shadow-md'
                  : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
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
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8B3C7]">
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
              onChange={handleSearchChange}
              placeholder="Search by event name, blurb, category, or tags..."
              aria-label="Search events"
              className="w-full bg-[#0D1020] border border-[#FF7A1A]/30 rounded-md pl-10 pr-9 py-2.5 text-sm text-[#F3EFE8] placeholder-[#B8B3C7]/60 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A] focus:border-transparent transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ search: '' });
                }}
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#B8B3C7] hover:text-[#F3EFE8]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Selector Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="events-sort-select" className="text-xs text-[#B8B3C7] font-medium hidden sm:inline">
              Sort:
            </label>
            <select
              id="events-sort-select"
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value as EventSortOption })}
              aria-label="Sort events by"
              className="bg-[#0D1020] border border-[#FF7A1A]/30 rounded-md px-3 py-2 text-xs text-[#F3EFE8] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A1A] cursor-pointer"
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
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-[#0D1020] hover:bg-[#1A1030] border border-[#FF7A1A]/40 text-[#F3EFE8] rounded-md text-xs font-semibold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
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
                <span className="w-4 h-4 rounded-full bg-[#FF7A1A] text-[10px] text-[#07060D] font-bold flex items-center justify-center font-mono">
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
            className="text-xs sm:text-sm font-mono text-[#B8B3C7] font-semibold"
          >
            Discovered <span className="text-[#F3EFE8] font-bold">{filteredEvents.length}</span>{' '}
            {filteredEvents.length === 1 ? 'reality' : 'realms'}
          </div>

          {/* Active Filter Removable Tags */}
          {activeFiltersPresent && (
            <div className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0D1020] border border-[#FF7A1A]/30 text-xs text-[#F3EFE8]">
                  <span>Search: "{filters.search}"</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateFilters({ search: '' });
                    }}
                    aria-label="Remove search filter"
                    className="text-[#B8B3C7] hover:text-[#F3EFE8]"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.theme !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0D1020] border border-[#FF7A1A]/30 text-xs text-[#F3EFE8]">
                  <span>Theme: {filters.theme}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ theme: 'all' })}
                    aria-label="Remove theme filter"
                    className="text-[#B8B3C7] hover:text-[#F3EFE8]"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.mode !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0D1020] border border-[#FF7A1A]/30 text-xs text-[#F3EFE8]">
                  <span>Mode: {filters.mode}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ mode: 'all' })}
                    aria-label="Remove mode filter"
                    className="text-[#B8B3C7] hover:text-[#F3EFE8]"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.type !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0D1020] border border-[#FF7A1A]/30 text-xs text-[#F3EFE8]">
                  <span>Format: {filters.type}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ type: 'all' })}
                    aria-label="Remove format filter"
                    className="text-[#B8B3C7] hover:text-[#F3EFE8]"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.price !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0D1020] border border-[#FF7A1A]/30 text-xs text-[#F3EFE8]">
                  <span>Admission: {filters.price}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ price: 'all' })}
                    aria-label="Remove price filter"
                    className="text-[#B8B3C7] hover:text-[#F3EFE8]"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0D1020] border border-[#FF7A1A]/30 text-xs text-[#F3EFE8]">
                  <span>Status: {filters.status}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ status: 'all' })}
                    aria-label="Remove status filter"
                    className="text-[#B8B3C7] hover:text-[#F3EFE8]"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.technicalOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0D1020] border border-[#3BA3FF]/40 text-xs text-[#3BA3FF]">
                  <span>Technical only</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ technicalOnly: false })}
                    aria-label="Remove technical filter"
                    className="text-[#B8B3C7] hover:text-[#F3EFE8]"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.showPast && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0D1020] border border-white/20 text-xs text-[#B8B3C7]">
                  <span>Including closed</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ showPast: false })}
                    aria-label="Remove past events filter"
                    className="text-[#B8B3C7] hover:text-[#F3EFE8]"
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#FF7A1A] hover:text-[#F5B642] font-semibold underline underline-offset-2 ml-1"
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
          className="bg-[#1A1030] border border-amber-500/40 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
          role="status"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm text-[#F3EFE8]">
              <strong className="text-amber-400">Showing astral cached data</strong>
              {formattedFetchedAt ? ` (${formattedFetchedAt})` : ''}: Live temporal connection interrupted.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={retry}>
            Retry Portal
          </Button>
        </div>
      )}

      {/* -------------------------------------------------------------
          Main Content: Desktop Filter Sidebar + Mixed-Size Event Display
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar (Sticky) */}
        <aside className="hidden lg:block lg:col-span-1 bg-[#0D1020] border border-[#FF7A1A]/20 rounded-xl p-5 sticky top-24 shadow-xl">
          <EventFilters
            filters={filters}
            onChange={updateFilters}
            onReset={handleResetFilters}
            hasActive={activeFiltersPresent}
            themeCounts={themeCounts}
          />
        </aside>

        {/* Events Display Container (Mixed-Size Grid or Timeline) */}
        <main className="lg:col-span-3 space-y-6">
          {/* Empty State */}
          {filteredEvents.length === 0 ? (
            <div className="py-16 bg-[#0D1020]/40 border border-white/5 rounded-xl flex items-center justify-center">
              <EmptyState
                title="No Dimensional Events Discovered"
                description="We couldn't detect any events matching your selected coordinates. Try recalibrating your filters or searching another keyword."
                action={
                  activeFiltersPresent ? (
                    <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                      Reset all coordinates
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : view === 'timeline' ? (
            /* Timeline View */
            <EventTimeline events={filteredEvents} />
          ) : (
            /* Mixed-Size Grid View: 1 col on mobile (375px), 2 on tablet (768px), 3 on desktop (1280px) */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {filteredEvents.map((event, index) => {
                // Asymmetric mixed-size accent: first featured item spans 2 cols on larger screens
                const isFlagshipSpan = index === 0 && Boolean(event.is_featured);
                return (
                  <div
                    key={event.id}
                    className={isFlagshipSpan ? 'sm:col-span-2 xl:col-span-2' : ''}
                  >
                    <EventCard
                      event={event}
                      priority={index < 4}
                      isFlagshipSpan={isFlagshipSpan}
                    />
                  </div>
                );
              })}
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
