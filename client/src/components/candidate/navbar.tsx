'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sidebar, candidateNavItems } from '@/components/candidate/sidebar';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function Navbar({ collapsed, onToggleSidebar }: NavbarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState('');
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [searchVal, setSearchVal] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    if (pathname.startsWith('/candidate/companies')) {
      router.push(`/candidate/companies?search=${encodeURIComponent(searchVal)}`);
    } else {
      router.push(`/candidate/jobs?search=${encodeURIComponent(searchVal)}`);
    }
  };

  React.useEffect(() => {
    const fetchCandidateImg = async () => {
      try {
        const res = await axiosInstance.get('/api/candidate');
        if (res.data?.success && res.data.data?.profileImage) {
          setProfileImage(res.data.data.profileImage);
        }
      } catch (err) {
        // Silent catch
      }
    };
    const fetchUnreadNotifications = async () => {
      try {
        const res = await axiosInstance.get('/api/notifications');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const unread = res.data.data.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        // Silent catch
      }
    };
    if (user) {
      fetchCandidateImg();
      fetchUnreadNotifications();
    }
  }, [user]);

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

  const name = user?.name || 'Candidate';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-card/95 px-4 backdrop-blur lg:px-6">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">T</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Techno Careers</span>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {candidateNavItems.map((item) => {
              const active = item.href === '/candidate' ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer text-left w-full"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs, companies..."
          className="pl-9"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notifications" asChild className="relative">
          <Link href="/candidate/notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
                {unreadCount}
              </span>
            )}
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profileImage} alt={name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{name.split(' ')[0]}</span>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/candidate/profile">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/candidate/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
