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
} from 'lucide-react';
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading company profile...</p>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/candidate/jobs">Find Jobs</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{company.companyName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/candidate/jobs"><ArrowLeft className="mr-2 h-4 w-4" />Back to Jobs</Link>
      </Button>

      {/* Cover / Header Section */}
      <Card className="overflow-hidden border border-border">
        <div className="h-40 bg-gradient-to-r from-primary/10 via-primary/5 to-background relative">
          {company.coverImage && (
            <img
              src={company.coverImage}
              alt={`${company.companyName} Cover`}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
          )}
        </div>
        <CardContent className="p-6 relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end -mt-16 sm:-mt-20">
            <Avatar className="h-24 w-24 rounded-2xl border-4 border-card shadow-sm shrink-0">
              <AvatarImage src={company.logo} alt={company.companyName} />
              <AvatarFallback className="rounded-2xl text-2xl bg-secondary text-secondary-foreground font-semibold">
                {company.companyName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{company.companyName}</h1>
                <Badge variant="outline" className="font-normal border-primary/20 bg-primary/5 text-primary">
                  {company.industry || 'Technology'}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{company.tagline || 'Verified Employer'}</p>
            </div>

            <Button
              variant={isSubscribed ? "outline" : "default"}
              onClick={handleToggleSubscribe}
              disabled={subscribing}
              className="mt-2 sm:mt-0 gap-2 shadow-sm shrink-0"
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
                  Follow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - details */}
        <div className="space-y-6 lg:col-span-2">
          {/* About Company */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">About Company</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {company.description || 'No description provided by the company.'}
              </p>
            </CardContent>
          </Card>

          {/* Active Job Openings */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Open Positions ({jobs.length})</h2>
            {jobs.length === 0 ? (
              <Card className="p-8 text-center border border-dashed text-sm text-muted-foreground">
                <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                This company has no active job postings at the moment.
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
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

        {/* Right column - overview info */}
        <div className="space-y-6">
          <Card className="border border-border">
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
      </div>
    </div>
  );
}
