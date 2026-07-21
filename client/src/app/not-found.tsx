'use client';

import Link from 'next/link';
import { FileQuestion, Home, LayoutDashboard, Search, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-24 text-center sm:py-32 lg:px-8">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-pulse">
        <FileQuestion className="h-14 w-14" />
        <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-base font-semibold text-primary">404 Error</p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">Page not found</h1>
      <p className="mt-6 text-base leading-7 text-muted-foreground max-w-md mx-auto">
        Sorry, we couldn’t find the page you’re looking for. It might have been moved, deleted, or the URL might be incorrect.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
        </Button>
      </div>
      <div className="mt-12 border-t border-border pt-6 w-full max-w-sm">
        <p className="text-xs text-muted-foreground mb-3">Looking for opportunities?</p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Briefcase className="h-4 w-4" />
          Browse open job postings
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
