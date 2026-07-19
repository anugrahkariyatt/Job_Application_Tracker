'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Upload,
  Pencil,
  Briefcase,
  GraduationCap,
  Award,
  Languages as LanguagesIcon,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/candidate/page-header';
import { useAppSelector } from '@/store/hooks';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { formatDate } from '@/lib/candidate-data';

function SectionCard({ title, icon: Icon, children, action }: { title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [uploadingResume, setUploadingResume] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profileRes = await axiosInstance.get('/api/candidate');
      if (profileRes.data?.success) {
        setProfile(profileRes.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Redirect to edit profile if no profile exists
        toast.info('Please create your candidate profile details.');
        router.push('/candidate/profile/edit');
        return;
      }
      console.error('Fetch profile error:', err);
      toast.error('Failed to load profile details.');
    }

    try {
      const [eduRes, expRes, skillRes] = await Promise.all([
        axiosInstance.get('/api/education'),
        axiosInstance.get('/api/experience'),
        axiosInstance.get('/api/skills'),
      ]);

      if (eduRes.data?.success) setEducation(eduRes.data.data);
      if (expRes.data?.success) setExperience(expRes.data.data);
      if (skillRes.data?.success) setSkills(skillRes.data.data);
    } catch (subErr) {
      console.error('Fetch profile subsections error:', subErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadingResume(true);
      const res = await axiosInstance.patch('/api/candidate/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setProfile(res.data.data);
        toast.success('Resume uploaded successfully.');
      }
    } catch (err: any) {
      console.error('Resume upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading candidate profile...</p>
      </div>
    );
  }

  const initials = (profile?.fullName || user?.name || 'Candidate').split(' ').map((n: any) => n[0]).join('');
  const profileCompletion = profile?.profileCompleted ? 100 : 50;

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="View and manage your professional profile">
        <Button asChild>
          <Link href="/candidate/profile/edit">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </PageHeader>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.profileImage || ''} alt={profile?.fullName || user?.name} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.fullName || user?.name}</h2>
              <p className="text-sm text-muted-foreground">{profile?.headline || 'Job Seeker'}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user?.email}</span>
                {profile?.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{profile.phone}</span>}
                {profile?.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>}
              </div>
            </div>
            <div className="sm:w-48">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-semibold">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <SectionCard title="Basic Information" icon={Mail}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Full Name</dt>
                <dd className="mt-1 text-sm font-medium">{profile?.fullName || user?.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1 text-sm font-medium">{user?.email}</dd>
              </div>
              {profile?.phone && (
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
                  <dd className="mt-1 text-sm font-medium">{profile.phone}</dd>
                </div>
              )}
              {profile?.location && (
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Location</dt>
                  <dd className="mt-1 text-sm font-medium">{profile.location}</dd>
                </div>
              )}
            </dl>
          </SectionCard>

          {/* Professional Information */}
          <SectionCard title="Professional Information" icon={Briefcase}>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Headline</p>
                <p className="mt-1 text-sm font-medium">{profile?.headline || 'Not specified'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Bio</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{profile?.bio || 'No bio provided.'}</p>
              </div>
            </div>
          </SectionCard>

          {/* Experience */}
          <SectionCard title="Experience" icon={Briefcase}>
            {experience.length === 0 ? (
              <p className="text-sm text-muted-foreground">No experience details added yet.</p>
            ) : (
              <div className="space-y-1">
                {experience.map((exp, idx) => (
                  <div key={exp._id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      {idx < experience.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold">{exp.role}</p>
                      <p className="text-sm text-muted-foreground">{exp.company} · {exp.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(exp.startDate)} — {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                      </p>
                      {exp.description && <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Education */}
          <SectionCard title="Education" icon={GraduationCap}>
            {education.length === 0 ? (
              <p className="text-sm text-muted-foreground">No education details added yet.</p>
            ) : (
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu._id} className="border-l-2 border-primary/20 pl-4 py-1">
                    <p className="text-sm font-semibold">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</p>
                    {edu.description && <p className="mt-1 text-sm text-muted-foreground">{edu.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          {/* Resume Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.resumeUrl ? (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-sm font-medium text-primary hover:underline block"
                    >
                      View Current Resume
                    </a>
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-3">No resume uploaded.</p>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                ref={fileInputRef}
                onChange={handleResumeUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                disabled={uploadingResume}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingResume ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload New Resume
              </Button>
            </CardContent>
          </Card>

          {/* Social Links */}
          <SectionCard title="Social Links" icon={Globe}>
            <div className="space-y-3">
              {profile?.github ? (
                <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} className="flex items-center gap-2 text-sm hover:underline text-primary" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 text-muted-foreground" />Github Profile
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">No Github added</p>
              )}
              {profile?.linkedin ? (
                <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} className="flex items-center gap-2 text-sm hover:underline text-primary" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />LinkedIn Profile
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">No LinkedIn added</p>
              )}
              {profile?.portfolio ? (
                <a href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`} className="flex items-center gap-2 text-sm hover:underline text-primary" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 text-muted-foreground" />Portfolio Website
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">No Portfolio website added</p>
              )}
            </div>
          </SectionCard>

          {/* Skills */}
          <SectionCard title="Skills" icon={CheckCircle2}>
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill._id} variant="secondary" className="font-normal">{skill.name}</Badge>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
