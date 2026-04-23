import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Check,
  ArrowUpRight,
  FileEdit,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import {
  agentPreparedResponses,
  batchesReadyToApprove,
  exceptionsByType,
  operationalCounts,
  queueAgeDistribution,
  weeklyThroughput,
  weeklyTotal,
  weekOverWeekChange,
  type ExceptionByType,
  type QueueAgeBucket,
} from '../mock/data';
import { AIGenerationIcon } from './icons/AIGenerationIcon';
import { EASE_STANDARD } from '../motion/variants';
import { colors } from '../tokens/theme';

/**
 * Dynamic Focus Panel — dashboard §4.3 Zone 1 top surface (v1.8).
 *
 * Replaces the legacy Attention Required strip. Three hardcoded mode views
 * (Queue Clearance / Exception Resolution / Steady State) swapped via a
 * manual dropdown. No real state logic, no auto-rotation — this is a demo
 * simulation of the agentic dashboard concept: the panel "changes what it
 * emphasizes based on what's happening right now."
 *
 * Default mode on load: Queue Clearance. 300ms cross-fade between modes.
 */

type Mode = 'queue-clearance' | 'exception-resolution' | 'steady-state';

const MODE_LABELS: Record<Mode, string> = {
  'queue-clearance': 'Queue Clearance',
  'exception-resolution': 'Exception Resolution',
  'steady-state': 'Steady State',
};

// #7BA87F (muted sage) is the amendment's fallback positive token — scoped
// to this panel rather than widened into the global palette. Everything else
// routes through `colors` from tokens/theme.
const COLOR_POSITIVE = '#7BA87F';
const COLOR_BONE = colors.bone;
const COLOR_BONE_MUTED = colors.boneMuted;
const COLOR_GOLD_3 = colors.gold3;
const COLOR_GOLD_4 = colors.gold4;
const COLOR_LIVE_RED = colors.liveRed;

