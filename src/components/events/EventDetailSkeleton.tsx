import type { FC } from 'react';

export const EventDetailSkeleton: FC = () => {
  return (
    <div
      className="w-full min-h-[1400px] bg-[#07060D] text-[#F3EFE8] pb-24 pt-[var(--navbar-height,64px)] animate-pulse overflow-x-clip"
      role="status"
      aria-label="Loading event details"
    >
      {/* 1. Banner image skeleton matching exact dimensions */}
      <div className="w-full h-[240px] md:h-[55vh] md:min-h-[280px] md:max-h-[560px] bg-[#0D1020] relative border-b border-white/5" />

      {/* 2. Hero content below banner image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-12 space-y-5 w-full relative z-10">
        {/* Breadcrumbs & Badges */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-28 rounded-lg bg-[#1A1030]" />
          <div className="h-7 w-20 rounded-lg bg-[#1A1030]/70" />
        </div>

        {/* Title & Blurb */}
        <div className="space-y-3 pt-1">
          <div className="h-10 sm:h-12 md:h-14 w-3/4 max-w-2xl rounded bg-[#1A1030]" />
          <div className="h-4 w-full max-w-xl rounded bg-[#1A1030]/60" />
        </div>

        {/* Compact Horizontal Facts Strip & CTA */}
        <div className="p-4 rounded-xl bg-[#0D1020] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="h-5 w-24 rounded bg-[#1A1030]" />
            <div className="h-5 w-20 rounded bg-[#1A1030]" />
            <div className="h-5 w-24 rounded bg-[#1A1030]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded-md bg-[#1A1030]" />
            <div className="w-12 h-12 rounded-xl bg-[#1A1030]" />
          </div>
        </div>

        {/* 3. Main layout: Overview + Summary Card */}
        <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="order-2 lg:order-1 lg:col-span-8 space-y-6">
            <div className="p-6 rounded-xl bg-[#0D1020] border border-white/10 space-y-4">
              <div className="h-6 w-32 rounded bg-[#1A1030]" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-[#1A1030]/60" />
                <div className="h-4 w-5/6 rounded bg-[#1A1030]/60" />
                <div className="h-4 w-4/6 rounded bg-[#1A1030]/60" />
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-4 h-80 rounded-xl bg-[#0D1020] border border-white/10 p-5" />
        </div>

        {/* ROW 2: Schedule & Details skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 rounded-xl bg-[#0D1020] border border-white/10 p-6" />
          <div className="h-48 rounded-xl bg-[#0D1020] border border-white/10 p-6" />
        </div>
      </div>
    </div>
  );
};
