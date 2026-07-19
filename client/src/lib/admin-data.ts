// Centralised dummy data + types for the Limenzy Admin Module.
// Frontend-only — scoped to current backend capabilities.

export type Role = 'Candidate' | 'Recruiter' | 'Admin';
export type UserStatus = 'Active' | 'Disabled' | 'Pending';
export type CompanyStatus = 'Active' | 'Disabled' | 'Pending';
export type JobStatus = 'Active' | 'Closed' | 'Pending';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
export type ApplicationStatus = 'Applied' | 'Reviewed' | 'Interview' | 'Offered' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  joined: string; // ISO date
  initials: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  jobsPosted: number;
  status: CompanyStatus;
  logoColor: string;
  website: string;
  location: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  type: EmploymentType;
  status: JobStatus;
  posted: string;
  applications: number;
}

export interface Application {
  id: string;
  candidate: string;
  candidateInitials: string;
  company: string;
  job: string;
  status: ApplicationStatus;
  applied: string;
}

export const stats = {
  totalUsers: 48230,
  totalCompanies: 1905,
  totalJobs: 7240,
  totalApplications: 42130,
};

export const users: User[] = [
  { id: 'U-1001', name: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', role: 'Candidate', status: 'Active', joined: '2025-03-12', initials: 'AM' },
  { id: 'U-1002', name: 'Sophia Carter', email: 'sophia.carter@outlook.com', role: 'Recruiter', status: 'Active', joined: '2025-01-08', initials: 'SC' },
  { id: 'U-1003', name: 'Liam Johnson', email: 'liam.johnson@gmail.com', role: 'Candidate', status: 'Disabled', joined: '2024-11-22', initials: 'LJ' },
  { id: 'U-1004', name: 'Olivia Brown', email: 'olivia.brown@northstar.io', role: 'Recruiter', status: 'Active', joined: '2025-02-14', initials: 'OB' },
  { id: 'U-1005', name: 'Noah Williams', email: 'noah.williams@gmail.com', role: 'Candidate', status: 'Pending', joined: '2025-08-02', initials: 'NW' },
  { id: 'U-1006', name: 'Emma Davis', email: 'emma.davis@gmail.com', role: 'Candidate', status: 'Active', joined: '2025-05-19', initials: 'ED' },
  { id: 'U-1007', name: 'James Wilson', email: 'james.wilson@brightlabs.com', role: 'Recruiter', status: 'Active', joined: '2025-04-03', initials: 'JW' },
  { id: 'U-1008', name: 'Isabella Garcia', email: 'isabella.garcia@gmail.com', role: 'Candidate', status: 'Disabled', joined: '2024-09-30', initials: 'IG' },
  { id: 'U-1009', name: 'Mason Martinez', email: 'mason.martinez@gmail.com', role: 'Candidate', status: 'Active', joined: '2025-07-11', initials: 'MM' },
  { id: 'U-1010', name: 'Ava Rodriguez', email: 'ava.rodriguez@nimbus.co', role: 'Recruiter', status: 'Pending', joined: '2025-08-15', initials: 'AR' },
  { id: 'U-1011', name: 'Ethan Anderson', email: 'ethan.anderson@gmail.com', role: 'Candidate', status: 'Active', joined: '2025-06-21', initials: 'EA' },
  { id: 'U-1012', name: 'Mia Thomas', email: 'mia.thomas@gmail.com', role: 'Candidate', status: 'Active', joined: '2025-02-28', initials: 'MT' },
];

export const companies: Company[] = [
  { id: 'C-3001', name: 'Northstar Technologies', industry: 'Software', jobsPosted: 24, status: 'Active', logoColor: 'bg-blue-500', website: 'northstar.io', location: 'San Francisco, US' },
  { id: 'C-3002', name: 'BrightLabs', industry: 'Biotech', jobsPosted: 12, status: 'Active', logoColor: 'bg-emerald-500', website: 'brightlabs.com', location: 'Boston, US' },
  { id: 'C-3003', name: 'Nimbus Cloud', industry: 'Cloud Services', jobsPosted: 8, status: 'Pending', logoColor: 'bg-sky-500', website: 'nimbus.co', location: 'Austin, US' },
  { id: 'C-3004', name: 'Quantum Dev', industry: 'Software', jobsPosted: 31, status: 'Active', logoColor: 'bg-indigo-500', website: 'quantum.dev', location: 'Seattle, US' },
  { id: 'C-3005', name: 'Vertex AI', industry: 'Artificial Intelligence', jobsPosted: 5, status: 'Disabled', logoColor: 'bg-rose-500', website: 'vertex.ai', location: 'Toronto, CA' },
  { id: 'C-3006', name: 'Helix Health', industry: 'Healthcare', jobsPosted: 18, status: 'Active', logoColor: 'bg-teal-500', website: 'helixhealth.com', location: 'New York, US' },
  { id: 'C-3007', name: 'Orbit Finance', industry: 'Fintech', jobsPosted: 14, status: 'Pending', logoColor: 'bg-amber-500', website: 'orbit.finance', location: 'London, UK' },
  { id: 'C-3008', name: 'Pixel Forge', industry: 'Gaming', jobsPosted: 9, status: 'Active', logoColor: 'bg-fuchsia-500', website: 'pixelforge.gg', location: 'Berlin, DE' },
];

export const jobs: Job[] = [
  { id: 'J-9001', title: 'Senior Frontend Engineer', company: 'Northstar Technologies', type: 'Full-time', status: 'Active', posted: '2025-08-01', applications: 142 },
  { id: 'J-9002', title: 'Product Designer', company: 'BrightLabs', type: 'Contract', status: 'Active', posted: '2025-08-05', applications: 88 },
  { id: 'J-9003', title: 'DevOps Engineer', company: 'Nimbus Cloud', type: 'Remote', status: 'Pending', posted: '2025-08-09', applications: 54 },
  { id: 'J-9004', title: 'ML Research Scientist', company: 'Quantum Dev', type: 'Full-time', status: 'Active', posted: '2025-07-28', applications: 211 },
  { id: 'J-9005', title: 'Backend Engineer', company: 'Vertex AI', type: 'Full-time', status: 'Closed', posted: '2025-07-15', applications: 67 },
  { id: 'J-9006', title: 'Registered Nurse', company: 'Helix Health', type: 'Part-time', status: 'Active', posted: '2025-08-12', applications: 39 },
  { id: 'J-9007', title: 'Financial Analyst', company: 'Orbit Finance', type: 'Full-time', status: 'Active', posted: '2025-08-14', applications: 73 },
  { id: 'J-9008', title: 'Gameplay Programmer', company: 'Pixel Forge', type: 'Full-time', status: 'Closed', posted: '2025-06-20', applications: 156 },
  { id: 'J-9009', title: 'Marketing Intern', company: 'Northstar Technologies', type: 'Internship', status: 'Active', posted: '2025-08-16', applications: 124 },
  { id: 'J-9010', title: 'Data Engineer', company: 'Quantum Dev', type: 'Remote', status: 'Active', posted: '2025-08-10', applications: 98 },
];

export const applications: Application[] = [
  { id: 'A-5001', candidate: 'Aarav Mehta', candidateInitials: 'AM', company: 'Northstar Technologies', job: 'Senior Frontend Engineer', status: 'Interview', applied: '2025-08-18' },
  { id: 'A-5002', candidate: 'Emma Davis', candidateInitials: 'ED', company: 'BrightLabs', job: 'Product Designer', status: 'Reviewed', applied: '2025-08-17' },
  { id: 'A-5003', candidate: 'Noah Williams', candidateInitials: 'NW', company: 'Quantum Dev', job: 'ML Research Scientist', status: 'Applied', applied: '2025-08-19' },
  { id: 'A-5004', candidate: 'Mason Martinez', candidateInitials: 'MM', company: 'Helix Health', job: 'Registered Nurse', status: 'Offered', applied: '2025-08-15' },
  { id: 'A-5005', candidate: 'Isabella Garcia', candidateInitials: 'IG', company: 'Orbit Finance', job: 'Financial Analyst', status: 'Rejected', applied: '2025-08-14' },
  { id: 'A-5006', candidate: 'Ethan Anderson', candidateInitials: 'EA', company: 'Quantum Dev', job: 'Data Engineer', status: 'Interview', applied: '2025-08-19' },
  { id: 'A-5007', candidate: 'Mia Thomas', candidateInitials: 'MT', company: 'Pixel Forge', job: 'Gameplay Programmer', status: 'Applied', applied: '2025-08-16' },
  { id: 'A-5008', candidate: 'Liam Johnson', candidateInitials: 'LJ', company: 'Northstar Technologies', job: 'Marketing Intern', status: 'Reviewed', applied: '2025-08-13' },
];

// Recent items for the dashboard tables (most recent first).
export const recentJobs = jobs.slice(0, 5);
export const recentCompanies = companies.slice(0, 5);
export const recentUsers = users.slice(0, 5);
