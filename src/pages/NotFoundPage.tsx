import type { FC } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { NotFound } from '../components/states/NotFound';

export const NotFoundPage: FC = () => {
  useDocumentMeta({
    title: '404 Not Found — PULSE',
    description: 'The requested page could not be found.',
  });

  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <NotFound />
    </div>
  );
};
