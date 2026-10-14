import type { FC } from 'react';

export interface EventsGridSkeletonProps {
  count?: number;
}

export const EventsGridSkeleton: FC<EventsGridSkeletonProps> = ({ count = 9 }) => {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-12 md:pb-16 space-y-8 bg-[#07060D] text-[#F3EFE8] w-full"
      role="status"
      aria-label="Loading events"
    >
      <span className="sr-only">Loading events</span>

      {/* 1. Header & View Toggle Row */}
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

          {/* Grid/Timeline Toggle Placeholder */}
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-[#0D1020] border border-white/10 self-start md:self-auto shrink-0 w-36 h-9" />
        </div>

        {/* 2. Search Bar + Sort + Mobile Filter Button Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="h-10 flex-1 rounded-md bg-[#0D1020] border border-[#FF7A1A]/30 flex items-center px-3.5">
            <div className="w-4 h-4 rounded-full bg-white/10 mr-2" />
            <div className="h-3 w-48 rounded bg-white/5" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown Placeholder */}
            <div className="h-9 w-36 rounded-md bg-[#0D1020] border border-[#FF7A1A]/30" />
            {/* Mobile Filter Button Placeholder (visible only on mobile) */}
            <div className="lg:hidden h-9 w-24 rounded-md bg-[#0D1020] border border-[#FF7A1A]/40" />
          </div>
        </div>

        {/* 3. Active Filter & Result Count Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="h-4 w-32 rounded bg-white/10 animate-pulse motion-reduce:animate-none" />
        </div>
      </div>

      {/* 4. Main Section: Desktop Filter Sidebar + Mixed-Size Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar (Exact match to real sidebar width) */}
        <aside className="hidden lg:block lg:col-span-1 bg-[#0D1020] border border-[#FF7A1A]/20 rounded-xl p-5 space-y-6 shadow-xl">
          {/* Filter Group 1: Themes */}
          <div className="space-y-3">
            <div className="h-4 w-20 rounded bg-white/15 animate-pulse motion-reduce:animate-none" />
            <div className="space-y-2">
              <div className="h-3.5 w-3/4 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
              <div className="h-3.5 w-5/6 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
              <div className="h-3.5 w-2/3 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
              <div className="h-3.5 w-1/2 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>

          {/* Filter Group 2: Mode */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="h-4 w-24 rounded bg-white/15 animate-pulse motion-reduce:animate-none" />
            <div className="space-y-2">
              <div className="h-3.5 w-1/2 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
              <div className="h-3.5 w-2/3 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>

          {/* Filter Group 3: Event Type */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="h-4 w-20 rounded bg-white/15 animate-pulse motion-reduce:animate-none" />
            <div className="space-y-2">
              <div className="h-3.5 w-3/5 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
              <div className="h-3.5 w-1/2 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>

          {/* Filter Group 4: Registration Status */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="h-4 w-28 rounded bg-white/15 animate-pulse motion-reduce:animate-none" />
            <div className="space-y-2">
              <div className="h-3.5 w-2/3 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
              <div className="h-3.5 w-1/2 rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>

          {/* Filter Group 5: Past Events Toggle */}
          <div className="pt-4 border-t border-white/5">
            <div className="h-6 w-full rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
          </div>
        </aside>

        {/* Mixed-Size Grid: exact match to real grid classes */}
        <main className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {Array.from({ length: count }).map((_, index) => {
              // Asymmetric mixed-size accent: first item spans 2 cols on tablet & desktop
              const isFlagshipSpan = index === 0;
              return (
                <div
                  key={index}
                  className={isFlagshipSpan ? 'sm:col-span-2 xl:col-span-2' : ''}
                >
                  <div
                    className="flex flex-col bg-[#0D1020] rounded-xl border border-white/10 p-3 sm:p-3.5 select-none animate-pulse motion-reduce:animate-none"
                    aria-hidden="true"
                  >
                    {/* 3:2 Image block with small pills top-left and top-right */}
                    <div className="relative aspect-[3/2] w-full rounded-lg bg-white/5 mb-3 overflow-hidden border border-white/10">
                      <div className="absolute top-2.5 left-2.5 w-16 h-4 rounded bg-white/15" />
                      <div className="absolute top-2.5 right-2.5 w-20 h-4 rounded bg-white/15" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1020] via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Card Body */}
                    <div className="space-y-3 px-0.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Date line with icon placeholder */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-sm bg-white/15" />
                          <div className="h-3 w-24 rounded bg-white/10" />
                        </div>
                        {/* Two-line title */}
                        <div className="space-y-1.5">
                          <div className="h-5 w-4/5 rounded bg-white/15" />
                          <div className="h-5 w-3/5 rounded bg-white/10" />
                        </div>
                      </div>

                      {/* Full-width button block */}
                      <div className="h-10 w-full rounded-xl bg-white/10 mt-1" />

                      {/* Footer bar */}
                      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                        <div className="h-3 w-16 rounded bg-white/10" />
                        <div className="h-3.5 w-14 rounded bg-white/15" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};
