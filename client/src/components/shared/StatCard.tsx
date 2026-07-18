import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  iconClassName,
  className,
}: StatCardProps) {
  const isPositive = (delta ?? 0) >= 0;
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary',
            iconClassName
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium',
              isPositive ? 'text-success' : 'text-destructive'
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}
