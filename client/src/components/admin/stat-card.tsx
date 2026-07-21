import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: number; // percentage, positive or negative
  tone?: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky';
  hint?: string;
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-600',
  sky: 'bg-sky-50 text-sky-600',
};

export function StatCard({ label, value, icon: Icon, change, tone = 'blue', hint }: StatCardProps) {
  const positive = (change ?? 0) >= 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          </div>
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', toneClasses[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {(change !== undefined || hint) && (
          <div className="mt-4 flex items-center gap-2 text-xs">
            {change !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  positive ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {Math.abs(change)}%
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
