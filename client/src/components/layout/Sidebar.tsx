"use client";

import { useEffect, useState } from "react";
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
  X,
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

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const [company, setCompany] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
    { label: "Company Profile", href: "/recruiter/company", icon: Building2 },
    { label: "Create Job", href: "/recruiter/jobs/new", icon: PlusCircle },
    { label: "My Jobs", href: "/recruiter/jobs", icon: Briefcase },
    { label: "Applicants", href: "/recruiter/applicants", icon: Users },
    {
      label: "Notifications",
      href: "/recruiter/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    { label: "Settings", href: "/recruiter/settings", icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col bg-background border-r border-border">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold text-foreground">Hireflow</span>
          <span className="text-xs text-muted-foreground">Recruiter</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 [scrollbar-width:thin]">
        {navItems.map((item) => {
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
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          {company?.logo ? (
            <img
              src={company.logo}
              alt={company.companyName}
              className="h-8 w-8 rounded-md object-cover ring-1 ring-border"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xs ring-1 ring-border">
              {(user?.name || "C").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-foreground">
              {company?.companyName || "Company Profile"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {company?.industry || "Unconfigured"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
