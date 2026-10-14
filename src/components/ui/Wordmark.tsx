import type { FC } from 'react';
import { Link } from 'react-router-dom';

export interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  asLink?: boolean;
  className?: string;
}

export const Wordmark: FC<WordmarkProps> = ({
  size = 'md',
  asLink = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xl tracking-wider',
    md: 'text-2xl tracking-widest',
    lg: 'text-3xl tracking-widest',
    xl: 'text-4xl md:text-5xl tracking-widest',
  }[size];

  const content = (
    <span
      className={`font-display font-normal uppercase select-none inline-flex items-center leading-none ${sizeClasses} ${className}`}
      aria-label="PULSE"
    >
      <span className="text-accent text-[#e50914]">P</span>
      <span className="text-white">ULSE</span>
    </span>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className="inline-flex items-center transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        aria-label="PULSE Home"
      >
        {content}
      </Link>
    );
  }

  return content;
};
