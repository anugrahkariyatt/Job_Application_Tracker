'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Briefcase,
  DollarSign,
  MapPin,
  FileText,
  Calendar,
  Building2,
  GraduationCap,
  Hammer,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge, statusTone } from '@/components/admin/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface EducationItem {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

interface ExperienceItem {
  _id: string;
  companyName: string;
  role: string;
  startYear: number;
  endYear: number;
  description: string;
}

interface SkillItem {
  _id: string;
  name: string;
  level: string;
}

interface ApplicationDetails {
  _id: string;
  status: string;
  createdAt: string;
  candidateId: {
    _id: string;
    userId: {
      name: string;
      email: string;
    };
    description?: string;
    resume?: string;
    phone?: string;
    skills?: SkillItem[];
    experience?: ExperienceItem[];
    education?: EducationItem[];
  };
  jobId: {
    _id: string;
    title: string;
    description: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    employmentType: string;
    experienceLevel: string;
  };
  companyId: {
    _id: string;
    companyName: string;
    logo: string;
    industry: string;
  };
}

const statusOptions = [
  { label: 'Applied', value: 'Applied' },
  { label: 'Under Review', value: 'Under Review' },
  { label: 'Shortlisted', value: 'Shortlisted' },
  { label: 'Hired', value: 'Hired' },
  { label: 'Rejected', value: 'Rejected' },
];

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const [app, setApp] = React.useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);

  const fetchApplication = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/admin/applications/${id}`);
      if (res.data?.success && res.data.data) {
        setApp(res.data.data);
      } else {
        toast.error('Application not found.');
        router.push('/admin/applications');
      }
    } catch (err) {
      console.error('Error fetching application details:', err);
      toast.error('Failed to load application details.');
      router.push('/admin/applications');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  React.useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      const res = await axiosInstance.patch(`/api/admin/applications/${id}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(`Status updated to "${newStatus}" successfully.`);
        setApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      console.error('Error updating application status:', err);
      toast.error(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setUpdating(false);
    }
  };

  const mapStatus = (s: string): string => {
    if (s === 'Under Review') return 'Reviewed';
    if (s === 'Shortlisted') return 'Interview';
    if (s === 'Hired') return 'Offered';
    return s;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!app) return null;

  const initials = app.candidateId?.userId?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${app.candidateId?.userId?.name}'s Application`}
        description={`Application ID: ${app._id}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Applications', href: '/admin/applications' },
          { label: 'Detail' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Candidate Profile Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Info Card */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Avatar className="h-16 w-16 border">
                <AvatarFallback className="bg-sky-100 text-lg font-semibold text-sky-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0">
                <h2 className="text-xl font-bold leading-none">{app.candidateId?.userId?.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {app.candidateId?.userId?.email}
                </p>
                {app.candidateId?.phone && (
                  <p className="text-xs text-muted-foreground">Phone: {app.candidateId.phone}</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {app.candidateId?.description && (
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">Candidate Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {app.candidateId.description}
                  </p>
                </div>
              )}

              {app.candidateId?.resume && (
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={app.candidateId.resume} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      View Resume
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
              <Briefcase className="h-5 w-5 text-sky-500" />
              <CardTitle className="text-base font-semibold">Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {app.candidateId?.experience && app.candidateId.experience.length > 0 ? (
                app.candidateId.experience.map((exp, idx) => (
                  <div key={exp._id} className="space-y-1">
                    {idx > 0 && <Separator className="my-3" />}
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{exp.role}</h4>
                      <span className="text-xs text-muted-foreground">
                        {exp.startYear} &ndash; {exp.endYear || 'Present'}
                      </span>
                    </div>
                    <p className="text-xs text-sky-600 font-medium">{exp.companyName}</p>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-normal">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No work experience history listed.</p>
              )}
            </CardContent>
          </Card>

          {/* Education History */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-base font-semibold">Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {app.candidateId?.education && app.candidateId.education.length > 0 ? (
                app.candidateId.education.map((edu, idx) => (
                  <div key={edu._id} className="space-y-1">
                    {idx > 0 && <Separator className="my-3" />}
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold text-foreground">
                        {edu.degree} in {edu.fieldOfStudy}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {edu.startYear} &ndash; {edu.endYear}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600 font-medium">{edu.institution}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No education history listed.</p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
              <Hammer className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base font-semibold">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {app.candidateId?.skills && app.candidateId.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {app.candidateId.skills.map((s) => (
                    <Badge key={s._id} variant="secondary" className="flex items-center gap-1 bg-amber-50/50 text-amber-700 border border-amber-200">
                      {s.name}
                      <span className="text-[10px] text-amber-500">({s.level})</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No skills listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Administration Actions & Job Details Card */}
        <div className="space-y-6">
          {/* Status Administration Actions */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Application Status</CardTitle>
              <CardDescription>Manage application state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <StatusBadge tone={statusTone(mapStatus(app.status))}>{mapStatus(app.status)}</StatusBadge>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-semibold">Change Status</label>
                <Select value={app.status} onValueChange={handleStatusChange} disabled={updating}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Job details card */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border rounded-lg">
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold rounded-lg">
                    {app.companyId?.companyName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-bold">{app.jobId?.title}</h4>
                  <p className="text-xs text-muted-foreground">{app.companyId?.companyName}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-semibold">{app.jobId?.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary Range (Annual)</span>
                  <span className="font-semibold text-emerald-600">
                    {app.jobId?.salaryMin !== undefined && app.jobId?.salaryMax !== undefined
                      ? `$${app.jobId.salaryMin.toLocaleString()} - $${app.jobId.salaryMax.toLocaleString()}`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="secondary">{app.jobId?.employmentType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience Level</span>
                  <span className="font-semibold">{app.jobId?.experienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applied On</span>
                  <span className="font-semibold">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Separator />

              <Button asChild className="w-full" size="sm" variant="outline">
                <a href={`/admin/jobs/${app.jobId?._id}`}>View Job Details</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
