import type { FC, KeyboardEvent, ReactNode } from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onToggle: () => void;
  count?: number;
  icon?: ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Chip: FC<ChipProps> = ({
  label,
  selected = false,
  onToggle,
  count,
  icon,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle();
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 h-7',
    md: 'text-sm px-3.5 py-1.5 gap-2 h-9',
  }[size];

  const stateClasses = selected
    ? 'bg-[#e50914] text-white border-[#e50914] shadow-sm shadow-[#e50914]/30'
    : 'bg-[#1e1e1e] text-[#b3b3b3] border-white/10 hover:bg-[#2f2f2f] hover:text-white';

  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center font-medium rounded-full border transition-all duration-150 ease-out cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses} ${stateClasses} ${className}`}
    >
      {icon}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
            selected ? 'bg-black/30 text-white' : 'bg-white/10 text-white/70'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
