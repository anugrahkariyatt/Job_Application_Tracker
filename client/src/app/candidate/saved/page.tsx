'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bookmark, Search, LayoutGrid, List, X, Briefcase } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/candidate/page-header';
import { JobCard } from '@/components/candidate/job-card';
import { EmptyState } from '@/components/candidate/empty-state';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

export default function SavedJobsPage() {
  const [search, setSearch] = React.useState('');
  const [savedJobs, setSavedJobs] = React.useState<any[]>([]);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved jobs:', e);
      }
    }
  }, []);

  const toggleSave = (jobId: string) => {
    const updated = savedJobs.filter((j) => j.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
    toast.success('Job removed from saved list.');
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

  const filtered = savedJobs.filter((job) =>
    !search ||
    job.title?.toLowerCase().includes(search.toLowerCase()) ||
    job.company?.toLowerCase().includes(search.toLowerCase()) ||
    job.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Saved Jobs" description={`You have ${savedJobs.length} bookmarked position${savedJobs.length === 1 ? '' : 's'}.`}>
        <Button asChild>
          <Link href="/candidate/jobs">Explore More Jobs</Link>
        </Button>
      </PageHeader>

      {/* Top Search + View Toggle Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search saved jobs by title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
              onClick={() => setSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center rounded-lg border bg-background">
          <Button
            variant="ghost"
            size="icon"
            className={cn('rounded-r-none h-11 w-11', view === 'grid' && 'bg-accent')}
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn('rounded-l-none h-11 w-11', view === 'list' && 'bg-accent')}
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={savedJobs.length === 0 ? 'No saved jobs yet' : 'No matching saved jobs'}
          description={
            savedJobs.length === 0
              ? 'Bookmark jobs while exploring to save them for later applications.'
              : 'Try clearing your search keyword to view your saved jobs.'
          }
          action={
            savedJobs.length === 0 ? (
              <Button asChild>
                <Link href="/candidate/jobs">Browse Active Jobs</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            )
          }
        />
      ) : (
        <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}>
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved
              onToggleSave={toggleSave}
              onApply={handleApply}
              view={view}
            />
          ))}
        </div>
      )}
    </div>
  );
}
