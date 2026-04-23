import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ClipboardList,
  Palette as PaletteIcon,
  Users as UsersIcon,
  Film,
  BadgeDollarSign,
  UserCog,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import {
  activeSubscriptions,
  activityFeed,
  clubHealthMatrix,
  engagementByTeam,
  exceptionsList,
  fulfillmentPipeline,
  ordersThisWeek,
  quickAccessTiles,
  revenueThisMonth,
  sevenDayThroughput,
  signupsByTeam,
  totalQueueItems,
  visibilityLeaderboard,
  type ClubHealthPoint,
  type DashboardException,
  type FulfillmentStage,
  type HealthStatus,
  type QuickAccessTile,
  type VisibilityRow,
} from '../mock/data';
import { DynamicFocusPanel } from '../components/DynamicFocusPanel';
import { EASE_CINEMATIC, fadeRise, staggerContainer } from '../motion/variants';

/* ──────────────────────────────────────────────────────────────────────
 * Status colors — dashboard-scoped. Green/amber/red sit outside the core
 * brand tokens; we use them only to encode health on data viz surfaces.
 * ────────────────────────────────────────────────────────────────────── */
const HEALTH = {
  thriving: '#6FA05E',  // green — on track
  steady:   '#D9A441',  // amber — steady but worth a glance
  attention: '#E53935', // live-red — needs action
} as const;

const TEXT_BONE = '#F5F1E8';
const TEXT_MUTED = '#A8A399';
const GOLD_3 = '#C9A24E';
const GOLD_4 = '#E8C472';
const LIVE_RED = '#E53935';

/* ──────────────────────────────────────────────────────────────────────
 * Main screen
 * ────────────────────────────────────────────────────────────────────── */
export function Dashboard() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* signature gold floor-fade */}
      <div
        className="pointer-events-none fixed bottom-0 left-sidebar right-0 h-[50vh]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.2) 0%, rgba(139, 106, 47, 0.06) 40%, transparent 75%)',
        }}
      />
      {/* subtle red top-right drift */}
      <div
        className="pointer-events-none fixed top-16 right-0 h-[40vh] w-[55vw]"
        style={{
          background:
            'radial-gradient(ellipse at 85% 0%, rgba(229, 57, 53, 0.08) 0%, transparent 55%)',
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
        <DashboardHeader />
        <Zone1Operations />
        <Zone2BusinessGrowth />
        <Zone3ManagementAccess />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Header
 * ────────────────────────────────────────────────────────────────────── */
function DashboardHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
      className="flex items-end justify-between gap-8"
    >
      <div>
        <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
          Super Admin · Command Center
        </p>
        <h1 className="mt-3 font-display text-[40px] font-bold leading-tight tracking-[0.01em] text-bone">
          Dashboard
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-[1px] w-16 bg-gradient-to-r from-gold-3/70 to-transparent" />
          <span className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted/70">
            Operations · Business · Management
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-soft-pulse rounded-full bg-live-red/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-live-red" />
        </span>
        <span className="font-display text-[11px] font-medium uppercase tracking-label-md text-live-red">
          Live · {totalQueueItems} in queue
        </span>
      </div>
    </motion.header>
  );
}

