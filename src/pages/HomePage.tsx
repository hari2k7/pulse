import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Button } from '../components/ui/Button';

export const HomePage: FC = () => {
  useDocumentMeta({
    title: 'PULSE — Discover events',
    description:
      "Feel what's happening. Find workshops, competitions and festivals happening near you. Search, filter and save the events you love.",
  });

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 max-w-4xl mx-auto">
      <h1 className="text-5xl sm:text-7xl font-display font-normal tracking-wide text-white leading-none mb-6">
        FEEL WHAT'S <span className="text-[#e50914]">HAPPENING.</span>
      </h1>
      <p className="text-xl sm:text-2xl text-[#b3b3b3] max-w-2xl mb-10 leading-relaxed font-body">
        Feel what's happening.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/events">
          <Button variant="primary" size="lg">
            Explore Events
          </Button>
        </Link>
        {import.meta.env.DEV && (
          <Link to="/styleguide">
            <Button variant="secondary" size="lg">
              View Styleguide
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
