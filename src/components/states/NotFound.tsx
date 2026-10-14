import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export interface NotFoundProps {
  title?: string;
  message?: string;
  className?: string;
}

export const NotFound: FC<NotFoundProps> = ({
  title = 'Dimension Lost in the Multiverse',
  message = "The reality coordinate you are attempting to traverse does not exist or has collapsed into another timeline.",
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 max-w-lg mx-auto ${className}`}
      role="status"
    >
      <span className="font-display font-bold text-7xl md:text-9xl text-[#FF7A1A]/15 tracking-widest select-none leading-none mb-2">
        404
      </span>
      <h1 className="text-2xl md:text-3xl font-display font-bold text-[#F3EFE8] mb-3">{title}</h1>
      <p className="text-sm md:text-base text-[#B8B3C7] mb-8 leading-relaxed max-w-md">
        {message}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/">
          <Button variant="primary" size="md">
            Return to Sanctum
          </Button>
        </Link>
        <Link to="/events">
          <Button variant="secondary" size="md">
            Multiverse Events
          </Button>
        </Link>
      </div>
    </div>
  );
};
