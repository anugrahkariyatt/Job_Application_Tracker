'use client';

import * as React from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2, ShieldAlert, ShieldCheck, Globe, Building2,
  Calendar, Users, ExternalLink, RefreshCw,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminVerificationPage() {
  const [companies, setCompanies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [verifying, setVerifying] = React.useState<string | null>(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/admin/companies?verified=false');
      if (res.data?.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load pending companies:', err);
      toast.error('Failed to load pending verifications.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id: string, companyName: string) => {
    try {
      setVerifying(id);
      const res = await axiosInstance.patch(`/api/admin/companies/${id}/verify`, {
        verified: true,
      });
      if (res.data?.success) {
        toast.success(`"${companyName}" has been verified successfully.`);
        setCompanies((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to verify company.');
    } finally {
      setVerifying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Verifications"
        description="Review and verify newly registered company profiles."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Pending Verifications' }]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold tracking-tight">
            {companies.length} Pending {companies.length === 1 ? 'Company' : 'Companies'}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPending}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {companies.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-600 mb-4">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-semibold">All caught up!</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            There are no companies awaiting verification at this time.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <Card key={company._id} className="flex flex-col overflow-hidden border hover:shadow-md transition-shadow">
              {/* Cover strip */}
              <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
                {company.coverImage && (
                  <img
                    src={company.coverImage}
                    alt="cover"
                    className="h-full w-full object-cover opacity-50"
                  />
                )}
                <div className="absolute bottom-0 left-4 translate-y-1/2">
                  <Avatar className="h-14 w-14 border-4 border-card rounded-xl">
                    <AvatarImage src={company.logo} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold rounded-xl">
                      {(company.companyName || 'C').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <CardContent className="pt-10 pb-4 px-4 flex flex-col flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-base leading-tight">{company.companyName}</h3>
                  <p className="text-xs text-muted-foreground">{company.industry}</p>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {company.companySize && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{company.companySize} employees</span>
                    </div>
                  )}
                  {company.headquarters && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{company.headquarters}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Registered {new Date(company.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {company.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 border-t pt-2">
                    {company.description}
                  </p>
                )}

                <div className="flex gap-2 pt-2 mt-auto">
                  <Link
                    href={`/admin/companies/${company._id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleVerify(company._id, company.companyName)}
                    disabled={verifying === company._id}
                  >
                    {verifying === company._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    {verifying === company._id ? 'Verifying...' : 'Verify'}
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
