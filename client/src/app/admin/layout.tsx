'use client';

import * as React from 'react';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import RoleGuard from '@/features/auth/components/RoleGuard';
import { AdminShell } from '@/components/admin/admin-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin"]}>
        <AdminShell>{children}</AdminShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
