import type { Metadata } from "next";
import Sidebar from "@/components/admin/Sidebar";

export const metadata: Metadata = {
  title: { default: "Admin Panel", template: "%s | MedGallery Admin" },
  description: "MedGallery admin panel",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0" style={{ background: "#0f172a" }}>
        {children}
      </main>
    </div>
  );
}
