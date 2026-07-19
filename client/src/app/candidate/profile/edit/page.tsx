'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, Plus, Trash2, X, FileText, Loader2, Camera } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';

export default function EditProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [profileExists, setProfileExists] = React.useState(false);

  // Profile fields state
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [headline, setHeadline] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [github, setGithub] = React.useState('');
  const [linkedin, setLinkedin] = React.useState('');
  const [portfolio, setPortfolio] = React.useState('');

  // Avatar upload state
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState('');

  // Sub-items lists
  const [skills, setSkills] = React.useState<any[]>([]);
  const [initialSkills, setInitialSkills] = React.useState<any[]>([]);
  const [newSkill, setNewSkill] = React.useState('');

  const [experience, setExperience] = React.useState<any[]>([]);
  const [initialExperience, setInitialExperience] = React.useState<any[]>([]);

  const [education, setEducation] = React.useState<any[]>([]);
  const [initialEducation, setInitialEducation] = React.useState<any[]>([]);

  // Resume upload in-form
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [resumeName, setResumeName] = React.useState('');

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const resumeInputRef = React.useRef<HTMLInputElement>(null);

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/candidate');
        if (res.data?.success && res.data.data) {
          const data = res.data.data;
          setProfileExists(true);
          setFullName(data.fullName || '');
          setPhone(data.phone || '');
          setLocation(data.location || '');
          setHeadline(data.headline || '');
          setBio(data.bio || '');
          setGithub(data.github || '');
          setLinkedin(data.linkedin || '');
          setPortfolio(data.portfolio || '');
          setAvatarPreview(data.profileImage || '');
          setResumeName(data.resumeUrl ? 'Current Resume.pdf' : '');
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setProfileExists(false);
          setFullName(user?.name || '');
        } else {
          throw err;
        }
      }

      // Fetch experience, education, skills if profile exists
      const [expRes, eduRes, skillRes] = await Promise.all([
        axiosInstance.get('/api/experience').catch(() => ({ data: { success: false, data: [] } })),
        axiosInstance.get('/api/education').catch(() => ({ data: { success: false, data: [] } })),
        axiosInstance.get('/api/skills').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (expRes.data?.success) {
        setExperience(expRes.data.data);
        setInitialExperience(expRes.data.data);
      }
      if (eduRes.data?.success) {
        setEducation(eduRes.data.data);
        setInitialEducation(eduRes.data.data);
      }
      if (skillRes.data?.success) {
        setSkills(skillRes.data.data);
        setInitialSkills(skillRes.data.data);
      }
    } catch (err) {
      console.error('Fetch profile details error:', err);
      toast.error('Failed to load profile parameters.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfileDetails();
  }, []);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, { _id: `temp-${Date.now()}`, name: trimmed }]);
      setNewSkill('');
    }
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter((s) => s._id !== id));
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        _id: `temp-${Date.now()}`,
        role: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        location: '',
        description: '',
      },
    ]);
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter((e) => e._id !== id));
  };

  const updateExperienceField = (id: string, field: string, value: any) => {
    setExperience(
      experience.map((e) => (e._id === id ? { ...e, [field]: value } : e))
    );
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        _id: `temp-${Date.now()}`,
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((e) => e._id !== id));
  };

  const updateEducationField = (id: string, field: string, value: any) => {
    setEducation(
      education.map((e) => (e._id === id ? { ...e, [field]: value } : e))
    );
  };

  const ensureUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeName(file.name);
    }
  };

  const handleSave = async () => {
    // Validations
    if (!phone || phone.length < 10) {
      toast.error('Phone number must be at least 10 digits.');
      return;
    }
    if (!location) {
      toast.error('Location is required.');
      return;
    }
    if (!headline || headline.length < 5) {
      toast.error('Headline must be at least 5 characters.');
      return;
    }
    if (!bio || bio.length < 20) {
      toast.error('Bio must be at least 20 characters.');
      return;
    }

    try {
      setSaving(true);

      const profilePayload = {
        phone,
        location,
        headline,
        bio,
        github: github ? ensureUrl(github) : '',
        linkedin: linkedin ? ensureUrl(linkedin) : '',
        portfolio: portfolio ? ensureUrl(portfolio) : '',
      };

      let currentCandidateId = '';

      // 1. Create or update core profile details
      if (profileExists) {
        const res = await axiosInstance.patch('/api/candidate', profilePayload);
        if (res.data?.success) {
          currentCandidateId = res.data.data._id;
        }
      } else {
        const res = await axiosInstance.post('/api/candidate', profilePayload);
        if (res.data?.success) {
          currentCandidateId = res.data.data._id;
        }
      }

      // 2. Upload avatar if selected
      if (avatarFile) {
        const avatarData = new FormData();
        avatarData.append('profileImage', avatarFile);
        await axiosInstance.patch('/api/candidate/profile-image', avatarData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 3. Upload resume if selected
      if (resumeFile) {
        const resumeData = new FormData();
        resumeData.append('resume', resumeFile);
        await axiosInstance.patch('/api/candidate/resume', resumeData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 4. Sync experience sub-grid
      // Deleted
      const expToDelete = initialExperience.filter((init) => !experience.some((e) => e._id === init._id));
      for (const exp of expToDelete) {
        await axiosInstance.delete(`/api/experience/${exp._id}`);
      }
      // Created and Updated
      for (const exp of experience) {
        const payload = {
          companyName: exp.company,
          jobTitle: exp.role,
          employmentType: 'Full-time',
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate || undefined,
          currentlyWorking: exp.current || false,
          description: exp.description || '',
        };

        if (exp._id.startsWith('temp-')) {
          await axiosInstance.post('/api/experience', payload);
        } else {
          // If changed from initial, update it
          const init = initialExperience.find((i) => i._id === exp._id);
          if (
            init &&
            (init.companyName !== payload.companyName ||
              init.jobTitle !== payload.jobTitle ||
              init.location !== payload.location ||
              init.startDate !== payload.startDate ||
              init.endDate !== payload.endDate ||
              init.currentlyWorking !== payload.currentlyWorking ||
              init.description !== payload.description)
          ) {
            await axiosInstance.patch(`/api/experience/${exp._id}`, payload);
          }
        }
      }

      // 5. Sync education sub-grid
      // Deleted
      const eduToDelete = initialEducation.filter((init) => !education.some((e) => e._id === init._id));
      for (const edu of eduToDelete) {
        await axiosInstance.delete(`/api/education/${edu._id}`);
      }
      // Created and Updated
      for (const edu of education) {
        const payload = {
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: 'Computer Science',
          startDate: edu.startDate,
          endDate: edu.endDate,
          currentlyStudying: false,
          grade: '',
          description: edu.description || '',
        };

        if (edu._id.startsWith('temp-')) {
          await axiosInstance.post('/api/education', payload);
        } else {
          const init = initialEducation.find((i) => i._id === edu._id);
          if (
            init &&
            (init.institution !== payload.institution ||
              init.degree !== payload.degree ||
              init.startDate !== payload.startDate ||
              init.endDate !== payload.endDate ||
              init.description !== payload.description)
          ) {
            await axiosInstance.patch(`/api/education/${edu._id}`, payload);
          }
        }
      }

      // 6. Sync skills sub-grid
      // Deleted
      const skillsToDelete = initialSkills.filter((init) => !skills.some((s) => s.name.toLowerCase() === init.name.toLowerCase()));
      for (const skill of skillsToDelete) {
        await axiosInstance.delete(`/api/skills/${skill._id}`);
      }
      // Created
      const skillsToCreate = skills.filter((s) => !initialSkills.some((init) => init.name.toLowerCase() === s.name.toLowerCase()));
      for (const skill of skillsToCreate) {
        await axiosInstance.post('/api/skills', { name: skill.name });
      }

      toast.success('Profile saved successfully!');
      router.push('/candidate/profile');
    } catch (err: any) {
      console.error('Save profile error:', err);
      toast.error(err.response?.data?.message || 'Failed to save candidate details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading profile editor...</p>
      </div>
    );
  }

  const initials = (fullName || user?.name || 'C').split(' ').map((n) => n[0]).join('');

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/candidate/profile">Profile</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
        <div className="flex gap-2">
          <Button variant="outline" disabled={saving} asChild>
            <Link href="/candidate/profile">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Avatar + Basic Information */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Avatar selector */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary-hover transition cursor-pointer"
                title="Change Photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP up to 2MB</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled className="bg-muted text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 019-2834" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Senior Frontend Engineer at Google" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell companies about yourself (minimum 20 characters)..." />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Social Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input id="github" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio Website</Label>
            <Input id="portfolio" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://myportfolio.com" />
          </div>
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumeName && (
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/20">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{resumeName}</p>
                <p className="text-xs text-muted-foreground">Select a file below to replace it</p>
              </div>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            ref={resumeInputRef}
            onChange={handleResumeChange}
            className="hidden"
          />
          <div
            onClick={() => resumeInputRef.current?.click()}
            className="flex items-center justify-center rounded-lg border border-dashed p-6 cursor-pointer hover:bg-muted/10 transition"
          >
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Click to select new resume file</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-normal">PDF, DOCX up to 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button onClick={addSkill} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill._id} variant="secondary" className="gap-1 py-1.5 font-normal">
                {skill.name}
                <button onClick={() => removeSkill(skill._id)} className="ml-1 rounded-full hover:bg-foreground/10 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Experience</CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience}>
            <Plus className="mr-1 h-4 w-4" /> Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {experience.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No experience records added.</p>
          ) : (
            experience.map((exp, idx) => (
              <div key={exp._id} className="space-y-4">
                {idx > 0 && <Separator className="my-4" />}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={exp.role || ''} onChange={(e) => updateExperienceField(exp._id, 'role', e.target.value)} placeholder="Senior Frontend Engineer" />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={exp.company || ''} onChange={(e) => updateExperienceField(exp._id, 'company', e.target.value)} placeholder="Google" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="month" value={exp.startDate ? exp.startDate.slice(0, 7) : ''} onChange={(e) => updateExperienceField(exp._id, 'startDate', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="month" value={exp.endDate ? exp.endDate.slice(0, 7) : ''} onChange={(e) => updateExperienceField(exp._id, 'endDate', e.target.value)} disabled={exp.current} />
                  </div>
                  <div className="space-y-2 sm:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${exp._id}`}
                      checked={exp.current || false}
                      onChange={(e) => updateExperienceField(exp._id, 'current', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <Label htmlFor={`current-${exp._id}`} className="cursor-pointer">I am currently working in this role</Label>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Location</Label>
                    <Input value={exp.location || ''} onChange={(e) => updateExperienceField(exp._id, 'location', e.target.value)} placeholder="Remote or San Francisco, CA" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea rows={3} value={exp.description || ''} onChange={(e) => updateExperienceField(exp._id, 'description', e.target.value)} placeholder="Describe your key achievements and duties..." />
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive animate-pulse-hover mt-1" onClick={() => removeExperience(exp._id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Remove Experience
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Education</CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation}>
            <Plus className="mr-1 h-4 w-4" /> Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No education records added.</p>
          ) : (
            education.map((edu, idx) => (
              <div key={edu._id} className="space-y-4">
                {idx > 0 && <Separator className="my-4" />}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Degree / Certification</Label>
                    <Input value={edu.degree || ''} onChange={(e) => updateEducationField(edu._id, 'degree', e.target.value)} placeholder="B.S. in Computer Science" />
                  </div>
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input value={edu.institution || ''} onChange={(e) => updateEducationField(edu._id, 'institution', e.target.value)} placeholder="Stanford University" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="month" value={edu.startDate ? edu.startDate.slice(0, 7) : ''} onChange={(e) => updateEducationField(edu._id, 'startDate', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="month" value={edu.endDate ? edu.endDate.slice(0, 7) : ''} onChange={(e) => updateEducationField(edu._id, 'endDate', e.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea rows={2} value={edu.description || ''} onChange={(e) => updateEducationField(edu._id, 'description', e.target.value)} placeholder="Honors, activities, focus of study..." />
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive animate-pulse-hover mt-1" onClick={() => removeEducation(edu._id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Remove Education
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" disabled={saving} asChild>
          <Link href="/candidate/profile">Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
