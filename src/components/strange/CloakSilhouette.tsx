import type { FC } from 'react';

export interface CloakSilhouetteProps {
  className?: string;
  variant?: 'silhouette' | 'divider';
}

/**
 * Cloak of Levitation Motif
 * Original flowing crimson vector silhouette for hero atmospheric background
 * or section transition sweep.
 */
export const CloakSilhouette: FC<CloakSilhouetteProps> = ({
  className = '',
  variant = 'silhouette',
}) => {
  if (variant === 'divider') {
    return (
      <div className={`w-full overflow-hidden leading-none select-none pointer-events-none ${className}`} aria-hidden="true">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 sm:h-16 md:h-20"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C320,90 640,110 960,60 C1200,20 1360,80 1440,100 L1440,120 L0,120 Z"
            fill="url(#cloak-divider-grad)"
          />
          <path
            d="M0,40 C360,110 720,80 1080,90 C1260,95 1380,50 1440,40 L1440,120 L0,120 Z"
            fill="#07060D"
            fillOpacity="0.8"
          />
          <defs>
            <linearGradient id="cloak-divider-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8102E" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#800010" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#07060D" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-20 filter blur-[1px]"
      >
        <defs>
          <linearGradient id="cloak-grad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#C8102E" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#8A081C" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#07060D" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* High collar & sweeping dynamic folds */}
        <path
          d="M 280 50 C 310 30 350 40 370 70 C 350 120 320 160 300 200 C 270 260 220 350 160 480 C 130 550 90 620 40 680 C 120 650 220 620 300 640 C 380 660 460 670 540 650 C 470 520 440 380 430 250 C 425 180 410 100 380 50 Z"
          fill="url(#cloak-grad)"
        />
        <path
          d="M 270 90 C 250 140 220 220 190 320 C 170 390 140 480 100 560 C 180 520 280 500 360 520 C 320 410 300 300 290 200 Z"
          fill="#C8102E"
          fillOpacity="0.15"
        />
      </svg>
    </div>
  );
};
