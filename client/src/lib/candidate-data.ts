export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected'
  | 'Hired';

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Freelance';

export type ExperienceLevel =
  | 'Entry'
  | 'Junior'
  | 'Mid'
  | 'Senior'
  | 'Lead'
  | 'Manager';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salary: string;
  postedDate: string;
  remote: boolean;
  skills: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  aboutCompany: string;
  industry: string;
  companyId?: string;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  appliedDate: string;
  status: ApplicationStatus;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  location: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
}

export interface Language {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  resumeUrl: string;
  resumeName: string;
  socialLinks: {
    github: string;
    linkedin: string;
    portfolio: string;
  };
  skills: string[];
  experience: Experience[];
  education: Education[];
  certificates: Certificate[];
  languages: Language[];
  profileCompletion: number;
}

export interface JobAlert {
  id: string;
  keyword: string;
  location: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  active: boolean;
  createdAt: string;
}

export interface CompanySubscription {
  id: string;
  company: string;
  companyLogo: string;
  industry: string;
  latestJobCount: number;
  subscribedAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'application' | 'job_alert' | 'company' | 'interview';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Interview {
  id: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  date: string;
  time: string;
  format: 'Video' | 'Onsite' | 'Phone';
  round: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'applied' | 'review' | 'interview' | 'offer' | 'rejected';
}

export const statusConfig: Record<
  ApplicationStatus,
  { className: string; dot: string }
> = {
  Applied: { className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', dot: 'bg-blue-500' },
  'Under Review': { className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' },
  Shortlisted: { className: 'bg-violet-500/10 text-violet-600 border-violet-500/20', dot: 'bg-violet-500' },
  Interview: { className: 'bg-teal-500/10 text-teal-600 border-teal-500/20', dot: 'bg-teal-500' },
  Rejected: { className: 'bg-rose-500/10 text-rose-600 border-rose-500/20', dot: 'bg-rose-500' },
  Hired: { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
};

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function relativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} week${Math.floor(diff / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? 's' : ''} ago`;
}
