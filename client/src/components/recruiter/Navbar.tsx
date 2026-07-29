'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Menu,
  Settings,
  LogOut,
  Gem,
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

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isPro = user?.subscriptionPlan === 'pro';

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
    if (user?._id || user?.id) {
      fetchHeaderData();
    }
  }, [user?._id, user?.id]);

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
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-20 w-full items-center justify-between px-6 lg:px-10">
        {/* Left: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-10">
          <Link href="/recruiter/dashboard" className="flex items-center gap-3 shrink-0 transition-opacity hover:opacity-90">
            <img
              src="/Nuvora-logo.png"
              alt="Nuvora Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
              Nuvora
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
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
                    'relative py-2 text-sm font-medium transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full',
                    isActive
                      ? 'text-primary font-bold after:w-full'
                      : 'text-muted-foreground'
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

          {/* PRO Badge with Gem Icon */}
          <Link
            href="/recruiter/pricing"
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all",
              isPro
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
            )}
          >
            <Gem
              className={cn(
                "h-3.5 w-3.5",
                isPro
                  ? "text-emerald-500 fill-emerald-500/20"
                  : "text-muted-foreground"
              )}
            />
            <span>{isPro ? "PRO" : "Upgrade to PRO"}</span>
          </Link>

          {/* Notifications */}
          <Link
            href={user?.role === 'candidate' ? '/candidate/notifications' : '/recruiter/notifications'}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full p-0 overflow-hidden ring-2 ring-border/50 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Avatar className="h-full w-full rounded-full">
                  {company?.logo ? (
                    <AvatarImage src={company.logo} alt={company?.companyName || user?.name} className="object-cover h-full w-full" />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold h-full w-full flex items-center justify-center">
                    {(company?.companyName || user?.name || 'R').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2">
              <DropdownMenuLabel className="p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 rounded-md border shrink-0">
                    {company?.logo ? (
                      <AvatarImage src={company.logo} alt={company?.companyName} className="object-cover h-full w-full" />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-md">
                      {(company?.companyName || user?.name || 'R').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-foreground truncate">{user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {company?.companyName || user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/recruiter/company" className="cursor-pointer">
                  Company Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recruiter/pricing" className="cursor-pointer">
                  Subscription Plans
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recruiter/settings" className="cursor-pointer">
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