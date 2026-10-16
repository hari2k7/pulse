import { useEffect, useRef, type FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FESTIVAL_CONFIG } from '../../config/festival';

export interface RegistrationNoticeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventName?: string;
  registrationStatus?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const RegistrationNoticeDialog: FC<RegistrationNoticeDialogProps> = ({
  isOpen,
  onClose,
  eventName,
  registrationStatus,
  triggerRef,
}) => {
  const location = useLocation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Capture triggering active element on open and restore on close
  useEffect(() => {
    if (isOpen) {
      lastActiveElementRef.current = (document.activeElement as HTMLElement) || null;
      // Focus the primary "Got it" button
      const timer = setTimeout(() => {
        primaryButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (lastActiveElementRef.current) {
      // Return focus to trigger
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else {
        lastActiveElementRef.current.focus();
      }
    }
  }, [isOpen, triggerRef]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Escape key and Tab focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contactEmail = FESTIVAL_CONFIG.contactEmail?.trim();
  const isOnEventsPage = location.pathname === '/events';

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-dialog-title"
        aria-describedby="reg-dialog-desc"
        className="w-full max-w-md bg-[#0D1020] border border-[#FF7A1A]/40 rounded-xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.85)] text-[#F3EFE8] space-y-5 motion-safe:transition-all motion-reduce:transition-opacity motion-reduce:transform-none select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="space-y-1.5 border-b border-white/10 pb-4">
          <h2
            id="reg-dialog-title"
            className="text-xl sm:text-2xl font-display font-bold text-[#F3EFE8] tracking-wide"
          >
            Registration is not available here
          </h2>
        </div>

        {/* Dialog Body */}
        <div id="reg-dialog-desc" className="text-sm text-[#B8B3C7] space-y-3 leading-relaxed">
          <p className="m-0">
            You can&apos;t register for events on this website. STRANGE is a showcase of the festival&apos;s events, so there is no sign-up or payment here.
          </p>

          {eventName && registrationStatus && (
            <p className="m-0 text-[#F3EFE8] font-medium border-l-2 border-[#FF7A1A] pl-3 py-0.5">
              {eventName}: {registrationStatus}.
            </p>
          )}

          {contactEmail && (
            <p className="m-0 text-xs text-[#B8B3C7]/90">
              For registration help, contact {contactEmail}.
            </p>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
          {!isOnEventsPage && (
            <Link
              to="/events"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-md text-xs font-semibold text-[#F5B642] hover:text-[#FF7A1A] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
            >
              Browse other events
            </Link>
          )}

          <button
            ref={primaryButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-[#FF7A1A] text-[#07060D] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#F5B642] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B642] active:scale-95 shadow-md cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
