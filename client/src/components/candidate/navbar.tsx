'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Settings,
  LogOut,
  Gem,

} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', href: '/candidate' },
  { label: 'Find Jobs', href: '/candidate/jobs' },
  { label: 'Companies', href: '/candidate/companies' },
  { label: 'Applied Jobs', href: '/candidate/applied' },
  { label: 'Saved Jobs', href: '/candidate/saved' },
];

export function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isPro = user?.subscriptionPlan === 'pro';

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState('');
  const [unreadCount, setUnreadCount] = React.useState(0);

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
      dispatch(clearUser());
      router.push('/login');
    }
  };

  const name = user?.name || 'Candidate';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-20 w-full items-center justify-between px-6 lg:px-10">
        {/* Left: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-10">
          <Link href="/candidate" className="flex items-center gap-3 shrink-0 transition-opacity hover:opacity-90">
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
                item.href === '/candidate'
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

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

          <Link
            href="/candidate/pricing"
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
            href="/candidate/notifications"
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
                className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-muted p-0 ring-2 ring-border/50 hover:ring-primary/40"
              >
                <Avatar className="h-10 w-10 sm:h-11 sm:w-11">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt={name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{name}</span>
                <span className="text-xs font-normal text-muted-foreground text-ellipsis overflow-hidden">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/candidate/profile" className="cursor-pointer">
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/candidate/alerts" className="cursor-pointer">
                  Job Alerts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/candidate/subscriptions" className="cursor-pointer">
                  Subscriptions
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/candidate/pricing" className="cursor-pointer">
                  Subscription Plans
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/candidate/settings" className="cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
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
                    item.href === '/candidate'
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

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
                  href="/candidate/settings"
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
                    handleLogout();
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
