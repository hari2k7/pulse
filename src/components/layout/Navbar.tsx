import { useEffect, useRef, useState, type FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { StrangeLogo } from '../strange/StrangeLogo';

export const Navbar: FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const location = useLocation();

  // Close mobile menu during render if route changed (official React pattern)
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setMobileMenuOpen(false);
  }

  // Passive scroll listener to toggle solid background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard accessibility: Escape key closes menu and restores focus
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Focus management when opening mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      firstMobileLinkRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors py-1 relative ${
      isActive
        ? 'text-[#F3EFE8] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF7A1A]'
        : 'text-[#B8B3C7] hover:text-[#F3EFE8]'
    }`;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ease-out ${
        isScrolled
          ? 'bg-[#07060D]/95 backdrop-blur-md shadow-lg shadow-black/60 border-b border-[#FF7A1A]/20'
          : 'bg-gradient-to-b from-[#07060D]/90 via-[#07060D]/40 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* STRANGE Logo */}
        <div className="flex items-center gap-8">
          <StrangeLogo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/events" className={navLinkClass}>
              Events
            </NavLink>
            <NavLink to="/schedule" className={navLinkClass}>
              Schedule
            </NavLink>
            <a href="/#about" className="text-sm font-medium text-[#B8B3C7] hover:text-[#F3EFE8] transition-colors py-1">
              About
            </a>
            {import.meta.env.DEV && (
              <NavLink to="/styleguide" className={navLinkClass}>
                Styleguide
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right side CTA or mobile menu toggle */}
        <div className="flex items-center gap-4">
          <NavLink
            to="/events?registration_status=OPEN"
            className="hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md bg-gradient-to-r from-[#FF7A1A] to-[#F5B642] text-[#07060D] shadow-md hover:shadow-[#FF7A1A]/40 transition-all hover:scale-105 active:scale-95"
          >
            Register
          </NavLink>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-[#F3EFE8] hover:bg-[#1A1030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden bg-[#0D1020] border-b border-[#FF7A1A]/20 px-4 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top-2 duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <nav className="flex flex-col gap-2">
            <NavLink
              ref={firstMobileLinkRef}
              to="/"
              end
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold'
                    : 'text-[#B8B3C7] hover:text-[#F3EFE8] hover:bg-[#1A1030]'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/events"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold'
                    : 'text-[#B8B3C7] hover:text-[#F3EFE8] hover:bg-[#1A1030]'
                }`
              }
            >
              Multiverse Events
            </NavLink>
            <NavLink
              to="/schedule"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF7A1A] text-[#07060D] font-bold'
                    : 'text-[#B8B3C7] hover:text-[#F3EFE8] hover:bg-[#1A1030]'
                }`
              }
            >
              Festival Schedule
            </NavLink>
            <a
              href="/#about"
              onClick={closeMobileMenu}
              className="px-3 py-2.5 rounded-md text-base font-medium text-[#B8B3C7] hover:text-[#F3EFE8] hover:bg-[#1A1030] transition-colors"
            >
              About
            </a>
            <NavLink
              to="/events?registration_status=OPEN"
              onClick={closeMobileMenu}
              className="px-3 py-2.5 rounded-md text-base font-bold text-[#FF7A1A] hover:bg-[#1A1030] transition-colors"
            >
              Register
            </NavLink>
            {import.meta.env.DEV && (
              <NavLink
                to="/styleguide"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[#FF7A1A] text-[#07060D] font-bold'
                      : 'text-[#B8B3C7] hover:text-[#F3EFE8] hover:bg-[#1A1030]'
                  }`
                }
              >
                Styleguide (Dev)
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
