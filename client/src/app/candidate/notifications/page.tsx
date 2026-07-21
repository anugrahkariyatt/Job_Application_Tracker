"use client";

import * as React from "react";
import {
  Bell,
  FileText,
  TrendingUp,
  Video,
  Trash2,
  CheckCheck,
  MailOpen,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/candidate/page-header";
import { EmptyState } from "@/components/candidate/empty-state";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { mapNotificationToFrontend } from "@/lib/candidate-mappers";
import { relativeTime } from "@/lib/candidate-data";

interface NotificationItem {
  id: string;
  type: "application" | "job_alert" | "company" | "interview";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const iconMap = {
  application: {
    icon: FileText,
    className: "bg-primary-light text-primary",
  },

  job_alert: {
    icon: Bell,
    className: "bg-accent text-accent-foreground",
  },

  company: {
    icon: TrendingUp,
    className: "bg-secondary text-primary",
  },

  interview: {
    icon: Video,
    className: "bg-muted text-primary",
  },
};

const typeLabels: Record<NotificationItem["type"], string> = {
  application: "Application Update",
  job_alert: "Job Alert",
  company: "Company Update",
  interview: "Interview",
};

export default function NotificationsPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/notifications");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setItems(res.data.data.map(mapNotificationToFrontend));
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const filtered = items.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const markAsRead = async (id: string) => {
    try {
      const res = await axiosInstance.patch(`/api/notifications/${id}/read`);
      if (res.data?.success) {
        setItems(items.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } catch (err) {
      console.error("Mark notification read error:", err);
    }
  };

  const markAllRead = async () => {
    const unread = items.filter((n) => !n.read);
    try {
      await Promise.all(
        unread.map((n) =>
          axiosInstance.patch(`/api/notifications/${n.id}/read`),
        ),
      );
      setItems(items.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read.");
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/api/notifications/${id}`);
      if (res.data?.success) {
        setItems(items.filter((n) => n.id !== id));
        toast.success("Notification deleted.");
      }
    } catch (err) {
      console.error("Delete notification error:", err);
      toast.error("Failed to delete notification.");
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread of ${items.length} total`}
      >
        <Button
          variant="outline"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark All Read
        </Button>
      </PageHeader>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread" className="gap-1.5">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            filter === "unread"
              ? "You don't have any unread notifications."
              : filter === "read"
                ? "You don't have any read notifications yet."
                : "You don't have any notifications yet."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const config = iconMap[item.type] || iconMap.application;
            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-all",
                  !item.read &&
                    "border-primary/30 bg-primary/5 dark:bg-primary/950",
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      config.className,
                    )}
                  >
                    <config.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {typeLabels[item.type]}
                      </span>
                      {!item.read && (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1 text-[10px]"
                        >
                          New
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-1 font-semibold text-sm leading-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {relativeTime(item.time)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!item.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        onClick={() => markAsRead(item.id)}
                        title="Mark as read"
                      >
                        <MailOpen className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive animate-pulse-hover"
                      onClick={() => deleteNotification(item.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
