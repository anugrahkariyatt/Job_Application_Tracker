'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import { logout } from '@/features/auth/api/auth.api';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchHeaderData = async () => {
    try {
      const compResponse = await axiosInstance.get('/api/company');
      if (compResponse.data?.success) {
        setCompany(compResponse.data.data);
      }
    } catch (err) {
      console.error('Error loading header company:', err);
    }

    try {
      const notifResponse = await axiosInstance.get('/api/notifications');
      if (notifResponse.data?.success) {
        const unread = notifResponse.data.data.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error loading header notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHeaderData();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      dispatch(clearUser());
      toast.success('Signed out successfully.');
      router.push('/login');
    } catch (err) {
      console.error('Sign out failed:', err);
      dispatch(clearUser());
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search jobs, applicants, settings…"
          className="h-9 w-full rounded-md border border-input bg-muted/50 pl-9 pr-3 text-sm text-foreground outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Link
          href="/recruiter/notifications"
          className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full bg-muted"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                  {(user?.name || "R").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs font-normal text-muted-foreground text-ellipsis overflow-hidden">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/recruiter/company">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/recruiter/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}