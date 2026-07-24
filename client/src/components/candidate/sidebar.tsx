'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Search,
  FileText,
  Bookmark,
  Bell,
  Building2,
  Settings,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// Core Primary Nav Items shown directly
const primaryNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/candidate', icon: LayoutDashboard },
  { label: 'My Profile', href: '/candidate/profile', icon: User },
  { label: 'Find Jobs', href: '/candidate/jobs', icon: Search },
  { label: 'Companies', href: '/candidate/companies', icon: Building2 },
  { label: 'Applied Jobs', href: '/candidate/applied', icon: FileText },
  { label: 'Saved Jobs', href: '/candidate/saved', icon: Bookmark },
];

// Secondary Nav Items inside Collapsible "Settings & More"
const secondaryNavItems: NavItem[] = [
  { label: 'Job Alerts', href: '/candidate/alerts', icon: Bell },
  { label: 'Company Subscriptions', href: '/candidate/subscriptions', icon: Building2 },
  { label: 'Notifications', href: '/candidate/notifications', icon: Bell },
  { label: 'Settings', href: '/candidate/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isPro = currentUser?.subscriptionPlan === 'pro';

  // State to toggle "Settings & More" dropdown section
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);

  // Auto-expand dropdown if current page is in secondaryNavItems
  React.useEffect(() => {
    if (secondaryNavItems.some((item) => pathname.startsWith(item.href))) {
      setIsMoreOpen(true);
    }
  }, [pathname]);

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 border-r bg-card transition-[width] duration-200 md:flex flex-col justify-between',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
    >
      <div className="flex flex-col min-h-0 overflow-y-auto">
        {/* Header Logo & Collapse Toggle */}
        <div className="flex h-16 items-center justify-between border-b px-4 shrink-0">
          <Link href="/candidate" className="flex items-center gap-2">
            <img
              src="/Nuvora-logo.png"
              alt="Nuvora Logo"
              className="h-8 w-auto object-contain"
            />
            {!collapsed && <span className="text-lg font-bold tracking-tight text-foreground">Nuvora</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>

        {/* Primary Navigation */}
        <div className="flex flex-col gap-1 p-3">
          <nav className="flex flex-col gap-1">
            {primaryNavItems.map((item) => {
              const active = item.href === '/candidate' ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}

            {/* "Settings & More" Collapsible Dropdown */}
            <div className="pt-1">
              {!collapsed ? (
                <div>
                  <button
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal className="h-4 w-4 shrink-0" />
                      <span>Settings & More</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isMoreOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  {isMoreOpen && (
                    <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-border/60 pl-2">
                      {secondaryNavItems.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                              active
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                            )}
                          >
                            <item.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Collapsed Icon Bar */
                <div className="flex flex-col gap-1 border-t pt-1">
                  {secondaryNavItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center justify-center rounded-lg py-2 text-sm transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                        title={item.label}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Upgrade to PRO Badge at Bottom */}
      <div className="p-3 border-t border-border/50 shrink-0">
        {!collapsed ? (
          <Link
            href="/candidate/pricing"
            className={cn(
              "flex items-center justify-between rounded-xl p-3 text-xs font-bold transition-all shadow-sm",
              isPro
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/20 border border-amber-500/30 text-foreground hover:shadow-md"
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
              <span>{isPro ? "Candidate PRO Active" : "Upgrade to PRO"}</span>
            </div>
            {!isPro && (
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                PRO
              </span>
            )}
          </Link>
        ) : (
          <Link
            href="/candidate/pricing"
            className="flex items-center justify-center rounded-lg p-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            title="Upgrade to PRO"
          >
            <Sparkles className="h-4 w-4 fill-amber-500" />
          </Link>
        )}
      </div>
    </aside>
  );
}

export const candidateNavItems = [...primaryNavItems, ...secondaryNavItems];
