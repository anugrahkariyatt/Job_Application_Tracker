'use client';

import * as React from 'react';
import { Search, Building2, MapPin, Globe, Users, ArrowRight, Loader2, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/candidate/page-header';
import { EmptyState } from '@/components/candidate/empty-state';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

const industries = [
  'All',
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Real Estate',
  'Automotive',
  'E-commerce',
];

export default function FindCompaniesPage() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search') || '';

  const [loading, setLoading] = React.useState(true);
  const [companies, setCompanies] = React.useState<any[]>([]);
  const [subscriptions, setSubscriptions] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState(searchParam);
  const [selectedIndustry, setSelectedIndustry] = React.useState('All');
  const [location, setLocation] = React.useState('');
  const [subscribingId, setSubscribingId] = React.useState<string | null>(null);

  // Sync with global header search query
  React.useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all companies matching filters
      const companyParams: any = {};
      if (search.trim()) companyParams.search = search.trim();
      if (selectedIndustry !== 'All') companyParams.industry = selectedIndustry;
      if (location.trim()) companyParams.location = location.trim();

      const companiesRes = await axiosInstance.get('/api/company/list/all', { params: companyParams });
      
      // Fetch subscriptions to check follow status
      const subsRes = await axiosInstance.get('/api/subscriptions');
      
      if (companiesRes.data?.success && Array.isArray(companiesRes.data.data)) {
        setCompanies(companiesRes.data.data);
      }
      
      if (subsRes.data?.success && Array.isArray(subsRes.data.data)) {
        setSubscriptions(subsRes.data.data);
      }
    } catch (err: any) {
      console.error('Fetch companies data error:', err);
      toast.error('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced filter triggers
  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedIndustry, location]);

  const handleToggleSubscribe = async (companyId: string) => {
    try {
      setSubscribingId(companyId);
      const existingSub = subscriptions.find(
        (sub: any) => (sub.companyId?._id || sub.companyId) === companyId
      );

      if (existingSub) {
        const res = await axiosInstance.delete(`/api/subscriptions/${existingSub._id}`);
        if (res.data?.success) {
          setSubscriptions((prev) => prev.filter((s) => s._id !== existingSub._id));
          toast.success('Unsubscribed from company updates.');
        }
      } else {
        const res = await axiosInstance.post('/api/subscriptions', { companyId });
        if (res.data?.success && res.data.data) {
          setSubscriptions((prev) => [...prev, res.data.data]);
          toast.success('Subscribed to company updates.');
        }
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      toast.error('Failed to update subscription status.');
    } finally {
      setSubscribingId(null);
    }
  };

  const getSubId = (companyId: string) => {
    return subscriptions.some(
      (sub: any) => (sub.companyId?._id || sub.companyId) === companyId
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Explore Companies" description="Browse company profiles, follow updates, and search open positions." />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Filter Companies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="industry-filter">Industry</Label>
              <select
                id="industry-filter"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-filter">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location-filter"
                  placeholder="e.g. San Francisco"
                  className="pl-9"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Section */}
        <div className="space-y-4 lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company name, keywords, industry..."
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-3.5 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </Card>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No companies found"
              description="Try adjusting your keywords or clearing filters to find more companies."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setSelectedIndustry('All');
                    setLocation('');
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {companies.map((comp) => {
                const isSubbed = getSubId(comp._id);
                return (
                  <Card key={comp._id} className="flex flex-col justify-between transition-all hover:shadow-md animate-fade-in">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 rounded-lg border">
                          <AvatarImage src={comp.logo} alt={comp.companyName} />
                          <AvatarFallback className="rounded-lg">{comp.companyName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{comp.companyName}</h3>
                          <p className="text-xs text-primary font-medium">{comp.industry || 'Tech'}</p>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {comp.headquarters || 'Remote'}
                            </span>
                            {comp.employeesCount && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {comp.employeesCount} employees
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground line-clamp-3">
                        {comp.description || 'No description available.'}
                      </p>
                    </CardContent>
                    
                    <div className="flex gap-2 p-5 pt-0 border-t mt-auto pt-3 flex-wrap">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/candidate/company/${comp._id}`}>
                          View Profile
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant={isSubbed ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => handleToggleSubscribe(comp._id)}
                        disabled={subscribingId === comp._id}
                        className="gap-1.5"
                      >
                        {isSubbed ? (
                          <>
                            <BellOff className="h-3.5 w-3.5" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <Bell className="h-3.5 w-3.5" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
