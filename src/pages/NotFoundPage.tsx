import type { FC } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { NotFound } from '../components/states/NotFound';

export const NotFoundPage: FC = () => {
  useDocumentMeta({
    title: '404 Not Found — STRANGE',
    description: 'This dimensional coordinate does not exist in our reality.',
  });

  return (
    <div className="flex-1 flex items-center justify-center pt-[calc(var(--navbar-height)+32px)] md:pt-[calc(var(--navbar-height)+48px)] pb-16">
      <NotFound />
    </div>
  );
};