function ZoneHeader({ index, title, sub }: { index: number; title: string; sub: string }) {
  return (
    <div className="mt-14 mb-6 flex items-end justify-between gap-6">
      <div className="flex items-center gap-4">
        <span
          className="flex h-6 min-w-[28px] items-center justify-center rounded-full border border-gold-3/50 bg-ink-2 px-2 font-display text-[10px] font-semibold tracking-[0.1em] text-gold-3"
        >
          0{index}
        </span>
        <h2 className="font-display text-[20px] font-bold uppercase tracking-[0.04em] text-bone">
          {title}
        </h2>
        <span className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted/70">
          · {sub}
        </span>
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-bone-muted/20 via-bone-muted/10 to-transparent" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * ZONE 1 — OPERATIONS
 * ══════════════════════════════════════════════════════════════════════ */
function Zone1Operations() {
  return (
    <section>
      <ZoneHeader index={1} title="Operations" sub="what needs me, what's in flight, what's broken" />
      <DynamicFocusPanel />
      <FulfillmentPanel />
      <ExceptionsPanel />
    </section>
  );
}

function FulfillmentPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.2 }}
      className="ink-card mt-5 overflow-hidden rounded-[18px] border border-bone-muted/10 p-7"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Fulfillment Pipeline
          </p>
          <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
            Cards moving through production · stage widths scale to volume
          </p>
        </div>
        <span className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted/70">
          Live · updates hourly
        </span>
      </div>

      <FulfillmentPipelineBars stages={fulfillmentPipeline} />

      <div className="mt-8 flex items-end justify-between gap-6">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
            7-day throughput · delivered per day
          </p>
          <p className="mt-1 font-display text-[28px] font-bold leading-none tracking-data-tight text-bone">
            {sevenDayThroughput.reduce((acc, p) => acc + p.value, 0)}
            <span className="ml-2 font-body text-[12px] font-light text-bone-muted">
              cards in last 7d
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sevenDayThroughput}
            margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
          >
            <CartesianGrid stroke="rgba(168,163,153,0.08)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: TEXT_MUTED, fontFamily: 'Oswald Variable', fontSize: 11, letterSpacing: 1.4 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: TEXT_MUTED, fontFamily: 'Oswald Variable', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<BrandTooltip suffix=" delivered" />} cursor={{ stroke: 'rgba(201,162,78,0.15)' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={GOLD_3}
              strokeWidth={2.2}
              dot={{ r: 3, fill: GOLD_3 }}
              activeDot={{ r: 5, fill: GOLD_4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

function FulfillmentPipelineBars({ stages }: { stages: FulfillmentStage[] }) {
  const navigate = useNavigate();
  const total = stages.reduce((acc, s) => acc + s.count, 0);
  const toneFill: Record<FulfillmentStage['tone'], string> = {
    muted: 'rgba(168, 163, 153, 0.18)',
    gold: 'rgba(201, 162, 78, 0.22)',
    red: 'rgba(229, 57, 53, 0.22)',
    green: 'rgba(111, 160, 94, 0.22)',
  };
  const toneBorder: Record<FulfillmentStage['tone'], string> = {
    muted: 'rgba(168, 163, 153, 0.35)',
    gold: GOLD_3,
    red: LIVE_RED,
    green: HEALTH.thriving,
  };
  const toneLabel: Record<FulfillmentStage['tone'], string> = {
    muted: TEXT_MUTED,
    gold: GOLD_4,
    red: LIVE_RED,
    green: HEALTH.thriving,
  };

  return (
    <div className="mt-8">
      <div className="flex items-stretch gap-2">
        {stages.map((s, i) => {
          const flex = Math.max(0.6, s.count / total * stages.length);
          return (
            <div key={s.stage} className="flex items-stretch" style={{ flex }}>
              <button
                type="button"
                onClick={() => navigate(s.href)}
                className="group relative flex w-full flex-col items-start justify-between overflow-hidden rounded-[10px] border px-4 py-3 text-left transition-all duration-300 ease-cinematic hover:-translate-y-0.5 hover:border-bone"
                style={{
                  background: toneFill[s.tone],
                  borderColor: toneBorder[s.tone],
                }}
              >
                <span
                  className="font-display text-[9px] font-medium uppercase tracking-label-lg"
                  style={{ color: toneLabel[s.tone] }}
                >
                  {s.stage}
                </span>
                <span
                  className="mt-2 font-display text-[26px] font-bold leading-none tracking-data-tight"
                  style={{ color: toneLabel[s.tone] }}
                >
                  {s.count}
                </span>
              </button>
              {i < stages.length - 1 && (
                <div className="mx-1 flex items-center">
                  <ArrowRight size={14} strokeWidth={1.8} className="text-bone-muted/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExceptionsPanel() {
  const navigate = useNavigate();
  const visible = exceptionsList.slice(0, 5);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.35 }}
      className="ink-card mt-5 overflow-hidden rounded-[18px] border border-live-red/25 p-7"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 0% 0%, rgba(229, 57, 53, 0.09) 0%, transparent 55%)',
        }}
      />
      <div className="relative flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert size={18} strokeWidth={1.6} className="text-live-red" />
          <div>
            <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-live-red">
              Exceptions · {exceptionsList.length} items
            </p>
            <p className="mt-1 font-body text-[13px] font-light text-bone-muted">
              Work that can't advance without Kevin's intervention
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/review?filter=exceptions')}
          className="font-display text-[11px] font-medium uppercase tracking-label-md text-gold-3 transition-colors hover:text-gold-4"
        >
          See all exceptions
        </button>
      </div>

      <ul className="relative mt-5 flex flex-col gap-2">
        {visible.map((exc) => (
          <ExceptionRow key={exc.id} data={exc} />
        ))}
      </ul>
    </motion.section>
  );
}

function ExceptionRow({ data }: { data: DashboardException }) {
  const iconColor = data.severity === 'red' ? LIVE_RED : GOLD_4;
  return (
    <li className="flex items-center gap-4 rounded-[10px] border border-bone-muted/8 bg-ink-3/60 px-4 py-3">
      <AlertTriangle size={16} strokeWidth={1.8} style={{ color: iconColor }} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[13px] font-medium tracking-data-tight text-bone">
          {data.reason}
        </p>
        <p className="mt-1 font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted">
          {data.athlete} · {data.team} {data.jersey}
          <span className="ml-2 text-bone-muted/60">stuck {data.age}</span>
        </p>
      </div>
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-[8px] border border-gold-3/40 bg-ink-2 px-3 font-display text-[10px] font-semibold uppercase tracking-label-md text-gold-3 transition-colors hover:border-gold-3/70 hover:text-gold-4"
      >
        {data.action}
        <ArrowRight size={12} strokeWidth={2} />
      </button>
    </li>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * ZONE 2 — BUSINESS GROWTH
 * ══════════════════════════════════════════════════════════════════════ */
function Zone2BusinessGrowth() {
  return (
    <section>
      <ZoneHeader index={2} title="Business Growth" sub="how is the business doing, where are the opportunities" />
      <BusinessRow />
      <ClubHealthMatrixCard />
      <SignupsAndEngagement />
      <VisibilityLeaderboardCard />
    </section>
  );
}

function BusinessRow() {
  return (
    <motion.div
      variants={staggerContainer(0.1, 0)}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-4"
    >
      <OrdersCard />
      <RevenueCard />
      <SubscriptionsCard />
    </motion.div>
  );
}

function OrdersCard() {
  const delta = ordersThisWeek.weekOverWeekPct;
  return (
    <motion.div variants={fadeRise} className="ink-card relative overflow-hidden rounded-[14px] border border-bone-muted/10 p-5">
      <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
        Orders · This Week
      </p>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-display text-[40px] font-bold leading-none tracking-data-tight text-bone">
          {ordersThisWeek.count}
        </span>
        <TrendPill delta={delta} label="vs. last week" />
      </div>
      <div className="mt-3 h-[72px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ordersThisWeek.last8Weeks} margin={{ top: 6, right: 2, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" hide />
            <YAxis hide />
            <Tooltip content={<BrandTooltip suffix=" orders" />} cursor={{ stroke: 'rgba(201,162,78,0.15)' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={GOLD_3}
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4, fill: GOLD_4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/70">
        8-week trend · W05 → W12
      </p>
    </motion.div>
  );
}

function RevenueCard() {
  const delta = revenueThisMonth.monthOverMonthPct;
  return (
    <motion.div variants={fadeRise} className="ink-card relative overflow-hidden rounded-[14px] border border-bone-muted/10 p-5">
      <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
        Revenue · This Month
      </p>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-display text-[40px] font-bold leading-none tracking-data-tight text-bone">
          ${(revenueThisMonth.amountUSD / 1000).toFixed(1)}k
        </span>
        <TrendPill delta={delta} label="vs. last month" />
      </div>
      <div className="mt-3 h-[72px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueThisMonth.last6Months} margin={{ top: 6, right: 2, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" hide />
            <YAxis hide />
            <Tooltip content={<BrandTooltip prefix="$" />} cursor={{ fill: 'rgba(201,162,78,0.06)' }} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {revenueThisMonth.last6Months.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === revenueThisMonth.last6Months.length - 1 ? GOLD_4 : GOLD_3}
                  fillOpacity={i === revenueThisMonth.last6Months.length - 1 ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/70">
        6-month trend · Nov → Apr
      </p>
    </motion.div>
  );
}

function SubscriptionsCard() {
  const rising = activeSubscriptions.deltaWeek > 0;
  const series = activeSubscriptions.last7.map((value, i) => ({ i, value }));
  return (
    <motion.div variants={fadeRise} className="ink-card relative overflow-hidden rounded-[14px] border border-bone-muted/10 p-5">
      <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
        Active Subscriptions
      </p>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-display text-[40px] font-bold leading-none tracking-data-tight text-bone">
          {activeSubscriptions.count}
        </span>
        <span
          className={`flex items-center gap-1 font-display text-[12px] font-semibold tracking-data-tight ${
            rising ? 'text-gold-4' : 'text-live-red'
          }`}
        >
          {rising ? <TrendingUp size={14} strokeWidth={2.2} /> : <TrendingDown size={14} strokeWidth={2.2} />}
          {rising ? '+' : ''}
          {activeSubscriptions.deltaWeek} this wk
        </span>
      </div>
      <div className="mt-3 h-[72px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 6, right: 2, bottom: 0, left: 0 }}>
            <XAxis hide />
            <YAxis hide />
            <Tooltip content={<BrandTooltip suffix=" subs" />} cursor={{ stroke: 'rgba(201,162,78,0.15)' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={GOLD_3}
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4, fill: GOLD_4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/70">
        7-day sparkline
      </p>
    </motion.div>
  );
}

function ClubHealthMatrixCard() {
  const navigate = useNavigate();
  const points = clubHealthMatrix.map((p) => ({
    ...p,
    color: HEALTH[p.status],
  }));

  const statusLabel: Record<HealthStatus, string> = {
    thriving: 'Thriving',
    steady: 'Steady',
    attention: 'Needs attention',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.15 }}
      className="ink-card mt-5 overflow-hidden rounded-[18px] border border-bone-muted/10 p-7"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Club Health Matrix
          </p>
          <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
            Activity × athletes · bubble size = 90-day orders · color = status
          </p>
        </div>
        <div className="flex items-center gap-5">
          {(['thriving', 'steady', 'attention'] as const).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: HEALTH[status] }} />
              <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                {statusLabel[status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 24, bottom: 32, left: 24 }}>
              <CartesianGrid stroke="rgba(168,163,153,0.08)" strokeDasharray="2 4" />
              <XAxis
                type="number"
                dataKey="activity30d"
                name="Activity (30d)"
                tick={{ fill: TEXT_MUTED, fontFamily: 'Oswald Variable', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(168,163,153,0.2)' }}
                tickLine={false}
                label={{
                  value: 'SUBMISSIONS (LAST 30 DAYS)',
                  position: 'bottom',
                  offset: 12,
                  style: {
                    fill: TEXT_MUTED,
                    fontFamily: 'Oswald Variable',
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  },
                }}
              />
              <YAxis
                type="number"
                dataKey="athletes"
                name="Athletes"
                tick={{ fill: TEXT_MUTED, fontFamily: 'Oswald Variable', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(168,163,153,0.2)' }}
                tickLine={false}
                label={{
                  value: 'ATHLETES',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 8,
                  style: {
                    fill: TEXT_MUTED,
                    fontFamily: 'Oswald Variable',
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  },
                }}
              />
              <ZAxis type="number" dataKey="orders90d" range={[120, 1200]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: 'rgba(201,162,78,0.3)' }}
                content={<ClubHealthTooltip />}
              />
              <Scatter
                data={points}
                onClick={(p: unknown) => {
                  const pt = p as { teamId?: string };
                  if (pt.teamId) navigate(`/teams`);
                }}
                cursor="pointer"
                isAnimationActive={false}
              >
                {points.map((p, i) => (
                  <Cell key={i} fill={p.color} fillOpacity={0.7} stroke={p.color} strokeWidth={1.5} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex flex-col gap-2">
          {clubHealthMatrix.map((p) => (
            <ClubHealthRow key={p.teamId} point={p} />
          ))}
        </ul>
      </div>
    </motion.section>
  );
}

function ClubHealthRow({ point }: { point: ClubHealthPoint }) {
  const navigate = useNavigate();
  const color = HEALTH[point.status];
  return (
    <button
      type="button"
      onClick={() => navigate('/teams')}
      className="group flex items-center gap-3 rounded-[10px] border border-bone-muted/8 bg-ink-3/50 px-3 py-2.5 text-left transition-colors hover:border-bone-muted/20 hover:bg-ink-3"
    >
      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[13px] font-medium tracking-data-tight text-bone">
          {point.teamName}
        </p>
        <p className="mt-0.5 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
          {point.athletes} athletes · {point.activity30d} subs/30d · last {point.lastActivity}
        </p>
      </div>
      <ArrowUpRight size={14} strokeWidth={1.8} className="text-bone-muted/40 transition-colors group-hover:text-bone-muted" />
    </button>
  );
}

function ClubHealthTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ClubHealthPoint & { color: string } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-[8px] border border-bone-muted/15 bg-ink-2 px-3 py-2 shadow-card-depth">
      <p className="font-display text-[12px] font-semibold tracking-data-tight text-bone">{d.teamName}</p>
      <p className="mt-1 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
        {d.athletes} athletes · {d.activity30d} submissions/30d · {d.orders90d} orders/90d
      </p>
      <p className="mt-1 font-display text-[9px] font-medium uppercase tracking-label-lg" style={{ color: d.color }}>
        {d.status}
      </p>
    </div>
  );
}

function SignupsAndEngagement() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.25 }}
      className="mt-5 grid grid-cols-2 gap-4"
    >
      <SignupsByTeamCard />
      <EngagementByTeamCard />
    </motion.div>
  );
}

function SignupsByTeamCard() {
  return (
    <div className="ink-card overflow-hidden rounded-[18px] border border-bone-muted/10 p-6">
      <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
        Signups by Team · 30d
      </p>
      <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
        New athletes added to each roster
      </p>
      <div className="mt-5 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={signupsByTeam} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 12 }}>
            <CartesianGrid stroke="rgba(168,163,153,0.06)" strokeDasharray="2 4" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: TEXT_MUTED, fontFamily: 'Oswald Variable', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="teamName"
              width={140}
              tick={{ fill: TEXT_BONE, fontFamily: 'Oswald Variable', fontSize: 11, letterSpacing: 0.8 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<BrandTooltip suffix=" signups" />} cursor={{ fill: 'rgba(201,162,78,0.06)' }} />
            <Bar dataKey="signups" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {signupsByTeam.map((_, i) => (
                <Cell key={i} fill={i === 0 ? GOLD_4 : GOLD_3} fillOpacity={i === 0 ? 1 : 0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EngagementByTeamCard() {
  return (
    <div className="ink-card overflow-hidden rounded-[18px] border border-bone-muted/10 p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            App Engagement · per team
          </p>
          <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
            Daily / weekly / monthly active users
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LegendSwatch color={GOLD_3} label="DAU" />
          <LegendSwatch color={GOLD_4} label="WAU" />
          <LegendSwatch color={LIVE_RED} label="MAU" />
        </div>
      </div>
      <div className="mt-5 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={engagementByTeam} margin={{ top: 10, right: 8, bottom: 8, left: -8 }}>
            <CartesianGrid stroke="rgba(168,163,153,0.06)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="teamName"
              tick={{ fill: TEXT_MUTED, fontFamily: 'Oswald Variable', fontSize: 11, letterSpacing: 1 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: TEXT_MUTED, fontFamily: 'Oswald Variable', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<BrandTooltip />} cursor={{ fill: 'rgba(201,162,78,0.06)' }} />
            <Bar dataKey="dau" stackId="eng" fill={GOLD_3} isAnimationActive={false} />
            <Bar dataKey="wau" stackId="eng" fill={GOLD_4} isAnimationActive={false} />
            <Bar dataKey="mau" stackId="eng" fill={LIVE_RED} fillOpacity={0.7} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VisibilityLeaderboardCard() {
  const maxScore = Math.max(...visibilityLeaderboard.map((r) => r.score));
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.3 }}
      className="ink-card mt-5 overflow-hidden rounded-[18px] border border-bone-muted/10 p-7"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Athlete Visibility · Sponsorship Targeting
          </p>
          <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
            Top athletes by video views · card shares · profile visits
          </p>
        </div>
        <span className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted/70">
          Top 10 · last 30 days
        </span>
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1.5">
        {visibilityLeaderboard.map((row, i) => (
          <VisibilityRowItem key={row.athleteId} row={row} rank={i + 1} maxScore={maxScore} />
        ))}
      </ul>
    </motion.section>
  );
}

function VisibilityRowItem({ row, rank, maxScore }: { row: VisibilityRow; rank: number; maxScore: number }) {
  const navigate = useNavigate();
  const rising = row.delta > 0;
  const pct = (row.score / maxScore) * 100;
  return (
    <li>
      <button
        type="button"
        onClick={() => navigate(`/player/${row.athleteId}`)}
        className="flex w-full items-center gap-3 rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-ink-3/50"
      >
      <span className="w-6 font-display text-[11px] font-semibold tracking-data-tight text-bone-muted/70">
        {rank.toString().padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-display text-[13px] font-medium tracking-data-tight text-bone">
            {row.firstName} {row.lastName}
          </p>
          {row.sponsorshipCandidate && (
            <span className="flex items-center gap-1 rounded-full border border-gold-3/40 bg-gold-3/10 px-1.5 py-0.5 font-display text-[8px] font-semibold uppercase tracking-label-md text-gold-4">
              <Sparkles size={9} strokeWidth={2.2} />
              Sponsor
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-bone-muted/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: row.sponsorshipCandidate ? GOLD_4 : GOLD_3,
              }}
            />
          </div>
          <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
            {row.teamName.split(' ')[0]}
          </span>
          <span
            className={`flex items-center gap-0.5 font-display text-[10px] font-semibold tracking-data-tight ${
              rising ? 'text-gold-4' : 'text-live-red/80'
            }`}
          >
            {rising ? <TrendingUp size={10} strokeWidth={2.4} /> : <TrendingDown size={10} strokeWidth={2.4} />}
            {rising ? '+' : ''}
            {Math.round(row.delta * 100)}%
          </span>
        </div>
      </div>
      </button>
    </li>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * ZONE 3 — MANAGEMENT ACCESS
 * ══════════════════════════════════════════════════════════════════════ */
function Zone3ManagementAccess() {
  return (
    <section>
      <ZoneHeader index={3} title="Management Access" sub="quick access to the things I manage" />
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
        <QuickAccessTilesGrid />
        <ActivityFeedCard />
      </div>
    </section>
  );
}

function QuickAccessTilesGrid() {
  return (
    <motion.div
      variants={staggerContainer(0.08, 0)}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-4"
    >
      {quickAccessTiles.map((tile) => (
        <QuickAccessTileCard key={tile.id} tile={tile} />
      ))}
    </motion.div>
  );
}

function QuickAccessTileCard({ tile }: { tile: QuickAccessTile }) {
  const navigate = useNavigate();
  const toneBorder =
    tile.tone === 'gold' ? 'border-gold-3/30' :
    tile.tone === 'red' ? 'border-live-red/30' :
    'border-bone-muted/10';
  const toneText =
    tile.tone === 'gold' ? 'text-gold-3' :
    tile.tone === 'red' ? 'text-live-red' :
    'text-bone';
  const Icon =
    tile.id === 'tile_media' ? Film :
    tile.id === 'tile_teams' ? UsersIcon :
    tile.id === 'tile_users' ? UserCog :
    tile.id === 'tile_sponsors' ? BadgeDollarSign :
    ClipboardList;

  return (
    <motion.button
      variants={fadeRise}
      type="button"
      onClick={() => navigate(tile.href)}
      className={`ink-card group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-[14px] border ${toneBorder} p-5 text-left transition-all duration-300 ease-cinematic hover:-translate-y-0.5 hover:border-bone-muted/40`}
    >
      <div className="flex items-start justify-between">
        <Icon size={18} strokeWidth={1.6} className={toneText} />
        <ArrowUpRight
          size={14}
          strokeWidth={1.6}
          className="text-bone-muted/40 transition-colors group-hover:text-bone-muted"
        />
      </div>
      <div>
        <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
          {tile.label}
        </p>
        <p className={`mt-1 font-display text-[24px] font-bold leading-none tracking-data-tight ${toneText}`}>
          {tile.stat}
        </p>
        <p className="mt-2 font-body text-[11px] font-light leading-relaxed text-bone-muted">
          {tile.sub}
        </p>
      </div>
    </motion.button>
  );
}

function ActivityFeedCard() {
  const navigate = useNavigate();
  const kindIcon: Record<string, React.ReactNode> = {
    upload: <ClipboardList size={13} strokeWidth={1.8} className="text-gold-3" />,
    approve: <TrendingUp size={13} strokeWidth={1.8} className="text-gold-4" />,
    design: <PaletteIcon size={13} strokeWidth={1.8} className="text-gold-3" />,
    ship: <ArrowRight size={13} strokeWidth={1.8} className="text-live-red" />,
    sponsor: <BadgeDollarSign size={13} strokeWidth={1.8} className="text-gold-4" />,
  };

  return (
    <div className="ink-card overflow-hidden rounded-[18px] border border-bone-muted/10 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Recent Activity
          </p>
          <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
            Last 8 events · click to jump
          </p>
        </div>
      </div>
      <ul className="mt-5 flex flex-col">
        {activityFeed.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => navigate(item.href)}
              className="group flex w-full items-center gap-3 rounded-[8px] px-2 py-2.5 text-left transition-colors hover:bg-ink-3/50"
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-bone-muted/10 bg-ink-3/60">
                {kindIcon[item.kind]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[12px] font-medium tracking-data-tight text-bone">
                  {item.subject}
                </p>
                <p className="mt-0.5 truncate font-body text-[11px] font-light text-bone-muted">
                  {item.detail}
                </p>
              </div>
              <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/60">
                {item.timestamp}
              </span>
              <ArrowUpRight
                size={12}
                strokeWidth={1.8}
                className="text-bone-muted/30 transition-colors group-hover:text-bone-muted"
              />
            </button>
            {i < activityFeed.length - 1 && <div className="h-px bg-bone-muted/5" />}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Shared sub-components
 * ────────────────────────────────────────────────────────────────────── */
function TrendPill({ delta, label }: { delta: number; label: string }) {
  const rising = delta >= 0;
  const pct = Math.abs(Math.round(delta * 100));
  return (
    <div className="flex flex-col">
      <span
        className={`flex items-center gap-1 font-display text-[13px] font-bold leading-none tracking-data-tight ${
          rising ? 'text-gold-4' : 'text-live-red'
        }`}
      >
        {rising ? <TrendingUp size={13} strokeWidth={2.4} /> : <TrendingDown size={13} strokeWidth={2.4} />}
        {rising ? '+' : '−'}
        {pct}%
      </span>
      <span className="mt-0.5 font-display text-[9px] font-medium uppercase tracking-label-md text-bone-muted/70">
        {label}
      </span>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-3 rounded-[1px]" style={{ background: color }} />
      <span className="font-display text-[9px] font-medium uppercase tracking-label-md text-bone-muted">
        {label}
      </span>
    </div>
  );
}

function BrandTooltip({
  active,
  payload,
  label,
  prefix = '',
  suffix = '',
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; name?: string; value?: number; color?: string }>;
  label?: string | number;
  prefix?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[8px] border border-bone-muted/15 bg-ink-2 px-3 py-2 shadow-card-depth">
      {label !== undefined && (
        <p className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
          {label}
        </p>
      )}
      <div className="mt-1 flex flex-col gap-0.5">
        {payload.map((entry, i) => (
          <p key={i} className="font-display text-[12px] font-semibold tracking-data-tight text-bone">
            {entry.name && <span className="mr-2 text-bone-muted/70">{entry.name}</span>}
            {prefix}
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            {suffix}
          </p>
        ))}
      </div>
    </div>
  );
}
