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
  LogOut,
  ChevronLeft,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/candidate', icon: LayoutDashboard },
  { label: 'My Profile', href: '/candidate/profile', icon: User },
  { label: 'Find Jobs', href: '/candidate/jobs', icon: Search },
  { label: 'Companies', href: '/candidate/companies', icon: Building2 },
  { label: 'Applied Jobs', href: '/candidate/applied', icon: FileText },
  { label: 'Saved Jobs', href: '/candidate/saved', icon: Bookmark },
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
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post('/api/auth/logout');
      if (response.data?.success) {
        dispatch(clearUser());
        toast.success('Successfully logged out.');
        router.push('/login');
      }
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error('Failed to log out.');
    }
  };

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 border-r bg-card transition-[width] duration-200 md:block',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Link href="/candidate" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">T</span>
          </div>
          {!collapsed && <span className="text-lg font-bold tracking-tight">Techno Careers</span>}
        </Link>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="mb-1 h-8 w-8 self-end"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = item.href === '/candidate' ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t p-3">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer text-left',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export { navItems as candidateNavItems };
