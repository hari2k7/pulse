import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { StrangeLogo } from '../strange/StrangeLogo';
import { SanctumSeal } from '../strange/SanctumSeal';
import { FESTIVAL_CONFIG } from '../../config/festival';

export const Footer: FC = () => {
  return (
    <footer className="relative bg-[#07060D] border-t border-[#FF7A1A]/20 pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-auto text-sm text-[#B8B3C7] overflow-hidden">
      {/* Background Sanctum Seal Backdrop */}
      <div className="absolute right-[-100px] sm:right-[-50px] bottom-[-80px] opacity-15 pointer-events-none select-none" aria-hidden="true">
        <SanctumSeal size={420} glow={false} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <StrangeLogo size="md" />
            <p className="font-display text-sm tracking-widest text-[#F5B642] uppercase">
              {FESTIVAL_CONFIG.tagline || 'A Tech Fest Beyond Reality.'}
            </p>
            <p className="text-xs text-[#B8B3C7] max-w-md leading-relaxed mt-1">
              Welcome to STRANGE, the multiverse convergence of technical innovation,
              hackathons, robotics, and creative arts. Organized {FESTIVAL_CONFIG.collegeName ? `at ${FESTIVAL_CONFIG.collegeName}` : 'by the student council'}
              {FESTIVAL_CONFIG.venue ? ` • Venue: ${FESTIVAL_CONFIG.venue}` : ''}.
            </p>
            {FESTIVAL_CONFIG.contactEmail && (
              <p className="text-xs text-[#B8B3C7] mt-1">
                Contact:{' '}
                <a
                  href={`mailto:${FESTIVAL_CONFIG.contactEmail}`}
                  className="text-[#FF7A1A] hover:underline"
                >
                  {FESTIVAL_CONFIG.contactEmail}
                </a>
              </p>
            )}
          </div>

          {/* Navigation */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F3EFE8] mb-4">
              Realms
            </h2>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-[#F3EFE8] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#F3EFE8] transition-colors">
                  Events
                </Link>
              </li>
              {import.meta.env.DEV && (
                <li>
                  <Link to="/styleguide" className="hover:text-[#F3EFE8] transition-colors">
                    Styleguide (Dev)
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F3EFE8] mb-4">
              Connect
            </h2>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <a href="/#about" className="hover:text-[#F3EFE8] transition-colors">
                  About STRANGE
                </a>
              </li>
              {FESTIVAL_CONFIG.socials && FESTIVAL_CONFIG.socials.length > 0 &&
                FESTIVAL_CONFIG.socials.map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#FF7A1A] transition-colors inline-block"
                      aria-label={`${social.platform} (opens in new window)`}
                    >
                      {social.platform}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B8B3C7]">
          <p>© 2026 STRANGE.</p>
          <p className="font-display tracking-[0.25em] uppercase text-[#F5B642] text-xs">
            SEE YOU IN ANOTHER REALITY.
          </p>
        </div>
      </div>
    </footer>
  );
};
