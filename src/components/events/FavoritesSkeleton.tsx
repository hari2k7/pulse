import type { FC } from 'react';
import { Link } from 'react-router-dom';

export const FavoritesSkeleton: FC = () => {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-12 md:pb-16 space-y-8 bg-[#07060D] text-[#F3EFE8] min-h-[70vh]"
      role="status"
      aria-label="Loading favorites"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#FF7A1A]/20 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8]">
              FAVORITES
            </h1>
          </div>
          <p className="text-sm text-[#B8B3C7]">
            Your curated collection of bookmarked dimensions and competitions.
          </p>
        </div>
        <Link
          to="/events"
          className="text-xs font-bold uppercase tracking-wider text-[#F5B642] hover:text-[#FF7A1A] transition-colors self-start sm:self-auto"
        >
          Explore More Events
        </Link>
      </div>
      <div className="py-12 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse mb-4" />
        <div className="h-6 w-48 rounded bg-white/10 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-white/5 animate-pulse" />
      </div>
    </div>
  );
};
