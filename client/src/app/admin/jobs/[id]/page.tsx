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
    if (!window.confirm('Are you sure you want to delete this job posting? This will also delete all associated applications.')) {
      return;
    }
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
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete Posting'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Job Details Card */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/50 bg-background/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vacancies</p>
                    <p className="text-sm font-semibold">{job.vacancies || 1}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Salary Range (Annual)</p>
                    <p className="text-sm font-semibold">
                      {job.salaryMin !== undefined && job.salaryMax !== undefined
                        ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-rose-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-semibold">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Job Type</p>
                    <Badge variant="secondary" className="mt-0.5">{job.employmentType}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Experience Level</p>
                    <p className="text-sm font-semibold">{job.experienceLevel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Posted Date</p>
                    <p className="text-sm font-semibold">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">Job Description</h3>
                <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{job.description}</p>
              </div>

              {job.responsibilities && (
                <div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">Responsibilities</h3>
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
                  <div>
                    <h3 className="mb-3 text-base font-semibold text-foreground">Requirements</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {reqList.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Company and Stats Columns */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-background/60 backdrop-blur-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex justify-center">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={job.companyId?.logo} />
                  <AvatarFallback className="bg-primary/5 text-xl font-bold text-primary">
                    {job.companyId?.companyName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-lg font-bold flex items-center justify-center gap-1.5">
                {job.companyId?.companyName}
                {job.companyId?.verified && <CheckCircle className="h-4 w-4 fill-sky-500 text-white" />}
              </CardTitle>
              <CardDescription>{job.companyId?.industry || 'Unknown Industry'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.companyId?.description && (
                <p className="text-xs text-muted-foreground leading-normal text-center italic">
                  &ldquo;{job.companyId.description}&rdquo;
                </p>
              )}
              
              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{job.companyId?.location || 'Not Specified'}</span>
                </div>
                {job.companyId?.website && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Website</span>
                    <a
                      href={job.companyId.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" /> Visit website
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-background/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Application Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <p className="text-4xl font-extrabold text-primary">{job.applicationsCount}</p>
              <p className="text-xs text-muted-foreground mt-2">Total candidate applications submitted for this role.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
