import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, RefreshCw, Filter, X, ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  athleteById,
  teamById,
  type QueueGroup,
} from '../mock/data';
import { useAppState } from '../state/AppState';
import { StatusPill } from '../components/StatusPill';
import { ComposedCardPreview } from '../components/ComposedCardPreview';
import { TeamMonogram } from '../components/icons/TeamMonogram';
import { QueueStatusIcon } from '../components/icons/QueueStatusIcon';
import { Toast } from '../components/Toast';
import {
  EASE_CINEMATIC,
  EASE_STANDARD,
  staggerContainer,
  fadeRise,
} from '../motion/variants';

export function ReviewQueue() {
  const { reviewQueue } = useAppState();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    reviewQueue[0] ? { [reviewQueue[0].id]: true } : {},
  );
  const [detail, setDetail] = useState<{ groupId: string; itemId: string } | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const [approvedGroups, setApprovedGroups] = useState<string[]>([]);

  const visibleGroups = useMemo(
    () => reviewQueue.filter((g) => !approvedGroups.includes(g.id)),
    [reviewQueue, approvedGroups],
  );

  const totalQueueItems = useMemo(
    () => reviewQueue.reduce((acc, g) => acc + g.items.length, 0),
    [reviewQueue],
  );

  const visibleTotal = useMemo(
    () => visibleGroups.reduce((acc, g) => acc + g.items.length, 0),
    [visibleGroups],
  );

  const toggle = (id: string) =>
    setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const pushToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  };

  const approveGroup = (g: QueueGroup) => {
    const team = teamById(g.teamId);
    setApprovedGroups((list) => [...list, g.id]);
    pushToast(`Approved ${g.items.length} cards · ${team?.name ?? 'Team'} sent to print`);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div className="relative mx-auto max-w-content px-8 pb-24 pt-12">
        {/* header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
          className="flex items-end justify-between gap-8"
        >
          <div>
            <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
              Operational
            </p>
            <h1 className="mt-3 font-display text-[40px] font-bold leading-tight tracking-[0.01em] text-bone">
              Review Queue
            </h1>
            <p className="mt-3 font-body text-[14px] font-light text-bone-muted">
              {visibleTotal} {visibleTotal === 1 ? 'card' : 'cards'} pending across {visibleGroups.length}{' '}
              {visibleGroups.length === 1 ? 'team' : 'teams'}
              {visibleTotal !== totalQueueItems && (
                <span className="ml-2 font-display text-[11px] uppercase tracking-label-md text-gold-3">
                  · {totalQueueItems - visibleTotal} approved this session
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-[8px] border border-bone-muted/15 bg-ink-2 px-3 font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted transition-colors hover:border-bone-muted/30 hover:text-bone"
            >
              <Filter size={14} strokeWidth={1.6} />
              <span>All</span>
              <ChevronDown size={12} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-bone-muted/15 bg-ink-2 text-bone-muted transition-colors hover:border-bone-muted/30 hover:text-bone"
              aria-label="Refresh"
              onClick={() => pushToast('Queue refreshed')}
            >
              <RefreshCw size={14} strokeWidth={1.6} />
            </button>
          </div>
        </motion.header>

        {/* groups */}
        <motion.div
          variants={staggerContainer(0.08, 0.2)}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col gap-4"
        >
          <AnimatePresence initial={false}>
            {visibleGroups.map((group) => (
              <QueueGroupCard
                key={group.id}
                group={group}
                expanded={!!expanded[group.id]}
                onToggle={() => toggle(group.id)}
                onApprove={() => approveGroup(group)}
                onReject={() => pushToast('Reject flow is a Session 2 path — batch left in queue')}
                onItemClick={(itemId) => setDetail({ groupId: group.id, itemId })}
              />
            ))}
          </AnimatePresence>

          {visibleGroups.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
              className="flex flex-col items-center justify-center rounded-[14px] border border-bone-muted/10 bg-ink-2 px-8 py-20 text-center"
            >
              <QueueStatusIcon status="ready" size={56} />
              <h2 className="mt-6 font-display text-[28px] font-bold leading-tight tracking-[0.01em] text-bone">
                All clear.
              </h2>
              <p className="mt-3 max-w-[320px] font-body text-[14px] font-light text-bone-muted">
                No cards pending review. New uploads will appear here.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* detail modal stub */}
      <AnimatePresence>
        {detail && (
          <DetailModal
            groupId={detail.groupId}
            itemId={detail.itemId}
            queue={reviewQueue}
            onClose={() => setDetail(null)}
            onApprove={() => {
              pushToast('Single-card approve · Session 2 path');
              setDetail(null);
            }}
            onReject={() => {
              pushToast('Single-card reject · Session 2 path');
              setDetail(null);
            }}
          />
        )}
      </AnimatePresence>

      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );

  function QueueGroupCard({
    group,
    expanded,
    onToggle,
    onApprove,
    onReject,
    onItemClick,
  }: {
    group: QueueGroup;
    expanded: boolean;
    onToggle: () => void;
    onApprove: () => void;
    onReject: () => void;
    onItemClick: (itemId: string) => void;
  }) {
    const team = teamById(group.teamId);
    if (!team) return null;
    return (
      <motion.article
        variants={fadeRise}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.3 } }}
        layout
        className="ink-card overflow-hidden rounded-[14px] border border-bone-muted/10"
      >
        {/* header row */}
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-5 px-6 py-4 text-left transition-colors hover:bg-ink-3/40"
        >
          <TeamMonogram
            mark={team.monogram}
            primary={team.palette.primary}
            accent={team.palette.accent}
            size={40}
            variant="crest"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-[22px] font-bold leading-tight tracking-[0.01em] text-bone">
                {team.name}
              </h2>
              <span className="h-1.5 w-1.5 rounded-full bg-gold-3" />
              <span className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted">
                {team.club} · {team.sport} · {team.ageGroup}
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-3">
              <StatusPill tone="ready" withDot>
                Ready to approve
              </StatusPill>
              <span className="font-display text-[12px] font-medium tracking-data-loose text-bone-muted">
                {group.items.length} {group.items.length === 1 ? 'card' : 'cards'} ·
                submitted {group.submittedAgo}
              </span>
            </p>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.22, ease: EASE_STANDARD as unknown as number[] }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-bone-muted"
          >
            <ChevronDown size={18} strokeWidth={1.6} />
          </motion.div>
        </button>

        {/* expanded body */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE_STANDARD as unknown as number[] }}
              className="overflow-hidden border-t border-bone-muted/8"
            >
              <div className="p-6">
                {/* batch actions row */}
                <div className="mb-5 flex items-center justify-between gap-4">
                  <p className="font-display text-[11px] font-medium uppercase tracking-label-lg text-bone-muted">
                    Batch · {team.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onReject}
                      className="flex h-10 items-center gap-2 rounded-[8px] border border-live-red/40 bg-ink-2 px-4 font-display text-[11px] font-semibold uppercase tracking-label-md text-live-red transition-all hover:border-live-red/70 hover:bg-live-red/5"
                    >
                      Reject batch
                    </button>
                    <button
                      type="button"
                      onClick={onApprove}
                      className="specular-sweep relative flex h-10 items-center gap-2 overflow-hidden rounded-[8px] px-5 font-display text-[11px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px]"
                      style={{
                        background:
                          'linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)',
                      }}
                    >
                      <span className="relative z-[2]">
                        Approve all · {group.items.length}
                      </span>
                      <ArrowRight size={13} strokeWidth={2} className="relative z-[2]" />
                    </button>
                  </div>
                </div>

                {/* card grid */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-5">
                  {group.items.map((item) => {
                    const athlete = item.athlete ?? athleteById(item.athleteId);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onItemClick(item.id)}
                        className="group flex flex-col items-center focus:outline-none"
                      >
                        <ComposedCardPreview
                          team={team}
                          athlete={athlete}
                          background={team.skinBackground}
                          width={170}
                          compact
                          hoverable
                        />
                        <p className="mt-3 font-display text-[11px] font-medium tracking-data-tight text-bone">
                          {athlete
                            ? `${athlete.firstName} ${athlete.lastName}`
                            : 'Athlete'}
                        </p>
                        <p className="mt-0.5 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                          #{athlete?.jerseyNumber ?? '—'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    );
  }
}

function DetailModal({
  groupId,
  itemId,
  queue,
  onClose,
  onApprove,
  onReject,
}: {
  groupId: string;
  itemId: string;
  queue: QueueGroup[];
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const navigate = useNavigate();
  const group = queue.find((g) => g.id === groupId);
  const item = group?.items.find((i) => i.id === itemId);
  const team = group ? teamById(group.teamId) : undefined;
  const athlete = item ? item.athlete ?? athleteById(item.athleteId) : undefined;
  if (!team || !athlete || !item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: EASE_STANDARD as unknown as number[] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.28, ease: EASE_CINEMATIC as unknown as number[] }}
        onClick={(e) => e.stopPropagation()}
        className="ink-card relative flex w-full max-w-[720px] flex-col gap-8 overflow-hidden rounded-[14px] border border-gold-3/25 p-8 md:flex-row"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 0% 0%, rgba(201, 162, 78, 0.18) 0%, transparent 60%)',
          }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-bone-muted transition-colors hover:bg-ink-3 hover:text-bone"
        >
          <X size={16} strokeWidth={1.8} />
        </button>

        <div className="relative flex-shrink-0">
          <ComposedCardPreview
            team={team}
            athlete={athlete}
            background={team.skinBackground}
            width={260}
          />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Review · {team.name}
          </p>
          <h2 className="mt-2 font-display text-[30px] font-bold leading-tight tracking-[0.01em] text-bone">
            {athlete.firstName} {athlete.lastName}
          </h2>
          <p className="mt-1.5 font-body text-[14px] font-light text-bone-muted">
            {team.sport} · {team.ageGroup} · #{athlete.jerseyNumber}
          </p>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/player/${athlete.id}`);
            }}
            className="mt-4 flex w-fit items-center gap-1 font-display text-[11px] font-medium uppercase tracking-label-md text-gold-3 transition-colors hover:text-gold-4"
          >
            View full player detail
            <ArrowUpRight size={12} strokeWidth={2} />
          </button>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <MetaCell label="Submitted" value={item.submittedAgo} />
            <MetaCell label="Skin" value={`${team.monogram} · ${team.club}`} />
            <MetaCell label="Status" value="Ready to approve" />
            <MetaCell label="Card ID" value={item.id.toUpperCase()} />
          </div>

          <div className="mt-auto flex items-center gap-2 pt-8">
            <button
              type="button"
              onClick={onReject}
              className="flex h-11 items-center rounded-[8px] border border-live-red/40 bg-ink-2 px-4 font-display text-[11px] font-semibold uppercase tracking-label-md text-live-red transition-all hover:border-live-red/70 hover:bg-live-red/5"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="specular-sweep relative flex h-11 flex-1 items-center justify-center overflow-hidden rounded-[8px] font-display text-[12px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px]"
              style={{
                background:
                  'linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)',
              }}
            >
              <span className="relative z-[2]">Approve · send to print</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-ink-3/60 px-3 py-2.5">
      <p className="font-display text-[9px] font-medium uppercase tracking-label-lg text-bone-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-[13px] font-medium tracking-data-tight text-bone">
        {value}
      </p>
    </div>
  );
}
