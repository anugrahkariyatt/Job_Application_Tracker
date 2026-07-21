'use client';

import * as React from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Check, Trash2, MailOpen, AlertCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await axiosInstance.patch(`/api/notifications/${id}/read`);
      if (res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        toast.success('Notification marked as read.');
      }
    } catch (err) {
      toast.error('Failed to mark notification as read.');
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(
        unread.map((n) => axiosInstance.patch(`/api/notifications/${n._id}/read`))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const removeNotification = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/api/notifications/${id}`);
      if (res.data?.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success('Notification deleted.');
      }
    } catch (err) {
      toast.error('Failed to delete notification.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Notifications"
        description="Review alerts, registration approvals, and logs."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Notifications' }]}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          All Notifications ({notifications.length})
        </h2>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <MailOpen className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
          <div className="rounded-full bg-primary/10 p-4 text-primary mb-4">
            <Bell className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-medium">No Notifications</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            You're all caught up! There are no system notifications to review.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`transition-all duration-200 ${
                n.isRead ? 'opacity-70 bg-muted/20' : 'border-l-4 border-l-primary bg-background shadow-sm'
              }`}
            >
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="flex gap-3">
                  <div className={`mt-0.5 rounded-full p-2 ${n.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{n.title}</h4>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground/80">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => markAsRead(n._id)}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeNotification(n._id)}
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
