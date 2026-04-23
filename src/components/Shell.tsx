import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { EASE_STANDARD } from '../motion/variants';

/**
 * Authenticated Shell — persistent sidebar + topbar, route-swapped content.
 * 220ms horizontal fade between routes (web spec §2.2) — not vertical stacks.
 */
export function Shell() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-ink text-bone">
      <Sidebar />
      <Topbar />
      <main
        className="ml-sidebar min-h-screen overflow-x-hidden pt-0"
        style={{ background: '#0A0A0A' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_STANDARD as unknown as number[] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
