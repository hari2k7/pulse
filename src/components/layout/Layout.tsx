import type { FC, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export interface LayoutProps {
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white">
      {/* Accessible skip link for keyboard/screen-reader users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#e50914] focus:text-white focus:rounded-[4px] focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white font-semibold text-sm"
      >
        Skip to main content
      </a>

      {/* Primary Sticky Header */}
      <Navbar />

      {/* Main Landmark */}
      <main id="main" className="flex-1 flex flex-col pt-16 md:pt-18 outline-none">
        {children ?? <Outlet />}
      </main>

      {/* Footer Landmark */}
      <Footer />
    </div>
  );
};
