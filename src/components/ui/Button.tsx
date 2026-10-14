import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-[4px] cursor-pointer transition-transform duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e50914] focus-visible:ring-offset-[#141414] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none disabled:transform-none select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-6 py-3 gap-2.5 h-12',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#e50914] text-white hover:bg-[#f40612] hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-[#e50914]/20',
    secondary:
      'bg-[#2f2f2f] text-white hover:bg-[#3f3f3f] hover:-translate-y-0.5 active:translate-y-0',
    outline:
      'border border-white/30 text-white hover:border-white hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0',
    ghost:
      'bg-transparent text-white/80 hover:text-white hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0',
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span
          className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
