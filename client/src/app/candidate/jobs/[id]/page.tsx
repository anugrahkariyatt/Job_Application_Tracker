'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Bookmark,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Calendar,
  Users,
  Loader2,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { relativeTime } from '@/lib/candidate-data';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { mapJobToFrontend } from '@/lib/candidate-mappers';

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [job, setJob] = React.useState<any>(null);
  const [applied, setApplied] = React.useState(false);
  const [applying, setApplying] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [interview, setInterview] = React.useState<any>(null);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch job by ID
      const jobRes = await axiosInstance.get(`/api/jobs/${id}`);
      if (jobRes.data?.success && jobRes.data.data) {
        const mapped = mapJobToFrontend(jobRes.data.data);
        setJob(mapped);
        
        // Check if job is saved in localStorage
        const savedJobsStr = localStorage.getItem('savedJobs');
        if (savedJobsStr) {
          try {
            const parsed = JSON.parse(savedJobsStr);
            setSaved(parsed.some((j: any) => j.id === id));
          } catch (e) {}
        }
      } else {
        toast.error('Job not found.');
        router.push('/candidate/jobs');
        return;
      }

      // Fetch applications to check if already applied
      const appsRes = await axiosInstance.get('/api/application');
      if (appsRes.data?.success && Array.isArray(appsRes.data.data)) {
        const hasApplied = appsRes.data.data.some(
          (app: any) => (app.jobId?._id || app.jobId) === id
        );
        setApplied(hasApplied);
      }

      // Fetch interviews to check if one is scheduled for this job
      try {
        const interviewRes = await axiosInstance.get('/api/interviews');
        if (interviewRes.data?.success && Array.isArray(interviewRes.data.data)) {
          const matchingInterview = interviewRes.data.data.find(
            (iv: any) => (iv.jobId?._id || iv.jobId) === id && iv.status === 'Scheduled'
          );
          setInterview(matchingInterview || null);
        }
      } catch (ivErr) {
        console.error('Fetch job interviews error:', ivErr);
      }
    } catch (err: any) {
      console.error('Fetch job details error:', err);
      toast.error('Failed to load job details.');
      router.push('/candidate/jobs');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleToggleSave = () => {
    if (!job) return;
    const savedJobsStr = localStorage.getItem('savedJobs');
    let currentSaved: any[] = [];
    if (savedJobsStr) {
      try {
        currentSaved = JSON.parse(savedJobsStr);
      } catch (e) {}
    }
    
    if (saved) {
      const updated = currentSaved.filter((j: any) => j.id !== id);
      localStorage.setItem('savedJobs', JSON.stringify(updated));
      setSaved(false);
      toast.success('Job unsaved successfully.');
    } else {
      currentSaved.push(job);
      localStorage.setItem('savedJobs', JSON.stringify(currentSaved));
      setSaved(true);
      toast.success('Job saved successfully.');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: job?.title || 'Job Opportunity',
      text: `Check out this job: ${job?.title} at ${job?.company}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        } else {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link to clipboard.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-28" />
        <Card className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </Card>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </Card>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/candidate/jobs">Find Jobs</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{job.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/candidate/jobs"><ArrowLeft className="mr-2 h-4 w-4" />Back to Jobs</Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Company Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {job.companyId ? (
                  <Link href={`/candidate/company/${job.companyId}`}>
                    <Avatar className="h-16 w-16 rounded-xl hover:opacity-85 transition-opacity">
                      <AvatarImage src={job.companyLogo} alt={job.company} />
                      <AvatarFallback className="rounded-xl text-lg">{job.company.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Avatar className="h-16 w-16 rounded-xl">
                    <AvatarImage src={job.companyLogo} alt={job.company} />
                    <AvatarFallback className="rounded-xl text-lg">{job.company.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
                  {job.companyId ? (
                    <Link href={`/candidate/company/${job.companyId}`} className="hover:underline">
                      <p className="mt-1 text-sm text-muted-foreground hover:text-primary transition-colors">{job.company} · {job.industry || 'Tech'}</p>
                    </Link>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{job.company} · {job.industry || 'Tech'}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location} {job.workMode ? `(${job.workMode})` : (job.remote ? '(Remote)' : '(Onsite)')}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.employmentType}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{job.salary}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Posted {relativeTime(job.postedDate)}</span>
                  </div>
                  {job.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="font-normal">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                <Button onClick={async () => {
                  try {
                    setApplying(true);
                    const res = await axiosInstance.post('/api/application', { jobId: id });
                    if (res.data?.success) {
                      setApplied(true);
                      toast.success('Successfully applied for this job!');
                    }
                  } catch (err: any) {
                    console.error('Apply job error:', err);
                    toast.error(err.response?.data?.message || 'Failed to submit application.');
                  } finally {
                    setApplying(false);
                  }
                }} disabled={applied || applying} className="flex-1 sm:flex-none">
                  {applying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : applied ? (
                    <><CheckCircle2 className="mr-2 h-4 w-4" />Applied</>
                  ) : (
                    'Apply Now'
                  )}
                </Button>
                <Button variant="outline" onClick={handleToggleSave}>
                  <Bookmark className={cn('mr-2 h-4 w-4', saved && 'fill-primary text-primary')} />
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Job Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Responsibilities</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.responsibilities.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Requirements</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Interview Card */}
          {interview && (
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Interview Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">Round</span>
                  <span className="font-semibold text-foreground">{interview.title}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">Date & Time</span>
                    <span className="font-medium text-foreground">{new Date(interview.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">Format</span>
                    <span className="font-medium text-foreground">{interview.type}</span>
                  </div>
                </div>
                {interview.link && (
                  <div className="space-y-1 pt-1">
                    <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">Meeting Link</span>
                    <a
                      href={interview.link.startsWith('http') ? interview.link : `https://${interview.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline font-semibold break-all"
                    >
                      {interview.link}
                    </a>
                  </div>
                )}
                {interview.notes && (
                  <div className="space-y-1 pt-1">
                    <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">Instructions</span>
                    <p className="text-xs text-muted-foreground bg-muted/65 p-2 rounded leading-relaxed whitespace-pre-line">
                      {interview.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Summary */}
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Job Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><DollarSign className="h-4 w-4" />Salary</span>
                <span className="font-medium">{job.salary}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Location</span>
                <span className="font-medium">{job.location} {job.workMode ? `(${job.workMode})` : (job.remote ? '(Remote)' : '(Onsite)')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" />Type</span>
                <span className="font-medium">{job.employmentType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />Level</span>
                <span className="font-medium">{job.experienceLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />Posted</span>
                <span className="font-medium">{relativeTime(job.postedDate)}</span>
              </div>
            </CardContent>
          </Card>

          {/* About Company */}
          {job.aboutCompany && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base font-semibold">About {job.company}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center gap-3">
                  {job.companyId ? (
                    <Link href={`/candidate/company/${job.companyId}`}>
                      <Avatar className="h-10 w-10 rounded-lg hover:opacity-85 transition-opacity">
                        <AvatarImage src={job.companyLogo} alt={job.company} />
                        <AvatarFallback className="rounded-lg">{job.company.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    </Link>
                  ) : (
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={job.companyLogo} alt={job.company} />
                      <AvatarFallback className="rounded-lg">{job.company.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {job.companyId ? (
                      <Link href={`/candidate/company/${job.companyId}`} className="hover:underline">
                        <p className="text-sm font-medium hover:text-primary transition-colors">{job.company}</p>
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">{job.company}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{job.industry}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{job.aboutCompany}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
