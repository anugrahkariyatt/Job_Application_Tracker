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
import { mapJobToFrontend } from '@/lib/candidate-mappers';

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

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch company by ID
      const companyRes = await axiosInstance.get(`/api/company/${id}`);
      if (companyRes.data?.success && companyRes.data.data) {
        setCompany(companyRes.data.data);
      } else {
        toast.error('Company not found.');
        router.push('/candidate/jobs');
        return;
      }

      // Fetch company's active jobs
      const jobsRes = await axiosInstance.get('/api/jobs', { params: { companyId: id } });
      if (jobsRes.data?.success && Array.isArray(jobsRes.data.data)) {
        const mappedJobs = jobsRes.data.data.map(mapJobToFrontend);
        setJobs(mappedJobs);
      }

      // Fetch active subscriptions to check follow status
      const subsRes = await axiosInstance.get('/api/subscriptions');
      if (subsRes.data?.success && Array.isArray(subsRes.data.data)) {
        const found = subsRes.data.data.find(
          (sub: any) => (sub.companyId?._id || sub.companyId) === id
        );
        if (found) {
          setIsSubscribed(true);
          setSubId(found._id);
        }
      }
    } catch (err: any) {
      console.error('Fetch company details error:', err);
      toast.error('Failed to load company details.');
      router.push('/candidate/jobs');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCompanyDetails();
    
    // Load bookmark saves
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedJobIds(parsed.map((j: any) => j.id));
      } catch (e) {}
    }
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
      } catch (e) {}
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
      }
    } catch (err: any) {
      console.error('Apply job error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit application.');
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

      {/* Cover / Header Section */}
      <Card className="overflow-hidden border border-border/70 shadow-xs rounded-2xl bg-card">
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

        {/* Header Profile Content */}
        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-3">
            {/* Logo Avatar */}
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-card bg-background shadow-md shrink-0">
              <AvatarImage src={company.logo} alt={company.companyName} className="object-cover" />
              <AvatarFallback className="rounded-2xl text-2xl font-black bg-primary/10 text-primary">
                {company.companyName ? company.companyName.slice(0, 2).toUpperCase() : 'CO'}
              </AvatarFallback>
            </Avatar>

            {/* Action Buttons */}
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

          {/* Company Main Details Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {company.companyName}
              </h1>
              <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-0.5 rounded-full border border-border/60 bg-muted/50 text-muted-foreground">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-primary" />
                Verified Employer
              </Badge>
              {company.industry && (
                <Badge variant="outline" className="font-semibold text-xs px-2.5 py-0.5 rounded-full border-primary/20 bg-primary/5 text-primary">
                  {company.industry}
                </Badge>
              )}
            </div>


            {/* Sub-Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2 text-xs font-medium text-muted-foreground border-t border-border/40 mt-3 pt-3">
              {company.headquarters && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {company.headquarters}
                </span>
              )}
              {company.employees && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  {company.employees} Employees
                </span>
              )}
  
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 2-Column Section: About & Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* About Company */}
        <Card className="border border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">About Company</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {company.description || 'No description provided by the company.'}
            </p>
          </CardContent>
        </Card>

        {/* Overview Info */}
        <Card className="border border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Headquarters</p>
                <p className="font-medium text-foreground">{company.headquarters || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Website</p>
                {company.website ? (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                ) : (
                  <p className="font-medium text-foreground">Not specified</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Company Size</p>
                <p className="font-medium text-foreground">{company.employees || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Industry</p>
                <p className="font-medium text-foreground">{company.industry || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Width Open Positions Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold tracking-tight">Open Positions ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <Card className="p-8 text-center border border-dashed text-sm text-muted-foreground">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            This company has no active job postings at the moment.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                saved={savedJobIds.includes(job.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
