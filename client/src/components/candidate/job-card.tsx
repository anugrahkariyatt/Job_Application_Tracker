'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Briefcase, DollarSign, Bookmark, ExternalLink } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { relativeTime, type Job } from '@/lib/candidate-data';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  saved?: boolean;
  onToggleSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  view?: 'grid' | 'list';
}

export function JobCard({ job, saved, onToggleSave, onApply, view = 'grid' }: JobCardProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, button, [role="button"]')) {
      return;
    }
    router.push(`/candidate/jobs/${job.id}`);
  };

  const workModeText = job.workMode || (job.remote ? 'Remote' : 'Onsite');

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card p-0 transition-all duration-200 hover:border-foreground/20 hover:shadow-xs cursor-pointer',
        view === 'list' && 'md:flex-row md:items-center'
      )}
    >
      <CardContent className={cn('flex-1 p-5 space-y-3.5', view === 'list' && 'flex items-start gap-4 space-y-0 p-5')}>
        {/* Header: Company Logo, Title, Company Name, Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {job.companyId ? (
              <Link href={`/candidate/company/${job.companyId}`} onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-10 w-10 shrink-0 rounded-lg border border-border/60 bg-background">
                  <AvatarImage src={job.companyLogo} alt={job.company} className="object-cover" />
                  <AvatarFallback className="rounded-lg font-bold text-xs bg-muted text-muted-foreground">
                    {job.company ? job.company.slice(0, 2).toUpperCase() : 'CO'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Avatar className="h-10 w-10 shrink-0 rounded-lg border border-border/60 bg-background">
                <AvatarImage src={job.companyLogo} alt={job.company} className="object-cover" />
                <AvatarFallback className="rounded-lg font-bold text-xs bg-muted text-muted-foreground">
                  {job.company ? job.company.slice(0, 2).toUpperCase() : 'CO'}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="min-w-0 space-y-0.5">
              <Link
                href={`/candidate/jobs/${job.id}`}
                className="hover:underline block"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-bold text-base leading-tight text-foreground truncate">
                  {job.title}
                </h3>
              </Link>

              {job.companyId ? (
                <Link
                  href={`/candidate/company/${job.companyId}`}
                  className="hover:underline inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors truncate">
                    {job.company}
                  </p>
                </Link>
              ) : (
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {job.company}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(job.id);
            }}
            aria-label={saved ? 'Unsave job' : 'Save job'}
          >
            <Bookmark className={cn('h-4 w-4', saved && 'fill-primary text-primary')} />
          </Button>
        </div>

        {/* Minimal Details Row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
              {job.location} ({workModeText})
            </span>
          )}
          {job.employmentType && (
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70" />
              {job.employmentType}
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground/70" />
              {job.salary}
            </span>
          )}
        </div>

        {/* Minimal Skill Badges */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {job.skills.slice(0, 4).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="font-normal text-[11px] px-2 py-0.5 rounded-md border border-border/40 bg-muted/30 text-muted-foreground"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/80 pt-0.5">
          Posted {relativeTime(job.postedDate)}
        </p>
      </CardContent>

      <CardFooter className={cn('flex items-center justify-between gap-2 p-5 pt-0 mt-auto', view === 'list' && 'p-5 md:w-auto md:shrink-0')}>
        <Button
          size="sm"
          className="flex-1 font-semibold text-xs h-9 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            onApply?.(job.id);
          }}
        >
          Apply Now
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="font-medium text-xs h-9 rounded-lg border-border/60"
          asChild
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/candidate/jobs/${job.id}`}>
            <ExternalLink className="mr-1 h-3.5 w-3.5" />
            Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
