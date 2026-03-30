"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import FileCard from "@/components/gallery/FileCard";
import FilePreviewModal from "@/components/gallery/FilePreviewModal";
import Pagination from "@/components/ui/Pagination";
import { FileCardSkeleton } from "@/components/ui/Skeleton";
import { categoriesApi } from "@/services/api";
import { useFiles } from "@/hooks/useFiles";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { Category, MedicalFile } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  "x-ray": "🦴", "mri": "🧠", "ct-scan": "🔬",
  "blood-report": "🩸", "prescription": "💊",
  "ultrasound": "🫀", "ecg": "💓", "other": "📋",
};

export default function GalleryPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [preview, setPreview] = useState<MedicalFile | null>(null);
  const { result, loading, query, updateQuery } = useFiles({ limit: 12 });

  useEffect(() => { categoriesApi.getAll().then(setCategories).catch(() => {}); }, []);
  useEffect(() => {
    updateQuery({ search: debouncedSearch || undefined, page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const activeCategory = categories.find((c) => c.id === query.categoryId);

  return (
    // Added overflow-x-hidden to prevent horizontal scroll
    <div className="min-h-screen flex flex-col bg-slate-900 overflow-x-hidden">
      {/* Header - unchanged */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl">
  <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">

    {/* LEFT */}
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-sm" />
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      </div>

      <div className="truncate">
        <span className="font-bold text-white text-sm sm:text-lg truncate">
          MedGallery
        </span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs text-green-400">Live</span>
        </div>
      </div>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-2 sm:gap-3">

      <div className="hidden xs:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-800 border border-slate-700 rounded-full">
        <span className="text-[10px] sm:text-xs text-slate-400">
          {result?.total ?? 0} files
        </span>
      </div>

      {session ? (
        <Link
          href="/dashboard"
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
          </svg>
          Admin Panel
        </Link>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l4-4m-4 4l4 4m6-4h8" />
          </svg>
          Admin Login
        </Link>
      )}
    </div>
  </div>
</header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 space-y-10">
        {/* Hero section - added relative and overflow-hidden to clip absolute blur */}
        <div className="text-center py-14 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-40 bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 text-blue-300">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure Medical File Portal
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
              Medical{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                File Gallery
              </span>
            </h1>

            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
              Browse and access medical records, imaging files, and reports — all in one secure place.
            </p>

            {/* Stats pills */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2">
                <span className="text-base">📁</span>
                <span className="text-white font-bold text-sm">{result?.total ?? 0}</span>
                <span className="text-slate-500 text-xs">Files</span>
              </div>
              <div className="w-1 h-1 bg-slate-700 rounded-full" />
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2">
                <span className="text-base">🏷️</span>
                <span className="text-white font-bold text-sm">{categories.length}</span>
                <span className="text-slate-500 text-xs">Categories</span>
              </div>
              <div className="w-1 h-1 bg-slate-700 rounded-full" />
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2">
                <span className="text-base">🔒</span>
                <span className="text-white font-bold text-sm">256-bit</span>
                <span className="text-slate-500 text-xs">Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search - added overflow-hidden to clip gradient blur */}
        <div className="relative max-w-2xl mx-auto overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl blur opacity-20" />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl flex items-center gap-3 px-5 py-1">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search files by title or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 py-4 text-sm text-white placeholder-slate-500 focus:outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills (unchanged) */}
        <div className="flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={() => updateQuery({ categoryId: undefined, page: 1 })}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
              !query.categoryId
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                : "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
            )}
          >
            ✨ All Files
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateQuery({ categoryId: cat.id, page: 1 })}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                query.categoryId === cat.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                  : "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
              )}
            >
              <span>{CATEGORY_ICONS[cat.slug] ?? "📄"}</span>
              {cat.name}
              {cat._count !== undefined && (
                <span className="opacity-50 text-xs">({cat._count.medicalFiles})</span>
              )}
            </button>
          ))}
        </div>

        {/* Results info (unchanged) */}
        {!loading && result && (
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-slate-500">
              {result.total === 0 ? "No files found"
                : `Showing ${result.data.length} of ${result.total} file${result.total !== 1 ? "s" : ""}${activeCategory ? ` in "${activeCategory.name}"` : ""}${search ? ` for "${search}"` : ""}`}
            </p>
            {(query.categoryId || search) && (
              <button
                onClick={() => { setSearch(""); updateQuery({ categoryId: undefined, search: undefined, page: 1 }); }}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Grid (unchanged) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <FileCardSkeleton key={i} />)}
          </div>
        ) : result?.data.length === 0 ? (
          <div className="text-center py-28 bg-slate-800/50 rounded-3xl border border-slate-700">
            <div className="w-24 h-24 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-white">No files found</p>
            <p className="text-sm text-slate-500 mt-2">Try a different search term or category</p>
            {(query.categoryId || search) && (
              <button
                onClick={() => { setSearch(""); updateQuery({ categoryId: undefined, search: undefined, page: 1 }); }}
                className="mt-6 px-6 py-3 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {result?.data.map((file) => (
              <FileCard key={file.id} file={file} onPreview={setPreview} />
            ))}
          </div>
        )}

        {result && result.totalPages > 1 && (
          <Pagination page={result.page} totalPages={result.totalPages} onPageChange={(p) => updateQuery({ page: p })} />
        )}
      </main>

      {/* Footer (unchanged) */}
      <footer className="border-t border-slate-800 bg-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">MedGallery</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              256-bit Encrypted
            </span>
            <span className="text-xs text-slate-600">© {new Date().getFullYear()} MedGallery</span>
          </div>
        </div>
      </footer>

      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
    </div>
  );
}