import { useState, useEffect, useRef, type FC, type KeyboardEvent } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { StrangeLogo } from '../strange/StrangeLogo';

export const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsOpen(false);
  }

  // Close mobile menu on resize to desktop (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(target)
      ) {
        setIsOpen(false);
        hamburgerRef.current.focus();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle body scroll lock & focus management
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Move focus into the first element of the panel
      const timer = window.setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.clearTimeout(timer);
      };
    }
  }, [isOpen]);

  // Focus trap inside mobile panel and Escape key handler
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      hamburgerRef.current?.focus();
      return;
    }

    if (e.key === 'Tab') {
      if (!menuRef.current) return;
      const focusables = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <header className="fixed top-2 sm:top-4 inset-x-0 z-40 px-2 sm:px-4 md:px-6 pointer-events-none flex justify-center">
      {/* Floating Centered Bar (max-width ~1100px, near-black fill #07060D, no blur) */}
      <div
        className="pointer-events-auto relative w-full max-w-[1100px] h-[58px] sm:h-[64px] bg-[#07060D] px-3 sm:px-6 select-none grid grid-cols-[1fr_auto_1fr] items-center"
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

        {/* Small Diamond Ornament at Exact Center of Top Line */}
        <div
          className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#F5B642] border border-[#FF7A1A] shadow-[0_0_8px_#FF7A1A] pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Small Diamond Ornament at Exact Center of Bottom Line */}
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
            <path
              d="M20 0 L2 32 L20 64 Z"
              fill="#07060D"
              stroke="#F5B642"
              strokeWidth="1.2"
            />
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
            <path
              d="M0 0 L18 32 L0 64 Z"
              fill="#07060D"
              stroke="#F5B642"
              strokeWidth="1.2"
            />
            <path
              d="M2 8 L14 32 L2 56 M6 16 L12 32 L6 48 M0 24 L10 32 L0 40"
              stroke="#FF7A1A"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />
          </svg>
        </div>

        {/* ====================================================================
            COLUMN 1 (LEFT): Desktop Navigation Items (justify-self-start)
            On mobile (< lg): spacer element maintaining strict 1fr balance
            ==================================================================== */}
        <div className="justify-self-start flex items-center h-full">
          {/* Mobile Spacer to keep logo in exact horizontal center */}
          <div className="lg:hidden w-11 h-11 pointer-events-none" aria-hidden="true" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center h-full gap-1" aria-label="Main Navigation">
            {/* 1. Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `group relative flex flex-col items-center justify-center px-3 h-full min-w-[58px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] ${
                  isActive ? 'text-[#F3EFE8]' : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
                }`
              }
            >
              {({ isActive }) => (
                <>
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
                  <span className="font-display text-[10px] tracking-widest uppercase font-semibold mt-0.5">
                    Home
                  </span>
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
            <div className="w-[1px] h-6 bg-white/10 shrink-0 mx-0.5" aria-hidden="true" />

            {/* 2. Events */}
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `group relative flex flex-col items-center justify-center px-3 h-full min-w-[58px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] ${
                  isActive ? 'text-[#F3EFE8]' : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
                }`
              }
            >
              {({ isActive }) => (
                <>
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
                  <span className="font-display text-[10px] tracking-widest uppercase font-semibold mt-0.5">
                    Events
                  </span>
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
            <div className="w-[1px] h-6 bg-white/10 shrink-0 mx-0.5" aria-hidden="true" />

            {/* 3. Favorites */}
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `group relative flex flex-col items-center justify-center px-3 h-full min-w-[58px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] ${
                  isActive ? 'text-[#F3EFE8]' : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
                }`
              }
            >
              {({ isActive }) => (
                <>
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
                  <span className="font-display text-[10px] tracking-widest uppercase font-semibold mt-0.5">
                    Favorites
                  </span>
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
        </div>

        {/* ====================================================================
            COLUMN 2 (CENTER): STRANGE Wordmark & Circular Sigil
            Exact horizontal center: 1fr on left, 1fr on right.
            ==================================================================== */}
        <div className="justify-self-center flex items-center justify-center px-1 sm:px-2">
          <NavLink
            to="/"
            className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A1A] rounded py-1 px-1.5"
            aria-label="STRANGE Home"
          >
            <StrangeLogo size="sm" />
          </NavLink>
        </div>

        {/* ====================================================================
            COLUMN 3 (RIGHT): Desktop Dummy Sign In Pill & Mobile Hamburger
            justify-self-end to keep symmetric 1fr bounding balance
            ==================================================================== */}
        <div className="justify-self-end flex items-center gap-2">
          {/* Desktop Right Ornament Divider + Sign In Pill Button */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-[1px] h-6 bg-white/10 shrink-0" aria-hidden="true" />
            <button
              type="button"
              className="group relative flex items-center gap-1.5 px-4 py-1.5 min-h-[44px] min-w-[44px] rounded-full border border-[#FF7A1A] bg-[#07060D] text-[#F3EFE8] text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:bg-[#FF7A1A]/10 hover:border-[#F5B642] hover:text-[#F5B642] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060D]"
              style={{
                boxShadow: '0 0 12px rgba(255, 122, 26, 0.35)',
              }}
              aria-label="Sign In"
            >
              <span>Sign In</span>
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

          {/* Mobile Hamburger Button (< lg) */}
          <button
            ref={hamburgerRef}
            type="button"
            onClick={toggleMenu}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-panel"
            className="lg:hidden relative flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg border border-[#FF7A1A]/40 bg-[#07060D] text-[#F3EFE8] hover:border-[#F5B642] hover:text-[#F5B642] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
          >
            <div className="relative w-5 h-5 flex flex-col justify-center items-center">
              {/* Morphing bars */}
              <span
                className={`block h-0.5 w-5 bg-current rounded-full transition-transform duration-200 ease-out motion-reduce:transition-none ${
                  isOpen ? 'rotate-45 translate-y-[3px]' : '-translate-y-1'
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current rounded-full transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current rounded-full transition-transform duration-200 ease-out motion-reduce:transition-none ${
                  isOpen ? '-rotate-45 -translate-y-[3px]' : 'translate-y-1'
                }`}
              />
            </div>
          </button>
        </div>

        {/* ====================================================================
            Mobile Full-Width Nav Panel (Dropdown below floating bar)
            ==================================================================== */}
        {isOpen && (
          <div
            id="mobile-nav-panel"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            onKeyDown={handleKeyDown}
            className="lg:hidden absolute top-[calc(100%+8px)] inset-x-0 bg-[#07060D] border border-[#FF7A1A]/50 rounded-xl shadow-2xl p-4 flex flex-col gap-3 z-50 animate-fadeIn"
            style={{
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.95), 0 0 20px rgba(255, 122, 26, 0.25)',
            }}
          >
            {/* Top decorative line inside panel */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF7A1A]/60 to-transparent mb-1" />

            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {/* Home */}
              <NavLink
                ref={firstFocusableRef}
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-display tracking-wider uppercase font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] ${
                    isActive
                      ? 'bg-[#FF7A1A]/20 text-[#F5B642] border border-[#FF7A1A]/40'
                      : 'text-[#B8B3C7] hover:bg-white/5 hover:text-[#F3EFE8]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <svg
                      className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#FF7A1A]' : 'text-[#B8B3C7]'}`}
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
                    <span>Home</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rotate-45 bg-[#F5B642] shadow-[0_0_6px_#FF7A1A]" />
                    )}
                  </>
                )}
              </NavLink>

              {/* Events */}
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-display tracking-wider uppercase font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] ${
                    isActive
                      ? 'bg-[#FF7A1A]/20 text-[#F5B642] border border-[#FF7A1A]/40'
                      : 'text-[#B8B3C7] hover:bg-white/5 hover:text-[#F3EFE8]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <svg
                      className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#FF7A1A]' : 'text-[#B8B3C7]'}`}
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
                    <span>Events</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rotate-45 bg-[#F5B642] shadow-[0_0_6px_#FF7A1A]" />
                    )}
                  </>
                )}
              </NavLink>

              {/* Favorites */}
              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-display tracking-wider uppercase font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] ${
                    isActive
                      ? 'bg-[#FF7A1A]/20 text-[#F5B642] border border-[#FF7A1A]/40'
                      : 'text-[#B8B3C7] hover:bg-white/5 hover:text-[#F3EFE8]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <svg
                      className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#FF7A1A] fill-[#FF7A1A]' : 'text-[#B8B3C7]'}`}
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
                    <span>Favorites</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rotate-45 bg-[#F5B642] shadow-[0_0_6px_#FF7A1A]" />
                    )}
                  </>
                )}
              </NavLink>
            </nav>

            {/* Divider */}
            <div className="w-full h-[1px] bg-white/10 my-1" />

            {/* Mobile Sign In Pill Button (Dummy, strictly non-navigating <button>) */}
            <div className="pt-1">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] rounded-full border border-[#FF7A1A] bg-[#07060D] text-[#F3EFE8] text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:bg-[#FF7A1A]/10 hover:border-[#F5B642] hover:text-[#F5B642] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
                style={{
                  boxShadow: '0 0 12px rgba(255, 122, 26, 0.35)',
                }}
                aria-label="Sign In"
              >
                <span>Sign In</span>
                <svg
                  className="w-3.5 h-3.5 text-[#FF7A1A]"
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
        )}
      </div>
    </header>
  );
};
