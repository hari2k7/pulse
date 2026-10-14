import type { FC } from 'react';
import type { EventStatus, RegistrationStatus } from '../../lib/types';

export type StatusBadgeProps =
  | {
      type: 'event';
      status: EventStatus;
      size?: 'sm' | 'md';
      className?: string;
    }
  | {
      type: 'registration';
      status: RegistrationStatus;
      size?: 'sm' | 'md';
      className?: string;
    };

export const StatusBadge: FC<StatusBadgeProps> = (props) => {
  const { size = 'md', className = '' } = props;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  }[size];

  if (props.type === 'event') {
    const config = {
      ACTIVE: {
        label: 'Active',
        container: 'bg-[#0f172a] border border-[#38bdf8]/40 text-[#7dd3fc]',
        dot: 'bg-[#38bdf8]',
      },
      COMPLETED: {
        label: 'Completed',
        container: 'bg-[#1e1e24] border border-white/10 text-[#9ca3af]',
        dot: 'bg-[#9ca3af]',
      },
      CLOSED: {
        label: 'Closed',
        container: 'bg-[#18181b] border border-white/10 text-[#a1a1aa]',
        dot: 'bg-[#71717a]',
      },
    }[props.status];

    return (
      <span
        className={`inline-flex items-center font-medium rounded-[4px] border ${config.container} ${sizeClasses} ${className}`}
        aria-label={`Event status: ${config.label}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
        <span>{config.label}</span>
      </span>
    );
  }

  // Registration Status
  const regConfig = {
    OPEN: {
      label: 'Registration Open',
      container: 'bg-[#064e3b]/80 border border-[#10b981]/50 text-[#6ee7b7]',
      dot: 'bg-[#34d399] animate-pulse',
    },
    CLOSED: {
      label: 'Registration Closed',
      container: 'bg-[#27272a] border border-white/10 text-[#d4d4d8]',
      dot: 'bg-[#71717a]',
    },
    SOLD_OUT: {
      label: 'Sold Out',
      container: 'bg-[#450a0a]/90 border border-[#ef4444]/60 text-[#fca5a5]',
      dot: 'bg-[#ef4444]',
    },
  }[props.status];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-[4px] border ${regConfig.container} ${sizeClasses} ${className}`}
      aria-label={`Registration: ${regConfig.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${regConfig.dot}`} aria-hidden="true" />
      <span>{regConfig.label}</span>
    </span>
  );
};
