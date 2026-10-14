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
    'inline-flex items-center justify-center font-semibold rounded-md cursor-pointer transition-all duration-200 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-[#07060D] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none disabled:transform-none select-none';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4.5 py-2 gap-2 h-10',
    lg: 'text-base px-6 py-3 gap-2.5 h-12',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#FF7A1A] to-[#F5B642] text-[#07060D] hover:from-[#f06f13] hover:to-[#e5a835] hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-[#FF7A1A]/25 hover:shadow-[#FF7A1A]/45',
    secondary:
      'bg-[#1A1030] border border-[#FF7A1A]/30 text-[#F3EFE8] hover:bg-[#251745] hover:border-[#FF7A1A]/60 hover:-translate-y-0.5 active:translate-y-0',
    outline:
      'border border-[#F5B642]/40 text-[#F3EFE8] hover:border-[#F5B642] hover:bg-[#F5B642]/10 hover:-translate-y-0.5 active:translate-y-0',
    ghost:
      'bg-transparent text-[#B8B3C7] hover:text-[#F3EFE8] hover:bg-[#1A1030]/60 hover:-translate-y-0.5 active:translate-y-0',
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
          className="inline-block w-4 h-4 border-2 border-[#07060D]/30 border-t-[#07060D] rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
