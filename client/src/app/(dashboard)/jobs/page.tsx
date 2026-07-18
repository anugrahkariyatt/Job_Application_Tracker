'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusChip } from '@/lib/status';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { JobCard } from '@/components/shared/JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  PlusCircle,
  Search,
  LayoutGrid,
  List,
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Ban,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { JobStatus } from '@/lib/types';
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

const statusFilters = ['All', 'Open', 'Draft', 'Closed'];
const PER_PAGE = 6;

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [totalCount, setTotalCount] = useState(0);

  const fetchCompany = async () => {
    try {
      const companyResponse = await axiosInstance.get('/api/company');
      if (companyResponse.data?.success) {
        setCompany(companyResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching company:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/jobs/my-jobs', {
        params: {
          search,
          status: statusFilter,
          page,
          limit: PER_PAGE,
        },
      });
      if (response.data?.success) {
        setJobs(response.data.data.jobs);
        setTotalCount(response.data.data.totalCount);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      toast.error('Failed to load jobs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter, page]);

  const handleCloseJob = async (jobId: string) => {
    try {
      const response = await axiosInstance.patch(`/api/jobs/${jobId}/status`, {
        status: 'Closed',
      });
      if (response.data?.success) {
        toast.success('Job closed successfully.');
        fetchJobs();
      }
    } catch (err) {
      console.error('Error closing job:', err);
      toast.error('Failed to close job.');
    }
  };

  const handleOpenJob = async (jobId: string) => {
    try {
      const response = await axiosInstance.patch(`/api/jobs/${jobId}/status`, {
        status: 'Open',
      });
      if (response.data?.success) {
        toast.success('Job opened successfully.');
        fetchJobs();
      }
    } catch (err) {
      console.error('Error opening job:', err);
      toast.error('Failed to open job.');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This cannot be undone.')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/jobs/${jobId}`);
      if (response.data?.success) {
        toast.success('Job deleted successfully.');
        fetchJobs();
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      toast.error('Failed to delete job.');
    }
  };

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const paged = jobs;

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
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Jobs"
        description="Manage all your job postings — like a job board for your company."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Jobs' }]}
        icon={Briefcase}
        actions={
          <Link
            href="/jobs/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <PlusCircle className="h-4 w-4" />
            Post a Job
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1-2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search jobs by title or location…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
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
                {s === 'All' ? 'All Statuses' : s === 'Open' ? 'Published' : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="hidden items-center rounded-md border border-border p-0.5 sm:flex">
          <button
            onClick={() => setView('grid')}
            className={`rounded p-1.5 transition-colors ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded p-1.5 transition-colors ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {paged.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="Try adjusting your filters or post a new job."
            action={
              <Link
                href="/jobs/new"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
              >
                <PlusCircle className="h-4 w-4" />
                Post a Job
              </Link>
            }
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              companyLogo={company?.logo}
              companyName={company?.companyName}
              showActions={true}
              onClose={handleCloseJob}
              onOpen={handleOpenJob}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {paged.map((job) => {
              const jobId = job._id;
              const statusVal = job.status === 'Open' ? 'Published' : job.status;
              const logo = company?.logo;
              const companyName = company?.companyName || 'Company';

              return (
                <div
                  key={jobId}
                  className="flex items-start gap-3 p-4 hover:bg-accent/50 transition-colors"
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt={companyName}
                      className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="h-11 w-11 shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm ring-1 ring-border">
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/jobs/${jobId}`}
                      className="text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{companyName}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" /> {job.employmentType}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" /> {job.salaryMin?.toLocaleString()}–{job.salaryMax?.toLocaleString()} USD
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={statusVal} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={`/jobs/${jobId}`}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {job.status === 'Open' ? (
                          <DropdownMenuItem onClick={() => handleCloseJob(jobId)}>
                            <Ban className="mr-2 h-4 w-4" /> Close Job
                          </DropdownMenuItem>
                        ) : job.status === 'Closed' ? (
                          <DropdownMenuItem onClick={() => handleOpenJob(jobId)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Re-open Job
                          </DropdownMenuItem>
                        ) : job.status === 'Draft' ? (
                          <DropdownMenuItem onClick={() => handleOpenJob(jobId)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Publish Job
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteJob(jobId)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
