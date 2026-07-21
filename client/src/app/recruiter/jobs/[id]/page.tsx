'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusChip } from '@/lib/status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  MapPin,
  Eye,
  Users,
  Calendar,
  Pencil,
  Ban,
  ArrowRight,
  Building2,
  DollarSign,
  Clock,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

import { use } from 'react';

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

      // Fetch applicants for this job
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </Card>
          ))}
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
        description={`${job.employmentType} · ${job.experienceLevel} · ${job.remote ? 'Remote' : 'Onsite'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/recruiter/dashboard' },
          { label: 'My Jobs', href: '/recruiter/jobs' },
          { label: job.title },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={togglingStatus}
            >
              {togglingStatus ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : job.status === 'Open' ? (
                <Ban className="mr-1.5 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-1.5 h-4 w-4" />
              )}
              {job.status === 'Open'
                ? 'Close Job'
                : job.status === 'Draft'
                ? 'Publish Job'
                : 'Re-open Job'}
            </Button>
            <Button size="sm" asChild>
              <Link href={`/applicants?job=${job._id}`}>
                <Users className="mr-1.5 h-4 w-4" />
                View Applicants
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Applications</span>
          </div>
          <p className="mt-1.5 text-xl font-semibold">{applicants.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">Vacancies</span>
          </div>
          <p className="mt-1.5 text-xl font-semibold">{job.vacancies || 1}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Posted</span>
          </div>
          <p className="mt-1.5 text-sm font-medium">
            {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Deadline</span>
          </div>
          <p className="mt-1.5 text-sm font-medium">
            {new Date(job.applicationDeadline).toLocaleDateString()}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Job Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow icon={MapPin} label="Location" value={`${job.location} · ${workModeText}`} />
                <InfoRow icon={Briefcase} label="Employment Type" value={job.employmentType} />
                <InfoRow icon={Building2} label="Experience Level" value={job.experienceLevel} />
                <InfoRow
                  icon={DollarSign}
                  label="Salary Range"
                  value={`${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()} USD`}
                />
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Skills Required</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s: string) => (
                    <Badge key={s} variant="secondary" className="font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {job.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.responsibilities.split('\n').map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.split('\n').map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold">Status</CardTitle>
              <StatusChip status={statusVal} />
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold">Recent Applicants</CardTitle>
              <Link
                href={`/applicants?job=${job._id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {applicants.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No applicants yet.</p>
              ) : (
                applicants.slice(0, 5).map((app: any) => {
                  const candidate = app.candidateId || {};
                  const user = candidate.userId || {};
                  return (
                    <Link
                      key={app._id}
                      href={`/applicants/${app._id}`}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                    >
                      {candidate.profileImage ? (
                        <img
                          src={candidate.profileImage}
                          alt={user.name || 'Applicant'}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xs">
                          {(user.name || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
