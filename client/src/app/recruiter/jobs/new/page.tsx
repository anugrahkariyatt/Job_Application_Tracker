'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/shared/TagInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Save, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

type EmploymentType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Freelance';
type ExperienceLevel = 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
type WorkMode = 'Remote' | 'Hybrid' | 'Onsite';

const employmentTypes: EmploymentType[] = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
const experienceLevels: ExperienceLevel[] = ['Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead'];
const workModes: WorkMode[] = ['Remote', 'Hybrid', 'Onsite'];

export default function CreateJobPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Mid-Level');
  const [workMode, setWorkMode] = useState<WorkMode>('Remote');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [vacancies, setVacancies] = useState('1');
  const [applicationDeadline, setApplicationDeadline] = useState('');

  const submitJob = async (jobStatus: 'Open' | 'Draft') => {
    if (!title.trim()) {
      toast.error('Job title is required.');
      return;
    }
    if (description.trim().length < 20) {
      toast.error('Job description must be at least 20 characters.');
      return;
    }
    if (requirements.trim().length < 10) {
      toast.error('Requirements must be at least 10 characters.');
      return;
    }
    if (responsibilities.trim().length < 10) {
      toast.error('Responsibilities must be at least 10 characters.');
      return;
    }
    if (skills.length === 0) {
      toast.error('At least one skill is required.');
      return;
    }
    if (!location.trim()) {
      toast.error('Location is required.');
      return;
    }
    if (!salaryMin || !salaryMax) {
      toast.error('Salary fields are required.');
      return;
    }
    if (Number(salaryMax) < Number(salaryMin)) {
      toast.error('Maximum salary cannot be less than minimum salary.');
      return;
    }
    if (!applicationDeadline) {
      toast.error('Application deadline is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      responsibilities: responsibilities.trim(),
      skills,
      employmentType,
      experienceLevel,
      location: location.trim(),
      remote: workMode === 'Remote',
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      vacancies: Number(vacancies),
      applicationDeadline: new Date(applicationDeadline).toISOString(),
      status: jobStatus,
    };

    try {
      setSaving(true);
      const response = await axiosInstance.post('/api/jobs', payload);
      if (response.data?.success) {
        toast.success(
          jobStatus === 'Open'
            ? 'Job published successfully! It is now live.'
            : 'Job saved as draft.'
        );
        router.push('/recruiter/jobs');
      }
    } catch (err: any) {
      console.error('Error creating job:', err);
      const fieldErrors = err.response?.data?.errors?.fieldErrors;
      if (fieldErrors) {
        Object.keys(fieldErrors).forEach((key) => {
          toast.error(`${key}: ${fieldErrors[key].join(', ')}`);
        });
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit job.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post a Job"
        description="Create a new job opening for your company."
        breadcrumbs={[
          { label: 'Dashboard', href: '/recruiter/dashboard' },
          { label: 'Post a Job' },
        ]}
        icon={PlusCircle}
        actions={
          <>
            <Button variant="outline" onClick={() => submitJob('Draft')} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Save Draft
            </Button>
            <Button onClick={() => submitJob('Open')} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              Publish
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Job Basics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Job Title *</Label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Employment Type *</Label>
              <Select
                value={employmentType}
                onValueChange={(v) => setEmploymentType(v as EmploymentType)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Experience Level *</Label>
              <Select
                value={experienceLevel}
                onValueChange={(v) => setExperienceLevel(v as ExperienceLevel)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Location & Work Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Location *</Label>
              <Input
                placeholder="e.g. San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Work Mode *</Label>
              <Select
                value={workMode}
                onValueChange={(v) => setWorkMode(v as WorkMode)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workModes.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Compensation & Openings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5 block">Minimum Salary *</Label>
              <Input
                type="number"
                placeholder="e.g. 120000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Maximum Salary *</Label>
              <Input
                type="number"
                placeholder="e.g. 160000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Vacancies *</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Skills & Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Skills Required *</Label>
            <TagInput
              value={skills}
              onChange={setSkills}
              placeholder="Type a skill and press Enter…"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Job Description (min 20 chars) *</Label>
            <Textarea
              rows={4}
              placeholder="Describe the role and its impact…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Responsibilities (min 10 chars) *</Label>
            <Textarea
              rows={4}
              placeholder="List core responsibilities of this position..."
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Requirements (min 10 chars) *</Label>
            <Textarea
              rows={4}
              placeholder="List qualifications, degree requirements, or experience levels needed..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Application Deadline *</Label>
              <Input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Link href="/recruiter/jobs">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button variant="outline" onClick={() => submitJob('Draft')} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save Draft
        </Button>
        <Button onClick={() => submitJob('Open')} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-4 w-4" />
          )}
          Publish Job
        </Button>
      </div>
    </div>
  );
}
