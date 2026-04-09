"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { StatCardSkeleton, FileCardSkeleton } from "@/components/ui/Skeleton";
import { statsApi, DashboardStats } from "@/services/api";
import { formatBytes } from "@/lib/utils";
import FileCard from "@/components/gallery/FileCard";
import FilePreviewModal from "@/components/gallery/FilePreviewModal";
import type { MedicalFile } from "@/types";

function StatCard({ label, value, icon, gradient }: {
  label: string; value: string | number; icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 ${gradient} shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
        {icon}
      </div>
      <div className="min-w-0 relative z-10">
        <p className="text-sm text-white/70 truncate">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<MedicalFile | null>(null);

  useEffect(() => {
    statsApi.get().then(setStats).finally(() => setLoading(false));
  }, []);

  const imageCount = stats?.filesByType.find((f) => f.fileType === "IMAGE")?._count ?? 0;
  const pdfCount = stats?.filesByType.find((f) => f.fileType === "PDF")?._count ?? 0;
  const totalFiles = stats?.totalFiles ?? 0;
  const imagePercent = totalFiles > 0 ? Math.round((imageCount / totalFiles) * 100) : 0;
  const pdfPercent = totalFiles > 0 ? Math.round((pdfCount / totalFiles) * 100) : 0;

  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview of your medical file gallery" />
      <div className="flex-1 overflow-auto p-6 mt-20 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
            <>
              <StatCard label="Total Files" value={stats?.totalFiles ?? 0}
                gradient="bg-gradient-to-br from-blue-600 to-blue-800"
                icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <StatCard label="Categories" value={stats?.totalCategories ?? 0}
                gradient="bg-gradient-to-br from-violet-600 to-purple-800"
                icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
              />
              <StatCard label="Images" value={imageCount}
                gradient="bg-gradient-to-br from-emerald-600 to-teal-800"
                icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              />
              <StatCard label="Storage Used" value={formatBytes(stats?.totalSize ?? 0)}
                gradient="bg-gradient-to-br from-orange-600 to-red-700"
                icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>}
              />
            </>
          )}
        </div>

        {/* File type breakdown */}
        {!loading && totalFiles > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-slate-300 mb-5">File Type Breakdown</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Images</span>
                  <span className="text-slate-300 font-medium">{imageCount} files ({imagePercent}%)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-700" style={{ width: `${imagePercent}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />PDFs</span>
                  <span className="text-slate-300 font-medium">{pdfCount} files ({pdfPercent}%)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-red-500 to-orange-400 h-2 rounded-full transition-all duration-700" style={{ width: `${pdfPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/upload" className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-2xl p-5 flex items-center gap-4 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <div className="relative z-10">
              <p className="font-bold text-sm">Upload File</p>
              <p className="text-blue-200 text-xs mt-0.5">Add new medical file</p>
            </div>
          </Link>
          <Link href="/files" className="group bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <p className="font-bold text-sm text-white">Manage Files</p>
              <p className="text-slate-500 text-xs mt-0.5">Edit or delete files</p>
            </div>
          </Link>
          <Link href="/categories" className="group bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 transition-colors">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <div>
              <p className="font-bold text-sm text-white">Categories</p>
              <p className="text-slate-500 text-xs mt-0.5">Manage categories</p>
            </div>
          </Link>
        </div>

        {/* Recent uploads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Recent Uploads</h2>
            <Link href="/files" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <FileCardSkeleton key={i} />)}
            </div>
          ) : stats?.recentFiles.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl border-dashed">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400 font-medium">No files uploaded yet</p>
              <Link href="/upload" className="mt-3 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium">
                Upload your first file →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {stats?.recentFiles.map((file) => (
                <FileCard key={file.id} file={file} onPreview={setPreview} />
              ))}
            </div>
          )}
        </div>
      </div>
      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
    </>
  );
}
