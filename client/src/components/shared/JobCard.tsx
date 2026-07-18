import { cn } from '@/lib/utils';
import { StatusChip } from '@/lib/status';
import {
  MapPin,
  Briefcase,
  Clock,
  Eye,
  Users,
  DollarSign,
  ArrowRight,
  CalendarDays,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface JobCardProps {
  job: any;
  showStatus?: boolean;
  showStats?: boolean;
  className?: string;
  companyLogo?: string;
  companyName?: string;
  showActions?: boolean;
  onClose?: (id: string) => void;
  onOpen?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function JobCard({
  job,
  showStatus = true,
  showStats = true,
  className,
  companyLogo,
  companyName,
  showActions = false,
  onClose,
  onOpen,
  onDelete,
}: JobCardProps) {
  const jobId = job._id || job.id;

  const logo = companyLogo || (job.companyId as any)?.logo;
  const name = companyName || (job.companyId as any)?.companyName || 'Company';

  const workModeText = job.workMode || (job.remote ? 'Remote' : 'Onsite');
  const currencyText = job.currency || 'USD';
  const applicationsCount = job.applicationsCount || 0;
  const viewsCount = job.views || 0;
  
  // Map backend 'Open' status to 'Published' status string for standard UI chip coloring
  const statusVal = job.status === 'Open' ? 'Published' : job.status;

  return (
    <div
      className={cn(
        'group rounded-lg border border-border bg-card p-4 relative flex flex-col justify-between transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {logo ? (
          <Link href={`/jobs/${jobId}`} className="shrink-0">
            <img
              src={logo}
              alt={name}
              className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
            />
          </Link>
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold text-lg ring-1 ring-border">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/jobs/${jobId}`} className="hover:text-primary transition-colors block">
                <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                  {job.title}
                </h3>
              </Link>
              <p className="truncate text-xs text-muted-foreground mt-0.5">
                {name}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {showStatus && <StatusChip status={statusVal} />}
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      aria-label="Manage job"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem asChild>
                      <Link href={`/jobs/${jobId}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {job.status === 'Open' ? (
                      <DropdownMenuItem onClick={() => onClose?.(jobId)}>
                        <Ban className="mr-2 h-4 w-4" /> Close Job
                      </DropdownMenuItem>
                    ) : job.status === 'Closed' ? (
                      <DropdownMenuItem onClick={() => onOpen?.(jobId)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Re-open Job
                      </DropdownMenuItem>
                    ) : job.status === 'Draft' ? (
                      <DropdownMenuItem onClick={() => onOpen?.(jobId)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Publish Job
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete?.(jobId)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {job.employmentType}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {workModeText}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {job.salaryMin?.toLocaleString()}–{job.salaryMax?.toLocaleString()} {currencyText}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {job.experienceLevel}
            </span>
          </div>
          {showStats && (
            <div className="mt-3.5 flex items-center gap-4 border-t border-border pt-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{applicationsCount}</span> applicants
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{viewsCount}</span> views
              </span>
              <Link href={`/jobs/${jobId}`} className="ml-auto flex items-center gap-1 font-medium text-primary hover:underline">
                View <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
