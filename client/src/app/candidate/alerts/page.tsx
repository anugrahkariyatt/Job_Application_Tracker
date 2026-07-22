'use client';

import * as React from 'react';
import { Bell, Plus, Pencil, Trash2, MapPin, Search, Loader2 } from 'lucide-react';
import { z } from 'zod';

const alertFormSchema = z.object({
  keyword: z.string().trim().min(1, 'Keyword is required'),
  location: z.string().trim().optional(),
});

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/candidate/page-header';
import { EmptyState } from '@/components/candidate/empty-state';
import { formatDate } from '@/lib/candidate-data';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface UIJobAlert {
  id: string;
  keyword: string;
  location: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  active: boolean;
  createdAt: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  remote: boolean;
}

export default function JobAlertsPage() {
  const [loading, setLoading] = React.useState(true);
  const [alerts, setAlerts] = React.useState<UIJobAlert[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<UIJobAlert | null>(null);
  const [form, setForm] = React.useState({
    keyword: '',
    location: '',
    employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract' | 'Internship',
    remote: false,
    frequency: 'Daily' as 'Daily' | 'Weekly' | 'Monthly'
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prevErr) => {
        const copy = { ...prevErr };
        delete copy[field];
        return copy;
      });
    }
  };

  const mapAlertToUI = (dbAlert: any): UIJobAlert => {
    return {
      id: dbAlert._id,
      keyword: dbAlert.keywords?.join(', ') || '',
      location: dbAlert.location || '',
      frequency: 'Daily', // Mock default frequency
      active: dbAlert.isActive ?? true,
      createdAt: dbAlert.createdAt || new Date().toISOString(),
      employmentType: dbAlert.employmentType || 'Full-time',
      remote: dbAlert.remote || false,
    };
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/job-alerts');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAlerts(res.data.data.map(mapAlertToUI));
      }
    } catch (err) {
      console.error('Fetch job alerts error:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAlerts();
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ keyword: '', location: '', employmentType: 'Full-time', remote: false, frequency: 'Daily' });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (alert: UIJobAlert) => {
    setEditTarget(alert);
    setForm({
      keyword: alert.keyword,
      location: alert.location,
      employmentType: alert.employmentType,
      remote: alert.remote,
      frequency: alert.frequency
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setErrors({});
    const validation = alertFormSchema.safeParse(form);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const payload = {
        keywords: form.keyword.split(',').map((k) => k.trim()),
        location: form.location,
        employmentType: form.employmentType,
        remote: form.remote,
      };

      if (editTarget) {
        const res = await axiosInstance.patch(`/api/job-alerts/${editTarget.id}`, payload);
        if (res.data?.success) {
          toast.success('Job alert updated.');
          fetchAlerts();
        }
      } else {
        const res = await axiosInstance.post('/api/job-alerts', payload);
        if (res.data?.success) {
          toast.success('Job alert created.');
          fetchAlerts();
        }
      }
      setDialogOpen(false);
    } catch (err: any) {
      console.error('Save alert error:', err);
      toast.error(err.response?.data?.message || 'Failed to save job alert.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/api/job-alerts/${id}`);
      if (res.data?.success) {
        setAlerts(alerts.filter((a) => a.id !== id));
        toast.success('Job alert deleted.');
      }
    } catch (err) {
      console.error('Delete alert error:', err);
      toast.error('Failed to delete job alert.');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await axiosInstance.patch(`/api/job-alerts/${id}`, {
        isActive: !currentStatus,
      });
      if (res.data?.success) {
        setAlerts(alerts.map((a) => (a.id === id ? { ...a, active: !currentStatus } : a)));
        toast.success(!currentStatus ? 'Alert activated.' : 'Alert paused.');
      }
    } catch (err) {
      console.error('Toggle alert error:', err);
      toast.error('Failed to update alert state.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading job alerts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Job Alerts" description="Get notified when new jobs match your criteria">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Alert
        </Button>
      </PageHeader>

      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No job alerts"
          description="Create an alert to get notified when new jobs match your search criteria."
          action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create Alert</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{alert.keyword}</p>
                      {alert.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />{alert.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch checked={alert.active} onCheckedChange={() => toggleActive(alert.id, alert.active)} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-normal">{alert.frequency}</Badge>
                    <Badge variant="outline" className="font-normal">{alert.employmentType}</Badge>
                    {alert.remote && <Badge variant="secondary" className="bg-sky-50 text-sky-700 font-normal">Remote</Badge>}
                    <Badge variant={alert.active ? 'default' : 'outline'} className="font-normal">
                      {alert.active ? 'Active' : 'Paused'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Created {formatDate(alert.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(alert)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" />Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="mr-1 h-3.5 w-3.5" />Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this alert?</AlertDialogTitle>
                        <AlertDialogDescription>You will stop receiving notifications for "{alert.keyword}".</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(alert.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Alert' : 'Create Job Alert'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="keyword">Keyword</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="keyword"
                  placeholder="e.g. Frontend, React"
                  value={form.keyword}
                  onChange={(e) => handleFieldChange('keyword', e.target.value)}
                  className="pl-9"
                />
              </div>
              {errors.keyword && (
                <p className="mt-1 text-xs text-destructive font-medium">{errors.keyword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="alertLocation">Location</Label>
              <Input
                id="alertLocation"
                placeholder="e.g. Remote or San Francisco, CA"
                value={form.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-destructive font-medium">{errors.location}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v as any })}>
                <SelectTrigger id="employmentType"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-1">
              <Label htmlFor="remoteAlert" className="cursor-pointer">Remote Only</Label>
              <Switch id="remoteAlert" checked={form.remote} onCheckedChange={(v) => setForm({ ...form, remote: v })} />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editTarget ? 'Save Changes' : 'Create Alert'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
