"use client";
import { useEffect, useState, useCallback } from "react"; // Add useCallback
import toast from "react-hot-toast";
import Topbar from "@/components/admin/Topbar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { categoriesApi } from "@/services/api";
import type { Category } from "@/types";

const GRADIENTS = [
  "from-blue-600 to-blue-800", "from-violet-600 to-purple-800",
  "from-emerald-600 to-teal-800", "from-orange-600 to-red-700",
  "from-pink-600 to-rose-800", "from-cyan-600 to-blue-700",
  "from-indigo-600 to-violet-800", "from-amber-600 to-orange-700",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setCategories(await categoriesApi.getAll()); }
    catch { toast.error("Failed to load categories"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Memoized close handlers
  const closeModal = useCallback(() => setModalOpen(false), []);
  const closeDeleteModal = useCallback(() => setDeleteTarget(null), []);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "" }); setFormErrors({}); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, description: cat.description ?? "" }); setFormErrors({}); setModalOpen(true); };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      if (editing) { await categoriesApi.update(editing.id, { name: form.name.trim(), description: form.description.trim() || undefined }); toast.success("Category updated"); }
      else { await categoriesApi.create({ name: form.name.trim(), description: form.description.trim() || undefined }); toast.success("Category created"); }
      setModalOpen(false); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await categoriesApi.delete(deleteTarget.id); toast.success("Category deleted"); setDeleteTarget(null); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to delete"); }
    finally { setDeleting(false); }
  };

  const totalFiles = categories.reduce((sum, c) => sum + (c._count?.medicalFiles ?? 0), 0);

  return (
    <>
      <Topbar title="Categories" subtitle="Organize your medical files by category" />
      <div className="flex-1 overflow-auto p-6 mt-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">{loading ? "Loading…" : `${categories.length} categories · ${totalFiles} total files`}</p>
          <Button onClick={openCreate} size="sm" className="text-xs sm:text-sm sm:px-4 sm:py-2">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Category
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24 bg-white/3 border border-white/10 rounded-2xl border-dashed">
            <svg className="w-14 h-14 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="font-bold text-white">No categories yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first category to start organizing files</p>
            <button onClick={openCreate} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} shadow-lg`}>
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white truncate">{cat.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 font-mono">/{cat.slug}</p>
                      {cat.description && <p className="text-sm text-slate-400 mt-1.5 line-clamp-2">{cat.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${GRADIENTS[idx % GRADIENTS.length]} shadow-sm`}>
                    {cat._count?.medicalFiles ?? 0} file{(cat._count?.medicalFiles ?? 0) !== 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-2 sm:hidden">
                    <button onClick={() => openEdit(cat)} className="text-xs text-blue-400 font-medium">Edit</button>
                    <button onClick={() => setDeleteTarget(cat)} className="text-xs text-red-400 font-medium">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Category" : "New Category"}>
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setFormErrors((p) => ({ ...p, name: "" })); }} placeholder="e.g. X-Ray, MRI, Blood Report" error={formErrors.name} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Description <span className="text-slate-500 font-normal">(optional)</span></label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description…" rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={closeModal} className="flex-1" disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? "Save Changes" : "Create Category"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={closeDeleteModal} title="Delete Category" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm text-red-300 font-medium">Delete &quot;{deleteTarget?.name}&quot;?</p>
              <p className="text-xs text-red-400/70 mt-1">All <strong>{deleteTarget?._count?.medicalFiles ?? 0} files</strong> will also be deleted. This cannot be undone.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={closeDeleteModal} className="flex-1" disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}