"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import Topbar from "@/components/admin/Topbar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { categoriesApi, filesApi } from "@/services/api";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, formatBytes, cn } from "@/lib/utils";
import type { Category } from "@/types";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { categoriesApi.getAll().then(setCategories).catch(() => toast.error("Failed to load categories")); }, []);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const handleFile = (f: File) => {
    if (!ALLOWED_MIME_TYPES.includes(f.type)) { toast.error("Only images and PDFs allowed"); return; }
    if (f.size > MAX_FILE_SIZE) { toast.error("File must be under 10MB"); return; }
    setFile(f);
    setErrors((p) => ({ ...p, file: "" }));
    if (f.type.startsWith("image/")) { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(URL.createObjectURL(f)); }
    else setPreviewUrl(null);
    if (!form.title) setForm((p) => ({ ...p, title: f.name.replace(/\.[^.]+$/, "") }));
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  const removeFile = (e: React.MouseEvent) => { e.stopPropagation(); setFile(null); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } if (fileInputRef.current) fileInputRef.current.value = ""; };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.categoryId) errs.categoryId = "Please select a category";
    if (!file) errs.file = "Please select a file";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true); setProgress(0);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 8, 88)), 250);
    try {
      const fd = new FormData();
      fd.append("file", file!); fd.append("title", form.title.trim());
      fd.append("description", form.description.trim()); fd.append("categoryId", form.categoryId);
      await filesApi.upload(fd);
      clearInterval(interval); setProgress(100);
      toast.success("File uploaded successfully!");
      setTimeout(() => router.push("/files"), 600);
    } catch (err) {
      clearInterval(interval); setProgress(0);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <>
      <Topbar title="Upload File" subtitle="Add a new medical file to the gallery" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Drop Zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer",
                dragging ? "border-blue-500 bg-blue-500/10 scale-[1.01]" : "border-white/10 hover:border-blue-500/50 hover:bg-white/5",
                file && !errors.file ? "border-emerald-500/50 bg-emerald-500/5" : "",
                errors.file ? "border-red-500/50 bg-red-500/5" : ""
              )}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept={ALLOWED_MIME_TYPES.join(",")} className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

              {file ? (
                <div className="p-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex-shrink-0 flex items-center justify-center">
                    {previewUrl ? <Image src={previewUrl} alt="preview" width={64} height={64} className="object-cover w-full h-full" /> : (
                      <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" /></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate text-sm">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatBytes(file.size)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-xs text-emerald-400 font-medium">Ready to upload</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button type="button" onClick={removeFile} className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 hover:bg-red-500/10 rounded-lg transition-colors">Remove</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 hover:bg-blue-500/10 rounded-lg transition-colors">Change</button>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center space-y-3">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-300">Drop file here or <span className="text-blue-400">browse</span></p>
                    <p className="text-sm text-slate-600 mt-1">JPEG, PNG, WebP, GIF, PDF — max 10MB</p>
                  </div>
                </div>
              )}
            </div>
            {errors.file && <p className="text-xs text-red-400 -mt-2">{errors.file}</p>}

            <Input label="Title *" value={form.title} onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setErrors((p) => ({ ...p, title: "" })); }} placeholder="e.g. Chest X-Ray — Patient Report" error={errors.title} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Description <span className="text-slate-500 font-normal">(optional)</span></label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Additional notes…" rows={3} maxLength={1000}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <p className="text-xs text-slate-600 text-right">{form.description.length}/1000</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Category *</label>
              <select value={form.categoryId} onChange={(e) => { setForm((p) => ({ ...p, categoryId: e.target.value })); setErrors((p) => ({ ...p, categoryId: "" })); }}
                className={cn("w-full rounded-xl border px-4 py-2.5 text-sm text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500", errors.categoryId ? "border-red-500/50" : "border-white/10")}>
                <option value="" className="bg-[#1e293b]">Select a category…</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id} className="bg-[#1e293b]">{cat.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-red-400">{errors.categoryId}</p>}
              {categories.length === 0 && <p className="text-xs text-amber-400">No categories found. <a href="/categories" className="underline">Create one first.</a></p>}
            </div>

            {uploading && (
              <div className="space-y-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <div className="flex justify-between text-xs text-blue-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Uploading…
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1" disabled={uploading}>Cancel</Button>
              <Button type="submit" loading={uploading} className="flex-1" size="lg">{uploading ? "Uploading…" : "Upload File"}</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
