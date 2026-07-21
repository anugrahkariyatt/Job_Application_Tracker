'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RowAction {
  label: string;
  icon: LucideIcon;
  tone?: 'default' | 'destructive';
  onClick?: () => void;
}

export function RowActions({ actions, className }: { actions: RowAction[]; className?: string }) {
  return (
    <div className={cn('flex justify-end', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <DropdownMenuItem
                key={a.label}
                onClick={a.onClick}
                className={cn(a.tone === 'destructive' && 'text-destructive focus:text-destructive')}
              >
                <Icon className="mr-2 h-4 w-4" />
                {a.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
