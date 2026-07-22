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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced search
  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }
    try {
      setSearchLoading(true);
      const res = await axiosInstance.get(`/api/admin/search?q=${encodeURIComponent(q.trim())}`);
      if (res.data?.success) {
        setSearchResults(res.data.data);
        setSearchOpen(true);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!val.trim()) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }
    debounceTimer.current = setTimeout(() => performSearch(val), 350);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchOpen(false);
    inputRef.current?.focus();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResultClick = (href: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
    router.push(href);
  };

  const totalResults = searchResults
    ? searchResults.users.length + searchResults.companies.length + searchResults.jobs.length
    : 0;

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

      {/* Global Search */}
      <div className="relative hidden flex-1 max-w-md md:block" ref={searchRef}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchResults && totalResults > 0 && setSearchOpen(true)}
          placeholder="Search users, companies, jobs…"
          className="h-9 w-full rounded-lg border border-input bg-muted/40 pl-9 pr-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
        />
        {/* Clear / Loader icon */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          {searchLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : searchQuery ? (
            <button onClick={clearSearch} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Results Dropdown */}
        {searchOpen && searchResults && (
          <div className="absolute top-full mt-1.5 w-full rounded-xl border bg-popover shadow-xl z-50 overflow-hidden">
            {totalResults === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                No results found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                {/* Users */}
                {searchResults.users.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground border-b bg-muted/30">
                      <Users className="h-3.5 w-3.5" />
                      Users
                    </div>
                    {searchResults.users.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => handleResultClick(`/admin/users`)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : u.role === 'recruiter' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Companies */}
                {searchResults.companies.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground border-b bg-muted/30">
                      <Building2 className="h-3.5 w-3.5" />
                      Companies
                    </div>
                    {searchResults.companies.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => handleResultClick(`/admin/companies/${c._id}`)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold">
                          {c.companyName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{c.companyName}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.industry} · {c.location}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${c.verified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {c.verified ? 'Verified' : 'Pending'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Jobs */}
                {searchResults.jobs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground border-b bg-muted/30">
                      <Briefcase className="h-3.5 w-3.5" />
                      Jobs
                    </div>
                    {searchResults.jobs.map((j) => (
                      <button
                        key={j._id}
                        onClick={() => handleResultClick(`/admin/jobs/${j._id}`)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 text-xs font-semibold">
                          <Briefcase className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{j.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {j.companyId?.companyName} · {j.location}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${j.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {j.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer hint */}
                <div className="border-t px-3 py-2 text-center text-[11px] text-muted-foreground">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} · Press <kbd className="rounded border px-1 py-0.5 text-[10px] bg-muted font-mono">Esc</kbd> to close
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <a
          href="/admin/notifications"
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground mr-1.5 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
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
