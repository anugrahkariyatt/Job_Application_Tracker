'use client';

import { useState, useEffect } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DataTable, Column } from '@/components/admin/data-table';
import { RowActions } from '@/components/admin/row-actions';
import { StatusBadge, statusTone } from '@/components/admin/status-badge';
import { PageHeader } from '@/components/admin/page-header';
import { DetailDialog } from '@/components/admin/detail-dialog';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface ApplicationItem {
  id: string;
  candidate: string;
  candidateInitials: string;
  company: string;
  job: string;
  status: string;
  applied: string;
}

const statusOptions = [
  { label: 'Applied', value: 'Applied' },
  { label: 'Reviewed', value: 'Reviewed' },
  { label: 'Interview', value: 'Interview' },
  { label: 'Offered', value: 'Offered' },
  { label: 'Rejected', value: 'Rejected' },
];

const mapStatus = (s: string): string => {
  if (s === 'Under Review') return 'Reviewed';
  if (s === 'Shortlisted') return 'Interview';
  if (s === 'Hired') return 'Offered';
  return s;
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState<ApplicationItem | null>(null);

  const fetchApplications = async (params?: { search?: string; filters?: Record<string, string>; page?: number }) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (params?.search) {
        queryParams.set('search', params.search);
      }
      if (params?.filters?.status && params.filters.status !== 'all') {
        // Map UI status filter value to DB status value
        const dbStatus = mapUIToDBStatus(params.filters.status);
        queryParams.set('status', dbStatus);
      }

      const res = await axiosInstance.get(`/api/admin/applications?${queryParams.toString()}`);
      if (res.data?.success) {
        const mapped: ApplicationItem[] = res.data.data.map((a: any) => {
          const candidateName = a.candidateId?.userId?.name || 'Deleted User';
          const initials = candidateName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return {
            id: a._id,
            candidate: candidateName,
            candidateInitials: initials,
            company: a.companyId?.companyName || 'Deleted Company',
            job: a.jobId?.title || 'Deleted Job',
            status: mapStatus(a.status),
            applied: new Date(a.createdAt).toLocaleDateString(),
          };
        });
        setItems(mapped);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  function mapUIToDBStatus(uiStatus: string): string {
    switch (uiStatus) {
      case 'Reviewed':
        return 'Under Review';
      case 'Interview':
        return 'Shortlisted';
      case 'Offered':
        return 'Hired';
      default:
        return uiStatus;
    }
  }

  const columns: Column<ApplicationItem>[] = [
    {
      key: 'candidate',
      header: 'Candidate',
      cell: (a) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sky-100 text-xs font-semibold text-sky-700">{a.candidateInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{a.candidate}</p>
            <p className="truncate text-xs text-muted-foreground">{a.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'company', header: 'Company', cell: (a) => <span className="text-sm">{a.company}</span> },
    { key: 'job', header: 'Job', cell: (a) => <span className="text-sm text-muted-foreground">{a.job}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (a) => <StatusBadge tone={statusTone(a.status)}>{a.status}</StatusBadge>,
    },
    { key: 'applied', header: 'Applied', cell: (a) => <span className="text-sm text-muted-foreground">{a.applied}</span> },
    {
      key: 'actions',
      header: '',
      headClassName: 'w-12 text-right',
      className: 'p-0',
      cell: (a) => {
        const actions: import('@/components/admin/row-actions').RowAction[] = [
          { label: 'View', icon: Eye, onClick: () => router.push(`/admin/applications/${a.id}`) },
        ];
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="View, search and filter all job applications across the platform."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Applications' }]}
      />
      <DataTable<ApplicationItem>
        data={items}
        columns={columns}
        searchPlaceholder="Search applications…"
        getRowId={(a) => a.id}
        serverSide={true}
        loading={loading}
        onServerParamsChange={(p) => fetchApplications(p)}
        filters={[{ key: 'status', placeholder: 'Status', options: statusOptions }]}
      />

      <DetailDialog
        open={!!viewTarget}
        onOpenChange={(o) => !o && setViewTarget(null)}
        title={viewTarget?.candidate ?? ''}
        description={viewTarget?.id}
        badge={viewTarget?.status}
        badgeTone={viewTarget ? statusTone(viewTarget.status) : 'neutral'}
        fields={[
          { label: 'Company', value: viewTarget?.company },
          { label: 'Job', value: viewTarget?.job },
          { label: 'Applied Date', value: viewTarget?.applied },
          { label: 'Status', value: viewTarget?.status },
        ]}
      />
    </div>
  );
}
