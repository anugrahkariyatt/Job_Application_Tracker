'use client';

import Link from 'next/link';
import { MapPin, Briefcase, DollarSign, Bookmark, ExternalLink } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, relativeTime, type Job } from '@/lib/candidate-data';

interface JobCardProps {
  job: Job;
  saved?: boolean;
  onToggleSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  view?: 'grid' | 'list';
}

export function JobCard({ job, saved, onToggleSave, onApply, view = 'grid' }: JobCardProps) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardContent className={view === 'list' ? 'flex flex-1 items-start gap-4 p-5' : 'flex-1 p-5'}>
        {view === 'list' && (
          job.companyId ? (
            <Link href={`/candidate/company/${job.companyId}`}>
              <Avatar className="h-12 w-12 shrink-0 rounded-lg hover:opacity-85 transition-opacity">
                <AvatarImage src={job.companyLogo} alt={job.company} />
                <AvatarFallback className="rounded-lg">{job.company.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-12 w-12 shrink-0 rounded-lg">
              <AvatarImage src={job.companyLogo} alt={job.company} />
              <AvatarFallback className="rounded-lg">{job.company.slice(0, 2)}</AvatarFallback>
            </Avatar>
          )
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              {view === 'grid' && (
                job.companyId ? (
                  <Link href={`/candidate/company/${job.companyId}`}>
                    <Avatar className="mb-3 h-10 w-10 rounded-lg hover:opacity-85 transition-opacity">
                      <AvatarImage src={job.companyLogo} alt={job.company} />
                      <AvatarFallback className="rounded-lg">{job.company.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Avatar className="mb-3 h-10 w-10 rounded-lg">
                    <AvatarImage src={job.companyLogo} alt={job.company} />
                    <AvatarFallback className="rounded-lg">{job.company.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                )
              )}
              <Link href={`/candidate/jobs/${job.id}`} className="hover:underline">
                <h3 className="font-semibold leading-tight">{job.title}</h3>
              </Link>
              {job.companyId ? (
                <Link href={`/candidate/company/${job.companyId}`} className="hover:underline">
                  <p className="mt-0.5 text-sm text-muted-foreground hover:text-primary transition-colors">{job.company}</p>
                </Link>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">{job.company}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onToggleSave?.(job.id)}
              aria-label={saved ? 'Unsave job' : 'Save job'}
            >
              <Bookmark className={saved ? 'h-4 w-4 fill-primary text-primary' : 'h-4 w-4'} />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location} {job.workMode ? `(${job.workMode})` : (job.remote ? '(Remote)' : '(Onsite)')}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {job.employmentType}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {job.salary}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="font-normal">
                {skill}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Posted {relativeTime(job.postedDate)}</p>
        </div>
      </CardContent>
      <CardFooter className="gap-2 p-5 pt-0">
        <Button className="flex-1" onClick={() => onApply?.(job.id)}>
          Apply Now
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/candidate/jobs/${job.id}`}>
            <ExternalLink className="mr-1 h-4 w-4" />
            Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
