import type { FC } from 'react';

export interface EventsGridSkeletonProps {
  count?: number;
}

/**
 * Loading Skeleton for /events (The Multiverse Index)
 * Mirrors the real layout:
 * - Header with H1 "THE MULTIVERSE INDEX"
 * - Realm Portal Selector Row (4 circular placeholders with labels)
 * - Search bar + Sort controls
 * - Filter Sidebar + Uniform Grid of 12 card skeletons
 */
export const EventsGridSkeleton: FC<EventsGridSkeletonProps> = ({ count = 12 }) => {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+24px)] md:pt-[calc(var(--navbar-height)+36px)] pb-16 space-y-8 bg-[#07060D] text-[#F3EFE8] w-full"
      role="status"
      aria-label="Loading Multiverse Index"
    >
      <span className="sr-only">Loading Multiverse Index</span>

      {/* 1. Header Row */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
        <div className="h-10 sm:h-12 w-80 max-w-full rounded bg-white/15 animate-pulse" />
        <div className="h-4 w-64 max-w-full rounded bg-white/5 animate-pulse" />
      </div>

      {/* 2. Portal Selector Row Skeleton (4 portals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center p-4 rounded-xl bg-[#0D1020]/70 border border-white/10 space-y-3 animate-pulse"
          >
            <div className="w-full flex justify-between">
              <div className="h-3 w-6 rounded bg-white/10" />
              <div className="h-3 w-12 rounded bg-white/10" />
            </div>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white/10 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/5" />
            </div>
            <div className="h-4 w-24 rounded bg-white/15" />
            <div className="h-3 w-32 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* 3. Search Bar + Sort + Mobile Filter Button Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <div className="h-11 flex-1 rounded-md bg-[#0D1020] border border-white/10 flex items-center px-3.5">
          <div className="w-4 h-4 rounded-full bg-white/10 mr-2" />
          <div className="h-3.5 w-48 rounded bg-white/5" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-11 w-36 rounded-md bg-[#0D1020] border border-white/10" />
          <div className="lg:hidden h-11 w-24 rounded-md bg-[#0D1020] border border-white/10" />
        </div>
      </div>

      {/* 4. Main Section: Desktop Filter Sidebar + Uniform Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start pt-2">
        {/* Desktop Filter Sidebar Skeleton */}
        <aside className="hidden lg:block lg:col-span-1 bg-[#0D1020]/80 border border-white/10 rounded-xl p-5 space-y-6 shadow-xl">
          <div className="h-4 w-28 rounded bg-white/15 animate-pulse" />
          <div className="space-y-3 pt-2">
            <div className="h-3.5 w-20 rounded bg-white/10 animate-pulse" />
            <div className="flex flex-wrap gap-1.5">
              <div className="h-6 w-16 rounded bg-white/5 animate-pulse" />
              <div className="h-6 w-20 rounded bg-white/5 animate-pulse" />
              <div className="h-6 w-14 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="h-3.5 w-20 rounded bg-white/10 animate-pulse" />
            <div className="flex flex-wrap gap-1.5">
              <div className="h-6 w-14 rounded bg-white/5 animate-pulse" />
              <div className="h-6 w-16 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        </aside>

        {/* Uniform Grid of Card Skeletons */}
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="w-full h-[440px] rounded-xl bg-[#0D1020]/80 border border-white/10 overflow-hidden flex flex-col justify-between animate-pulse"
              >
                <div className="w-full h-48 bg-white/5" />
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="h-3 w-20 rounded bg-white/10" />
                    <div className="h-5 w-4/5 rounded bg-white/15" />
                    <div className="h-4 w-3/5 rounded bg-white/10" />
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="h-4 w-16 rounded bg-white/10" />
                    <div className="h-7 w-28 rounded bg-white/15" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
