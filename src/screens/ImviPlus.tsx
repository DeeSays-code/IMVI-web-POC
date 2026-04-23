import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Megaphone,
  Settings,
  MapPin,
  BellRing,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { digitalWorkers, type DigitalWorker } from '../mock/data';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { EASE_CINEMATIC, fadeRise, staggerContainer } from '../motion/variants';

const ICONS: Record<DigitalWorker['icon'], LucideIcon> = {
  sales: Briefcase,
  marketing: Megaphone,
  ops: Settings,
  venue: MapPin,
};

export function ImviPlus() {
  const [open, setOpen] = useState<DigitalWorker | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const pushToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2600);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* gold floor-fade signature */}
      <div
        className="pointer-events-none fixed bottom-0 left-sidebar right-0 h-[55vh]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.24) 0%, rgba(139, 106, 47, 0.07) 40%, transparent 75%)',
        }}
      />
      {/* subtle gold ceiling glow */}
      <div
        className="pointer-events-none fixed top-16 left-sidebar right-0 h-[30vh]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201, 162, 78, 0.1) 0%, transparent 60%)',
        }}
      />
      {/* grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(rgba(201, 162, 78, 0.04) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      <div className="relative mx-auto max-w-content px-8 pb-24 pt-12">
        {/* header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
          className="flex flex-col"
        >
          <p className="brushed-gold-text font-display text-[16px] font-bold uppercase tracking-[0.32em]">
            IMVI+
          </p>
          <h1 className="mt-4 font-display text-[48px] font-bold leading-none tracking-[0.01em] text-bone">
            Digital Workers
          </h1>
          <p className="mt-5 max-w-[640px] font-body text-[15px] font-light leading-relaxed text-bone-muted">
            AI agents that run parts of your operation — sales outreach, marketing content,
            roster logistics, venue AR. Arriving later in 2026.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-[1px] w-20 bg-gradient-to-r from-gold-3/70 to-transparent" />
            <span className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted/70">
              4 agents on the roadmap
            </span>
          </div>
        </motion.header>

        {/* tiles */}
        <motion.div
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          animate="visible"
          className="mt-14 grid grid-cols-2 gap-6"
        >
          {digitalWorkers.map((worker) => (
            <AgentTile
              key={worker.id}
              worker={worker}
              onOpen={() => setOpen(worker)}
            />
          ))}
        </motion.div>

        {/* footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 font-display text-[10px] font-medium uppercase tracking-label-xl text-bone-muted/50"
        >
          Roadmap · not yet available in POC
        </motion.p>
      </div>

      {/* detail modal */}
      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        eyebrow={open ? `IMVI+ · ${open.shortName}` : undefined}
        title={open?.name}
        width={560}
      >
        {open && (
          <AgentModalBody
            worker={open}
            onNotify={() => {
              pushToast(`You'll be notified when ${open.name} ships.`);
              setOpen(null);
            }}
            onClose={() => setOpen(null)}
          />
        )}
      </Modal>

      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function AgentTile({
  worker,
  onOpen,
}: {
  worker: DigitalWorker;
  onOpen: () => void;
}) {
  const Icon = ICONS[worker.icon];
  return (
    <motion.button
      variants={fadeRise}
      type="button"
      onClick={onOpen}
      className="ink-card group relative flex min-h-[280px] flex-col items-start overflow-hidden rounded-[18px] border border-bone-muted/10 p-7 text-left transition-all duration-300 ease-cinematic hover:-translate-y-0.5 hover:border-gold-3/50 hover:shadow-gold-glow-soft"
    >
      {/* brushed-gold top accent bar — spec §4.11 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-80 transition-opacity group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(110deg, #5C4620 0%, #8B6A2F 20%, #C9A24E 40%, #F0D286 50%, #C9A24E 60%, #8B6A2F 80%, #5C4620 100%)',
        }}
      />
      {/* hover wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 100% 0%, rgba(201, 162, 78, 0.12) 0%, transparent 55%)',
        }}
      />

      <div className="relative flex w-full items-start justify-between">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-gold-3/40 bg-gold-3/5 transition-colors group-hover:border-gold-3/70 group-hover:bg-gold-3/10"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(10,10,10,0.4)' }}
        >
          <Icon size={24} strokeWidth={1.6} className="text-gold-3 transition-colors group-hover:text-gold-4" />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-gold-3/40 bg-gold-3/10 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-label-md text-gold-4">
          <Sparkles size={10} strokeWidth={2.2} />
          Coming soon
        </span>
      </div>

      <div className="relative mt-auto pt-8">
        <h2 className="font-display text-[24px] font-bold leading-tight tracking-[0.01em] text-bone">
          {worker.name}
        </h2>
        <p className="mt-3 max-w-[340px] font-body text-[13px] font-light leading-relaxed text-bone-muted">
          {worker.description}
        </p>
        <p className="mt-4 font-display text-[10px] font-medium uppercase tracking-label-lg text-gold-3">
          Target · {worker.eta}
        </p>
      </div>
    </motion.button>
  );
}

function AgentModalBody({
  worker,
  onNotify,
  onClose,
}: {
  worker: DigitalWorker;
  onNotify: () => void;
  onClose: () => void;
}) {
  const Icon = ICONS[worker.icon];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] border border-gold-3/40 bg-gold-3/10"
        >
          <Icon size={24} strokeWidth={1.6} className="text-gold-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[11px] font-medium uppercase tracking-label-lg text-gold-3">
            Digital Worker · {worker.shortName}
          </p>
          <p className="mt-1 font-display text-[13px] font-medium tracking-data-tight text-bone">
            Target release · {worker.eta}
          </p>
        </div>
      </div>

      <p className="font-body text-[14px] font-light leading-relaxed text-bone">
        {worker.description}
      </p>

      <div className="rounded-[10px] border border-bone-muted/10 bg-ink-3/40 px-4 py-3">
        <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
          Status
        </p>
        <p className="mt-1 font-body text-[13px] font-light text-bone-muted">
          On the roadmap. Not yet available — click "Notify me" and we'll email when it ships.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-[8px] border border-bone-muted/20 bg-ink-2 px-4 font-display text-[11px] font-semibold uppercase tracking-label-md text-bone transition-colors hover:border-bone-muted/40"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onNotify}
          className="specular-sweep relative flex h-11 items-center gap-2 overflow-hidden rounded-[8px] bg-brushed-gold px-5 font-display text-[11px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px]"
        >
          <BellRing size={13} strokeWidth={2.2} className="relative z-[2]" />
          <span className="relative z-[2]">Notify me</span>
        </button>
      </div>
    </div>
  );
}
