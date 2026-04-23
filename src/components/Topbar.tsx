import { useLocation } from 'react-router-dom';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { admin, athleteById } from '../mock/data';

const routeLabels: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/design/new': ['Operations', 'Design', 'New team'],
  '/bulk': ['Operations', 'Bulk Onboarding'],
  '/review': ['Operations', 'Review Queue'],
  '/teams': ['Operations', 'Teams Directory'],
  '/imvi-plus': ['Platform', 'IMVI+'],
};

function breadcrumbsFor(pathname: string): string[] {
  if (routeLabels[pathname]) return routeLabels[pathname];
  if (pathname.startsWith('/design/')) return ['Operations', 'Design'];
  if (pathname.startsWith('/player/')) {
    const id = pathname.split('/')[2];
    const athlete = id ? athleteById(id) : undefined;
    const name = athlete ? `${athlete.firstName} ${athlete.lastName}` : 'Athlete';
    return ['Platform', 'Player', name];
  }
  return ['Dashboard'];
}

export function Topbar() {
  const { pathname } = useLocation();
  const crumbs = breadcrumbsFor(pathname);

  return (
    <header
      className="sticky top-0 z-20 ml-sidebar flex h-topbar items-center border-b border-bone-muted/8 bg-ink-2/90 px-8 backdrop-blur-md"
      style={{ boxShadow: '0 1px 0 0 rgba(168, 163, 153, 0.06)' }}
    >
      {/* breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <div key={`${crumb}-${idx}`} className="flex items-center gap-2">
              <span
                className={`font-display text-[13px] font-medium tracking-data-loose ${
                  isLast ? 'text-bone' : 'text-bone-muted/70'
                }`}
              >
                {crumb}
              </span>
              {!isLast && (
                <span className="font-display text-[13px] text-bone-muted/30">/</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* center search */}
      <div className="mx-auto flex min-w-0 max-w-[380px] flex-1 items-center gap-2.5 rounded-[10px] border border-bone-muted/10 bg-ink px-3 py-2 text-bone-muted/70 transition-colors hover:border-bone-muted/20">
        <Search size={15} strokeWidth={1.6} className="text-bone-muted/60" />
        <input
          type="text"
          placeholder="Search teams, athletes, sponsors…"
          className="flex-1 bg-transparent font-body text-[13px] font-light text-bone placeholder:text-bone-muted/50 focus:outline-none"
          readOnly
          onClick={(e) => e.currentTarget.blur()}
        />
        <span className="rounded-[4px] border border-bone-muted/15 px-1.5 py-0.5 font-display text-[9px] font-medium uppercase tracking-label-md text-bone-muted/60">
          /
        </span>
      </div>

      {/* right cluster */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-bone-muted transition-colors hover:bg-ink-3 hover:text-bone"
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={1.6} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold-3 shadow-[0_0_6px_rgba(201,162,78,0.8)]" />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-3/70"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(10,10,10,0.5)' }}
          >
            <span className="font-display text-[11px] font-bold tracking-[0.06em] text-gold-3">
              {admin.initials}
            </span>
          </div>
          <div className="hidden leading-tight lg:block">
            <p className="font-display text-[13px] font-medium tracking-data-tight text-bone">
              {admin.firstName}
            </p>
            <p className="font-display text-[9px] font-medium uppercase tracking-label-md text-gold-3/90">
              {admin.role}
            </p>
          </div>
          <ChevronDown size={14} strokeWidth={1.5} className="text-bone-muted/60" />
        </div>
      </div>
    </header>
  );
}
