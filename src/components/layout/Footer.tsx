import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '../ui/Wordmark';

export const Footer: FC = () => {
  return (
    <footer className="bg-[#0c0c0c] border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 mt-auto text-sm text-[#b3b3b3]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <Wordmark size="sm" />
          <p className="text-xs italic text-[#b3b3b3]">Feel what's happening.</p>
          <p className="text-xs text-[#b3b3b3] mt-2">
            PULSE. Built with React 18, Vite, TypeScript & Tailwind CSS.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6 text-xs" aria-label="Footer Navigation">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/events" className="hover:text-white transition-colors">
            All Events
          </Link>
          {import.meta.env.DEV && (
            <Link to="/styleguide" className="hover:text-white transition-colors">
              Styleguide
            </Link>
          )}
        </nav>
      </div>
    </footer>
  );
};
