'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Briefcase,
  Globe,
  Mail,
  User,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Building,
  Check,
  Ban,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface CompanyDetails {
  _id: string;
  companyName: string;
  logo?: string;
  coverImage?: string;
  headquarters?: string;
  website: string;
  industry: string;
  description: string;
  verified: boolean;
  isActive: boolean;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  jobsPosted: number;
  createdAt: string;
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const [company, setCompany] = React.useState<CompanyDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updatingVerify, setUpdatingVerify] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const fetchCompany = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/admin/companies/${id}`);
      if (res.data?.success && res.data.data) {
        setCompany(res.data.data);
      } else {
        toast.error('Company not found.');
        router.push('/admin/companies');
      }
    } catch (err) {
      console.error('Error fetching company details:', err);
      toast.error('Failed to load company details.');
      router.push('/admin/companies');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  React.useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleToggleVerification = async () => {
    if (!company) return;
    const targetState = !company.verified;
    try {
      setUpdatingVerify(true);
      const res = await axiosInstance.patch(`/api/admin/companies/${id}/verify`, {
        verified: targetState,
      });
      if (res.data?.success) {
        toast.success(targetState ? 'Company approved and verified successfully!' : 'Company unverified successfully.');
        setCompany((prev) => (prev ? { ...prev, verified: targetState } : null));
      }
    } catch (err: any) {
      console.error('Error toggling verification:', err);
      toast.error(err.response?.data?.message || 'Failed to update company verification status.');
    } finally {
      setUpdatingVerify(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!company) return;
    const targetState = !company.isActive;
    try {
      setUpdatingStatus(true);
      const res = await axiosInstance.patch(`/api/admin/companies/${id}/status`, {
        isActive: targetState,
      });
      if (res.data?.success) {
        toast.success(targetState ? 'Company account activated.' : 'Company account deactivated.');
        setCompany((prev) => (prev ? { ...prev, isActive: targetState } : null));
      }
    } catch (err: any) {
      console.error('Error toggling active status:', err);
      toast.error(err.response?.data?.message || 'Failed to update company status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/api/admin/companies/${id}`);
      if (res.data?.success) {
        toast.success('Company profile deleted successfully.');
        router.push('/admin/companies');
      }
    } catch (err: any) {
      console.error('Error deleting company:', err);
      toast.error(err.response?.data?.message || 'Failed to delete company profile.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) return null;

  const ownerInitials = company.ownerId?.name
    ? company.ownerId.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OW';

  return (
    <div className="space-y-6">
      <PageHeader
        title={company.companyName}
        description={`Company ID: ${company._id}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Companies', href: '/admin/companies' },
          { label: 'Detail' },
        ]}
        actions={
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete Company'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details Area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Company Profile Header Card */}
          <Card className="overflow-hidden">
          <div className="h-24 w-full bg-muted border-b relative overflow-hidden">
            {company.coverImage && (
              <img src={company.coverImage} className="w-full h-full object-cover opacity-20" alt="Cover" />
            )}
          </div>
          <CardContent className="relative pt-10 pb-6 px-6">
            {/* Profile Logo positioning */}
            <div className="absolute -top-10 left-6 border-2 border-border rounded-xl overflow-hidden bg-background h-20 w-20 shadow-sm">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={company.logo} />
                <AvatarFallback className="bg-primary/8 text-xl font-bold text-primary rounded-none">
                  {company.companyName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {company.companyName}
                    {company.verified && <CheckCircle className="h-5 w-5 fill-primary text-primary-foreground" />}
                  </h2>
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge tone={company.verified ? 'success' : 'warning'}>
                    {company.verified ? 'Verified' : 'Pending Review'}
                  </StatusBadge>
                  <StatusBadge tone={company.isActive ? 'primary' : 'neutral'}>
                    {company.isActive ? 'Active' : 'Deactivated'}
                  </StatusBadge>
                </div>
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground pt-1 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{company.headquarters || 'Location not specified'}</span>
                </div>
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 shrink-0" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5 truncate">
                      {company.website} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          </Card>

          {/* Description Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">About Company</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {company.description || 'No description provided by the recruiter.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions & Stats */}
        <div className="space-y-6">
          {/* Admin Approval Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <Building className="h-4 w-4" />
                Administrative Actions
              </CardTitle>
              <CardDescription>Verify accounts and set access permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Verify approval toggle */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Verification Approval</span>
                  <span className="font-semibold">{company.verified ? 'Approved' : 'Pending'}</span>
                </div>
                <Button
                  onClick={handleToggleVerification}
                  variant={company.verified ? 'outline' : 'default'}
                  className="w-full flex items-center gap-2"
                  disabled={updatingVerify}
                >
                  {company.verified ? (
                    <>
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      Revoke Approval
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-white" />
                      Approve & Verify Company
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Status active/inactive toggle */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="font-semibold">{company.isActive ? 'Active' : 'Disabled'}</span>
                </div>
                <Button
                  onClick={handleToggleStatus}
                  variant={company.isActive ? 'outline' : 'secondary'}
                  className="w-full flex items-center gap-2"
                  disabled={updatingStatus}
                >
                  {company.isActive ? (
                    <>
                      <Ban className="h-4 w-4 text-rose-500" />
                      Disable Company
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      Activate Company
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recruiter Owner profile card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                Recruiter Profile
              </CardTitle>
              <CardDescription>Primary owner of this company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {ownerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold truncate">{company.ownerId?.name || 'Deleted Recruiter'}</h4>
                  <p className="text-xs text-muted-foreground truncate">{company.ownerId?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                Active Postings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <p className="text-4xl font-extrabold text-primary">{company.jobsPosted}</p>
              <p className="text-xs text-muted-foreground mt-2">Active jobs posted by this company on the platform.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(o) => !o && setShowDeleteDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-foreground">{company.companyName}</span>?{' '}
              This will also cascade-delete all associated jobs and applications.
              <span className="mt-2 block font-medium text-destructive">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Company'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
