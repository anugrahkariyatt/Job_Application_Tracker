import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
            {breadcrumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {c.href ? (
                  <Link href={c.href} className="hover:text-foreground transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{c.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="h-3 w-3 opacity-50" />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
