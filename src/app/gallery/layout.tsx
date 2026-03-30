import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical File Gallery",
  description: "Browse and access medical records, reports, and imaging files securely.",
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
