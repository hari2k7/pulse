import { useEffect, useRef, type FC, type ReactNode, type RefObject } from 'react';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}

export const FilterDrawer: FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Escape key listener & focus restore
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, triggerRef]);

  // Initial focus management
  useEffect(() => {
    if (isOpen) {
      // Focus close button on open
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Focus trap inside drawer
  const handleTrapKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;

    const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  const handleClose = () => {
    onClose();
    triggerRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="presentation"
      onKeyDown={handleTrapKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
        className="relative w-full max-w-xs sm:max-w-sm h-full bg-[#181818] border-l border-white/10 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 id="filter-drawer-title" className="text-base font-bold text-white uppercase tracking-wider">
            Filter & Refine
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Close filters drawer"
            className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/80">
          <button
            type="button"
            onClick={handleClose}
            className="w-full bg-[#e50914] hover:bg-[#f40612] text-white font-semibold py-2.5 px-4 rounded-[4px] text-sm uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
