import type { FC, HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'default' | 'accent' | 'muted' | 'outline' | 'surface';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
}

export const Badge: FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center font-semibold uppercase tracking-wider rounded-[4px] select-none';

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
  }[size];

  const variantClasses = {
    default: 'bg-[#2a2a2a] text-[#ffffff] border border-white/10',
    surface: 'bg-[#181818] text-[#e5e5e5] border border-white/5',
    accent: 'bg-[#e50914] text-[#ffffff]',
    muted: 'bg-[#222222] text-[#b3b3b3]',
    outline: 'border border-white/25 text-[#ffffff] bg-black/40',
  }[variant];

  return (
    <span className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} {...rest}>
      {icon}
      <span>{children}</span>
    </span>
  );
};
