'use client';

import * as React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, X, Loader2, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { PageHeader } from '@/components/candidate/page-header';
import { JobCard } from '@/components/candidate/job-card';
import { EmptyState } from '@/components/candidate/empty-state';
import { type EmploymentType, type ExperienceLevel } from '@/lib/candidate-data';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { mapJobToFrontend } from '@/lib/candidate-mappers';

const employmentTypes: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const experienceLevels: ExperienceLevel[] = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Manager'];
const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'salary_high', label: 'Salary: High to Low' },
  { value: 'salary_low', label: 'Salary: Low to High' },
];

export default function FindJobsPage() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search') || '';

  const [loading, setLoading] = React.useState(true);
  const [allJobs, setAllJobs] = React.useState<any[]>([]);

  const [search, setSearch] = React.useState(searchParam);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = React.useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = React.useState<string[]>([]);
  const [location, setLocation] = React.useState('');
  const [salaryMin, setSalaryMin] = React.useState(0);
  const [sortBy, setSortBy] = React.useState('recent');
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [savedJobIds, setSavedJobIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  React.useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedJobIds(parsed.map((j: any) => j.id));
      } catch (e) {
        console.error('Error parsing saved jobs:', e);
      }
    }
  }, []);

  const handleToggleSave = (jobId: string) => {
    const saved = localStorage.getItem('savedJobs');
    let currentSaved: any[] = [];
    if (saved) {
      try {
        currentSaved = JSON.parse(saved);
      } catch (e) {}
    }
    
    const isSaved = currentSaved.some(j => j.id === jobId);
    if (isSaved) {
      currentSaved = currentSaved.filter(j => j.id !== jobId);
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
      toast.success('Job unsaved successfully.');
    } else {
      const jobToAdd = allJobs.find(j => j.id === jobId);
      if (jobToAdd) {
        currentSaved.push(jobToAdd);
        setSavedJobIds(prev => [...prev, jobId]);
        toast.success('Job saved successfully.');
      }
    }
    localStorage.setItem('savedJobs', JSON.stringify(currentSaved));
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (selectedTypes.length > 0) params.employmentTypes = selectedTypes.join(',');
      if (selectedLevels.length > 0) params.experienceLevels = selectedLevels.join(',');
      if (selectedWorkModes.length > 0) params.workModes = selectedWorkModes.join(',');
      if (location.trim()) params.location = location.trim();
      if (salaryMin > 0) params.salaryMin = salaryMin;
      if (sortBy) params.sortBy = sortBy;

      const res = await axiosInstance.get('/api/jobs', { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map(mapJobToFrontend);
        setAllJobs(mapped);
      }
    } catch (err: any) {
      console.error('Fetch jobs error:', err);
      toast.error('Failed to load active job postings.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced query fetching whenever search parameters are updated by the user
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedTypes, selectedLevels, selectedWorkModes, location, salaryMin, sortBy]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };
  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]);
  };
  const toggleWorkMode = (mode: string) => {
    setSelectedWorkModes((prev) => prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]);
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

  const activeFilters = selectedTypes.length + selectedLevels.length + selectedWorkModes.length + (location ? 1 : 0) + (salaryMin > 0 ? 1 : 0);

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold">Location</Label>
        <Input
          placeholder="City or state"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label className="text-sm font-semibold">Employment Type</Label>
        <div className="mt-2 space-y-2">
          {employmentTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox checked={selectedTypes.includes(type)} onCheckedChange={() => toggleType(type)} />
              <Label className="text-sm font-normal cursor-pointer">{type}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm font-semibold">Experience Level</Label>
        <div className="mt-2 space-y-2">
          {experienceLevels.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox checked={selectedLevels.includes(level)} onCheckedChange={() => toggleLevel(level)} />
              <Label className="text-sm font-normal cursor-pointer">{level}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm font-semibold">Minimum Salary: ${(salaryMin).toLocaleString()}k</Label>
        <input
          type="range"
          min={0}
          max={250}
          step={10}
          value={salaryMin}
          onChange={(e) => setSalaryMin(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
      </div>
      <div>
        <Label className="text-sm font-semibold">Work Mode</Label>
        <div className="mt-2 space-y-2">
          {['Remote', 'Hybrid', 'Onsite'].map((mode) => (
            <div key={mode} className="flex items-center space-x-2">
              <Checkbox checked={selectedWorkModes.includes(mode)} onCheckedChange={() => toggleWorkMode(mode)} />
              <Label className="text-sm font-normal cursor-pointer">{mode}</Label>
            </div>
          ))}
        </div>
      </div>
      {activeFilters > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => { setSelectedTypes([]); setSelectedLevels([]); setSelectedWorkModes([]); setLocation(''); setSalaryMin(0); }}
        >
          <X className="mr-1 h-4 w-4" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Find Jobs" description={`Showing ${allJobs.length} active job postings`} />

      {/* Search + Sort + View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by job title, company, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFilters > 0 && <Badge className="ml-1 h-5 px-1.5">{activeFilters}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center rounded-lg border">
            <Button variant="ghost" size="icon" className={cn('rounded-r-none', view === 'grid' && 'bg-accent')} onClick={() => setView('grid')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className={cn('rounded-l-none', view === 'list' && 'bg-accent')} onClick={() => setView('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Desktop sidebar filters */}
        <Card className="hidden lg:block h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <FiltersContent />
          </CardContent>
        </Card>

        {/* Jobs list grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Filtering jobs...</p>
            </div>
          ) : allJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs found"
              description="Try adjusting your filters or search keywords to find matching positions."
              action={<Button onClick={() => { setSearch(''); setSelectedTypes([]); setSelectedLevels([]); setSelectedWorkModes([]); setLocation(''); setSalaryMin(0); }}>Reset Search</Button>}
            />
          ) : (
            <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'flex flex-col gap-4'}>
              {allJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  saved={savedJobIds.includes(job.id)}
                  onToggleSave={handleToggleSave}
                  view={view}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
