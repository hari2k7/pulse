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
  const { className = '' } = props;

  // Small, plain, slightly squared tag (radius 4px, 1px border, no blur), compact padding,
  // sentence case text, semibold 12px body font (not monospace, not uppercase, no letter-spacing).
  // No dots, no pulse, no glow, no gradient, no animation.
  const baseClasses =
    'inline-flex items-center text-[12px] font-semibold leading-normal font-sans normal-case tracking-normal rounded-[4px] border px-2 py-0.5 select-none';

  if (props.type === 'event') {
    const config = {
      ACTIVE: {
        label: 'Active',
        styles: 'bg-[#0A1424] text-[#60A5FA] border-[#1E3A5F]',
      },
      COMPLETED: {
        label: 'Completed',
        styles: 'bg-[#141416] text-[#9CA3AF] border-[#2E2E34]',
      },
      CLOSED: {
        label: 'Closed',
        styles: 'bg-[#141416] text-[#9CA3AF] border-[#2E2E34]',
      },
    }[props.status];

    return (
      <span
        className={`${baseClasses} ${config.styles} ${className}`}
        aria-label={`Event status: ${config.label}`}
      >
        {config.label}
      </span>
    );
  }

  // Registration Status
  const regConfig = {
    OPEN: {
      label: 'Registration open',
      styles: 'bg-[#0A1A12] text-[#4ADE80] border-[#1B4D35]',
    },
    CLOSED: {
      label: 'Registration closed',
      styles: 'bg-[#141416] text-[#9CA3AF] border-[#2E2E34]',
    },
    SOLD_OUT: {
      label: 'Sold out',
      styles: 'bg-[#1E0B0D] text-[#F87171] border-[#552026]',
    },
  }[props.status];

  return (
    <span
      className={`${baseClasses} ${regConfig.styles} ${className}`}
      aria-label={`Registration: ${regConfig.label}`}
    >
      {regConfig.label}
    </span>
  );
};
