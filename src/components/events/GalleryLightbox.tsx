import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FC,
  type TouchEvent,
  type MouseEvent,
} from 'react';
import { getOptimizedImageUrl } from '../../lib/images';

export interface GalleryLightboxProps {
  images: string[];
  initialIndex: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  triggerButtonId?: string;
}

export const GalleryLightbox: FC<GalleryLightboxProps> = ({
  images,
  initialIndex,
  eventName,
  isOpen,
  onClose,
  triggerButtonId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  if (prevInitialIndex !== initialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
  }

  const [isHighResLoaded, setIsHighResLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prevCurrentIndex, setPrevCurrentIndex] = useState(currentIndex);
  if (prevCurrentIndex !== currentIndex) {
    setPrevCurrentIndex(currentIndex);
    setIsHighResLoaded(false);
    setHasError(false);
  }

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const total = images.length;

  // Preload ONLY the neighboring images (prev and next)
  useEffect(() => {
    if (!isOpen || total <= 1) return;
    const prevIdx = (currentIndex - 1 + total) % total;
    const nextIdx = (currentIndex + 1) % total;

    const imgPrev = new Image();
    imgPrev.src = images[prevIdx];

    const imgNext = new Image();
    imgNext.src = images[nextIdx];
  }, [currentIndex, isOpen, images, total]);

  // Body scroll lock & class for hiding BackToTop
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('lightbox-open');

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('lightbox-open');
    };
  }, [isOpen]);

  // Focus trap and return focus on close
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button initially
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(focusTimer);
      if (triggerButtonId) {
        const triggerEl = document.getElementById(triggerButtonId);
        triggerEl?.focus();
      }
    };
  }, [isOpen, triggerButtonId]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation & trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }

      if (e.key === 'Tab') {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex="0"]'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Touch swipe support (horizontal swipe changes image)
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Trigger only if horizontal move is significant and greater than vertical drift
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    // Only close if clicked directly on the backdrop container, not on controls/image
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || total === 0) return null;

  const currentUrl = images[currentIndex];
  const thumbUrl = getOptimizedImageUrl(currentUrl, 400, 300);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${eventName} gallery`}
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none p-4 sm:p-6"
    >
      {/* Top bar: counter & close button */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between z-20 pointer-events-none">
        <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-[#07060D]/80 border border-white/10 text-xs font-mono font-bold text-[#F3EFE8]">
          {currentIndex + 1} / {total}
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="pointer-events-auto w-11 h-11 flex items-center justify-center rounded-xl bg-[#07060D]/80 border border-white/15 text-[#F3EFE8] hover:text-[#FF7A1A] hover:border-[#FF7A1A]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation: Previous Button */}
      {total > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous image"
          className="absolute left-3 sm:left-6 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-[#07060D]/80 border border-white/15 text-[#F3EFE8] hover:text-[#FF7A1A] hover:border-[#FF7A1A]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Main image viewing stage */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {hasError ? (
          /* Error State Panel */
          <div className="w-[300px] sm:w-[420px] aspect-[4/3] rounded-xl bg-[#0D1020] border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <svg
              className="w-12 h-12 text-[#FF7A1A]/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="font-display font-bold text-base text-[#F3EFE8]">Image unavailable</p>
            <p className="text-xs text-[#8E8A9F]">This photograph could not be loaded from the sanctum archive.</p>
          </div>
        ) : (
          <>
            {/* Spinner-free: Thumbnail preview scaled up while high-res loads */}
            {!isHighResLoaded && (
              <img
                src={thumbUrl}
                alt=""
                aria-hidden="true"
                className="max-w-[90vw] max-h-[85vh] object-contain blur-xs scale-100 transition-opacity duration-200"
              />
            )}

            {/* High-res image */}
            <img
              key={currentUrl}
              src={currentUrl}
              alt={`${eventName} photo ${currentIndex + 1}`}
              onLoad={() => setIsHighResLoaded(true)}
              onError={() => setHasError(true)}
              className={`max-w-[90vw] max-h-[85vh] object-contain transition-opacity duration-200 motion-reduce:transition-none ${
                isHighResLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0 m-auto'
              }`}
            />
          </>
        )}
      </div>

      {/* Navigation: Next Button */}
      {total > 1 && (
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next image"
          className="absolute right-3 sm:right-6 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-[#07060D]/80 border border-white/15 text-[#F3EFE8] hover:text-[#FF7A1A] hover:border-[#FF7A1A]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};
