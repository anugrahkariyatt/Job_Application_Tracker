'use client';

import { useEffect, useState, use } from 'react';
import { z } from 'zod';

const scheduleInterviewFormSchema = z.object({
  title: z.string().trim().min(1, 'Round title is required'),
  date: z.string().min(1, 'Date is required').refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  time: z.string().min(1, 'Time is required'),
  link: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusChip } from '@/lib/status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Mail,
  Phone,
  MapPin,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  FileText,
  CheckCircle2,
  Circle,
  Users,
  Send,
  Briefcase,
  Calendar,
  Award,
  Loader2,
  XCircle,
  Video,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { AIAssessmentModal } from '@/components/recruiter/AIAssessmentModal';
import { calculateRealSkillMatch } from '@/lib/skillMatcher';
import { useAppSelector } from '@/store/hooks';

type ApplicationStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Rejected' | 'Hired';

const statusFlow: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Hired',
];

export default function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const currentUser = useAppSelector((state) => state.auth.user);
  const isPro = currentUser?.subscriptionPlan === 'pro';

  const [app, setApp] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [interviews, setInterviews] = useState<any[]>([]);
  const [interviewStatusFilter, setInterviewStatusFilter] = useState<string>('all');
  const [interviewTypeFilter, setInterviewTypeFilter] = useState<string>('all');
  const [cancelInterviewTarget, setCancelInterviewTarget] = useState<any | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    title: 'Technical Interview',
    date: '',
    time: '10:00',
    type: 'Video Call' as 'Video Call' | 'Onsite' | 'Phone',
    link: '',
    notes: '',
  });
  const [interviewErrors, setInterviewErrors] = useState<Record<string, string>>({});

  const handleInterviewFieldChange = (field: string, value: string) => {
    setInterviewForm((prev) => ({ ...prev, [field]: value }));
    if (interviewErrors[field]) {
      setInterviewErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const companyRes = await axiosInstance.get('/api/company');
      if (companyRes.data?.success) {
        setCompany(companyRes.data.data);
      }

      const response = await axiosInstance.get(`/api/application/${id}`);
      if (response.data?.success) {
        setApp(response.data.data);
        
        // Setup initial local notes mockup so the layout is still rich and functional
        setNotes([
          {
            id: '1',
            author: 'HR Recruiter',
            date: new Date(response.data.data.createdAt).toLocaleDateString(),
            content: 'Candidate profile matches requirements. Resume looks promising.',
          }
        ]);
      }

      try {
        const interviewRes = await axiosInstance.get('/api/interviews');
        if (interviewRes.data?.success && Array.isArray(interviewRes.data.data)) {
          // Pure backend order (backend performs .sort({ createdAt: -1, date: -1 }))
          const appInterviews = interviewRes.data.data.filter(
            (iv: any) => iv.applicationId === id || iv.applicationId?._id === id
          );
          setInterviews(appInterviews);
        }
      } catch (err) {
        console.error('Error fetching interviews:', err);
      }
    } catch (err) {
      console.error('Error fetching application details:', err);
      toast.error('Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const handleUpdateStatus = async (status: ApplicationStatus) => {
    if (!app) return;
    if (status === 'Interview') {
      setInterviewErrors({});
      setScheduleDialogOpen(true);
      return;
    }
    try {
      setUpdating(true);
      const response = await axiosInstance.patch(`/api/application/${app._id}/status`, {
        status,
      });
      if (response.data?.success) {
        toast.success(`Application status updated to ${status}.`);
        setApp((prev: any) => ({ ...prev, status }));
        
        // Append update history to local notes
        setNotes((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            author: 'System',
            date: new Date().toLocaleDateString(),
            content: `Status updated to ${status}.`,
          }
        ]);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleScheduleInterview = async () => {
    setInterviewErrors({});
    const validation = scheduleInterviewFormSchema.safeParse(interviewForm);
    if (!validation.success) {
      const errorsMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errorsMap[err.path[0]] = err.message;
        }
      });
      setInterviewErrors(errorsMap);
      return;
    }

    try {
      setUpdating(true);
      const datetime = new Date(`${interviewForm.date}T${interviewForm.time}`);
      
      const payload = {
        applicationId: id,
        title: interviewForm.title,
        date: datetime.toISOString(),
        type: interviewForm.type,
        link: interviewForm.link,
        notes: interviewForm.notes,
      };

      const response = await axiosInstance.post('/api/interviews', payload);
      if (response.data?.success) {
        toast.success('Interview scheduled successfully!');
        setApp((prev: any) => ({ ...prev, status: 'Interview' }));
        setScheduleDialogOpen(false);
        fetchApplicationDetails();
      }
    } catch (err: any) {
      console.error('Error scheduling interview:', err);
      toast.error(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateInterviewStatus = async (interviewId: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    try {
      const response = await axiosInstance.patch(`/api/interviews/${interviewId}/status`, { status });
      if (response.data?.success) {
        toast.success(`Interview marked as ${status}.`);
        fetchApplicationDetails();
      }
    } catch (err: any) {
      console.error('Error updating interview status:', err);
      toast.error(err.response?.data?.message || 'Failed to update interview status.');
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        author: 'Recruiter',
        date: new Date().toLocaleDateString(),
        content: newNote.trim(),
      }
    ]);
    setNewNote('');
    toast.success('Note added locally.');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">Application not found.</p>
        <Link href="/recruiter/applicants" className="text-primary hover:underline mt-2 inline-block">
          Back to Applicants List
        </Link>
      </div>
    );
  }

  const candidate = app.candidateId || {};
  const user = candidate.userId || {};
  const job = app.jobId || {};
  const currentIdx = statusFlow.indexOf(app.status);

  const filteredInterviews = interviews.filter((iv) => {
    if (interviewStatusFilter !== 'all' && iv.status !== interviewStatusFilter) {
      return false;
    }
    if (interviewTypeFilter !== 'all' && iv.type !== interviewTypeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name || 'Candidate'}
        description={candidate.headline || 'Software Engineer'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/recruiter/dashboard' },
          { label: 'Applicants', href: '/recruiter/applicants' },
          { label: user.name || 'Applicant' },
        ]}
        icon={Users}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Profile card + cover letter + notes */}
        <div className="space-y-4 lg:col-span-2">
          {/* Profile header card */}
          <Card className="overflow-hidden">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-start gap-4">
                {candidate.profileImage ? (
                  <img
                    src={candidate.profileImage}
                    alt={user.name}
                    className="h-20 w-20 rounded-xl border border-border object-cover shadow-sm"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground font-semibold text-2xl shadow-sm">
                    {(user.name || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 pb-1">
                  <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{candidate.headline}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {candidate.location || 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  variant={isPro ? "default" : "outline"}
                  size="sm"
                  className={isPro ? "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" : "border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 gap-1.5 font-bold"}
                  onClick={() => setIsAIModalOpen(true)}
                >
                  <Award className="h-4 w-4" />
                  {isPro
                    ? `Skill Assessment (${app.aiMatchScore ?? calculateRealSkillMatch(candidate, app.jobId).score}%)`
                    : "Unlock AI Skill Assessment 🔒"}
                </Button>
                {candidate.resumeUrl && (
                  <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="mr-1.5 h-4 w-4" />
                      View Resume
                    </Button>
                  </a>
                )}
                {candidate.linkedin && (
                  <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Linkedin className="mr-1.5 h-4 w-4" />
                      LinkedIn
                    </Button>
                  </a>
                )}
                {candidate.github && (
                  <a href={candidate.github} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Github className="mr-1.5 h-4 w-4" />
                      GitHub
                    </Button>
                  </a>
                )}
                {candidate.portfolio && (
                  <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Portfolio
                    </Button>
                  </a>
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${user.email}`} className="font-medium text-primary hover:underline">
                    {user.email}
                  </a>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{candidate.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applied for card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Briefcase className="h-4.5 w-4.5 text-primary" />
                Applied Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/recruiter/jobs/${job._id}`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={company.companyName}
                    className="h-11 w-11 rounded-lg object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm ring-1 ring-border">
                    {(company?.companyName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {company?.companyName || 'Company'} · {job.location} · {job.remote ? 'Remote' : 'Onsite'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Applied on</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Cover Letter / Bio info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Candidate Bio & Cover Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {candidate.bio || "No cover statement or biography was supplied by the applicant."}
              </p>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recruiter Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-lg border border-border bg-muted/30 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{note.author}</span>
                        <span className="text-xs text-muted-foreground">{note.date}</span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No notes yet.</p>
              )}
              <div>
                <textarea
                  placeholder="Add a note about this candidate…"
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <div className="mt-2 flex justify-end">
                  <Button size="sm" onClick={handleAddNote}>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Status timeline + update status */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <StatusChip status={app.status} />
              </div>
              <div className="space-y-0">
                {statusFlow.map((status, i) => {
                  const isDone = i <= currentIdx;
                  const isRejected = app.status === 'Rejected';
                  const showDone = isDone && !isRejected;
                  const isLast = i === statusFlow.length - 1;
                  return (
                    <div key={status} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {showDone ? (
                          <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
                        ) : (
                          <Circle className="h-6 w-6 shrink-0 text-muted-foreground/30" />
                        )}
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 ${showDone ? 'bg-success/30' : 'bg-border'} min-h-6`}
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <p
                          className={`text-sm font-medium ${showDone ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {status}
                        </p>
                        {i === 0 && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {app.status === 'Rejected' && (
                  <div className="flex gap-3">
                    <XCircle className="h-6 w-6 shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Rejected</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Update Status</CardTitle>
              {(app.status === 'Hired' || app.status === 'Rejected') && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Application status is finalized as {app.status} and cannot be modified further.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {updating ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                (['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Hired', 'Rejected'] as ApplicationStatus[]).map(
                  (status) => {
                    const isTerminal = app.status === 'Hired' || app.status === 'Rejected';
                    const currentStatusIdx = statusFlow.indexOf(app.status);
                    const isBackwardStage = status !== 'Rejected' && currentStatusIdx >= 0 && statusFlow.indexOf(status) < currentStatusIdx;
                    const isDisabled = updating || app.status === status || isTerminal || isBackwardStage;

                    return (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(status)}
                        disabled={isDisabled}
                        title={
                          isTerminal
                            ? `Status is finalized as ${app.status}`
                            : isBackwardStage
                            ? `Cannot revert backwards to ${status}`
                            : `Update status to ${status}`
                        }
                        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          app.status === status
                            ? 'border-primary bg-primary/5 text-primary font-semibold'
                            : isDisabled
                            ? 'border-border/40 text-muted-foreground/40 bg-muted/20 cursor-not-allowed'
                            : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        <span>{status}</span>
                        {app.status === status && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  }
                )
              )}
            </CardContent>
          </Card>

          {interviews.length > 0 && (
            <Card>
              <CardHeader className="pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-primary" />
                    Scheduled Interviews ({filteredInterviews.length})
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full border border-border/50">
                    Latest first
                  </span>
                </div>
                
                {/* Dropdown Filters */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <div className="flex-1">
                    <Select value={interviewStatusFilter} onValueChange={setInterviewStatusFilter}>
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue placeholder="Status: All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select value={interviewTypeFilter} onValueChange={setInterviewTypeFilter}>
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue placeholder="Type: All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Video Call">Video Call</SelectItem>
                        <SelectItem value="Onsite">Onsite</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-1">
                {filteredInterviews.length > 0 ? (
                  <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3">
                    {filteredInterviews.map((iv) => (
                      <div key={iv._id} className="rounded-lg border border-border p-3 space-y-2 bg-card hover:bg-accent/20 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-foreground flex items-center gap-1.5 truncate">
                            <Video className="h-3.5 w-3.5 text-primary shrink-0" />
                            {iv.title}
                          </span>
                          <Badge variant={iv.status === 'Completed' ? 'default' : iv.status === 'Cancelled' ? 'destructive' : 'outline'} className="shrink-0">
                            {iv.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="flex items-center gap-1.5 font-medium text-foreground/80">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> 
                            {new Date(iv.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span className="font-medium text-muted-foreground">Type:</span> {iv.type}
                            {iv.link && (
                              <a href={iv.link} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline font-medium inline-flex items-center gap-0.5">
                                (Join Link <ExternalLink className="h-3 w-3" />)
                              </a>
                            )}
                          </p>
                          {iv.notes && <p className="mt-1 bg-muted/60 p-2 rounded text-xs border border-border/50 text-foreground/90">{iv.notes}</p>}
                        </div>
                        {iv.status === 'Scheduled' && (
                          <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                            <Button size="sm" variant="outline" className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white flex-1 h-7 text-xs" onClick={() => handleUpdateInterviewStatus(iv._id, 'Completed')}>
                              Complete
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 flex-1 h-7 text-xs" onClick={() => setCancelInterviewTarget(iv)}>
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No interviews match the selected filter.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Schedule Interview Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="roundTitle">Round Title</Label>
              <Input
                id="roundTitle"
                value={interviewForm.title}
                onChange={(e) => handleInterviewFieldChange('title', e.target.value)}
                placeholder="e.g. Technical Interview, Manager Round"
              />
              {interviewErrors.title && (
                <p className="mt-1 text-xs text-destructive font-medium">{interviewErrors.title}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={interviewForm.date}
                  onChange={(e) => handleInterviewFieldChange('date', e.target.value)}
                />
                {interviewErrors.date && (
                  <p className="mt-1 text-xs text-destructive font-medium">{interviewErrors.date}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={interviewForm.time}
                  onChange={(e) => handleInterviewFieldChange('time', e.target.value)}
                />
                {interviewErrors.time && (
                  <p className="mt-1 text-xs text-destructive font-medium">{interviewErrors.time}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Interview Type</Label>
              <Select
                value={interviewForm.type}
                onValueChange={(v) => setInterviewForm({ ...interviewForm, type: v as any })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video Call">Video Call</SelectItem>
                  <SelectItem value="Onsite">Onsite</SelectItem>
                  <SelectItem value="Phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Meeting Link / Address</Label>
              <Input
                id="link"
                value={interviewForm.link}
                onChange={(e) => handleInterviewFieldChange('link', e.target.value)}
                placeholder="e.g. Google Meet link or office address"
              />
              {interviewErrors.link && (
                <p className="mt-1 text-xs text-destructive font-medium">{interviewErrors.link}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes & Instructions</Label>
              <textarea
                id="notes"
                value={interviewForm.notes}
                onChange={(e) => handleInterviewFieldChange('notes', e.target.value)}
                placeholder="Instructions or agenda for the candidate..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              {interviewErrors.notes && (
                <p className="mt-1 text-xs text-destructive font-medium">{interviewErrors.notes}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setScheduleDialogOpen(false);
              setInterviewErrors({});
            }}>
              Cancel
            </Button>
            <Button onClick={handleScheduleInterview} disabled={updating}>
              {updating ? 'Scheduling...' : 'Schedule Round'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AIAssessmentModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        applicant={app}
        onStatusChange={(appId, newStatus) => handleUpdateStatus(newStatus as ApplicationStatus)}
        onScheduleInterview={() => setScheduleDialogOpen(true)}
      />

      {/* Cancel Interview Confirmation Dialog */}
      <Dialog open={!!cancelInterviewTarget} onOpenChange={(open) => { if (!open) setCancelInterviewTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Interview Cancellation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-muted-foreground">
            <p>
              Are you sure you want to cancel the scheduled interview round <span className="font-semibold text-foreground">&quot;{cancelInterviewTarget?.title}&quot;</span>?
            </p>
            {cancelInterviewTarget && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-1">
                <p><span className="font-medium text-foreground">Date & Time:</span> {new Date(cancelInterviewTarget.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <p><span className="font-medium text-foreground">Type:</span> {cancelInterviewTarget.type}</p>
                {cancelInterviewTarget.link && (
                  <p><span className="font-medium text-foreground">Link/Location:</span> {cancelInterviewTarget.link}</p>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This will update the interview status to <span className="font-semibold text-destructive">Cancelled</span>.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelInterviewTarget(null)}>
              Keep Interview
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (cancelInterviewTarget) {
                  const targetId = cancelInterviewTarget._id;
                  setCancelInterviewTarget(null);
                  await handleUpdateInterviewStatus(targetId, 'Cancelled');
                }
              }}
            >
              Yes, Cancel Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
