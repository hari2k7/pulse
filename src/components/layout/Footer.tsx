import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { StrangeLogo } from '../strange/StrangeLogo';
import { SanctumSeal } from '../strange/SanctumSeal';
import { FESTIVAL_CONFIG } from '../../config/festival';

export const Footer: FC = () => {
  return (
    <footer className="relative bg-[#07060D] border-t border-[#FF7A1A]/20 pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-auto text-sm text-[#B8B3C7] overflow-hidden">
      {/* Background Sanctum Seal Backdrop with Slow CSS Rotation */}
      <div
        className="absolute right-[-100px] sm:right-[-50px] bottom-[-80px] opacity-15 pointer-events-none select-none animate-spell-spin"
        style={{ animationDuration: '60s', transformOrigin: 'center' }}
        aria-hidden="true"
      >
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
              hackathons, robotics, and creative arts.
              {FESTIVAL_CONFIG.collegeName ? ` Organized at ${FESTIVAL_CONFIG.collegeName}` : ''}
              {FESTIVAL_CONFIG.venue ? ` • Venue: ${FESTIVAL_CONFIG.venue}` : ''}
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

          {/* Realms: Events & Favorites */}
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
              <li>
                <Link to="/favorites" className="hover:text-[#F3EFE8] transition-colors">
                  Favorites
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

          {/* Connect / Config-driven items only */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F3EFE8] mb-4">
              Sanctum
            </h2>
            <ul className="flex flex-col gap-2.5 text-xs">
              {FESTIVAL_CONFIG.venue && (
                <li className="text-[#B8B3C7]">
                  Venue: {FESTIVAL_CONFIG.venue}
                </li>
              )}
              {FESTIVAL_CONFIG.organizers && FESTIVAL_CONFIG.organizers.length > 0 && (
                <li className="text-[#B8B3C7]">
                  Organized by: {FESTIVAL_CONFIG.organizers.join(', ')}
                </li>
              )}
              {FESTIVAL_CONFIG.socials && FESTIVAL_CONFIG.socials.length > 0 ? (
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
                ))
              ) : (
                <>
                  <li className="text-[#8E8A9F]">Official multiverse coordinates</li>
                  {/* replace with real links from festival.ts socials when available */}
                  <li className="pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        aria-label="Instagram (not linked yet)"
                        className="w-11 h-11 rounded-full border border-[#F5B642]/30 bg-[#07060D] text-[#F3EFE8] flex items-center justify-center hover:border-[#F5B642] hover:text-[#FF7A1A] motion-safe:hover:scale-105 motion-safe:transition-all motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060D]"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="LinkedIn (not linked yet)"
                        className="w-11 h-11 rounded-full border border-[#F5B642]/30 bg-[#07060D] text-[#F3EFE8] flex items-center justify-center hover:border-[#F5B642] hover:text-[#FF7A1A] motion-safe:hover:scale-105 motion-safe:transition-all motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060D]"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                          <rect x="2" y="9" width="4" height="12"/>
                          <circle cx="4" cy="4" r="2"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="X (not linked yet)"
                        className="w-11 h-11 rounded-full border border-[#F5B642]/30 bg-[#07060D] text-[#F3EFE8] flex items-center justify-center hover:border-[#F5B642] hover:text-[#FF7A1A] motion-safe:hover:scale-105 motion-safe:transition-all motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060D]"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="YouTube (not linked yet)"
                        className="w-11 h-11 rounded-full border border-[#F5B642]/30 bg-[#07060D] text-[#F3EFE8] flex items-center justify-center hover:border-[#F5B642] hover:text-[#FF7A1A] motion-safe:hover:scale-105 motion-safe:transition-all motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060D]"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="GitHub (not linked yet)"
                        className="w-11 h-11 rounded-full border border-[#F5B642]/30 bg-[#07060D] text-[#F3EFE8] flex items-center justify-center hover:border-[#F5B642] hover:text-[#FF7A1A] motion-safe:hover:scale-105 motion-safe:transition-all motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060D]"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                        </svg>
                      </button>
                    </div>
                  </li>
                </>
              )}
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
