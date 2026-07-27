'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  ArrowLeft,
  Loader2,
  Bell,
  BellOff,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { JobCard } from '@/components/candidate/job-card';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { mapJobToFrontend, getCompanySlug } from '@/lib/candidate-mappers';

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [company, setCompany] = React.useState<any>(null);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [subId, setSubId] = React.useState<string | null>(null);
  const [subscribing, setSubscribing] = React.useState(false);
  const [savedJobIds, setSavedJobIds] = React.useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = React.useState<string[]>([]);
  
  const JOBS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalJobsCount, setTotalJobsCount] = React.useState(0);
  const [totalPagesCount, setTotalPagesCount] = React.useState(1);
  const [jobsLoading, setJobsLoading] = React.useState(false);

  const fetchCompanyJobs = async (companyId: string, page: number) => {
    try {
      setJobsLoading(true);
      const jobsRes = await axiosInstance.get('/api/jobs', {
        params: { companyId, page, limit: JOBS_PER_PAGE }
      });
      if (jobsRes.data?.success && Array.isArray(jobsRes.data.data)) {
        const mappedJobs = jobsRes.data.data.map(mapJobToFrontend);
        setJobs(mappedJobs);
        if (jobsRes.data.pagination) {
          setTotalJobsCount(jobsRes.data.pagination.total);
          setTotalPagesCount(jobsRes.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Fetch company jobs error:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);

      // Fetch company by ID or Slug
      const companyRes = await axiosInstance.get(`/api/company/${id}`);
      if (companyRes.data?.success && companyRes.data.data) {
        const compData = companyRes.data.data;
        setCompany(compData);

        const realCompId = compData._id || id;
        const realSlug = compData.slug || getCompanySlug(compData);

        if (realSlug && typeof window !== 'undefined' && id !== realSlug) {
          window.history.replaceState(null, '', `/candidate/company/${realSlug}`);
        }

        // Fetch company's active jobs from backend with server-side pagination
        await fetchCompanyJobs(realCompId, currentPage);

        // Fetch active subscriptions to check follow status
        const subsRes = await axiosInstance.get('/api/subscriptions');
        if (subsRes.data?.success && Array.isArray(subsRes.data.data)) {
          const found = subsRes.data.data.find(
            (sub: any) => (sub.companyId?._id || sub.companyId) === realCompId
          );
          if (found) {
            setIsSubscribed(true);
            setSubId(found._id);
          }
        }
      } else {
        toast.error('Company not found.');
        router.push('/candidate/jobs');
        return;
      }
    } catch (err: any) {
      console.error('Fetch company details error:', err);
      toast.error('Failed to load company details.');
      router.push('/candidate/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const targetCompId = company?._id || id;
    fetchCompanyJobs(targetCompId, newPage);
  };

  React.useEffect(() => {
    fetchCompanyDetails();

    // Load bookmark saves
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedJobIds(parsed.map((j: any) => j.id));
      } catch (e) { }
    }

    // Fetch applied job IDs
    axiosInstance.get('/api/application').then((res) => {
      if (res.data?.success && Array.isArray(res.data.data)) {
        const ids = res.data.data.map((app: any) => app.jobId?._id || app.jobId?.id || app.jobId);
        setAppliedJobIds(ids);
      }
    }).catch((e) => console.error('Error fetching applications:', e));
  }, [id]);

  const handleToggleSubscribe = async () => {
    try {
      setSubscribing(true);
      if (isSubscribed && subId) {
        const res = await axiosInstance.delete(`/api/subscriptions/${subId}`);
        if (res.data?.success) {
          setIsSubscribed(false);
          setSubId(null);
          toast.success(`Unsubscribed from ${company?.companyName || 'company'}`);
        }
      } else {
        const res = await axiosInstance.post('/api/subscriptions', { companyId: id });
        if (res.data?.success && res.data.data) {
          setIsSubscribed(true);
          setSubId(res.data.data._id);
          toast.success(`Subscribed to ${company?.companyName || 'company'}`);
        }
      }
    } catch (err: any) {
      console.error('Subscription toggle error:', err);
      toast.error('Failed to update subscription.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleToggleSave = (jobId: string) => {
    const saved = localStorage.getItem('savedJobs');
    let currentSaved: any[] = [];
    if (saved) {
      try {
        currentSaved = JSON.parse(saved);
      } catch (e) { }
    }

    const isSaved = currentSaved.some(j => j.id === jobId);
    if (isSaved) {
      currentSaved = currentSaved.filter(j => j.id !== jobId);
      setSavedJobIds(prev => prev.filter(saveId => saveId !== jobId));
      toast.success('Job unsaved successfully.');
    } else {
      const jobToAdd = jobs.find(j => j.id === jobId);
      if (jobToAdd) {
        currentSaved.push(jobToAdd);
        setSavedJobIds(prev => [...prev, jobId]);
        toast.success('Job saved successfully.');
      }
    }
    localStorage.setItem('savedJobs', JSON.stringify(currentSaved));
  };

  const handleApply = async (jobId: string) => {
    try {
      const response = await axiosInstance.post('/api/application', { jobId });
      if (response.data?.success) {
        toast.success('Successfully applied for this job!');
        setAppliedJobIds((prev) => [...prev, jobId]);
      }
    } catch (err: any) {
      console.error('Apply job error:', err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Failed to submit application.';
      const isProfileMissing = status === 404 || msg.toLowerCase().includes('profile');
      if (isProfileMissing) {
        toast.error('Please create your candidate profile before applying.');
        router.push('/candidate/profile');
      } else {
        toast.error(msg);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-28" />
        <Card className="overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <div className="p-6 space-y-4">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        </Card>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
          </div>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/candidate/companies">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Link>
      </Button>

      {/* Single Unified Company Profile Card */}
      <Card className="overflow-hidden border border-border/70 shadow-xs rounded-2xl bg-card space-y-6">
        {/* Cover Banner */}
        <div className="h-44 sm:h-52 bg-gradient-to-r from-primary/10 via-primary/5 to-muted relative overflow-hidden">
          {company.coverImage ? (
            <img
              src={company.coverImage}
              alt={`${company.companyName} Cover`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-background flex items-center justify-center">
              <Building2 className="h-20 w-20 text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Profile Content Body */}
        <CardContent className="p-6 pt-0 space-y-6">
          {/* Logo & Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 sm:-mt-16">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-card bg-background shadow-md shrink-0">
              <AvatarImage src={company.logo} alt={company.companyName} className="object-cover" />
              <AvatarFallback className="rounded-2xl text-2xl font-black bg-primary/10 text-primary">
                {company.companyName ? company.companyName.slice(0, 2).toUpperCase() : 'CO'}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2 self-start md:self-auto">
              {company.website && (
                <Button variant="outline" size="sm" className="rounded-xl font-medium text-xs h-10 px-4 border-border/70" asChild>
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Website
                  </a>
                </Button>
              )}

              <Button
                variant={isSubscribed ? 'outline' : 'default'}
                size="sm"
                onClick={handleToggleSubscribe}
                disabled={subscribing}
                className="rounded-xl font-semibold text-xs h-10 px-5 gap-2 shadow-xs"
              >
                {subscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    Follow Updates
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Company Title & Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {company.companyName}
              </h1>
              {company.verified && (
                <Badge className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/15">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5 fill-blue-500/20 text-blue-500" />
                  Verified
                </Badge>
              )}
              {company.industry && (
                <Badge variant="outline" className="font-semibold text-xs px-2.5 py-0.5 rounded-full border-primary/20 bg-primary/5 text-primary">
                  {company.industry}
                </Badge>
              )}
            </div>
          </div>

          {/* About Company */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">About {company.companyName}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {company.description || 'No description provided by the company.'}
            </p>
          </div>

          {/* Company Overview Stats Bar */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-foreground">Company Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Headquarters
                </span>
                <p className="text-sm font-semibold text-foreground truncate">{company.headquarters || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Globe className="h-3.5 w-3.5 text-primary" /> Website
                </span>
                {company.website ? (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary hover:underline truncate block"
                  >
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-foreground">Not specified</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Users className="h-3.5 w-3.5 text-primary" /> Company Size
                </span>
                <p className="text-sm font-semibold text-foreground truncate">{company.employees || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> Industry
                </span>
                <p className="text-sm font-semibold text-foreground truncate">{company.industry || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Width Open Positions Section with Backend Pagination */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight">Open Positions ({totalJobsCount})</h2>
          {totalJobsCount > 0 && (
            <span className="text-xs text-muted-foreground font-medium">
              Showing {Math.min((currentPage - 1) * JOBS_PER_PAGE + 1, totalJobsCount)}–{Math.min(currentPage * JOBS_PER_PAGE, totalJobsCount)} of {totalJobsCount} jobs
            </span>
          )}
        </div>

        {jobsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="p-8 text-center border border-dashed text-sm text-muted-foreground">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            This company has no active job postings at the moment.
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  saved={savedJobIds.includes(job.id)}
                  applied={appliedJobIds.includes(job.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPagesCount > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1 || jobsLoading}
                  className="h-9 px-3 text-xs font-medium"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPagesCount }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={jobsLoading}
                      className="h-9 w-9 p-0 text-xs font-semibold"
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPagesCount))}
                  disabled={currentPage === totalPagesCount || jobsLoading}
                  className="h-9 px-3 text-xs font-medium"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
