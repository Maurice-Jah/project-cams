import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ShieldAlert, LayoutDashboard, Users, FileText, Search, AlertTriangle, FolderOpen, Menu, X, UserCog, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useGetDashboardSummary } from '@/lib/api';
import { Logo } from '@/components/logo';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cases', label: 'Cases', icon: FolderOpen },
  { href: '/children', label: 'Children', icon: Users },
  { href: '/workers', label: 'Workers', icon: ShieldAlert },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/investigations', label: 'Investigations', icon: Search },
];
const ADMIN_NAV = { href: '/users', label: 'Users & Access', icon: UserCog };

export function Layout({ children }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { data: summary } = useGetDashboardSummary();
  const criticalCount = summary?.criticalCases ?? 0;
  const nav = isAdmin ? [...NAV, ADMIN_NAV] : NAV;
  useEffect(() => { setOpen(false); }, [location]);
  const title = nav.find(n => location.startsWith(n.href))?.label || 'Workspace';
  const initials = (user?.name || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col h-full border-r border-sidebar-border',
        'transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border gap-3 shrink-0">
          <div className="text-blue-400 shrink-0"><Logo className="h-6 w-6" /></div>
          <span className="font-semibold text-lg tracking-tight">CAMS Portal</span>
          <button className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-3">Navigation</div>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer text-sm font-medium',
                  active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground')}>
                  <Icon className="h-4 w-4 shrink-0" />{label}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0"><span className="text-xs font-bold">{initials}</span></div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-sm font-medium truncate">{user?.name || 'Loading...'}</span>
              <span className="text-xs text-sidebar-foreground/50 truncate capitalize">{isAdmin ? 'Administrator' : (user?.role || '')}</span>
            </div>
            <Link href="/account" title="My account" className="ml-auto shrink-0 p-1.5 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <Settings className="h-4 w-4" />
            </Link>
            <button onClick={signOut} title="Sign out" className="shrink-0 p-1.5 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30 min-w-0">
        <header className="h-16 flex items-center px-4 sm:px-6 border-b border-border bg-card shrink-0 shadow-sm z-10 gap-3">
          <button className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <h2 className="text-base sm:text-lg font-medium text-foreground flex-1 truncate">{title}</h2>
          {criticalCount > 0 && (
            <Link href="/cases?priority=critical">
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium shrink-0 cursor-pointer">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{criticalCount} Critical {criticalCount === 1 ? 'Case' : 'Cases'}</span>
                <span className="sm:hidden">{criticalCount}</span>
              </div>
            </Link>
          )}
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-6xl">{children}</div></div>
      </main>
    </div>
  );
}
