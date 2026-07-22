'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, FileText, Eye, Ban, Loader2, Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/candidate/page-header';
import { StatusBadge } from '@/components/candidate/status-badge';
import { EmptyState } from '@/components/candidate/empty-state';
import { formatDate, type ApplicationStatus } from '@/lib/candidate-data';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { mapApplicationToFrontend } from '@/lib/candidate-mappers';

const statusOptions: ApplicationStatus[] = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];

export default function AppliedJobsPage() {
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [withdrawTarget, setWithdrawTarget] = React.useState<string | null>(null);
  const [appList, setAppList] = React.useState<any[]>([]);
  const [interviews, setInterviews] = React.useState<any[]>([]);
  const [selectedInterview, setSelectedInterview] = React.useState<any>(null);
  const [interviewDialogOpen, setInterviewDialogOpen] = React.useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/application');
      if (response.data?.success && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map(mapApplicationToFrontend);
        setAppList(mapped);
      }
      
      try {
        const interviewRes = await axiosInstance.get('/api/interviews');
        if (interviewRes.data?.success && Array.isArray(interviewRes.data.data)) {
          setInterviews(interviewRes.data.data);
        }
      } catch (ivErr) {
        console.error('Fetch interviews error:', ivErr);
      }
    } catch (err: any) {
      console.error('Fetch applied jobs error:', err);
      toast.error('Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = appList.filter((app) => {
    const matchSearch = !search ||
      app.job.title.toLowerCase().includes(search.toLowerCase()) ||
      app.job.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      const response = await axiosInstance.delete(`/api/application/${withdrawTarget}`);
      if (response.data?.success) {
        setAppList(appList.filter((a) => a.id !== withdrawTarget));
        toast.success('Application withdrawn successfully.');
      }
    } catch (err: any) {
      console.error('Withdraw error:', err);
      toast.error(err.response?.data?.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading applied jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Applied Jobs" description={`You've applied to ${appList.length} jobs`} />

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search applied jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description="You haven't applied to any jobs matching these filters yet."
          action={<Button asChild><Link href="/candidate/jobs">Find Jobs</Link></Button>}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden sm:table-cell">Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link href={`/candidate/jobs/${app.jobId}`} className="font-medium hover:underline">
                        {app.job.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{app.job.company}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(app.appliedDate)}</TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {app.status === 'Interview' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary hover:bg-primary/5 border-primary/20"
                            onClick={() => {
                              const iv = interviews.find((i) => i.applicationId === app.id || i.applicationId?._id === app.id);
                              if (iv) {
                                setSelectedInterview(iv);
                                setInterviewDialogOpen(true);
                              } else {
                                toast.error('Interview details not found.');
                              }
                            }}
                            title="View Interview Details"
                          >
                            <Calendar className="mr-1.5 h-3.5 w-3.5" />
                            Interview
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/candidate/jobs/${app.jobId}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                        {app.allowWithdraw !== false ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/5 border-destructive/20"
                            onClick={() => setWithdrawTarget(app.id)}
                            title="Withdraw Application"
                          >
                            <Ban className="mr-1.5 h-3.5 w-3.5" />
                            Withdraw
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground/40 bg-muted/20 border-muted-foreground/10 cursor-not-allowed"
                            disabled
                            title="Withdrawals disabled by employer"
                          >
                            <Ban className="mr-1.5 h-3.5 w-3.5" />
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Dialog */}
      <Dialog open={!!withdrawTarget} onOpenChange={(open) => !open && setWithdrawTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Application?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The employer will be notified that you've withdrawn your application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleWithdraw}>Withdraw</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Interview Details Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>
              Details of your scheduled interview round.
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-semibold text-foreground">Round</span>
                <span className="text-sm font-medium">{selectedInterview.title}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-semibold text-foreground">Date & Time</span>
                <span className="text-sm font-medium">{new Date(selectedInterview.date).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-semibold text-foreground">Format</span>
                <span className="text-sm font-medium">{selectedInterview.type}</span>
              </div>
              {selectedInterview.link && (
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-foreground block">Meeting Link / Location</span>
                  <a
                    href={selectedInterview.link.startsWith('http') ? selectedInterview.link : `https://${selectedInterview.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline font-medium break-all block"
                  >
                    {selectedInterview.link}
                  </a>
                </div>
              )}
              {selectedInterview.notes && (
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-foreground block">Recruiter Instructions</span>
                  <p className="text-sm text-muted-foreground bg-muted p-2.5 rounded border leading-relaxed whitespace-pre-line">
                    {selectedInterview.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setInterviewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
