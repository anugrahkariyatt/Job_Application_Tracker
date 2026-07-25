'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  Settings,
  LogOut,
  Building2,
  Sparkles,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import { logout } from '@/features/auth/api/auth.api';
import { useRouter, usePathname } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/recruiter/dashboard' },
  { label: 'My Jobs', href: '/recruiter/jobs' },
  { label: 'Post Job', href: '/recruiter/jobs/new' },
  { label: 'Applicants', href: '/recruiter/applicants' },
];

export function RecruiterNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isPro = user?.subscriptionPlan === 'pro';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;

    if (pathname.startsWith('/recruiter/applicants')) {
      router.push(`/recruiter/applicants?search=${encodeURIComponent(searchVal)}`);
    } else {
      router.push(`/recruiter/jobs?search=${encodeURIComponent(searchVal)}`);
    }
  };

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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex h-20 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/recruiter/dashboard" className="flex items-center gap-3 shrink-0">
            <img
              src="/Nuvora-logo.png"
              alt="Nuvora Logo"
              className="h-10 sm:h-11 w-auto object-contain"
            />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
                Nuvora
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/recruiter/dashboard' &&
                  item.href !== '/recruiter/jobs' &&
                  pathname.startsWith(item.href)) ||
                (item.href === '/recruiter/jobs' &&
                  pathname.startsWith('/recruiter/jobs') &&
                  pathname !== '/recruiter/jobs/new');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3.5 py-2.5 text-sm sm:text-base font-semibold transition-colors',
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-52 xl:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search jobs & candidates..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-muted/40 pl-9.5 pr-3 text-sm text-foreground outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-1 focus:ring-ring"
            />
          </form>

          {/* PRO Upgrade Badge */}
          <Link
            href="/recruiter/pricing"
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black tracking-wider uppercase transition-all duration-200 shadow-md hover:scale-105',
              isPro
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/25 ring-2 ring-amber-400/40 hover:shadow-lg hover:shadow-amber-500/35'
            )}
          >
            <Sparkles className="h-3.5 w-3.5 fill-white text-white animate-pulse shrink-0" />
            <span>{isPro ? 'PRO Active' : 'Upgrade PRO'}</span>
          </Link>

          {/* Notifications */}
          <Link
            href="/recruiter/notifications"
            className="relative rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-muted p-0 ring-2 ring-border/50 hover:ring-primary/40"
              >
                <Avatar className="h-10 w-10 sm:h-11 sm:w-11">
                  {company?.logo ? (
                    <AvatarImage src={company.logo} alt={user?.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {(user?.name || 'R').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground text-ellipsis overflow-hidden">
                  {company?.companyName || user?.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/recruiter/company" className="cursor-pointer">
                  <Building2 className="mr-2 h-4 w-4 text-primary" />
                  Company Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recruiter/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4 text-primary" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recruiter/pricing" className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                  Subscription Plans
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

          {/* Mobile Menu Button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetHeader className="pb-4 text-left border-b border-border">
                <SheetTitle className="flex items-center gap-2.5">
                  <img
                    src="/Nuvora-logo.png"
                    alt="Nuvora Logo"
                    className="h-7 w-auto object-contain"
                  />
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
                    Nuvora
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/recruiter/dashboard' &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/recruiter/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="mt-6 border-t border-border pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export const Navbar = RecruiterNavbar;
