export interface CandidateAIData {
  fullName: string;
  headline?: string;
  summary?: string;

  skills: string[];

  experience?: string[];

  education?: string[];

  resumeUrl?: string;
}

export interface JobAIData {
  title: string;

  description: string;

  requiredSkills: string[];

  responsibilities?: string[];

  qualifications?: string[];

  location?: string;

  employmentType?: string;
}