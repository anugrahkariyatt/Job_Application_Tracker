'use client';

import * as React from 'react';
import { Navbar } from '@/components/candidate/navbar';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["candidate"]}>
        <div className="flex min-h-screen flex-col bg-background">
          <Navbar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col justify-between">
            <div className="w-full flex-1">{children}</div>
          </main>
          <Footer />
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
