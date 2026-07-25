'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Trash2,
  Building2,
  Calendar,
  Globe,
  Award,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/admin/page-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface JobDetails {
  _id: string;
  title: string;
  description: string;
  responsibilities: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  employmentType: string;
  vacancies: number;
  experienceLevel: string;
  requirements: string | string[];
  companyId?: {
    _id: string;
    companyName: string;
    logo: string;
    location: string;
    industry: string;
    verified: boolean;
    description: string;
    website: string;
  };
  applicationsCount: number;
  createdAt: string;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const [job, setJob] = React.useState<JobDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const fetchJob = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/admin/jobs/${id}`);
      if (res.data?.success && res.data.data) {
        setJob(res.data.data);
      } else {
        toast.error('Job not found.');
        router.push('/admin/jobs');
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      toast.error('Failed to load job details.');
      router.push('/admin/jobs');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  React.useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/api/admin/jobs/${id}`);
      if (res.data?.success) {
        toast.success('Job posting deleted successfully.');
        router.push('/admin/jobs');
      }
    } catch (err: any) {
      console.error('Error deleting job:', err);
      toast.error(err.response?.data?.message || 'Failed to delete job posting.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        description={`Job ID: ${job._id}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Jobs', href: '/admin/jobs' },
          { label: 'Detail' },
        ]}
        actions={
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete Posting'}
          </Button>
        }
      />

      {/* Single Unified Master Card */}
      <Card className="overflow-hidden p-6 space-y-6">
        {/* Header with Company Logo, Title, Company Name, Industry, Website & Applications Pill */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-xl border border-border/50 shrink-0">
              <AvatarImage src={job.companyId?.logo} />
              <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary rounded-xl">
                {job.companyId?.companyName.slice(0, 2).toUpperCase() || 'CO'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                {job.title}
              </h2>
              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
                <span className="font-semibold text-primary">{job.companyId?.companyName}</span>
                {job.companyId?.verified && <CheckCircle className="h-3.5 w-3.5 fill-primary text-primary-foreground shrink-0" />}
                <span>·</span>
                <span>{job.companyId?.industry || 'Tech'}</span>
                {job.companyId?.website && (
                  <>
                    <span>·</span>
                    <a href={job.companyId.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5 font-medium">
                      <Globe className="h-3 w-3" /> Website
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1 rounded-full border border-border bg-muted/30 text-xs font-semibold text-foreground">
              <strong className="text-primary font-bold">{job.applicationsCount}</strong> Applications
            </div>
            <Badge variant="secondary" className="text-xs font-semibold">
              {job.employmentType}
            </Badge>
          </div>
        </div>

        {/* Specs Bar */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <Briefcase className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Vacancies</p>
              <p className="text-xs font-semibold">{job.vacancies || 1}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <DollarSign className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Salary (Annual)</p>
              <p className="text-xs font-semibold">
                {job.salaryMin !== undefined && job.salaryMax !== undefined
                  ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Location</p>
              <p className="text-xs font-semibold">{job.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <Award className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Experience Level</p>
              <p className="text-xs font-semibold">{job.experienceLevel}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Sections */}
        <div className="space-y-4 pt-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Job Description</h3>
            <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{job.description}</p>
          </div>

          {job.responsibilities && (
            <div className="pt-3 border-t border-border/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Responsibilities</h3>
              <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{job.responsibilities}</p>
            </div>
          )}

          {(() => {
            const reqList = typeof job.requirements === 'string'
              ? job.requirements.split('\n').filter((r) => r.trim() !== '')
              : Array.isArray(job.requirements)
              ? job.requirements
              : [];
            if (reqList.length === 0) return null;
            return (
              <div className="pt-3 border-t border-border/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Requirements</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {reqList.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(o) => !o && setShowDeleteDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <span className="font-semibold text-foreground">{job.title}</span>?
              This will also remove all candidate applications submitted for this role.
              <span className="mt-2 block font-medium text-destructive">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Posting'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
