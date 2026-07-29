'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Bell,
  Users,
  Building2,
  Briefcase,
  Loader2,
  X,
} from 'lucide-react';
import { MobileSidebar } from './mobile-sidebar';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SearchResult {
  users: Array<{ _id: string; name: string; email: string; role: string; isActive: boolean }>;
  companies: Array<{ _id: string; companyName: string; industry: string; location: string; verified: boolean }>;
  jobs: Array<{ _id: string; title: string; location: string; status: string; companyId?: { companyName: string } }>;
}

export function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosInstance.get('/api/notifications');
      if (response.data?.success) {
        const unread = response.data.data.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const name = user?.name || 'Admin User';
  const email = user?.email || 'admin@technocareers.com';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <MobileSidebar />



      <div className="ml-auto flex items-center gap-1.5">
        <a
          href="/admin/notifications"
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground mr-1.5 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
              {unreadCount}
            </span>
          )}
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-none sm:block">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{name}</span>
                <span className="text-xs font-normal text-muted-foreground">{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/admin/settings">
                <User className="mr-2 h-4 w-4" />
                Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
