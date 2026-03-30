"use client";
import Image from "next/image";
import { MedicalFile } from "@/types";
import { formatBytes } from "@/lib/utils";

interface FileCardProps {
  file: MedicalFile;
  onPreview?: (file: MedicalFile) => void;
  onEdit?: (file: MedicalFile) => void;
  onDelete?: (file: MedicalFile) => void;
  isAdmin?: boolean;
}

export default function FileCard({ file, onPreview, onEdit, onDelete, isAdmin }: FileCardProps) {
  if (!isAdmin) {
    // ── Gallery card — premium glass style ──
    return (
      <div
        className="group relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer hover:border-slate-600"
        onClick={() => onPreview?.(file)}
      >
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          {file.fileType === "IMAGE" ? (
            <>
              <Image
                src={file.fileUrl}
                alt={file.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-9 h-9 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">PDF Document</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-gray-800 text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </div>
          </div>

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm ${
              file.fileType === "IMAGE"
                ? "bg-blue-600/90 text-white"
                : "bg-red-600/90 text-white"
            }`}>
              {file.fileType}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-white text-sm truncate mb-1 group-hover:text-blue-400 transition-colors" title={file.title}>
            {file.title}
          </h3>
          {file.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{file.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 bg-slate-700 border border-slate-600 text-blue-400 rounded-full text-xs font-semibold">
              {file.category.name}
            </span>
            <span className="text-xs text-slate-500 font-medium">{formatBytes(file.fileSize)}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {new Date(file.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>
    );
  }

  // ── Admin card — clean white ──
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
      <div className="relative h-48 bg-gray-50 cursor-pointer overflow-hidden flex-shrink-0" onClick={() => onPreview?.(file)}>
        {file.fileType === "IMAGE" ? (
          <Image src={file.fileUrl} alt={file.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-red-600 uppercase tracking-widest">PDF</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${file.fileType === "IMAGE" ? "bg-blue-600/80 text-white" : "bg-red-600/80 text-white"}`}>
            {file.fileType}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm truncate cursor-pointer hover:text-blue-600 transition-colors mb-1" onClick={() => onPreview?.(file)} title={file.title}>
          {file.title}
        </h3>
        {file.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2 flex-1">{file.description}</p>}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{file.category.name}</span>
          <span className="text-xs text-gray-400">{formatBytes(file.fileSize)}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {new Date(file.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => onEdit?.(file)} className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium py-1.5 hover:bg-blue-50 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </button>
          <button onClick={() => onDelete?.(file)} className="flex-1 flex items-center justify-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium py-1.5 hover:bg-red-50 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
