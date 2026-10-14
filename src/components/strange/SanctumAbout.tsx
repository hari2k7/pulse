import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { SanctumSeal } from './SanctumSeal';
import { FESTIVAL_CONFIG } from '../../config/festival';

export const SanctumAbout: FC = () => {
  return (
    <section
      id="about"
      className="relative w-full py-20 sm:py-28 bg-[#07060D] border-t border-[#FF7A1A]/20 overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Background Sanctum Seal Backdrop */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none"
        aria-hidden="true"
      >
        <SanctumSeal size={650} glow />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-8">
        <h2
          id="about-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8]"
        >
          A TECH FEST BEYOND REALITY
        </h2>

        <div className="max-w-3xl space-y-4 text-sm sm:text-base md:text-lg text-[#B8B3C7] leading-relaxed">
          <p>
            STRANGE is not an ordinary symposium; it is a convergence of multi-dimensional engineering,
            artificial intelligence, competitive coding, robotics, and creative design.
          </p>
          <p>
            Hosted {FESTIVAL_CONFIG.collegeName ? `by ${FESTIVAL_CONFIG.collegeName}` : 'by the student technical bodies'}{' '}
            {FESTIVAL_CONFIG.venue ? `at ${FESTIVAL_CONFIG.venue}` : ''}, the festival invites students, hackers, and creators
            from across the subcontinent to challenge existing realities and construct the future.
          </p>
          {FESTIVAL_CONFIG.organizers && FESTIVAL_CONFIG.organizers.length > 0 && (
            <p className="text-xs uppercase tracking-widest text-[#F5B642] pt-2">
              Organized by: {FESTIVAL_CONFIG.organizers.join(' • ')}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="flex flex-wrap gap-4 justify-center pt-2">
          <Link
            to="/events"
            className="px-6 py-3 rounded-md bg-[#FF7A1A] text-[#07060D] text-xs font-bold uppercase tracking-wider hover:bg-[#F5B642] transition-colors"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </section>
  );
};
