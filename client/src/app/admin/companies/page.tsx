'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, CheckCircle2, Ban, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { RowActions } from '@/components/admin/row-actions';
import { StatusBadge, statusTone } from '@/components/admin/status-badge';
import { PageHeader } from '@/components/admin/page-header';
import { DetailDialog } from '@/components/admin/detail-dialog';
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
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface CompanyItem {
  id: string;
  name: string;
  industry: string;
  jobsPosted: number;
  status: 'Active' | 'Disabled';
  verified: boolean;
  logoColor: string;
  website: string;
  location: string;
  logo?: string;
}

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Disabled', value: 'Disabled' },
];

export default function CompaniesPage() {
  const router = useRouter();
  const [items, setItems] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CompanyItem | null>(null);
  const [viewTarget, setViewTarget] = useState<CompanyItem | null>(null);

  const fetchCompanies = async (params?: { search?: string; filters?: Record<string, string>; page?: number }) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (params?.search) {
        queryParams.set('search', params.search);
      }
      if (params?.filters?.status && params.filters.status !== 'all') {
        queryParams.set('status', params.filters.status);
      }

      const res = await axiosInstance.get(`/api/admin/companies?${queryParams.toString()}`);
      if (res.data?.success) {
        const mapped: CompanyItem[] = res.data.data.map((c: any) => ({
          id: c._id,
          name: c.companyName,
          industry: c.industry,
          jobsPosted: c.jobsPosted || 0,
          status: c.isActive ? 'Active' : 'Disabled',
          verified: !!c.verified,
          logo: c.logo,
          website: c.website || 'N/A',
          location: c.headquarters || 'N/A',
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      toast.error('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'Active' | 'Disabled') => {
    const nextActive = currentStatus === 'Disabled';
    try {
      const res = await axiosInstance.patch(`/api/admin/companies/${id}/status`, {
        isActive: nextActive,
      });
      if (res.data?.success) {
        toast.success('Company status updated.');
        setItems((p) =>
          p.map((c) => (c.id === id ? { ...c, status: nextActive ? 'Active' : 'Disabled' } : c))
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const toggleVerify = async (id: string, currentVerified: boolean) => {
    const nextVerified = !currentVerified;
    try {
      const res = await axiosInstance.patch(`/api/admin/companies/${id}/verify`, {
        verified: nextVerified,
      });
      if (res.data?.success) {
        toast.success(nextVerified ? 'Company verified successfully.' : 'Company verification removed.');
        setItems((p) =>
          p.map((c) => (c.id === id ? { ...c, verified: nextVerified } : c))
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update verification.');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      const res = await axiosInstance.delete(`/api/admin/companies/${deleteTarget.id}`);
      if (res.data?.success) {
        toast.success('Company deleted successfully.');
        setItems((p) => p.filter((c) => c.id !== deleteTarget.id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete company.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns: Column<CompanyItem>[] = [
    {
      key: 'name',
      header: 'Company',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border rounded-lg">
            <AvatarImage src={c.logo} />
            <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary rounded-lg">
              {c.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-medium">{c.name}</p>
              {c.verified && <ShieldCheck className="h-4 w-4 text-emerald-600 fill-emerald-100" />}
            </div>
            <p className="truncate text-xs text-muted-foreground">{c.website}</p>
          </div>
        </div>
      ),
    },
    { key: 'industry', header: 'Industry', cell: (c) => <span className="text-sm">{c.industry}</span> },
    { key: 'location', header: 'Location', cell: (c) => <span className="text-sm text-muted-foreground">{c.location}</span> },
    { key: 'jobsPosted', header: 'Jobs Posted', cell: (c) => <span className="text-sm font-medium">{c.jobsPosted}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => <StatusBadge tone={statusTone(c.status)}>{c.status}</StatusBadge>,
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'w-12 text-right',
      className: 'p-0',
      cell: (c) => {
        const actions: import('@/components/admin/row-actions').RowAction[] = [
          { label: 'View', icon: Eye, onClick: () => router.push(`/admin/companies/${c.id}`) },
          c.status === 'Disabled'
            ? { label: 'Enable', icon: CheckCircle2, onClick: () => toggleStatus(c.id, c.status) }
            : { label: 'Disable', icon: Ban, tone: 'destructive', onClick: () => toggleStatus(c.id, c.status) },
          c.verified
            ? { label: 'Unverify', icon: ShieldAlert, onClick: () => toggleVerify(c.id, c.verified) }
            : { label: 'Verify', icon: ShieldCheck, onClick: () => toggleVerify(c.id, c.verified) },
          { label: 'Delete', icon: Trash2, tone: 'destructive', onClick: () => setDeleteTarget(c) },
        ];
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="View, search and manage companies on the platform."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Companies' }]}
      />
      <DataTable<CompanyItem>
        data={items}
        columns={columns}
        searchPlaceholder="Search companies…"
        getRowId={(c) => c.id}
        serverSide={true}
        loading={loading}
        onServerParamsChange={(p) => fetchCompanies(p)}
        filters={[{ key: 'status', placeholder: 'Status', options: statusOptions }]}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>? This action cannot be undone and will delete all associated jobs and applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={remove}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DetailDialog
        open={!!viewTarget}
        onOpenChange={(o) => !o && setViewTarget(null)}
        title={viewTarget?.name ?? ''}
        description={viewTarget?.website}
        badge={viewTarget?.status}
        badgeTone={viewTarget ? statusTone(viewTarget.status) : 'neutral'}
        accent={viewTarget?.logoColor}
        fields={[
          { label: 'Industry', value: viewTarget?.industry },
          { label: 'Location', value: viewTarget?.location },
          { label: 'Website', value: viewTarget?.website },
          { label: 'Jobs Posted', value: viewTarget?.jobsPosted },
          { label: 'Verification', value: viewTarget?.verified ? 'Verified' : 'Unverified' },
        ]}
      />
    </div>
  );
}
