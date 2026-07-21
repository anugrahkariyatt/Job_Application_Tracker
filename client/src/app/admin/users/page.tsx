'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/admin/data-table';
import { RowActions } from '@/components/admin/row-actions';
import { StatusBadge, statusTone } from '@/components/admin/status-badge';
import { PageHeader } from '@/components/admin/page-header';
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

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Disabled';
  joined: string;
  initials: string;
}

const roleOptions = [
  { label: 'Candidate', value: 'Candidate' },
  { label: 'Recruiter', value: 'Recruiter' },
  { label: 'Admin', value: 'Admin' },
];
const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Disabled', value: 'Disabled' },
];

export default function UsersPage() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

  const fetchUsers = async (params?: { search?: string; filters?: Record<string, string>; page?: number }) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (params?.search) {
        queryParams.set('search', params.search);
      }
      if (params?.filters?.role && params.filters.role !== 'all') {
        queryParams.set('role', params.filters.role.toLowerCase());
      }
      if (params?.filters?.status && params.filters.status !== 'all') {
        queryParams.set('status', params.filters.status);
      }

      const res = await axiosInstance.get(`/api/admin/users?${queryParams.toString()}`);
      if (res.data?.success) {
        const mapped: UserItem[] = res.data.data.map((u: any) => {
          const initials = u.name
            ? u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
            : 'U';
          const roleLabel = u.role.charAt(0).toUpperCase() + u.role.slice(1);
          return {
            id: u._id,
            name: u.name || 'N/A',
            email: u.email,
            role: roleLabel,
            status: u.isActive ? 'Active' : 'Disabled',
            joined: new Date(u.createdAt).toLocaleDateString(),
            initials,
          };
        });
        setItems(mapped);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'Active' | 'Disabled') => {
    const nextActive = currentStatus === 'Disabled';
    try {
      const res = await axiosInstance.patch(`/api/admin/users/${id}/status`, {
        isActive: nextActive,
      });
      if (res.data?.success) {
        toast.success(`User status updated successfully.`);
        setItems((p) =>
          p.map((u) => (u.id === id ? { ...u, status: nextActive ? 'Active' : 'Disabled' } : u))
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      const res = await axiosInstance.delete(`/api/admin/users/${deleteTarget.id}`);
      if (res.data?.success) {
        toast.success('User deleted successfully.');
        setItems((p) => p.filter((u) => u.id !== deleteTarget.id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns: Column<UserItem>[] = [
    {
      key: 'name',
      header: 'User',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{u.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{u.name}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', cell: (u) => <span className="text-sm">{u.role}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (u) => <StatusBadge tone={statusTone(u.status)}>{u.status}</StatusBadge>,
    },
    { key: 'joined', header: 'Joined', cell: (u) => <span className="text-sm text-muted-foreground">{u.joined}</span> },
    {
      key: 'actions',
      header: '',
      headClassName: 'w-12 text-right',
      className: 'p-0',
      cell: (u) => {
        const actions: import('@/components/admin/row-actions').RowAction[] = [
          u.role === 'Admin' ? null : (u.status === 'Disabled'
            ? { label: 'Enable', icon: UserCheck, onClick: () => toggleStatus(u.id, u.status) }
            : { label: 'Disable', icon: UserX, tone: 'destructive', onClick: () => toggleStatus(u.id, u.status) }),
          u.role === 'Admin' ? null : { label: 'Delete', icon: Trash2, tone: 'destructive', onClick: () => setDeleteTarget(u) },
        ].filter(Boolean) as import('@/components/admin/row-actions').RowAction[];
        
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="View, search, filter and manage user accounts."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]}
      />
      <DataTable<UserItem>
        data={items}
        columns={columns}
        searchPlaceholder="Search users…"
        getRowId={(u) => u.id}
        serverSide={true}
        loading={loading}
        onServerParamsChange={(p) => fetchUsers(p)}
        filters={[
          { key: 'role', placeholder: 'Role', options: roleOptions },
          { key: 'status', placeholder: 'Status', options: statusOptions },
        ]}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>? This action cannot be undone and will delete all associated records.
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
    </div>
  );
}
