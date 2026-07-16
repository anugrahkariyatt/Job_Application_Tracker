import PublicNavbar from "@/components/layout/PublicNavbar";
import Statistics from "@/components/public/Statistics";
// import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProtectedRoute>
        <RoleGuard allowedRoles={["candidate"]}>
          <PublicNavbar />
          <main>{children}</main>
        </RoleGuard>
      </ProtectedRoute>
    </>
  );
}
