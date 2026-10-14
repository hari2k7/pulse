import type { FC } from 'react';

export interface EventsGridSkeletonProps {
  count?: number;
}

export const EventsGridSkeleton: FC<EventsGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8 min-h-[60vh]"
      role="status"
      aria-label="Loading events"
    >
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl md:text-5xl font-display font-normal tracking-wide text-white">
          DISCOVER EVENTS
        </h1>
        <p className="text-sm md:text-base text-[#b3b3b3] mt-2">
          Filter and explore workshops, competitions, and challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col bg-[#181818] rounded-[4px] border border-white/5 overflow-hidden w-full"
            aria-hidden="true"
          >
            <div className="aspect-[3/2] w-full bg-[#222222] animate-pulse motion-reduce:animate-none" />
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="h-4 rounded-[4px] w-3/4 bg-[#222222] animate-pulse motion-reduce:animate-none" />
                <div className="h-3 rounded-[4px] w-full bg-[#222222] animate-pulse motion-reduce:animate-none" />
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="h-3.5 rounded-[4px] w-16 bg-[#222222] animate-pulse motion-reduce:animate-none" />
                <div className="h-3.5 rounded-[4px] w-12 bg-[#222222] animate-pulse motion-reduce:animate-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
