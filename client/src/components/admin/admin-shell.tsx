import { SidebarContent } from '@/components/admin/sidebar-content';
import { Navbar } from '@/components/admin/navbar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-sidebar lg:block">
        <SidebarContent />
      </aside>
      <div className="lg:pl-64">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
