import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE_CINEMATIC, EASE_STANDARD } from '../motion/variants';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Header label rendered at top-left of the drawer. */
  title?: string;
  /** Small eyebrow above the title — usually category or context. */
  eyebrow?: string;
  /** Width in px. Default 440 per spec §2.3 (400–480). */
  width?: number;
  children: React.ReactNode;
  /** Footer content — pinned to bottom of drawer. */
  footer?: React.ReactNode;
}

/**
 * Right-slide Drawer — shared chrome per web spec §2.3. Slides in at 280ms
 * cinematic ease, backdrop fades at 220ms standard. Closes on backdrop click
 * or Escape key.
 */
export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  width = 440,
  children,
  footer,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="drawer-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_STANDARD as unknown as number[] }}
            className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            key="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: width + 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: width + 40, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE_CINEMATIC as unknown as number[] }}
            className="fixed right-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-l border-bone-muted/10 bg-ink-2 shadow-card-depth"
            style={{ width }}
          >
            {/* header */}
            <header className="flex items-start justify-between gap-4 border-b border-bone-muted/8 px-6 py-5">
              <div className="min-w-0 flex-1">
                {eyebrow && (
                  <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
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

            {/* body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {/* footer */}
            {footer && (
              <footer className="border-t border-bone-muted/8 px-6 py-4">{footer}</footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
