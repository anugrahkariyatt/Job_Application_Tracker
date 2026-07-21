export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Temporary';

export type ExperienceLevel =
  | 'Entry-level'
  | 'Junior'
  | 'Mid-level'
  | 'Senior'
  | 'Lead'
  | 'Executive';

export type WorkMode = 'Remote' | 'Hybrid' | 'Onsite';

export type JobStatus = 'Draft' | 'Published' | 'Closed';

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Rejected'
  | 'Hired';

export type CompanyStatus = 'Verified' | 'Pending Verification';

export type NotificationType =
  | 'application_received'
  | 'candidate_withdrew'
  | 'job_expiring'
  | 'company_verified'
  | 'system';

export interface Company {
  id: string;
  name: string;
  logo: string;
  cover: string;
  industry: string;
  size: string;
  website: string;
  email: string;
  phone: string;
  headquarters: string;
  address: string;
  foundedYear: number;
  linkedin: string;
  twitter: string;
  facebook: string;
  description: string;
  status: CompanyStatus;
}

export interface Job {
  id: string;
  title: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  location: string;
  workMode: WorkMode;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  skills: string[];
  category: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  deadline: string;
  postedDate: string;
  status: JobStatus;
  views: number;
  applicationsCount: number;
}

export interface Applicant {
  id: string;
  jobId: string;
  photo: string;
  name: string;
  headline: string;
  location: string;
  experienceYears: number;
  appliedDate: string;
  resumeUrl: string;
  portfolio: string | null;
  github: string | null;
  linkedin: string | null;
  status: ApplicationStatus;
  coverLetter: string;
  email: string;
  phone: string;
  timeline: TimelineEvent[];
  notes: ApplicationNote[];
}

export interface TimelineEvent {
  id: string;
  status: ApplicationStatus;
  date: string;
  note: string;
}

export interface ApplicationNote {
  id: string;
  author: string;
  date: string;
  content: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ActivityEvent {
  id: string;
  icon: string;
  title: string;
  description: string;
  date: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  delta: number;
  icon: string;
}
