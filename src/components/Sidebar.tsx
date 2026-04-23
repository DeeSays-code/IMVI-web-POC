import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  Users,
  Upload,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { IMVILogo } from './icons/IMVILogo';
import { admin } from '../mock/data';
import { useAppState } from '../state/AppState';

interface SidebarNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  /** Disabled + "soon" marker — session 2 routes. */
  comingSoon?: boolean;
}

const primaryNav: SidebarNavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/design/new', label: 'Design', icon: Sparkles },
  { to: '/bulk', label: 'Bulk Upload', icon: Upload },
  { to: '/review', label: 'Review Queue', icon: ClipboardList },
  { to: '/teams', label: 'Teams', icon: Users },
];

const platformNav: SidebarNavItem[] = [
  { to: '/imvi-plus', label: 'IMVI+', icon: Zap },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { reviewQueue } = useAppState();
  const queueCount = reviewQueue.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen w-sidebar flex-col overflow-hidden bg-sidebar-base"
      style={{ boxShadow: '1px 0 0 0 rgba(168, 163, 153, 0.06)' }}
    >
      {/* top gold accent line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201, 162, 78, 0.0) 10%, rgba(201, 162, 78, 0.8) 50%, rgba(201, 162, 78, 0.0) 90%, transparent 100%)',
        }}
      />

      {/* ambient gold ceiling glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(201, 162, 78, 0.16) 0%, transparent 65%)',
        }}
      />

      {/* wordmark */}
      <div className="relative z-10 flex h-[72px] items-center px-6">
        <NavLink to="/dashboard" className="block" aria-label="IMVI dashboard">
          <IMVILogo height={28} tracking={0.12} />
        </NavLink>
        <span className="ml-3 mt-0.5 self-end font-display text-[9px] font-medium uppercase tracking-label-xl text-bone-muted/70">
          Portal
        </span>
      </div>

      {/* hairline */}
      <div className="mx-5 border-b border-bone-muted/10" />

      {/* primary nav */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-1">
          {primaryNav.map((item) => (
            <SidebarItem key={item.to} item={item} badge={item.to === '/review' ? String(queueCount) : undefined} />
          ))}
        </ul>

        <div className="mx-2 my-5 flex items-center gap-3">
          <span className="h-[1px] flex-1 bg-bone-muted/10" />
          <span className="font-display text-[9px] font-medium uppercase tracking-label-xl text-bone-muted/60">
            Platform
          </span>
          <span className="h-[1px] flex-1 bg-bone-muted/10" />
        </div>

        <ul className="space-y-1">
          {platformNav.map((item) => (
            <SidebarItem key={item.to} item={item} />
          ))}
        </ul>
      </nav>

      {/* admin badge bottom */}
      <div className="relative z-10 px-3 pb-6">
        <div className="mx-2 border-t border-bone-muted/10 pt-4">
          <div className="flex items-center gap-3 rounded-[10px] bg-ink-3/50 px-3 py-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-3/70"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(10,10,10,0.5)' }}
            >
              <span className="font-display text-[11px] font-bold tracking-[0.08em] text-gold-3">
                {admin.initials}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[12px] font-medium tracking-data-tight text-bone">
                {admin.name}
              </p>
              <p className="mt-0.5 truncate font-display text-[9px] font-medium uppercase tracking-label-md text-gold-3/90">
                {admin.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* active indicator is driven per-item — this is a hidden visual layer */}
      {pathname && null}
    </aside>
  );
}

function SidebarItem({ item, badge }: { item: SidebarNavItem; badge?: string }) {
  const Icon = item.icon;

  if (item.comingSoon) {
    return (
      <li>
        <NavLink
          to={item.to}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-[8px] px-3 py-2.5 font-display text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 ease-standard ${
              isActive
                ? 'bg-ink-3 text-bone'
                : 'text-bone-muted/70 hover:bg-ink-3/60 hover:text-bone-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <ActiveBar isActive={isActive} />
              <Icon size={18} strokeWidth={1.6} className={isActive ? 'text-gold-3' : 'text-bone-muted/70'} />
              <span className="flex-1">{item.label}</span>
              <span className="font-display text-[9px] font-medium uppercase tracking-label-md text-bone-muted/50">
                Soon
              </span>
            </>
          )}
        </NavLink>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 rounded-[8px] px-3 py-2.5 font-display text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 ease-standard ${
            isActive
              ? 'bg-ink-3 text-bone'
              : 'text-bone/90 hover:bg-ink-3/60 hover:text-bone'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <ActiveBar isActive={isActive} />
            <Icon size={18} strokeWidth={1.6} className={isActive ? 'text-gold-3' : 'text-bone-muted'} />
            <span className="flex-1">{item.label}</span>
            {badge && (
              <span
                className={`flex min-w-[22px] items-center justify-center rounded-full px-1.5 py-0.5 font-display text-[10px] font-bold tracking-[0.02em] ${
                  isActive ? 'bg-gold-3/20 text-gold-3' : 'bg-gold-3/10 text-gold-4'
                }`}
              >
                {badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}

function ActiveBar({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return (
    <span
      aria-hidden
      className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full"
      style={{
        background:
          'linear-gradient(180deg, #8B6A2F 0%, #F0D286 50%, #8B6A2F 100%)',
        boxShadow: '0 0 8px rgba(201, 162, 78, 0.6)',
      }}
    />
  );
}
