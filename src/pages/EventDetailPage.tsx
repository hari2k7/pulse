import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { EmptyState } from '../components/states/EmptyState';

export const EventDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();

  useDocumentMeta({
    title: `Event Detail — PULSE`,
    description: `Detailed schedule, prizes, rules, and overview for event ${id}.`,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <EmptyState
        title={`Event Detail (${id})`}
        description="Event detail view with banner, schedule, FAQ tabs, and prizes will be rendered here."
      />
    </div>
  );
};
