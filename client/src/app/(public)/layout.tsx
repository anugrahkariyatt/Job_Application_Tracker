import PublicNavbar from "@/components/layout/PublicNavbar";
import Statistics from "@/components/public/Statistics";
// import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
    </>
  );
}
