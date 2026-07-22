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
            <main className="flex-1 p-4 lg:p-6 flex flex-col justify-between">
              <div className="mx-auto max-w-7xl w-full flex-1">{children}</div>
              <footer className="mx-auto max-w-7xl w-full border-t border-border/50 mt-12 pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Nuvora. All rights reserved.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-primary transition-colors">Dashboard Help</a>
                  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
