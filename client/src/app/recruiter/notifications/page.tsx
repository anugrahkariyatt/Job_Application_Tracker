'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  UserPlus,
  Clock,
  BadgeCheck,
  Info,
  Check,
  Trash2,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  APPLICATION: { icon: UserPlus, color: 'bg-info/10 text-info' },
  JOB_ALERT: { icon: Clock, color: 'bg-warning/10 text-warning' },
  SUBSCRIPTION: { icon: BadgeCheck, color: 'bg-success/10 text-success' },
  SYSTEM: { icon: Info, color: 'bg-muted text-muted-foreground' },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/notifications');
      if (response.data?.success) {
        setNotifs(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const markRead = async (id: string) => {
    try {
      const response = await axiosInstance.patch(`/api/notifications/${id}/read`);
      if (response.data?.success) {
        setNotifs((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking read:', err);
      toast.error('Failed to mark notification as read.');
    }
  };

  const markAllRead = async () => {
    const unread = notifs.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    try {
      setClearing(true);
      await Promise.all(
        unread.map((n) => axiosInstance.patch(`/api/notifications/${n._id}/read`))
      );
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      console.error('Error marking all read:', err);
      toast.error('Failed to mark all notifications as read.');
    } finally {
      setClearing(false);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/api/notifications/${id}`);
      if (response.data?.success) {
        setNotifs((prev) => prev.filter((n) => n._id !== id));
        toast.success('Notification deleted.');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification.');
    }
  };

  const deleteAll = async () => {
    if (notifs.length === 0) return;
    if (!confirm('Are you sure you want to delete all notifications?')) return;

    try {
      setClearing(true);
      await Promise.all(
        notifs.map((n) => axiosInstance.delete(`/api/notifications/${n._id}`))
      );
      setNotifs([]);
      toast.success('All notifications deleted.');
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      toast.error('Failed to delete all notifications.');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="p-4 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 py-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/recruiter/dashboard' },
          { label: 'Notifications' },
        ]}
        icon={Bell}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              disabled={unreadCount === 0 || clearing}
            >
              {clearing ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-1.5 h-4 w-4" />
              )}
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteAll}
              disabled={notifs.length === 0 || clearing}
            >
              {clearing ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-4 w-4" />
              )}
              Delete All
            </Button>
          </>
        }
      />

      {notifs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Bell className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">No notifications</p>
          <p className="text-sm text-muted-foreground">
            You're all caught up. New notifications will appear here.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {notifs.map((n) => {
              const config = typeConfig[n.type] || typeConfig.SYSTEM;
              const Icon = config.icon;
              return (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 p-4 transition-colors hover:bg-accent/50 ${!n.isRead ? 'bg-primary/[0.03]' : ''}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {new Date(n.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n._id)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotif(n._id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
