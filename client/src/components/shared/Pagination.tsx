import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div
      className={cn('flex items-center justify-center gap-1', className)}
      role="navigation"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2.5 text-sm font-medium text-muted-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
      >
        Previous
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center">
            {showEllipsis && (
              <span className="px-1.5 text-sm text-muted-foreground">…</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={cn(
                'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2.5 text-sm font-medium transition-colors',
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-input bg-background text-muted-foreground hover:bg-accent'
              )}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2.5 text-sm font-medium text-muted-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
