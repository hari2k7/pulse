import type { FC } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { EmptyState } from '../components/states/EmptyState';

export const EventsPage: FC = () => {
  useDocumentMeta({
    title: 'Events — PULSE',
    description: 'Browse all upcoming tech, design, robotics, and creative events on PULSE.',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-white/10 pb-6 mb-8">
        <h1 className="text-3xl md:text-5xl font-display font-normal tracking-wide text-white">
          DISCOVER EVENTS
        </h1>
        <p className="text-sm md:text-base text-[#b3b3b3] mt-2">
          Filter and explore workshops, competitions, and challenges.
        </p>
      </div>

      <EmptyState
        title="Event Discovery Coming Soon"
        description="The full search, filters, timeline, and grid views will be integrated in the upcoming step."
      />
    </div>
  );
};
