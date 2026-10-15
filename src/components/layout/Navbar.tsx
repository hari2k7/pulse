import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { StrangeLogo } from '../strange/StrangeLogo';

export const Navbar: FC = () => {
  return (
    <header className="fixed top-2 sm:top-4 inset-x-0 z-40 px-2 sm:px-4 md:px-6 pointer-events-none flex justify-center">
      {/* Floating Centered Bar (max-width ~1100px, near-black fill #07060D, no blur) */}
      <div
        className="pointer-events-auto relative w-full max-w-[1100px] h-[58px] sm:h-[64px] bg-[#07060D] flex items-center justify-between px-2 sm:px-5 select-none"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 122, 26, 0.3)',
        }}
      >
        {/* ====================================================================
            Double Gold/Orange Lines along Top and Bottom with Diamond Ends & Center
            ==================================================================== */}
        {/* Top Double Line */}
        <div className="absolute top-0 inset-x-0 h-[3px] pointer-events-none">
          <div className="w-full h-[1px] bg-[#F5B642]/60 shadow-[0_0_6px_rgba(245,182,66,0.5)]" />
          <div className="w-full h-[1px] mt-[1px] bg-[#FF7A1A]/80 shadow-[0_0_8px_rgba(255,122,26,0.6)]" />
        </div>

        {/* Bottom Double Line */}
        <div className="absolute bottom-0 inset-x-0 h-[3px] pointer-events-none">
          <div className="w-full h-[1px] bg-[#FF7A1A]/80 shadow-[0_0_8px_rgba(255,122,26,0.6)]" />
          <div className="w-full h-[1px] mt-[1px] bg-[#F5B642]/60 shadow-[0_0_6px_rgba(245,182,66,0.5)]" />
        </div>

        {/* Small Diamond Ornament at Center of Top Line */}
        <div
          className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#F5B642] border border-[#FF7A1A] shadow-[0_0_8px_#FF7A1A] pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Small Diamond Ornament at Center of Bottom Line */}
        <div
          className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#F5B642] border border-[#FF7A1A] shadow-[0_0_8px_#FF7A1A] pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Left Pointed Diamond End Cap with Fine Lattice Pattern */}
        <div className="absolute -left-[14px] sm:-left-[18px] top-0 bottom-0 w-[16px] sm:w-[20px] pointer-events-none flex items-center justify-end overflow-hidden">
          <svg
            viewBox="0 0 20 64"
            className="w-full h-full text-[#FF7A1A]"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Diamond tip background */}
            <path
              d="M20 0 L2 32 L20 64 Z"
              fill="#07060D"
              stroke="#F5B642"
              strokeWidth="1.2"
            />
            {/* Fine lattice pattern */}
            <path
              d="M18 8 L6 32 L18 56 M14 16 L8 32 L14 48 M20 24 L10 32 L20 40"
              stroke="#FF7A1A"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />
          </svg>
        </div>

        {/* Right Pointed Diamond End Cap with Fine Lattice Pattern */}
        <div className="absolute -right-[14px] sm:-right-[18px] top-0 bottom-0 w-[16px] sm:w-[20px] pointer-events-none flex items-center justify-start overflow-hidden">
          <svg
            viewBox="0 0 20 64"
            className="w-full h-full text-[#FF7A1A]"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Diamond tip background */}
            <path
              d="M0 0 L18 32 L0 64 Z"
              fill="#07060D"
              stroke="#F5B642"
              strokeWidth="1.2"
            />
            {/* Fine lattice pattern */}
            <path
              d="M2 8 L14 32 L2 56 M6 16 L12 32 L6 48 M0 24 L10 32 L0 40"
              stroke="#FF7A1A"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />
          </svg>
        </div>

        {/* ====================================================================
            Navigation Items (Home, Events, Favorites)
            ==================================================================== */}
        <nav className="flex items-center h-full gap-0 sm:gap-1" aria-label="Main Navigation">
          {/* 1. Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `group relative flex flex-col items-center justify-center px-2 sm:px-3 h-full min-w-[50px] sm:min-w-[58px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] ${
                isActive ? 'text-[#F3EFE8]' : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* House Icon */}
                <svg
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#FF7A1A]' : 'text-[#B8B3C7] group-hover:text-[#F3EFE8]'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {/* Always-visible uppercase label */}
                <span className="font-display text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold mt-0.5">
                  Home
                </span>

                {/* Active Route Indicator: Orange underline with small diamond ornament */}
                {isActive && (
                  <div className="absolute bottom-0 inset-x-2 flex items-center justify-center" aria-hidden="true">
                    <div className="w-full h-[2px] bg-[#FF7A1A] shadow-[0_0_8px_#FF7A1A]" />
                    <div className="absolute -top-[2px] w-1.5 h-1.5 rotate-45 bg-[#F5B642] shadow-[0_0_6px_#FF7A1A]" />
                  </div>
                )}
              </>
            )}
          </NavLink>

          {/* Thin Vertical Divider */}
          <div className="w-[1px] h-6 bg-white/10 shrink-0" aria-hidden="true" />

          {/* 2. Events */}
          <NavLink
            to="/events"
            className={({ isActive }) =>
              `group relative flex flex-col items-center justify-center px-2 sm:px-3 h-full min-w-[50px] sm:min-w-[58px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] ${
                isActive ? 'text-[#F3EFE8]' : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Small Original Mandala Icon */}
                <svg
                  className={`w-4 h-4 transition-transform group-hover:rotate-45 ${
                    isActive ? 'text-[#FF7A1A]' : 'text-[#B8B3C7] group-hover:text-[#F3EFE8]'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth="1.2" />
                  <rect x="7" y="7" width="10" height="10" transform="rotate(45 12 12)" strokeWidth="1.2" />
                  <circle cx="12" cy="12" r="3" fill={isActive ? '#FF7A1A' : 'none'} strokeWidth="1.2" />
                </svg>
                {/* Always-visible uppercase label */}
                <span className="font-display text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold mt-0.5">
                  Events
                </span>

                {/* Active Route Indicator: Orange underline with small diamond ornament */}
                {isActive && (
                  <div className="absolute bottom-0 inset-x-2 flex items-center justify-center" aria-hidden="true">
                    <div className="w-full h-[2px] bg-[#FF7A1A] shadow-[0_0_8px_#FF7A1A]" />
                    <div className="absolute -top-[2px] w-1.5 h-1.5 rotate-45 bg-[#F5B642] shadow-[0_0_6px_#FF7A1A]" />
                  </div>
                )}
              </>
            )}
          </NavLink>

          {/* Thin Vertical Divider */}
          <div className="w-[1px] h-6 bg-white/10 shrink-0" aria-hidden="true" />

          {/* 3. Favorites */}
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `group relative flex flex-col items-center justify-center px-2 sm:px-3 h-full min-w-[50px] sm:min-w-[58px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] ${
                isActive ? 'text-[#F3EFE8]' : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Heart Icon */}
                <svg
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#FF7A1A] fill-[#FF7A1A]' : 'text-[#B8B3C7] group-hover:text-[#F3EFE8]'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {/* Always-visible uppercase label */}
                <span className="font-display text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold mt-0.5">
                  Favorites
                </span>

                {/* Active Route Indicator: Orange underline with small diamond ornament */}
                {isActive && (
                  <div className="absolute bottom-0 inset-x-2 flex items-center justify-center" aria-hidden="true">
                    <div className="w-full h-[2px] bg-[#FF7A1A] shadow-[0_0_8px_#FF7A1A]" />
                    <div className="absolute -top-[2px] w-1.5 h-1.5 rotate-45 bg-[#F5B642] shadow-[0_0_6px_#FF7A1A]" />
                  </div>
                )}
              </>
            )}
          </NavLink>
        </nav>

        {/* ====================================================================
            Center: STRANGE Wordmark (reduced/hidden on tiny 375px screens)
            ==================================================================== */}
        <div className="hidden xs:flex sm:flex items-center justify-center px-2">
          <NavLink
            to="/"
            className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] rounded py-1 px-1.5"
            aria-label="STRANGE Home"
          >
            <StrangeLogo size="sm" />
          </NavLink>
        </div>

        {/* ====================================================================
            Right: Dummy "Sign In" Pill Button
            Rendered strictly as <button type="button">, no navigation, no modal,
            no auth, no localStorage. Glowing orange outline + small up-right arrow.
            ==================================================================== */}
        <div className="flex items-center">
          <button
            type="button"
            className="group relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 min-h-[44px] min-w-[44px] rounded-full border border-[#FF7A1A] bg-[#07060D] text-[#F3EFE8] text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:bg-[#FF7A1A]/10 hover:border-[#F5B642] hover:text-[#F5B642] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060D]"
            style={{
              boxShadow: '0 0 12px rgba(255, 122, 26, 0.35)',
            }}
            aria-label="Sign In"
          >
            <span className="text-[10px] sm:text-xs">Sign In</span>
            {/* Small Up-Right Arrow (inline SVG) */}
            <svg
              className="w-3 h-3 text-[#FF7A1A] group-hover:text-[#F5B642] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
