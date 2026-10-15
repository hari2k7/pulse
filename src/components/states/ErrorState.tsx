import { useState, useCallback, type FC } from 'react';
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

const DEFAULT_ERROR_COPY: Record<ApiErrorKind, { title: string; message: string; badge: string }> = {
  timeout: {
    title: 'Connection Timed Out',
    message: 'The multiverse coordinates took longer than 8 seconds to respond. Check your connection and try again.',
    badge: 'Timeout (8s)',
  },
  network: {
    title: 'Network Connection Failed',
    message: 'Unable to reach the events service. Please verify your internet connection or try again shortly.',
    badge: 'Network Error',
  },
  offline: {
    title: 'You Are Currently Offline',
    message: 'Your temporal connection is severed. Showing cached coordinates until connection restores.',
    badge: 'Offline Mode',
  },
  http: {
    title: 'Multiverse Server Error',
    message: 'The upstream server encountered a temporal disruption (5xx). Please try again in a few moments.',
    badge: 'Server Error',
  },
  ratelimit: {
    title: 'Too Many Requests',
    message: 'Rate limit exceeded (429). The portal is resting briefly before accepting new requests.',
    badge: 'Rate Limited (429)',
  },
  invalid: {
    title: 'Malformed Response Data',
    message: 'The received coordinates could not be validated. Please try reloading.',
    badge: 'Invalid Format',
  },
  notfound: {
    title: 'Event Not Found',
    message: 'The specified multiverse event does not exist or has been shifted to another reality.',
    badge: 'Not Found (404)',
  },
  circuit_open: {
    title: 'Circuit Breaker Active',
    message: 'Repeated connection failures detected. Temporarily pausing requests for 15s to protect bandwidth.',
    badge: 'Circuit Open (15s)',
  },
};

export const ErrorState: FC<ErrorStateProps> = ({
  title,
  message,
  errorKind,
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  const [retrying, setRetrying] = useState(false);

  const copy = errorKind ? DEFAULT_ERROR_COPY[errorKind] : null;
  const displayTitle = title || copy?.title || 'Unable to load content';
  const displayMessage =
    message || copy?.message || 'A network or server error occurred. Please try again.';
  const displayBadge = copy?.badge;

  const handleRetry = useCallback(() => {
    if (retrying || isRetrying || !onRetry) return;
    setRetrying(true);
    onRetry();
    setTimeout(() => {
      setRetrying(false);
    }, 800);
  }, [retrying, isRetrying, onRetry]);

  const busy = retrying || isRetrying;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-[4px] bg-[#0D1020] border border-[#FF7A1A]/30 max-w-lg mx-auto my-8 shadow-2xl ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="w-16 h-16 rounded-full bg-[#FF7A1A]/10 flex items-center justify-center text-[#FF7A1A] mb-4">
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

      {displayBadge && (
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#F5B642] bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 px-2.5 py-0.5 rounded-[4px] mb-3">
          {displayBadge}
        </span>
      )}

      <h2 className="text-xl md:text-2xl font-display font-bold text-[#F3EFE8] mb-2">
        {displayTitle}
      </h2>
      <p className="text-sm md:text-base text-[#B8B3C7] max-w-md mb-6 leading-relaxed">
        {displayMessage}
      </p>

      {onRetry && (
        <Button
          variant="primary"
          size="md"
          onClick={handleRetry}
          disabled={busy}
          isLoading={busy}
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
