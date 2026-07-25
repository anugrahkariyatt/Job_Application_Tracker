'use client';

import * as React from 'react';
import { Bell, Plus, Pencil, Trash2, MapPin, Search, Loader2 } from 'lucide-react';
import { z } from 'zod';

const alertFormSchema = z.object({
  keyword: z.string().trim().min(1, 'Keyword is required'),
  location: z.string().trim().optional(),
});

import { Skeleton } from '@/components/ui/skeleton';
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

  return (
    <div className="space-y-6 flex-1 flex flex-col min-h-[calc(100vh-10rem)]">
      <PageHeader title="Job Alerts" description="Get notified when new jobs match your criteria">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Alert
        </Button>
      </PageHeader>

      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3.5 w-1/3" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={Bell}
              title="No job alerts"
              description="Create an alert to get notified when new jobs match your search criteria."
              action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create Alert</Button>}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className="relative overflow-hidden border border-border/60 shadow-xs hover:shadow-md hover:border-primary/40 transition-all rounded-2xl bg-card flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Row: Target Keywords & Active Switch */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-foreground tracking-tight">{alert.keyword}</h3>
                        <Badge
                          variant={alert.active ? 'default' : 'secondary'}
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        >
                          {alert.active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      {alert.location ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          {alert.location}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          Any Location
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.active}
                        onCheckedChange={() => toggleActive(alert.id, alert.active)}
                      />
                    </div>
                  </div>

                  {/* Metadata Badges Row */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Badge variant="outline" className="text-xs font-normal border-border/70 bg-muted/30">
                      {alert.frequency} Digest
                    </Badge>
                    <Badge variant="outline" className="text-xs font-normal border-border/70 bg-muted/30">
                      {alert.employmentType}
                    </Badge>
                    {alert.remote && (
                      <Badge variant="outline" className="text-xs font-normal border-primary/30 text-primary bg-primary/5">
                        Remote Only
                      </Badge>
                    )}
                  </div>

                  {/* Footer Row: Created Date & Actions */}
                  <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-2 text-xs text-muted-foreground">
                    <span>Created {formatDate(alert.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(alert)} className="h-8 px-2 text-xs font-medium">
                        <Pencil className="mr-1 h-3.5 w-3.5 text-muted-foreground" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this alert?</AlertDialogTitle>
                            <AlertDialogDescription>You will stop receiving job notifications for "{alert.keyword}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(alert.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
