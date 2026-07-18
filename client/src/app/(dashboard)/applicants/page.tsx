'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusChip } from '@/lib/status';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  X,
  Check,
  Award,
  FileText,
  ExternalLink,
  Github,
  Linkedin,
  MapPin,
  Briefcase,
  Mail,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import type { ApplicationStatus } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

const statusFilters = [
  'All',
  'Applied',
  'Under Review',
  'Shortlisted',
  'Rejected',
  'Hired',
];
const PER_PAGE = 9;

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [jobFilter, setJobFilter] = useState<string>('All');
  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);

  const fetchInitialData = async () => {
    try {
      const companyRes = await axiosInstance.get('/api/company');
      if (companyRes.data?.success) {
        setCompany(companyRes.data.data);
      }

      const jobsRes = await axiosInstance.get('/api/jobs/my-jobs', {
        params: { limit: 1000 },
      });
      if (jobsRes.data?.success) {
        setJobs(jobsRes.data.data.jobs);
      }
    } catch (err) {
      console.error('Error fetching initial applicants data:', err);
    }
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/application/recruiter/all', {
        params: {
          search,
          status: statusFilter,
          jobId: jobFilter,
          page,
          limit: PER_PAGE,
        },
      });
      if (response.data?.success) {
        setApplicants(response.data.data.applications);
        setTotalCount(response.data.data.totalCount);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      toast.error('Failed to load applicants list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [search, statusFilter, jobFilter, page]);

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const response = await axiosInstance.patch(`/api/application/${appId}/status`, {
        status: newStatus,
      });
      if (response.data?.success) {
        toast.success(`Applicant status updated to ${newStatus}.`);
        fetchApplicants();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status.');
    }
  };

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const paged = applicants;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 space-y-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicants"
        description="Browse candidates who applied to your job postings — like LinkedIn Recruiter."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Applicants' }]}
        icon={Users}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1-2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by name or headline…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <Select
          value={jobFilter}
          onValueChange={(v) => {
            setJobFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Jobs</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j._id} value={j._id}>
                {j.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {paged.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No applicants found"
            description="Try adjusting your search or filters."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((app) => {
            const candidate = app.candidateId || {};
            const user = candidate.userId || {};
            const jobTitle = app.jobId?.title || 'Unknown Job';
            const companyName = company?.companyName || 'Company';

            return (
              <Card key={app._id} className="job-card-hover overflow-hidden">
                <div className="h-2 bg-primary" />
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {candidate.profileImage ? (
                      <img
                        src={candidate.profileImage}
                        alt={user.name}
                        className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-lg ring-2 ring-border">
                        {(user.name || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/applicants/${app._id}`}
                        className="text-sm font-semibold text-foreground hover:text-primary"
                      >
                        {user.name || 'Candidate'}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {candidate.headline || 'Software Engineer'}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" /> {candidate.location || 'Not specified'}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/applicants/${app._id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                          </Link>
                        </DropdownMenuItem>
                        {candidate.resumeUrl && (
                          <DropdownMenuItem asChild>
                            <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" /> View Resume
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-success focus:text-success"
                          onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                        >
                          <Check className="mr-2 h-4 w-4" /> Shortlist
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-primary focus:text-primary"
                          onClick={() => handleUpdateStatus(app._id, 'Hired')}
                        >
                          <Award className="mr-2 h-4 w-4" /> Hire
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                        >
                          <X className="mr-2 h-4 w-4" /> Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 rounded-md border border-border bg-muted/30 p-2.5">
                    <p className="text-xs text-muted-foreground">Applied for</p>
                    <p className="text-sm font-medium text-foreground">{jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {companyName} · {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {candidate.github && (
                        <a
                          href={candidate.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {candidate.linkedin && (
                        <a
                          href={candidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {candidate.portfolio && (
                        <a
                          href={candidate.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {candidate.resumeUrl && (
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <StatusChip status={app.status} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
