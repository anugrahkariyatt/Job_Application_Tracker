import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  breadcrumbs?: { label: string; href?: string }[];
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  backHref,
  backLabel,
  actions,
  className,
}: PageHeaderProps) {
  let effectiveBackHref = backHref;
  let effectiveBackLabel = backLabel;

  if (!effectiveBackHref && breadcrumbs && breadcrumbs.length >= 3) {
    const parentCrumb = breadcrumbs[breadcrumbs.length - 2];
    if (parentCrumb && parentCrumb.href) {
      effectiveBackHref = parentCrumb.href;
      effectiveBackLabel = `Back to ${parentCrumb.label}`;
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {effectiveBackHref && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2.5 h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Link href={effectiveBackHref}>
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{effectiveBackLabel || 'Back'}</span>
            </Link>
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
