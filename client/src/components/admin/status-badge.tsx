import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Tone = 'success' | 'warning' | 'destructive' | 'info' | 'neutral' | 'primary';

const toneClasses: Record<Tone, string> = {
  success: 'border-transparent bg-emerald-100 text-emerald-700',
  warning: 'border-transparent bg-amber-100 text-amber-700',
  destructive: 'border-transparent bg-rose-100 text-rose-700',
  info: 'border-transparent bg-sky-100 text-sky-700',
  neutral: 'border-transparent bg-muted text-muted-foreground',
  primary: 'border-transparent bg-blue-100 text-blue-700',
};

export function StatusBadge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn('font-medium', toneClasses[tone], className)}>
      {children}
    </Badge>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case 'Active':
    case 'Verified':
    case 'Operational':
    case 'Offered':
    case 'Sent':
      return 'success';
    case 'Pending':
    case 'Scheduled':
    case 'Paused':
    case 'Reviewed':
    case 'Past Due':
      return 'warning';
    case 'Suspended':
    case 'Rejected':
    case 'Flagged':
    case 'Rejected':
    case 'Closed':
    case 'error':
      return 'destructive';
    case 'Interview':
    case 'Applied':
      return 'info';
    case 'Draft':
      return 'neutral';
    default:
      return 'neutral';
  }
}
