import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: { default: "MedGallery", template: "%s | MedGallery" },
  description: "Secure medical file gallery and management portal",
  keywords: ["medical", "gallery", "files", "radiology", "health records"],
  authors: [{ name: "MedGallery" }],
  openGraph: {
    title: "MedGallery — Medical File Gallery",
    description: "Secure medical file gallery and management portal",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen font-sans antialiased" style={{ background: "#0f172a" }}>
        {/* Ambient background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] animate-float" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />
          <div className="absolute top-[45%] -right-32 w-[500px] h-[500px] rounded-full blur-[140px] animate-float2" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-32 left-[35%] w-[450px] h-[450px] rounded-full blur-[120px] animate-float" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", animationDelay: "4s" }} />
        </div>
        <div className="relative z-10">
          <SessionProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: "12px",
                  fontSize: "14px",
                  background: "#1e293b",
                  color: "#f1f5f9",
                  border: "1px solid rgba(148,163,184,0.1)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                },
              }}
            />
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
