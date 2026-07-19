'use client';

import * as React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
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
