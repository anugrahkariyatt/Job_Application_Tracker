'use client';

import { useState, useEffect } from 'react';
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
import { z } from 'zod';

const createJobFormSchema = z.object({
  title: z.string().trim().min(1, 'Job title is required'),
  description: z.string().trim().min(20, 'Job description must be at least 20 characters'),
  requirements: z.string().trim().min(10, 'Requirements must be at least 10 characters'),
  responsibilities: z.string().trim().min(10, 'Responsibilities must be at least 10 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  location: z.string().trim().min(1, 'Location is required'),
  salaryMin: z.string().min(1, 'Minimum salary is required').refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  salaryMax: z.string().min(1, 'Maximum salary is required').refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  vacancies: z.string().min(1, 'Vacancies is required').refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  applicationDeadline: z.string().min(1, 'Application deadline is required').refine(val => !isNaN(Date.parse(val)), 'Invalid date format'),
}).refine(data => Number(data.salaryMax) >= Number(data.salaryMin), {
  message: 'Maximum salary cannot be less than minimum salary',
  path: ['salaryMax'],
});

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
  const [currency, setCurrency] = useState('USD');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [vacancies, setVacancies] = useState('1');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedPrefs = localStorage.getItem('recruiter_company_prefs');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.defaultEmploymentType) {
          setEmploymentType(prefs.defaultEmploymentType as EmploymentType);
        }
        if (prefs.defaultWorkMode) {
          setWorkMode(prefs.defaultWorkMode as WorkMode);
        }
        if (prefs.defaultCurrency) {
          setCurrency(prefs.defaultCurrency);
        }
        if (prefs.defaultDeadlineDays) {
          const days = parseInt(prefs.defaultDeadlineDays, 10);
          if (!isNaN(days) && days > 0) {
            const date = new Date();
            date.setDate(date.getDate() + days);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            setApplicationDeadline(`${yyyy}-${mm}-${dd}`);
          }
        }
      } catch (err) {
        console.error('Error parsing recruiter_company_prefs:', err);
      }
    }
  }, []);

  const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSkillsChange = (val: string[]) => {
    setSkills(val);
    if (errors.skills) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.skills;
        return copy;
      });
    }
  };

  const submitJob = async (jobStatus: 'Open' | 'Draft') => {
    setErrors({});
    const formData = {
      title,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      salaryMin,
      salaryMax,
      vacancies,
      applicationDeadline,
    };

    const validation = createJobFormSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please correct the validation errors in the form.');
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
      workMode,
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      currency,
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
                onChange={(e) => handleFieldChange('title', e.target.value, setTitle)}
                disabled={saving}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-destructive font-medium">{errors.title}</p>
              )}
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
                onChange={(e) => handleFieldChange('location', e.target.value, setLocation)}
                disabled={saving}
              />
              {errors.location && (
                <p className="mt-1.5 text-xs text-destructive font-medium">{errors.location}</p>
              )}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <Label className="mb-1.5 block">Currency *</Label>
              <Select
                value={currency}
                onValueChange={setCurrency}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['USD', 'EUR', 'GBP', 'INR'].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Minimum Salary *</Label>
              <Input
                type="number"
                placeholder="e.g. 120000"
                value={salaryMin}
                onChange={(e) => handleFieldChange('salaryMin', e.target.value, setSalaryMin)}
                disabled={saving}
              />
              {errors.salaryMin && (
                <p className="mt-1.5 text-xs text-destructive font-medium">{errors.salaryMin}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block">Maximum Salary *</Label>
              <Input
                type="number"
                placeholder="e.g. 160000"
                value={salaryMax}
                onChange={(e) => handleFieldChange('salaryMax', e.target.value, setSalaryMax)}
                disabled={saving}
              />
              {errors.salaryMax && (
                <p className="mt-1.5 text-xs text-destructive font-medium">{errors.salaryMax}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block">Vacancies *</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={vacancies}
                onChange={(e) => handleFieldChange('vacancies', e.target.value, setVacancies)}
                disabled={saving}
              />
              {errors.vacancies && (
                <p className="mt-1.5 text-xs text-destructive font-medium">{errors.vacancies}</p>
              )}
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
              onChange={handleSkillsChange}
              placeholder="Type a skill and press Enter…"
            />
            {errors.skills && (
              <p className="mt-1.5 text-xs text-destructive font-medium">{errors.skills}</p>
            )}
          </div>
          <div>
            <Label className="mb-1.5 block">Job Description (min 20 chars) *</Label>
            <Textarea
              rows={4}
              placeholder="Describe the role and its impact…"
              value={description}
              onChange={(e) => handleFieldChange('description', e.target.value, setDescription)}
              disabled={saving}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-destructive font-medium">{errors.description}</p>
            )}
          </div>
          <div>
            <Label className="mb-1.5 block">Responsibilities (min 10 chars) *</Label>
            <Textarea
              rows={4}
              placeholder="List core responsibilities of this position..."
              value={responsibilities}
              onChange={(e) => handleFieldChange('responsibilities', e.target.value, setResponsibilities)}
              disabled={saving}
            />
            {errors.responsibilities && (
              <p className="mt-1.5 text-xs text-destructive font-medium">{errors.responsibilities}</p>
            )}
          </div>
          <div>
            <Label className="mb-1.5 block">Requirements (min 10 chars) *</Label>
            <Textarea
              rows={4}
              placeholder="List qualifications, degree requirements, or experience levels needed..."
              value={requirements}
              onChange={(e) => handleFieldChange('requirements', e.target.value, setRequirements)}
              disabled={saving}
            />
            {errors.requirements && (
              <p className="mt-1.5 text-xs text-destructive font-medium">{errors.requirements}</p>
            )}
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
                onChange={(e) => handleFieldChange('applicationDeadline', e.target.value, setApplicationDeadline)}
                disabled={saving}
              />
              {errors.applicationDeadline && (
                <p className="mt-1.5 text-xs text-destructive font-medium">{errors.applicationDeadline}</p>
              )}
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
