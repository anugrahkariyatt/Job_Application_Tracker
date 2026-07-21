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
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col justify-between">
              <div className="mx-auto max-w-7xl w-full flex-1">{children}</div>
              <footer className="mx-auto max-w-7xl w-full border-t border-border/50 mt-12 pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Techno Careers. All rights reserved.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-primary transition-colors">Recruiter Support</a>
                  <a href="#" className="hover:text-primary transition-colors">Platform Status</a>
                  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}