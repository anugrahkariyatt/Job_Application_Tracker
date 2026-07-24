"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Briefcase,
  Users,
  Bell,
  Settings,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import axiosInstance from "@/lib/axios";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const primaryNavItems: NavItem[] = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "My Jobs", href: "/recruiter/jobs", icon: Briefcase },
  { label: "Post a Job", href: "/recruiter/jobs/new", icon: PlusCircle },
  { label: "Applicants", href: "/recruiter/applicants", icon: Users },
  { label: "Company Profile", href: "/recruiter/company", icon: Building2 },
];

const secondaryNavItems: NavItem[] = [
  { label: "Notifications", href: "/recruiter/notifications", icon: Bell },
  { label: "Settings", href: "/recruiter/settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const isPro = user?.subscriptionPlan === "pro";

  const [company, setCompany] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const fetchSidebarData = async () => {
    try {
      const compResponse = await axiosInstance.get("/api/company");
      if (compResponse.data?.success) {
        setCompany(compResponse.data.data);
      }
    } catch (err) {
      console.error("Error loading sidebar company:", err);
    }

    try {
      const notifResponse = await axiosInstance.get("/api/notifications");
      if (notifResponse.data?.success) {
        const unread = notifResponse.data.data.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error loading sidebar notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSidebarData();
    }
  }, [user]);

  useEffect(() => {
    if (secondaryNavItems.some((item) => pathname.startsWith(item.href))) {
      setIsMoreOpen(true);
    }
  }, [pathname]);

  return (
    <div className="flex h-full flex-col bg-background border-r border-border justify-between">
      <div className="flex flex-col min-h-0 overflow-y-auto">
        {/* Header Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5 shrink-0">
          <img
            src="/Nuvora-logo.png"
            alt="Nuvora Logo"
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-foreground">Nuvora</span>
            <span className="text-xs text-muted-foreground">Recruiter Portal</span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {primaryNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/recruiter/dashboard" &&
                item.href !== "/recruiter/jobs" &&
                pathname.startsWith(item.href)) ||
              (item.href === "/recruiter/jobs" &&
                pathname.startsWith("/recruiter/jobs") &&
                pathname !== "/recruiter/jobs/new");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}

          {/* Collapsible Settings & Preferences */}
          <div className="pt-1">
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-4 w-4 shrink-0" />
                <span>Settings & More</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isMoreOpen && "rotate-180"
                )}
              />
            </button>

            {isMoreOpen && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-border/60 pl-2">
                {secondaryNavItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.href === "/recruiter/notifications" && unreadCount > 0 ? (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                          {unreadCount}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Section: Company Profile & Upgrade to PRO Badge */}
      <div className="border-t border-border p-3 space-y-2 shrink-0">
        <Link
          href="/recruiter/pricing"
          className={cn(
            "flex items-center justify-between rounded-xl p-3 text-xs font-bold transition-all shadow-sm",
            isPro
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/20 border border-amber-500/30 text-foreground hover:shadow-md"
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
            <span>{isPro ? "Recruiter PRO Active" : "Upgrade to PRO"}</span>
          </div>
          {!isPro && (
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
              PRO
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3 rounded-lg px-2.5 py-2 border border-border/50 bg-card/60">
          {company?.logo ? (
            <img
              src={company.logo}
              alt={company.companyName}
              className="h-8 w-8 rounded-md object-cover ring-1 ring-border shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {(company?.companyName || user?.name || "C").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-xs font-bold text-foreground">
              {company?.companyName || "Company Profile"}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {company?.industry || "Recruiter Account"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
