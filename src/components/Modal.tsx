import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE_CINEMATIC, EASE_STANDARD } from '../motion/variants';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  /** Visual variant — default uses brushed-gold border, destructive uses live-red. */
  variant?: 'default' | 'destructive';
  /** Max width in px. Spec §2.3 lists 480–640 for modals. */
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Center-screen Modal — shared chrome per web spec §2.3.
 * Default variant: gold-3 border + gold radial wash.
 * Destructive variant: live-red border + red wash.
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  variant = 'default',
  width = 560,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const borderColor =
    variant === 'destructive' ? 'border-live-red/40' : 'border-gold-3/30';
  const washColor =
    variant === 'destructive'
      ? 'radial-gradient(ellipse at 0% 0%, rgba(229, 57, 53, 0.12) 0%, transparent 60%)'
      : 'radial-gradient(ellipse at 0% 0%, rgba(201, 162, 78, 0.14) 0%, transparent 60%)';
  const eyebrowColor = variant === 'destructive' ? 'text-live-red' : 'text-gold-3';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE_STANDARD as unknown as number[] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.28, ease: EASE_CINEMATIC as unknown as number[] }}
            onClick={(e) => e.stopPropagation()}
            className={`ink-card relative flex w-full flex-col overflow-hidden rounded-[14px] border ${borderColor} shadow-card-depth`}
            style={{ maxWidth: width }}
          >
            {/* corner wash */}
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{ background: washColor }}
            />

            {/* header */}
            {(title || eyebrow) && (
              <header className="relative flex items-start justify-between gap-4 border-b border-bone-muted/8 px-7 py-5">
                <div className="min-w-0 flex-1">
                  {eyebrow && (
                    <p className={`font-display text-[10px] font-medium uppercase tracking-label-xl ${eyebrowColor}`}>
                      {eyebrow}
                    </p>
                  )}
                  {title && (
                    <h2 className="mt-1.5 font-display text-[22px] font-bold leading-tight tracking-[0.01em] text-bone">
                      {title}
                    </h2>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-bone-muted transition-colors hover:bg-ink-3 hover:text-bone"
                >
                  <X size={16} strokeWidth={1.8} />
                </button>
              </header>
            )}

            {/* body */}
            <div className="relative flex-1 px-7 py-6">{children}</div>

            {/* footer */}
            {footer && (
              <footer className="relative border-t border-bone-muted/8 px-7 py-4">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
