import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  backLabel,
  actions,
  className,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
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
    <div className={cn('flex flex-col gap-3', className)}>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
