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
  ArrowLeft,
  CheckCircle2,
  Building2,
  Loader2,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { relativeTime } from '@/lib/candidate-data';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { mapJobToFrontend } from '@/lib/candidate-mappers';
import { ShareThisButtons } from '@/components/shared/ShareThisButtons';
import { CandidateAIMatchModal } from '@/components/candidate/CandidateAIMatchModal';


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
  const [aiMatchOpen, setAiMatchOpen] = React.useState(false);

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
    <div className={cn("space-y-6")}>
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/candidate/jobs"><ArrowLeft className="mr-2 h-4 w-4" />Back to Jobs</Link>
      </Button>

      {/* Single Full-Width Master Card */}
      <Card className="w-full overflow-hidden border border-border/60 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {job.companyId ? (
              <Link href={`/candidate/company/${job.companyId}`}>
                <Avatar className="h-16 w-16 rounded-xl hover:opacity-85 transition-opacity ring-2 ring-border/50 shrink-0">
                  <AvatarImage src={job.companyLogo} alt={job.company} />
                  <AvatarFallback className="rounded-xl text-lg font-bold">{job.company.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Avatar className="h-16 w-16 rounded-xl ring-2 ring-border/50 shrink-0">
                <AvatarImage src={job.companyLogo} alt={job.company} />
                <AvatarFallback className="rounded-xl text-lg font-bold">{job.company.slice(0, 2)}</AvatarFallback>
              </Avatar>
            )}
            <div className="space-y-1.5 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{job.title}</h1>
              {job.companyId ? (
                <Link href={`/candidate/company/${job.companyId}`} className="hover:underline">
                  <p className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{job.company} · {job.industry || 'Tech'}</p>
                </Link>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">{job.company} · {job.industry || 'Tech'}</p>
              )}
              <div className="pt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium"><MapPin className="h-4 w-4" />{job.location} {job.workMode ? `(${job.workMode})` : (job.remote ? '(Remote)' : '(Onsite)')}</span>
                <span className="flex items-center gap-1.5 font-medium">{job.employmentType}</span>
                <span className="flex items-center gap-1.5 font-semibold text-foreground">{job.salary}</span>
                <span className="flex items-center gap-1.5">Posted {relativeTime(job.postedDate)}</span>
              </div>
              {job.skills.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {job.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="font-normal text-xs px-2.5 py-0.5 border border-border/50 bg-muted/40">{skill}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
            <Button
              onClick={async () => {
                try {
                  setApplying(true);
                  const res = await axiosInstance.post('/api/application', { jobId: id });
                  if (res.data?.success) {
                    setApplied(true);
                    toast.success('Successfully applied for this job!');
                  }
                } catch (err: any) {
                  console.error('Apply job error:', err);
                  const status = err.response?.status;
                  const msg = err.response?.data?.message || 'Failed to submit application.';
                  if (status === 404 && msg.toLowerCase().includes('candidate profile')) {
                    toast.error('Please create your candidate profile first.');
                    router.push('/candidate/profile/edit');
                  } else {
                    toast.error(msg);
                  }
                } finally {
                  setApplying(false);
                }
              }}
              disabled={applied || applying}
              className="font-semibold px-6 h-10"
            >
              {applying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : applied ? (
                <><CheckCircle2 className="mr-2 h-4 w-4" />Applied</>
              ) : (
                'Apply Now'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setAiMatchOpen(true)}
              className="font-medium h-10  "
            >
              AI Match
            </Button>
            <Button variant="outline" onClick={handleToggleSave} className="font-medium h-10">
              <Bookmark className={cn('mr-2 h-4 w-4', saved && 'fill-primary text-primary')} />
              {saved ? 'Saved' : 'Save'}
            </Button>
            <ShareThisButtons
              title={job.title}
              company={job.company}
              description={job.description}
            />
          </div>
        </div>

        {/* Scheduled Interview Banner (if active) */}
        {interview && (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.03] space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Scheduled Interview: {interview.title}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span><strong>Date & Time:</strong> {new Date(interview.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              <span><strong>Format:</strong> {interview.type}</span>
              {interview.link && (
                <a href={interview.link.startsWith('http') ? interview.link : `https://${interview.link}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                  Join Meeting Link
                </a>
              )}
            </div>
            {interview.notes && (
              <p className="text-xs text-muted-foreground pt-1">{interview.notes}</p>
            )}
          </div>
        )}

        {/* Job Description */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground">Job Description</h3>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{job.description}</p>
        </div>

        {/* Responsibilities */}
        {job.responsibilities.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground">Key Responsibilities</h3>
            <ul className="space-y-2">
              {job.responsibilities.map((r: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {job.requirements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground">Requirements & Qualifications</h3>
            <ul className="space-y-2">
              {job.requirements.map((r: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* About Company */}
        {job.aboutCompany && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" /> About {job.company}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{job.aboutCompany}</p>
          </div>
        )}
      </Card>

      {/* Candidate AI Match Modal */}
      {aiMatchOpen && (
        <CandidateAIMatchModal
          open={aiMatchOpen}
          onOpenChange={setAiMatchOpen}
          jobId={id}
          jobTitle={job.title}
        />
      )}
    </div>
  );
}
