'use client';

import * as React from 'react';

import { Sidebar } from '@/components/candidate/sidebar';
import { Navbar } from '@/components/candidate/navbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["candidate"]}>
        <div className="flex min-h-screen bg-muted/30">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
          <div className="flex flex-1 flex-col min-w-0">
            <Navbar collapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} />
            <main className="flex-1 p-4 lg:p-6">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
