'use client';

import * as React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareThisButtonsProps {
  title: string;
  company?: string;
  url?: string;
  description?: string;
  className?: string;
}

export function ShareThisButtons({
  title,
  company,
  url,
  className,
}: ShareThisButtonsProps) {
  const currentUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `Check out this job opening: ${title}${
    company ? ` at ${company}` : ''
  }`;

  const handleShare = async () => {
    const shareData = {
      title: `${title}${company ? ` - ${company}` : ''}`,
      text: shareText,
      url: currentUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;
        }
      }
    }

    // Fallback: Copy link directly to clipboard
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Job link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link to clipboard.');
    }
  };

  return (
    <Button variant="outline" onClick={handleShare} className={className}>
      <Share2 className="mr-2 h-4 w-4 text-primary" />
      Share
    </Button>
  );
}
