import type { FC } from 'react';
import type { ApiErrorKind } from '../../lib/types';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  errorKind?: ApiErrorKind;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: FC<ErrorStateProps> = ({
  title = 'Unable to load content',
  message = 'A network or server error occurred. Please try again.',
  errorKind,
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  const kindBadge = errorKind
    ? {
        network: 'Network Error',
        timeout: 'Connection Timed Out (8s)',
        http: 'Server Unavailable',
        notfound: 'Resource Not Found',
        invalid: 'Invalid Response Data',
      }[errorKind]
    : null;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-[4px] bg-[#1c1c1c] border border-red-500/20 max-w-lg mx-auto my-8 shadow-xl ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-[#e50914] mb-4">
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
            strokeWidth={1.75}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {kindBadge && (
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#e50914] bg-[#e50914]/10 border border-[#e50914]/30 px-2 py-0.5 rounded-[4px] mb-3">
          {kindBadge}
        </span>
      )}

      <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm md:text-base text-[#b3b3b3] max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="primary"
          size="md"
          onClick={onRetry}
          isLoading={isRetrying}
          leftIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        >
          Retry
        </Button>
      )}
    </div>
  );
};
