'use client';

import { useState, useEffect, use } from 'react';
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
import { Save, Send, Loader2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { z } from 'zod';

const updateJobFormSchema = z.object({
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

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Mid-Level');
  const [workMode, setWorkMode] = useState<WorkMode>('Remote');
  const [currency, setCurrency] = useState('USD');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [vacancies, setVacancies] = useState('1');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [initialStatus, setInitialStatus] = useState<'Open' | 'Closed' | 'Draft'>('Draft');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/jobs/${id}`);
        if (response.data?.success && response.data.data) {
          const job = response.data.data;
          setTitle(job.title || '');
          setDescription(job.description || '');
          setRequirements(job.requirements || '');
          setResponsibilities(job.responsibilities || '');
          setSkills(Array.isArray(job.skills) ? job.skills : []);
          if (job.employmentType) setEmploymentType(job.employmentType as EmploymentType);
          if (job.experienceLevel) setExperienceLevel(job.experienceLevel as ExperienceLevel);
          if (job.workMode) setWorkMode(job.workMode as WorkMode);
          else if (job.remote) setWorkMode('Remote');
          if (job.currency) setCurrency(job.currency);
          setLocation(job.location || '');
          setSalaryMin(job.salaryMin ? String(job.salaryMin) : '');
          setSalaryMax(job.salaryMax ? String(job.salaryMax) : '');
          setVacancies(job.vacancies ? String(job.vacancies) : '1');
          setInitialStatus(job.status || 'Draft');

          if (job.applicationDeadline) {
            const dateObj = new Date(job.applicationDeadline);
            if (!isNaN(dateObj.getTime())) {
              const yyyy = dateObj.getFullYear();
              const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
              const dd = String(dateObj.getDate()).padStart(2, '0');
              setApplicationDeadline(`${yyyy}-${mm}-${dd}`);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching job to edit:', err);
        toast.error('Failed to load job details.');
        router.push('/recruiter/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, router]);

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

  const submitJob = async (targetStatus: 'Open' | 'Draft' | 'Closed') => {
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

    const validation = updateJobFormSchema.safeParse(formData);

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
      status: targetStatus,
    };

    try {
      setSaving(true);
      const response = await axiosInstance.patch(`/api/jobs/${id}`, payload);
      if (response.data?.success) {
        toast.success(
          targetStatus === 'Open'
            ? 'Job published successfully!'
            : targetStatus === 'Draft'
            ? 'Draft updated successfully.'
            : 'Job updated successfully.'
        );
        router.push(`/recruiter/jobs/${id}`);
      }
    } catch (err: any) {
      console.error('Error updating job:', err);
      const msg = err.response?.data?.message || 'Failed to update job.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Job: ${title || 'Job Posting'}`}
        description="Update your job details, compensation, requirements, or status."
        backHref={`/recruiter/jobs/${id}`}
        backLabel="Back to Job Details"
        icon={Pencil}
        actions={
          <>
            <Button variant="outline" onClick={() => submitJob('Draft')} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Save as Draft
            </Button>
            <Button onClick={() => submitJob('Open')} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              {initialStatus === 'Draft' ? 'Publish Job' : 'Save & Keep Published'}
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
        <Link href={`/recruiter/jobs/${id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button variant="outline" onClick={() => submitJob('Draft')} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save as Draft
        </Button>
        <Button onClick={() => submitJob('Open')} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-4 w-4" />
          )}
          {initialStatus === 'Draft' ? 'Publish Job' : 'Save & Keep Published'}
        </Button>
      </div>
    </div>
  );
}
