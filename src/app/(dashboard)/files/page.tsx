"use client";
import { useEffect, useState, useCallback } from "react"; // Add useCallback
import Link from "next/link";
import toast from "react-hot-toast";
import Topbar from "@/components/admin/Topbar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import FileCard from "@/components/gallery/FileCard";
import FilePreviewModal from "@/components/gallery/FilePreviewModal";
import { FileCardSkeleton } from "@/components/ui/Skeleton";
import { filesApi, categoriesApi } from "@/services/api";
import { useFiles } from "@/hooks/useFiles";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { Category, MedicalFile } from "@/types";

export default function FilesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [preview, setPreview] = useState<MedicalFile | null>(null);
  const [editTarget, setEditTarget] = useState<MedicalFile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalFile | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", categoryId: "" });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { result, loading, query, updateQuery, refetch } = useFiles();

  useEffect(() => { categoriesApi.getAll().then(setCategories).catch(() => {}); }, []);
  useEffect(() => {
    updateQuery({ search: debouncedSearch || undefined, page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Memoized close handlers
  const closeEditModal = useCallback(() => setEditTarget(null), []);
  const closeDeleteModal = useCallback(() => setDeleteTarget(null), []);
  const closePreviewModal = useCallback(() => setPreview(null), []);

  const openEdit = (file: MedicalFile) => {
    setEditTarget(file);
    setEditErrors({});
    setEditForm({ title: file.title, description: file.description ?? "", categoryId: file.categoryId });
  };

  const handleEdit = async () => {
    const errs: Record<string, string> = {};
    if (!editForm.title.trim()) errs.title = "Title is required";
    if (!editForm.categoryId) errs.categoryId = "Category is required";
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    setSaving(true);
    try {
      await filesApi.update(editTarget!.id, { title: editForm.title.trim(), description: editForm.description.trim() || undefined, categoryId: editForm.categoryId });
      toast.success("File updated");
      setEditTarget(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await filesApi.delete(deleteTarget.id);
      toast.success("File deleted");
      setDeleteTarget(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally { setDeleting(false); }
  };

  return (
    <>
      <Topbar title="Manage Files" subtitle="Edit, delete, and preview uploaded files" />
      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search files…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <select value={query.categoryId ?? ""} onChange={(e) => updateQuery({ categoryId: e.target.value || undefined, page: 1 })}
            className="px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="" className="bg-slate-800">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
          </select>
          <Link href="/upload"><Button className="whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Upload File
          </Button></Link>
        </div>

        {!loading && result && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{result.total} file{result.total !== 1 ? "s" : ""} found</p>
            {(query.categoryId || search) && (
              <button onClick={() => { setSearch(""); updateQuery({ categoryId: undefined, search: undefined, page: 1 }); }} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Clear filters</button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <FileCardSkeleton key={i} />)}
          </div>
        ) : result?.data.length === 0 ? (
          <div className="text-center py-24 bg-white/3 border border-white/10 rounded-2xl border-dashed">
            <svg className="w-14 h-14 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-bold text-white">No files found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
            <Link href="/upload" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Upload First File
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {result?.data.map((file) => (
              <FileCard key={file.id} file={file} isAdmin onPreview={setPreview} onEdit={openEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}

        {result && result.totalPages > 1 && (
          <Pagination page={result.page} totalPages={result.totalPages} onPageChange={(p) => updateQuery({ page: p })} />
        )}
      </div>

      <FilePreviewModal file={preview} onClose={closePreviewModal} />

      <Modal open={!!editTarget} onClose={closeEditModal} title="Edit File">
        <div className="space-y-4">
          <Input label="Title *" value={editForm.title} onChange={(e) => { setEditForm((p) => ({ ...p, title: e.target.value })); setEditErrors((p) => ({ ...p, title: "" })); }} error={editErrors.title} placeholder="File title" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Description <span className="text-slate-500 font-normal">(optional)</span></label>
            <textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Category *</label>
            <select value={editForm.categoryId} onChange={(e) => { setEditForm((p) => ({ ...p, categoryId: e.target.value })); setEditErrors((p) => ({ ...p, categoryId: "" })); }}
              className={cn("w-full rounded-xl border px-4 py-2.5 text-sm text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500", editErrors.categoryId ? "border-red-500/50" : "border-white/10")}>
              <option value="" className="bg-slate-800">Select category…</option>
              {categories.map((c) => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
            </select>
            {editErrors.categoryId && <p className="text-xs text-red-400">{editErrors.categoryId}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={closeEditModal} className="flex-1" disabled={saving}>Cancel</Button>
            <Button onClick={handleEdit} loading={saving} className="flex-1">Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={closeDeleteModal} title="Delete File" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-300">Are you sure you want to delete <strong className="text-red-200">&quot;{deleteTarget?.title}&quot;</strong>? This cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={closeDeleteModal} className="flex-1" disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting} className="flex-1">Delete File</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}