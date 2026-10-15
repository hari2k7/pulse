import type { FC } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner: FC = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-[#1A1030] border-b border-[#FF7A1A]/40 px-4 py-2 text-center text-xs text-[#F5B642] flex items-center justify-center gap-2 z-40"
    >
      <span className="w-2 h-2 rounded-full bg-[#FF7A1A] animate-pulse" />
      <span>
        Temporal connection severed. You are offline — displaying cached multiverse coordinates.
      </span>
    </div>
  );
};
