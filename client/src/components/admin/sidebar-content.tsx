'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems, logoutItem } from '@/lib/admin-nav';
import { ShieldCheck } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
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
        if (onNavigate) onNavigate();
      }
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error('Failed to log out.');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex h-16 items-center gap-3 border-b px-5 transition-opacity hover:opacity-90">
        <img
          src="/Nuvora-logo.png"
          alt="Nuvora Logo"
          className="h-9 w-auto object-contain"
        />
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
            Nuvora
          </span>
          <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Admin Console</span>
        </div>
      </Link>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Management
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-[18px] w-[18px]', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground text-left"
        >
          <logoutItem.icon className="h-[18px] w-[18px]" />
          {logoutItem.label}
        </button>
      </div>
    </div>
  );
}
