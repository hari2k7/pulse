import { Component, useState, useCallback, type ReactNode, type ErrorInfo, type FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../../lib/api';
import type { ApiErrorKind } from '../../lib/types';
import { Button } from '../ui/Button';

interface InnerProps {
  children: ReactNode;
  locationKey: string;
}

interface InnerState {
  hasError: boolean;
  error: Error | null;
}

const KIND_MESSAGES: Record<ApiErrorKind, { title: string; message: string; badge: string }> = {
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
    title: 'Multiverse Server Disruption',
    message: 'The upstream server encountered a temporal disruption (5xx). Please try again in a few moments.',
    badge: 'Server Error (5xx)',
  },
  ratelimit: {
    title: 'Too Many Requests',
    message: 'Temporal rate limit reached (429). The portal is resting briefly before accepting new requests.',
    badge: 'Rate Limited (429)',
  },
  invalid: {
    title: 'Malformed Response Data',
    message: 'The received coordinates could not be validated. Please try reloading.',
    badge: 'Invalid Format',
  },
  notfound: {
    title: 'Event Not Found',
    message: 'The requested multiverse event does not exist or has been shifted to another reality.',
    badge: 'Not Found (404)',
  },
  circuit_open: {
    title: 'Circuit Breaker Active',
    message: 'Repeated connection failures detected. Temporarily pausing requests for 15s to protect bandwidth.',
    badge: 'Circuit Open (15s)',
  },
};

const RouteFallbackUI: FC<{
  error: Error | null;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  const [retrying, setRetrying] = useState(false);

  const apiError = error instanceof ApiError ? error : null;
  const kind = apiError?.kind;
  const copy = kind ? KIND_MESSAGES[kind] : null;

  const title = copy?.title ?? 'Multiverse Route Disrupted';
  const message =
    copy?.message ??
    error?.message ??
    'A temporal disturbance occurred while materializing this coordinate. The rest of the Sanctum remains stable.';
  const badge = copy?.badge ?? 'Reality Disruption';

  const handleRetry = useCallback(() => {
    if (retrying) return;
    setRetrying(true);
    onRetry();
    setTimeout(() => {
      setRetrying(false);
    }, 800);
  }, [retrying, onRetry]);

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-[#07060D] text-[#F3EFE8]">
      <div
        role="alert"
        aria-live="polite"
        className="w-full max-w-lg p-8 sm:p-10 rounded-[4px] bg-[#0D1020] border border-[#FF7A1A]/30 text-center shadow-2xl space-y-6"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 flex items-center justify-center text-[#FF7A1A]">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <span className="inline-block text-[11px] font-mono uppercase tracking-wider text-[#F5B642] bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 px-2.5 py-0.5 rounded-[4px]">
            {badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#F3EFE8]">
            {title}
          </h1>
          <p className="text-sm text-[#B8B3C7] leading-relaxed max-w-md mx-auto pt-1">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleRetry}
            disabled={retrying}
            isLoading={retrying}
            className="w-full sm:w-auto"
          >
            Retry Portal
          </Button>
          <Link
            to="/events"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#F3EFE8] bg-[#1A1030] hover:bg-white/10 border border-white/15 rounded-[4px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </div>
  );
};

class InnerErrorBoundary extends Component<InnerProps, InnerState> {
  constructor(props: InnerProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): InnerState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[RouteErrorBoundary caught error]:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: InnerProps): void {
    // Automatically reset when location changes so navbar navigation clears error
    if (prevProps.locationKey !== this.props.locationKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <RouteFallbackUI error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

/**
 * Route-level Error Boundary with themed Doctor Strange fallback.
 * Renders inside Layout main landmark so the Navbar stays fully accessible and usable.
 * Offers debounced Retry and a direct link to /events.
 */
export const RouteErrorBoundary: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <InnerErrorBoundary locationKey={location.key || location.pathname}>
      {children}
    </InnerErrorBoundary>
  );
};
