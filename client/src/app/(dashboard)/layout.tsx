import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["recruiter", "admin"]}>
        <div className="flex min-h-screen bg-background">
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border lg:block">
            <Sidebar />
          </aside>
          <div className="flex flex-1 flex-col lg:pl-64">
            <Header />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}