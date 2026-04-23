import { AnimatePresence, motion } from 'framer-motion';
import { EASE_CINEMATIC } from '../motion/variants';

interface ToastProps {
  visible: boolean;
  message: string;
}

/**
 * Transient notification — ink-2 bg at 95%, gold-3 border at 30%, gold accent
 * bar on the left edge. Per mobile spec §2.3 — no popover framing, no emoji.
 * Scale-up entrance with a soft translate.
 */
export function Toast({ visible, message }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.32, ease: EASE_CINEMATIC as unknown as number[] }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform"
          role="status"
          aria-live="polite"
        >
          <div className="relative overflow-hidden rounded-[14px] border border-gold-3/30 bg-ink-2/95 px-5 py-3.5 pl-6 backdrop-blur-md shadow-gold-glow-soft">
            <span className="absolute left-0 top-0 h-full w-1 brushed-gold-v bg-gradient-to-b from-gold-2 via-gold-4 to-gold-2" />
            <p className="font-body text-[13px] leading-tight text-bone">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