export function DynamicFocusPanel() {
  const [mode, setMode] = useState<Mode>('queue-clearance');

  return (
    <section
      className="ink-card relative mb-10 overflow-hidden rounded-[14px] p-5"
      style={{ borderTop: '1px solid rgba(201, 162, 78, 0.4)' }}
    >
      <PanelHeader mode={mode} onModeChange={setMode} />
      <CountBar mode={mode} />

      {/* body — mode-specific, cross-fades on mode change */}
      <div className="relative mt-6 min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`body-${mode}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EASE_STANDARD as unknown as number[] }}
          >
            {mode === 'queue-clearance' && <QueueClearanceView />}
            {mode === 'exception-resolution' && <ExceptionResolutionView />}
            {mode === 'steady-state' && <SteadyStateView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* agent footer — cross-fades on mode change */}
      <div className="relative mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`footer-${mode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_STANDARD as unknown as number[] }}
          >
            <AgentFooter mode={mode} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

const MODE_ORDER: Mode[] = ['queue-clearance', 'exception-resolution', 'steady-state'];

function PanelHeader({ mode, onModeChange }: { mode: Mode; onModeChange: (m: Mode) => void }) {
  const idx = MODE_ORDER.indexOf(mode);
  const nextMode = MODE_ORDER[(idx + 1) % MODE_ORDER.length];
  const cycle = () => onModeChange(nextMode);

  return (
    <div className="flex items-start justify-between gap-4">
      <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
        Today's Operational Focus · Updated by IMVI+
      </p>

      <button
        type="button"
        onClick={cycle}
        aria-label={`Cycle mode · next: ${MODE_LABELS[nextMode]}`}
        title={`Next: ${MODE_LABELS[nextMode]}`}
        className="flex h-8 items-center gap-2 rounded-full border border-bone-muted/15 bg-ink-3 px-3 font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted transition-colors hover:border-gold-3/40 hover:text-bone"
      >
        <RotateCw size={11} strokeWidth={1.8} className="text-gold-3" />
        <span>
          <span className="text-bone-muted/70">Mode · </span>
          <span className="text-bone">{MODE_LABELS[mode]}</span>
        </span>
        <span className="font-display text-[9px] text-bone-muted/50">
          {idx + 1}/{MODE_ORDER.length}
        </span>
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function CountBar({ mode }: { mode: Mode }) {
  return (
    <div className="mt-5 grid grid-cols-4 gap-4">
      <CountTile
        label="Design Queue"
        value={operationalCounts.designQueue}
        elevated={false}
        tone="neutral"
      />
      <CountTile
        label="Print Approval"
        value={operationalCounts.printApproval}
        elevated={mode === 'queue-clearance'}
        tone="gold"
      />
      <CountTile
        label="New Teams"
        value={operationalCounts.newTeams}
        elevated={false}
        tone="neutral"
      />
      <CountTile
        label="Exceptions"
        value={operationalCounts.exceptions}
        elevated={mode === 'exception-resolution'}
        tone="red"
      />
    </div>
  );
}

function CountTile({
  label,
  value,
  elevated,
  tone,
}: {
  label: string;
  value: number;
  elevated: boolean;
  tone: 'neutral' | 'gold' | 'red';
}) {
  const valueColor = !elevated
    ? 'text-bone'
    : tone === 'gold'
      ? 'text-gold-3'
      : 'text-live-red';

  return (
    <div className="flex min-h-[72px] flex-col justify-center rounded-[10px] border border-bone-muted/10 bg-ink-3/60 px-4 py-3">
      <p className="flex items-center gap-1.5 font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
        {label}
        {elevated && <Sparkles size={10} strokeWidth={2.2} className={tone === 'red' ? 'text-live-red' : 'text-gold-3'} />}
      </p>
      <p
        className={`mt-1 font-display font-bold leading-none tracking-data-tight transition-all duration-300 ease-out ${valueColor}`}
        style={{ fontSize: elevated ? '44px' : '36px' }}
      >
        {value}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * MODE 1 — Queue Clearance
 * ══════════════════════════════════════════════════════════════════════ */

function QueueClearanceView() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <QueueAgeDistribution />
      <BatchesList />
    </div>
  );
}

function QueueAgeDistribution() {
  const total = queueAgeDistribution.reduce((acc, b) => acc + b.count, 0);
  const colors: Record<QueueAgeBucket['ageRange'], string> = {
    '0-1d': COLOR_POSITIVE,
    '1-2d': COLOR_BONE,
    '2-3d': COLOR_GOLD_3,
    '3+d': COLOR_LIVE_RED,
  };

  return (
    <div>
      <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
        Queue Age Distribution
      </p>

      <div className="mt-4 flex h-7 w-full overflow-hidden rounded-[6px] bg-ink">
        {queueAgeDistribution.map((b) => (
          <div
            key={b.ageRange}
            className="h-full transition-all duration-300 ease-out"
            style={{
              flex: b.count,
              background: colors[b.ageRange],
              borderRight: '1px solid rgba(10,10,10,0.9)',
            }}
            title={`${b.count} · ${b.ageRange}`}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {queueAgeDistribution.map((b) => (
          <div key={b.ageRange} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px]" style={{ background: colors[b.ageRange] }} />
            <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
              <span className="text-bone">{b.count}</span> · {b.ageRange}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/70">
        {total} cards awaiting approval · oldest {queueAgeDistribution[queueAgeDistribution.length - 1].count > 0 ? '3+ days' : 'under 1 day'}
      </p>
    </div>
  );
}

function BatchesList() {
  const navigate = useNavigate();
  return (
    <div>
      <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
        Batches Ready to Approve
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {batchesReadyToApprove.map((b) => (
          <li
            key={b.team}
            className="flex h-10 items-center justify-between gap-3 rounded-[8px] border border-bone-muted/8 bg-ink-3/50 px-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[14px] font-bold tracking-data-tight text-bone">
                {b.team}
              </p>
            </div>
            <span className="font-body text-[12px] font-light text-bone-muted">
              {b.cardCount} cards · {b.timeInQueue}
            </span>
            <button
              type="button"
              onClick={() => navigate('/review')}
              className="specular-sweep relative flex h-7 items-center overflow-hidden rounded-[6px] bg-brushed-gold px-2.5 font-display text-[11px] font-medium uppercase tracking-[0.15em] text-ink transition-transform duration-200 ease-cinematic hover:-translate-y-[0.5px]"
            >
              <span className="relative z-[2]">Approve</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * MODE 2 — Exception Resolution
 * ══════════════════════════════════════════════════════════════════════ */

function ExceptionResolutionView() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <ExceptionsByTypeChart />
      <AgentResponsesList />
    </div>
  );
}

function ExceptionsByTypeChart() {
  const toneToColor: Record<ExceptionByType['tone'], string> = {
    red: COLOR_LIVE_RED,
    gold: COLOR_GOLD_3,
    bone: COLOR_BONE,
  };

  return (
    <div>
      <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
        Exceptions by Type
      </p>
      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={exceptionsByType}
            layout="vertical"
            margin={{ top: 0, right: 28, bottom: 0, left: 12 }}
            barCategoryGap={10}
          >
            <CartesianGrid stroke="rgba(168,163,153,0.06)" strokeDasharray="2 4" horizontal={false} />
            <XAxis type="number" hide domain={[0, 'dataMax + 1']} />
            <YAxis
              type="category"
              dataKey="type"
              width={130}
              tick={{ fill: COLOR_BONE, fontFamily: 'Oswald Variable', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(201,162,78,0.06)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as ExceptionByType;
                return (
                  <div className="rounded-[8px] border border-bone-muted/15 bg-ink-2 px-3 py-2 shadow-card-depth">
                    <p className="font-display text-[11px] font-semibold tracking-data-tight text-bone">
                      {row.type}
                    </p>
                    <p className="mt-0.5 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                      {row.count} open
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
              label={{
                position: 'right',
                fill: COLOR_BONE,
                fontFamily: 'Oswald Variable',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {exceptionsByType.map((row, i) => (
                <Cell key={i} fill={toneToColor[row.tone]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AgentResponsesList() {
  return (
    <div>
      <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
        IMVI+ Responses Prepared
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {agentPreparedResponses.map((r, i) => (
          <li
            key={i}
            className="flex h-11 items-center gap-3 rounded-[8px] border border-bone-muted/8 bg-ink-3/50 px-3"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-gold-3/30 bg-gold-3/5">
              <FileEdit size={12} strokeWidth={1.8} className="text-gold-3" />
            </span>
            <p className="min-w-0 flex-1 truncate font-body text-[12px] font-light text-bone">
              {r.description}
            </p>
            <span className="flex h-6 items-center rounded-full bg-gold-3 px-2 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-ink">
              {r.status} · 1-tap send
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * MODE 3 — Steady State
 * ══════════════════════════════════════════════════════════════════════ */

function SteadyStateView() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <ThroughputChart />
      <AllClearPanel />
    </div>
  );
}

function ThroughputChart() {
  return (
    <div className="relative">
      <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
        This Week's Throughput
      </p>

      {/* overlay hero in top-left */}
      <div className="absolute left-0 top-6 z-10">
        <p className="font-display text-[22px] font-bold leading-none tracking-data-tight text-bone">
          {weeklyTotal}
        </p>
        <p className="mt-0.5 font-body text-[11px] font-light text-bone-muted">
          cards · last 7d
        </p>
      </div>

      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyThroughput} margin={{ top: 20, right: 12, bottom: 4, left: 24 }}>
            <defs>
              <linearGradient id="throughput-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_GOLD_3} stopOpacity={0.18} />
                <stop offset="100%" stopColor={COLOR_GOLD_3} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fill: COLOR_BONE_MUTED, fontFamily: 'Oswald Variable', fontSize: 11, letterSpacing: 1.2 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              ticks={[0, 3, 6, 9, 12]}
              domain={[0, 12]}
              tick={{ fill: COLOR_BONE_MUTED, fontFamily: 'Oswald Variable', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={22}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(201,162,78,0.2)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-[8px] border border-bone-muted/15 bg-ink-2 px-3 py-2 shadow-card-depth">
                    <p className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                      {label}
                    </p>
                    <p className="mt-1 font-display text-[12px] font-semibold tracking-data-tight text-bone">
                      {payload[0].value} delivered
                    </p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={COLOR_GOLD_3}
              strokeWidth={2}
              fill="url(#throughput-fade)"
              dot={{ r: 3, fill: COLOR_GOLD_3 }}
              activeDot={{ r: 5, fill: COLOR_GOLD_4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AllClearPanel() {
  const rows = [
    'Queue clear (0 items > 24h old)',
    'No exceptions',
    'All clubs active',
  ];
  return (
    <div>
      <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-gold-3">
        All Clear
      </p>
      <h3 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[0.01em] text-bone">
        {weeklyTotal} cards shipped this week
      </h3>
      <p className="mt-2 font-body text-[13px] font-light text-gold-3">
        Your fastest week yet — up {weekOverWeekChange} from last week
      </p>
      <ul className="mt-5 flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r} className="flex h-7 items-center gap-2.5">
            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-gold-3/50 bg-gold-3/10">
              <Check size={10} strokeWidth={2.6} className="text-gold-3" />
            </span>
            <span className="font-display text-[13px] font-medium tracking-data-tight text-bone">
              {r}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * AGENT FOOTER
 * ══════════════════════════════════════════════════════════════════════ */

function AgentFooter({ mode }: { mode: Mode }) {
  const navigate = useNavigate();

  const content: Record<Mode, { message: React.ReactNode; cta: string; href: string }> = {
    'queue-clearance': {
      message: (
        <>
          IMVI+ has grouped your queue by team.{' '}
          <span className="text-gold-3">NxLVL</span> and{' '}
          <span className="text-gold-3">PFA</span> are oldest — start there.
        </>
      ),
      cta: 'Open Review Queue',
      href: '/review',
    },
    'exception-resolution': {
      message: (
        <>
          <span className="text-gold-3">4 responses</span> ready. Review and send with one tap each, or approve the batch.
        </>
      ),
      cta: 'Review all 4 drafts',
      href: '/review',
    },
    'steady-state': {
      message: (
        <>
          IMVI+ has compiled your weekly ops digest — throughput, top teams, board-share highlights.
        </>
      ),
      cta: 'View digest',
      href: '/dashboard',
    },
  };

  const { message, cta, href } = content[mode];

  return (
    <div
      className="flex h-12 items-center justify-between gap-4 rounded-[8px] bg-ink-3 px-4"
      style={{ borderLeft: '2px solid rgba(201, 162, 78, 0.9)' }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <AIGenerationIcon size={16} />
        <p className="truncate font-body text-[13px] font-light text-bone">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate(href)}
        className="flex flex-shrink-0 items-center gap-1 font-display text-[11px] font-medium uppercase tracking-[0.15em] text-gold-3 transition-colors hover:text-gold-4"
      >
        {cta}
        <ArrowUpRight size={12} strokeWidth={2} />
      </button>
    </div>
  );
}

