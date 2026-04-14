"use client";
import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { MedicalFile } from "@/types";
import { formatBytes } from "@/lib/utils";

interface FilePreviewModalProps {
  file: MedicalFile | null;
  onClose: () => void;
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [pdfLoading, setPdfLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  if (!file) return null;

  return (
    <Modal open={!!file} onClose={onClose} title={file.title} size="xl">
      <div className="space-y-5">

        {/* Preview */}
        {file.fileType === "IMAGE" ? (
          <div className="relative w-full h-56 sm:h-80 md:h-96 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            {imgError ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Image could not be loaded</p>
              </div>
            ) : (
              <Image
                src={file.fileUrl}
                alt={file.title}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 672px"
                onError={() => setImgError(true)}
              />
            )}
          </div>
        ) : (
          <div className="relative w-full h-64 sm:h-96 md:h-[500px] rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
            {pdfLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500 z-10 bg-slate-800">
                <svg className="w-10 h-10 animate-pulse text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                </svg>
                <p className="text-sm font-medium text-slate-400">Loading PDF…</p>
              </div>
            )}
            <iframe
              src={file.fileUrl}
              className="w-full h-full border-0"
              title={file.title}
              onLoad={() => setPdfLoading(false)}
            />
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 text-sm">
          {file.description && (
            <div className="col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-3">
              <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-1">Description</p>
              <p className="text-slate-300">{file.description}</p>
            </div>
          )}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-1">Category</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/20">
              {file.category.name}
            </span>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-1">File Size</p>
            <p className="text-white font-semibold">{formatBytes(file.fileSize)}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-1">Type</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              file.fileType === "IMAGE"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                : "bg-red-500/20 text-red-300 border border-red-500/20"
            }`}>
              {file.fileType}
            </span>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-1">Uploaded</p>
            <p className="text-white">{new Date(file.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-700">
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in Browser
          </a>
          <a
            href={file.fileUrl}
            download
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-600 transition-colors border border-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          <button
            onClick={onClose}
            className="px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
