import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export interface NotFoundProps {
  title?: string;
  message?: string;
  className?: string;
}

export const NotFound: FC<NotFoundProps> = ({
  title = 'Page Not Found',
  message = "The event or page you are looking for doesn't exist, has been moved, or is no longer accessible.",
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 max-w-lg mx-auto ${className}`}
      role="status"
    >
      <span className="font-display font-normal text-7xl md:text-9xl text-white/10 tracking-widest select-none leading-none mb-2">
        404
      </span>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h1>
      <p className="text-sm md:text-base text-[#b3b3b3] mb-8 leading-relaxed max-w-md">
        {message}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/">
          <Button variant="primary" size="md">
            Go to Home
          </Button>
        </Link>
        <Link to="/events">
          <Button variant="secondary" size="md">
            Explore Events
          </Button>
        </Link>
      </div>
    </div>
  );
};
