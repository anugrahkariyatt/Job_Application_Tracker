'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/admin/status-badge';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'warning' | 'destructive' | 'info' | 'neutral' | 'primary';

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

export function DetailDialog({
  open,
  onOpenChange,
  title,
  description,
  badge,
  badgeTone = 'neutral',
  accent,
  fields,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  badge?: string;
  badgeTone?: Tone;
  accent?: string;
  fields: DetailField[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {accent && (
              <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white', accent)}>
                {title.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <DialogTitle className="truncate text-base font-semibold">{title}</DialogTitle>
              {description && <DialogDescription className="truncate">{description}</DialogDescription>}
            </div>
            {badge && <StatusBadge tone={badgeTone}>{badge}</StatusBadge>}
          </div>
        </DialogHeader>
        <Separator />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          {fields.map((f) => (
            <div key={f.label} className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.label}</dt>
              <dd className="text-sm font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
