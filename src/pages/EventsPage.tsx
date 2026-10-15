import { useState, useMemo, useRef, type FC, type ChangeEvent, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useEvents } from '../hooks/useEvents';
import { useFavorites } from '../lib/favorites';
import { EventCard } from '../components/events/EventCard';
import { EventFilters } from '../components/events/EventFilters';
import { EventTimeline } from '../components/events/EventTimeline';
import { FilterDrawer } from '../components/events/FilterDrawer';
import { EventsGridSkeleton } from '../components/events/EventsGridSkeleton';
import { PortalSelectorRow } from '../components/events/PortalSelectorRow';
import { ArrivalRingTrace } from '../components/events/ArrivalRingTrace';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { Button } from '../components/ui/Button';
import {
  filterAndSortEvents,
  parseFiltersFromSearchParams,
  filtersToSearchParams,
  hasActiveFilters,
  toggleArrayItem,
  type EventFilterState,
  type EventSortOption,
} from '../lib/filters';
import { getRealms, getRealmMetadata, type RealmId } from '../lib/realms';

export const EventsPage: FC = () => {
  useDocumentMeta({
    title: 'The Multiverse Index — STRANGE',
    description: 'Explore dimensional competitions, hackathons, and workshops across the STRANGE multiverse.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { status, events, stale, fetchedAt, error, retry } = useEvents();
  const { favorites } = useFavorites();

  // Active view: grid | timeline (synced to query param)
  const view = (searchParams.get('view') === 'timeline' ? 'timeline' : 'grid') as 'grid' | 'timeline';

  // Parse filters from URL search params (URL-synced)
  const filters = useMemo<EventFilterState>(() => {
    return parseFiltersFromSearchParams(searchParams);
  }, [searchParams]);

  // Derived real realms from live data
  const realms = useMemo(() => getRealms(events), [events]);

  // Dynamic Page Accent (--realm): tints borders/glows when exactly one realm is selected
  const singleRealm = useMemo(() => {
    if (filters.realms.length !== 1) return null;
    return realms.find((r) => r.id === filters.realms[0]) || getRealmMetadata(filters.realms[0]);
  }, [filters.realms, realms]);

  const realmAccent = singleRealm ? singleRealm.accentColor : '#FF7A1A';
  const singleRealmDescriptor = singleRealm
    ? 'descriptor' in singleRealm
      ? singleRealm.descriptor
      : singleRealm.defaultDescriptor
    : null;

  // Local state for immediate debounced search input feedback
  const [searchInput, setSearchInput] = useState<string>(filters.search);

  // Pagination: render first 12 cards, reset on filter change
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const [prevFilterKey, setPrevFilterKey] = useState<string>(filterKey);
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [announceText, setAnnounceText] = useState<string>('');

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(12);
  }

  // Mobile filter drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update URL search parameters when filters change
  const updateFilters = (updated: Partial<EventFilterState>) => {
    const next: EventFilterState = { ...filters, ...updated };
    const params = filtersToSearchParams(next);
    if (view === 'timeline') params.set('view', 'timeline');
    setSearchParams(params, { replace: true });
  };

  const handleToggleRealm = (realmId: RealmId) => {
    const updatedRealms = toggleArrayItem(filters.realms, realmId);
    updateFilters({ realms: updatedRealms });
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
    return filterAndSortEvents(events, filters, favorites);
  }, [events, filters, favorites]);

  // Visible batched events (12 initial, reveals 12 more on button click)
  const visibleEvents = useMemo(() => {
    return filteredEvents.slice(0, visibleCount);
  }, [filteredEvents, visibleCount]);

  const handleShowMore = () => {
    const nextCount = visibleCount + 12;
    setVisibleCount(nextCount);
    const shown = Math.min(nextCount, filteredEvents.length);
    setAnnounceText(`Showing ${shown} of ${filteredEvents.length} events`);
  };

  // Loading skeleton state
  if (status === 'loading') {
    return <EventsGridSkeleton count={12} />;
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Multiverse Index Unreachable"
          message={error?.message || 'Unable to load dimensional event coordinates.'}
          errorKind={error?.kind}
          onRetry={retry}
        />
      </div>
    );
  }

  const hasFilters = hasActiveFilters(filters);
  const remainingCount = filteredEvents.length - visibleCount;

  return (
    <div
      className="w-full min-h-screen bg-[#07060D] text-[#F3EFE8] pt-[calc(var(--navbar-height)+20px)] md:pt-[calc(var(--navbar-height)+32px)] pb-24"
      style={{ '--realm': realmAccent } as CSSProperties}
    >
      {/* 0. Arrival Ring Trace (In-app navigation only, <=600ms, skippable) */}
      <ArrivalRingTrace />

      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite">
        {announceText}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Page Header (Single H1 per page) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A] animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#FF7A1A]">
                {events.length} Available Coordinates
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-[#F3EFE8] tracking-wider leading-none">
              THE MULTIVERSE INDEX
            </h1>
            <p className="text-sm sm:text-base text-[#B8B3C7] mt-2 font-medium tracking-wide">
              Every reality has something waiting for you.
            </p>
          </div>

          {/* View Mode Toggle: Grid vs Timeline */}
          <div
            className="flex items-center gap-1 p-1 rounded-lg bg-[#0D1020] border border-white/10 self-start md:self-auto shrink-0"
            role="group"
            aria-label="View layout switch"
          >
            <button
              type="button"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] ${
                view === 'grid'
                  ? 'bg-[#FF7A1A] text-[#07060D]'
                  : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Grid</span>
            </button>
            <button
              type="button"
              aria-pressed={view === 'timeline'}
              onClick={() => setView('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] ${
                view === 'timeline'
                  ? 'bg-[#FF7A1A] text-[#07060D]'
                  : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Timeline</span>
            </button>
          </div>
        </div>

        {/* 2. Interactive Realm Portal Selector Row (Multi-select filter controls) */}
        <section aria-label="Realm Selector">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#F5B642]">
              Choose Dimensional Realms
            </span>
            {filters.realms.length > 0 && (
              <button
                type="button"
                onClick={() => updateFilters({ realms: [] })}
                className="text-xs text-[#FF7A1A] hover:text-[#F5B642] underline underline-offset-4 font-mono font-semibold"
              >
                Clear realms ({filters.realms.length})
              </button>
            )}
          </div>
          <PortalSelectorRow
            realms={realms}
            selectedRealms={filters.realms}
            onToggleRealm={handleToggleRealm}
          />
        </section>

        {/* 3. Search Bar, Sort Dropdown & Mobile Filter Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <label htmlFor="multiverse-search" className="sr-only">
              Search by title, description, category, or tags
            </label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8B3C7]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="multiverse-search"
              ref={searchInputRef}
              type="search"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search across all realities, technologies, or tags..."
              className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-[#0D1020] border border-white/15 text-sm text-[#F3EFE8] placeholder-[#B8B3C7]/60 focus:outline-none focus:border-[#FF7A1A] focus:ring-1 focus:ring-[#FF7A1A] transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ search: '' });
                  searchInputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#B8B3C7] hover:text-white"
                aria-label="Clear search input"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[170px]">
              <label htmlFor="multiverse-sort" className="sr-only">
                Sort events
              </label>
              <select
                id="multiverse-sort"
                value={filters.sort}
                onChange={(e) => updateFilters({ sort: e.target.value as EventSortOption })}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-lg bg-[#0D1020] border border-white/15 text-xs font-semibold text-[#F3EFE8] focus:outline-none focus:border-[#FF7A1A] focus:ring-1 focus:ring-[#FF7A1A] transition-colors cursor-pointer"
              >
                <option value="soonest">Sort: Soonest First</option>
                <option value="price-asc">Sort: Price Low → High</option>
                <option value="price-desc">Sort: Price High → Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#B8B3C7]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Mobile Filter Drawer Trigger */}
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0D1020] border border-[#FF7A1A]/40 text-xs font-bold uppercase tracking-wider text-[#F3EFE8] hover:border-[#FF7A1A] transition-colors"
            >
              <svg className="w-4 h-4 text-[#FF7A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
              {hasFilters && (
                <span className="w-2 h-2 rounded-full bg-[#FF7A1A]" />
              )}
            </button>
          </div>
        </div>

        {/* 4. Active Filters Chips & Matching Count Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#F3EFE8]">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event matches' : 'events match'}
            </span>

            {/* Removable Realm Chips */}
            {filters.realms.map((rId) => {
              const meta = getRealmMetadata(rId);
              return (
                <button
                  key={rId}
                  type="button"
                  onClick={() => handleToggleRealm(rId)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/20 bg-[#0D1020] text-[#F3EFE8] hover:border-[#FF7A1A] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                  <span>{meta.name}</span>
                  <span aria-hidden="true">&times;</span>
                </button>
              );
            })}

            {/* Removable Date Preset Chip */}
            {filters.datePreset !== 'all' && (
              <button
                type="button"
                onClick={() => updateFilters({ datePreset: 'all' })}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/20 bg-[#0D1020] text-[#F3EFE8] hover:border-[#FF7A1A] transition-colors"
              >
                <span>Date: {filters.datePreset.replace('_', ' ')}</span>
                <span aria-hidden="true">&times;</span>
              </button>
            )}

            {/* Removable Saved Only Chip */}
            {filters.savedOnly && (
              <button
                type="button"
                onClick={() => updateFilters({ savedOnly: false })}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-[#E11D48]/50 bg-[#E11D48]/20 text-[#F3EFE8] hover:border-[#E11D48] transition-colors"
              >
                <span>Saved Only</span>
                <span aria-hidden="true">&times;</span>
              </button>
            )}

            {/* Removable Status Chips */}
            {filters.statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateFilters({ statuses: toggleArrayItem(filters.statuses, s) })}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/20 bg-[#0D1020] text-[#B8B3C7] hover:border-[#FF7A1A] transition-colors"
              >
                <span>Status: {s.toLowerCase()}</span>
                <span aria-hidden="true">&times;</span>
              </button>
            ))}

            {/* Removable Price Chips */}
            {filters.prices.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateFilters({ prices: toggleArrayItem(filters.prices, p) })}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/20 bg-[#0D1020] text-[#B8B3C7] hover:border-[#FF7A1A] transition-colors"
              >
                <span>Price: {p}</span>
                <span aria-hidden="true">&times;</span>
              </button>
            ))}

            {/* Removable Format Chips */}
            {filters.types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateFilters({ types: toggleArrayItem(filters.types, t) })}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/20 bg-[#0D1020] text-[#B8B3C7] hover:border-[#FF7A1A] transition-colors"
              >
                <span>{t === 'EVENT' ? 'Competitions' : 'Workshops'}</span>
                <span aria-hidden="true">&times;</span>
              </button>
            ))}

            {/* Removable Mode Chips */}
            {filters.modes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => updateFilters({ modes: toggleArrayItem(filters.modes, m) })}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/20 bg-[#0D1020] text-[#B8B3C7] hover:border-[#FF7A1A] transition-colors"
              >
                <span>Mode: {m.toLowerCase()}</span>
                <span aria-hidden="true">&times;</span>
              </button>
            ))}

            {/* Removable Track Chips */}
            {filters.technical.map((tk) => (
              <button
                key={tk}
                type="button"
                onClick={() => updateFilters({ technical: toggleArrayItem(filters.technical, tk) })}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/20 bg-[#0D1020] text-[#B8B3C7] hover:border-[#FF7A1A] transition-colors"
              >
                <span>{tk}</span>
                <span aria-hidden="true">&times;</span>
              </button>
            ))}

            {/* Removable Search Chip */}
            {filters.search && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ search: '' });
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/20 bg-[#0D1020] text-[#F3EFE8] hover:border-[#FF7A1A] transition-colors"
              >
                <span>q: &quot;{filters.search}&quot;</span>
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-[#FF7A1A] hover:text-[#F5B642] underline underline-offset-4 font-mono font-semibold"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* 5. Main Section: Sidebar Controls + Archive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start pt-2">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24 bg-[#0D1020]/90 border border-white/10 rounded-xl p-5 shadow-xl">
            <EventFilters
              filters={filters}
              onChange={updateFilters}
              onReset={handleResetFilters}
              hasActive={hasFilters}
            />
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {/* Archive Section Heading: Realm name when 1 realm selected, else DISCOVER WHAT EXISTS BEYOND */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-wider" style={{ color: realmAccent }}>
                {singleRealm ? singleRealm.name.toUpperCase() : 'DISCOVER WHAT EXISTS BEYOND.'}
              </h2>
              {singleRealmDescriptor && (
                <span className="text-xs font-mono text-[#B8B3C7]">
                  {singleRealmDescriptor}
                </span>
              )}
            </div>

            {/* Stale State Banner */}
            {stale && (
              <div
                className="mb-6 p-4 rounded-xl bg-[#F5B642]/10 border border-[#F5B642]/30 flex items-center justify-between"
                role="status"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-[#F5B642]">
                  <span className="w-2 h-2 rounded-full bg-[#F5B642] animate-pulse" />
                  <span>
                    Viewing cached coordinates{fetchedAt ? ` (${new Date(fetchedAt).toLocaleTimeString()})` : ''}.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={retry}
                  className="text-xs text-[#F5B642] underline underline-offset-4 font-semibold hover:text-white"
                >
                  Reconnect
                </button>
              </div>
            )}

            {/* Empty State when no events match */}
            {filteredEvents.length === 0 ? (
              <EmptyState
                title="No Dimensional Events Match"
                description="No events match your current filter criteria across these coordinates."
                action={
                  <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                    Reset All Filters
                  </Button>
                }
              />
            ) : view === 'timeline' ? (
              /* Timeline View */
              <EventTimeline events={filteredEvents} />
            ) : (
              /* Uniform Grid View */
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visibleEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                {/* Show 12 More Pagination Button */}
                {remainingCount > 0 && (
                  <div className="flex flex-col items-center justify-center pt-4 pb-8 space-y-2">
                    <button
                      type="button"
                      onClick={handleShowMore}
                      className="px-8 py-3.5 rounded-lg bg-[#0D1020] border border-[#FF7A1A]/60 text-xs font-bold uppercase tracking-wider text-[#F3EFE8] hover:bg-[#FF7A1A] hover:text-[#07060D] transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] active:scale-95"
                    >
                      Show {Math.min(12, remainingCount)} more events
                    </button>
                    <span className="text-[11px] font-mono text-[#B8B3C7]">
                      Viewing {visibleEvents.length} of {filteredEvents.length} total events
                    </span>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        triggerRef={filterButtonRef}
      >
        <EventFilters
          filters={filters}
          onChange={updateFilters}
          onReset={() => {
            handleResetFilters();
            setMobileDrawerOpen(false);
          }}
          hasActive={hasFilters}
        />
      </FilterDrawer>
    </div>
  );
};
