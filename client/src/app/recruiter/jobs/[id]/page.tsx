'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusChip } from '@/lib/status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const jobResponse = await axiosInstance.get(`/api/jobs/${id}`);
      if (jobResponse.data?.success) {
        setJob(jobResponse.data.data);
      }

      try {
        const appResponse = await axiosInstance.get(`/api/application/job/${id}`);
        if (appResponse.data?.success) {
          setApplicants(appResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching job applicants:', err);
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      toast.error('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!job) return;
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    
    try {
      setTogglingStatus(true);
      const response = await axiosInstance.patch(`/api/jobs/${job._id}/status`, {
        status: newStatus,
      });
      if (response.data?.success) {
        toast.success(`Job status changed to ${newStatus === 'Open' ? 'Published' : 'Closed'}.`);
        setJob((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error changing job status:', err);
      toast.error('Failed to update job status.');
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[600px] w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">Job posting not found.</p>
        <Link href="/recruiter/jobs" className="text-primary hover:underline mt-2 inline-block">
          Back to Jobs List
        </Link>
      </div>
    );
  }

  const workModeText = job.remote ? 'Remote' : 'Onsite';
  const statusVal = job.status === 'Open' ? 'Published' : job.status;

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        description={`${job.employmentType} · ${job.experienceLevel} · ${workModeText}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/recruiter/dashboard' },
          { label: 'My Jobs', href: '/recruiter/jobs' },
          { label: job.title },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/recruiter/jobs/${job._id}/edit`}>
                Edit Job
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={togglingStatus}
            >
              {togglingStatus
                ? 'Updating...'
                : job.status === 'Open'
                ? 'Close Job'
                : job.status === 'Draft'
                ? 'Publish Job'
                : 'Re-open Job'}
            </Button>
            <Button size="sm" asChild>
              <Link href={`/recruiter/applicants?job=${job._id}`}>
                View Applicants
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* MAIN DETAILS */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-8">
            
            {/* Inline Stats */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-4">
              <StatItem label="Applications" value={applicants.length} />
              <StatItem label="Vacancies" value={job.vacancies || 1} />
              <StatItem label="Posted" value={new Date(job.createdAt).toLocaleDateString()} />
              <StatItem label="Deadline" value={new Date(job.applicationDeadline).toLocaleDateString()} />
            </div>

            {/* Overview Section */}
            <div>
              <h3 className="mb-4 text-base font-semibold">Job Overview</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow label="Location" value={`${job.location} · ${workModeText}`} />
                <InfoRow label="Employment Type" value={job.employmentType} />
                <InfoRow label="Experience Level" value={job.experienceLevel} />
                <InfoRow
                  label="Salary Range"
                  value={`${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()} ${job.currency || 'USD'}`}
                />
              </div>
              
              <div className="mt-6">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Skills Required</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s: string) => (
                    <Badge key={s} variant="secondary" className="font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Description Section */}
            <div>
              <h3 className="mb-3 text-base font-semibold">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {job.description}
              </p>
            </div>

            <hr className="border-border" />

            {/* Requirements & Responsibilities Split */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-base font-semibold">Responsibilities</h3>
                <ul className="space-y-2">
                  {job.responsibilities.split('\n').map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-base font-semibold">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.split('\n').map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SIDEBAR */}
        <Card className="h-fit">
          <CardHeader className="flex-row items-center justify-between border-b pb-4 space-y-0">
            <CardTitle className="text-base font-semibold">Status</CardTitle>
            <StatusChip status={statusVal} />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Recent Applicants</h3>
              <Link
                href={`/recruiter/applicants?job=${job._id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-1">
              {applicants.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No applicants yet.</p>
              ) : (
                applicants.slice(0, 5).map((app: any) => {
                  const candidate = app.candidateId || {};
                  const user = candidate.userId || {};
                  return (
                    <Link
                      key={app._id}
                      href={`/recruiter/applicants/${app._id}`}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {(user.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {user.name || 'Applicant'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusChip status={app.status} />
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Updated Sub-components (Icons removed completely)
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <p className="text-lg font-semibold leading-none">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}