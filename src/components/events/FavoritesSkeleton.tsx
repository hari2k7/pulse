import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { EventCardSkeleton } from './EventCard';

function getStoredFavCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('strange:favorites');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.length;
    }
  } catch {
    return 0;
  }
  return 0;
}

export const FavoritesSkeleton: FC = () => {
  const favCount = getStoredFavCount();

  return (
    <div
      className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-12 md:pb-16 space-y-8 bg-[#07060D] text-[#F3EFE8] min-h-[calc(100vh-var(--navbar-height,72px))]"
      role="status"
      aria-label="Loading favorites"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#FF7A1A]/20 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8]">
              FAVORITES
            </h1>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#FF7A1A]/20 border border-[#FF7A1A]/40 text-[#F5B642]"
            >
              {favCount}
            </span>
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

      {favCount > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {Array.from({ length: Math.min(favCount, 6) }).map((_, i) => (
            <div key={i} className="h-full">
              <EventCardSkeleton className="animate-pulse h-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12">
          <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-[4px] bg-[#181818]/60 border border-white/5 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#b3b3b3] mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">No Favorites Yet</h2>
            <p className="text-sm md:text-base text-[#b3b3b3] max-w-md mb-6 leading-relaxed">
              Explore the multiverse index and click the heart icon on any event card to save it to your Sanctum archives.
            </p>
            <div className="mt-2">
              <Link
                to="/events"
                className="inline-flex items-center justify-center font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-md bg-[#FF7A1A] text-[#07060D] hover:bg-[#F5B642] transition-colors"
              >
                Explore Events
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
