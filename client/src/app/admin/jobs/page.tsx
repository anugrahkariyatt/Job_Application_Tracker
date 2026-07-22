'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, Loader2 } from 'lucide-react';
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
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface JobItem {
  id: string;
  title: string;
  company: string;
  type: string;
  status: 'Active' | 'Closed';
  posted: string;
  applications: number;
}

const typeOptions = [
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Internship', value: 'Internship' },
  { label: 'Remote', value: 'Remote' },
];
const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Closed', value: 'Closed' },
];

export default function JobsPage() {
  const router = useRouter();
  const [items, setItems] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<JobItem | null>(null);
  const [viewTarget, setViewTarget] = useState<JobItem | null>(null);

  const fetchJobs = async (params?: { search?: string; filters?: Record<string, string>; page?: number }) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (params?.search) {
        queryParams.set('search', params.search);
      }
      if (params?.filters?.type && params.filters.type !== 'all') {
        queryParams.set('type', params.filters.type);
      }
      if (params?.filters?.status && params.filters.status !== 'all') {
        // Map Active UI status filter to Open backend status filter
        queryParams.set('status', params.filters.status === 'Active' ? 'Open' : 'Closed');
      }

      const res = await axiosInstance.get(`/api/admin/jobs?${queryParams.toString()}`);
      if (res.data?.success) {
        const mapped: JobItem[] = res.data.data.map((j: any) => ({
          id: j._id,
          title: j.title,
          company: j.companyId?.companyName || 'Deleted Company',
          type: j.employmentType,
          status: j.status === 'Open' ? 'Active' : 'Closed',
          posted: new Date(j.createdAt).toLocaleDateString(),
          applications: j.applicationsCount || 0,
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      toast.error('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      const res = await axiosInstance.delete(`/api/admin/jobs/${deleteTarget.id}`);
      if (res.data?.success) {
        toast.success('Job post deleted successfully.');
        setItems((p) => p.filter((j) => j.id !== deleteTarget.id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete job post.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns: Column<JobItem>[] = [
    {
      key: 'title',
      header: 'Job Title',
      cell: (j) => <span className="text-sm font-medium">{j.title}</span>,
    },
    { key: 'company', header: 'Company', cell: (j) => <span className="text-sm">{j.company}</span> },
    { key: 'type', header: 'Type', cell: (j) => <span className="text-sm">{j.type}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (j) => <StatusBadge tone={statusTone(j.status)}>{j.status}</StatusBadge>,
    },
    { key: 'posted', header: 'Posted', cell: (j) => <span className="text-sm text-muted-foreground">{j.posted}</span> },
    { key: 'applications', header: 'Applications', cell: (j) => <span className="text-sm font-medium">{j.applications}</span> },
    {
      key: 'actions',
      header: '',
      headClassName: 'w-12 text-right',
      className: 'p-0',
      cell: (j) => {
        const actions: import('@/components/admin/row-actions').RowAction[] = [
          { label: 'View', icon: Eye, onClick: () => router.push(`/admin/jobs/${j.id}`) },
          { label: 'Delete', icon: Trash2, tone: 'destructive', onClick: () => setDeleteTarget(j) },
        ];
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="View, search, filter and manage job posts across the platform."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Jobs' }]}
      />
      <DataTable<JobItem>
        data={items}
        columns={columns}
        searchPlaceholder="Search jobs…"
        getRowId={(j) => j.id}
        serverSide={true}
        loading={loading}
        onServerParamsChange={(p) => fetchJobs(p)}
        filters={[
          { key: 'type', placeholder: 'Type', options: typeOptions },
          { key: 'status', placeholder: 'Status', options: statusOptions },
        ]}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.title}</span>? This action cannot be undone and will delete all associated applications.
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
        title={viewTarget?.title ?? ''}
        description={viewTarget?.id}
        badge={viewTarget?.status}
        badgeTone={viewTarget ? statusTone(viewTarget.status) : 'neutral'}
        fields={[
          { label: 'Company', value: viewTarget?.company },
          { label: 'Employment Type', value: viewTarget?.type },
          { label: 'Posted Date', value: viewTarget?.posted },
          { label: 'Applications', value: viewTarget?.applications },
        ]}
      />
    </div>
  );
}
