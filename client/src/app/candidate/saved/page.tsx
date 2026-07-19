'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bookmark, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/candidate/page-header';
import { JobCard } from '@/components/candidate/job-card';
import { EmptyState } from '@/components/candidate/empty-state';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

export default function SavedJobsPage() {
  const [search, setSearch] = React.useState('');
  const [saved, setSaved] = React.useState<any[]>([]);

  React.useEffect(() => {
    const savedJobs = localStorage.getItem('savedJobs');
    if (savedJobs) {
      try {
        setSaved(JSON.parse(savedJobs));
      } catch (e) {
        console.error('Error parsing saved jobs:', e);
      }
    }
  }, []);

  const toggleSave = (jobId: string) => {
    const updated = saved.filter((j) => j.id !== jobId);
    setSaved(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
    toast.success('Job unsaved successfully.');
  };

  const handleApply = async (jobId: string) => {
    try {
      const response = await axiosInstance.post('/api/application', { jobId });
      if (response.data?.success) {
        toast.success('Successfully applied for this job!');
      }
    } catch (err: any) {
      console.error('Apply job error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    }
  };

  const filtered = saved.filter((job) =>
    !search ||
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Saved Jobs" description={`${saved.length} saved jobs`}>
        <Button asChild>
          <Link href="/candidate/jobs">Find More Jobs</Link>
        </Button>
      </PageHeader>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search saved jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs"
          description="Save jobs you're interested in to find them here later."
          action={<Button asChild><Link href="/candidate/jobs">Browse Jobs</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} saved onToggleSave={toggleSave} onApply={handleApply} />
          ))}
        </div>
      )}
    </div>
  );
}
