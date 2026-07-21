import { cn } from '@/lib/utils';
import type {
  ApplicationStatus,
  JobStatus,
  CompanyStatus,
} from '@/lib/types';

type Status = ApplicationStatus | JobStatus | CompanyStatus;

interface StatusConfig {
  label: string;
  className: string;
  dot: string;
}

const base =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium';

export const statusConfig: Record<Status, StatusConfig> = {
  // Application statuses
  Applied: {
    label: 'Applied',
    className: cn(base, 'bg-info/10 text-info border border-info/20'),
    dot: 'bg-info',
  },
  'Under Review': {
    label: 'Under Review',
    className: cn(base, 'bg-warning/10 text-warning border border-warning/20'),
    dot: 'bg-warning',
  },
  Shortlisted: {
    label: 'Shortlisted',
    className: cn(
      base,
      'bg-status-shortlisted/10 text-status-shortlisted border border-status-shortlisted/20'
    ),
    dot: 'bg-status-shortlisted',
  },
  Rejected: {
    label: 'Rejected',
    className: cn(
      base,
      'bg-destructive/10 text-destructive border border-destructive/20'
    ),
    dot: 'bg-destructive',
  },
  Hired: {
    label: 'Hired',
    className: cn(
      base,
      'bg-success/15 text-success border border-success/25'
    ),
    dot: 'bg-success',
  },
  // Job statuses
  Draft: {
    label: 'Draft',
    className: cn(
      base,
      'bg-muted text-muted-foreground border border-border'
    ),
    dot: 'bg-muted-foreground',
  },
  Published: {
    label: 'Published',
    className: cn(
      base,
      'bg-success/10 text-success border border-success/20'
    ),
    dot: 'bg-success',
  },
  Closed: {
    label: 'Closed',
    className: cn(
      base,
      'bg-foreground/10 text-foreground/70 border border-foreground/15'
    ),
    dot: 'bg-foreground/60',
  },
  // Company statuses
  Verified: {
    label: 'Verified',
    className: cn(
      base,
      'bg-success/10 text-success border border-success/20'
    ),
    dot: 'bg-success',
  },
  'Pending Verification': {
    label: 'Pending Verification',
    className: cn(base, 'bg-warning/10 text-warning border border-warning/20'),
    dot: 'bg-warning',
  },
};

export function StatusChip({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const config = statusConfig[status];
  if (!config) return null;
  return (
    <span className={cn(config.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
