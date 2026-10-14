import type { FC, ReactNode } from 'react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  title = 'No events found',
  description = 'Try adjusting your search criteria or resetting filters to see available events.',
  action,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-[4px] bg-[#181818]/60 border border-white/5 max-w-xl mx-auto my-8 ${className}`}
      role="status"
    >
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#b3b3b3] mb-4">
        {icon ?? (
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm md:text-base text-[#b3b3b3] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
