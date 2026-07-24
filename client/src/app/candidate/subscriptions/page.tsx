'use client';

import * as React from 'react';
import { Building2, X, Loader2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/candidate/page-header';
import { EmptyState } from '@/components/candidate/empty-state';
import { formatDate } from '@/lib/candidate-data';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface CompanySubscription {
  id: string;
  company: string;
  companyLogo: string;
  industry: string;
  latestJobCount: number;
  subscribedAt: string;
}

export default function SubscriptionsPage() {
  const [loading, setLoading] = React.useState(true);
  const [subs, setSubs] = React.useState<CompanySubscription[]>([]);

  const fetchSubscriptions = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/subscriptions');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((dbSub: any) => {
          const company = dbSub.companyId || {};
          return {
            id: dbSub._id,
            company: company.companyName || 'Unknown Employer',
            companyLogo: company.logo || '',
            industry: company.industry || 'Tech',
            latestJobCount: 1, // Default mock count
            subscribedAt: dbSub.createdAt || new Date().toISOString(),
          };
        });
        setSubs(mapped);
      }
    } catch (err) {
      console.error('Fetch subscriptions error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const unsubscribe = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/api/subscriptions/${id}`);
      if (res.data?.success) {
        setSubs(subs.filter((s) => s.id !== id));
        toast.success('Successfully unsubscribed.');
      }
    } catch (err) {
      console.error('Unsubscribe error:', err);
      toast.error('Failed to unsubscribe.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Company Subscriptions" description={`Following ${subs.length} companies`} />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3.5 w-1/3" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : subs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No subscriptions"
          description="Subscribe to companies to get notified when they post new jobs."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subs.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 rounded-lg">
                    <AvatarImage src={sub.companyLogo} alt={sub.company} />
                    <AvatarFallback className="rounded-lg">{sub.company.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{sub.company}</p>
                    <p className="text-sm text-muted-foreground">{sub.industry}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <Badge variant="secondary" className="font-normal">{sub.latestJobCount} open jobs</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">Subscribed {formatDate(sub.subscribedAt)}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => unsubscribe(sub.id)}>
                    <X className="mr-1 h-3.5 w-3.5" />Unsubscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
