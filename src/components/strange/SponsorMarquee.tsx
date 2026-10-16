import type { FC } from 'react';
import { FESTIVAL_CONFIG, type Sponsor } from '../../config/festival';

export const SponsorMarquee: FC = () => {
  const sponsors = FESTIVAL_CONFIG.sponsors;

  // Strict Rule: Rendered ONLY if festival.ts sponsors exist and is non-empty
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  // Double the list for seamless CSS marquee loop
  const marqueeItems: Sponsor[] = [...sponsors, ...sponsors];

  return (
    <section
      className="relative w-full py-16 bg-[#07060D] border-t border-[#FF7A1A]/10 overflow-hidden"
      aria-labelledby="sponsors-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <h2
          id="sponsors-heading"
          className="font-display font-bold text-xs uppercase tracking-[0.3em] text-[#F5B642]"
        >
          POWERED BY OUR MULTIVERSE PARTNERS
        </h2>
      </div>

      {/* Marquee Track with CSS-only animation & pause-on-hover/focus */}
      <div className="relative w-full overflow-hidden mask-gradient">
        <div className="flex items-center gap-12 w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
          {marqueeItems.map((sponsor, idx) => {
            const content = (
              <div
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-[#0D1020]/80 border border-white/5 hover:border-[#FF7A1A]/40 transition-colors shrink-0"
                title={sponsor.tier ? `${sponsor.name} (${sponsor.tier})` : sponsor.name}
              >
                {sponsor.logoUrl ? (
                  <img
                    src={sponsor.logoUrl}
                    alt={`${sponsor.name} logo`}
                    width="120"
                    height="32"
                    className="h-8 max-w-[140px] object-contain filter grayscale hover:grayscale-0 transition-all"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="font-display font-bold text-sm tracking-wider text-[#F3EFE8]">
                    {sponsor.name}
                  </span>
                )}
                {sponsor.tier && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1A1030] text-[#F5B642] border border-[#F5B642]/30">
                    {sponsor.tier}
                  </span>
                )}
              </div>
            );

            if (sponsor.href) {
              return (
                <a
                  key={`${sponsor.name}-${idx}`}
                  href={sponsor.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] rounded-lg"
                  aria-label={`${sponsor.name} (opens in new tab)`}
                >
                  {content}
                </a>
              );
            }

            return <div key={`${sponsor.name}-${idx}`}>{content}</div>;
          })}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};
