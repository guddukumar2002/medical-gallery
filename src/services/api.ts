import type { Category, MedicalFile, PaginatedResponse } from "@/types";

// BASE is a relative path — only used in browser-side fetch calls, never with user-controlled input
const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// Categories
export const categoriesApi = {
  getAll: () => request<Category[]>(`${BASE}/categories`),
  create: (data: { name: string; description?: string }) =>
    request<Category>(`${BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name: string; description?: string }) =>
    request<Category>(`${BASE}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ success: boolean }>(`${BASE}/categories/${id}`, { method: "DELETE" }),
};

// Files
export interface FilesQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

export const filesApi = {
  getAll: (query: FilesQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.categoryId) params.set("categoryId", query.categoryId);
    if (query.search) params.set("search", query.search);
    return request<PaginatedResponse<MedicalFile>>(`${BASE}/files?${params}`);
  },
  getById: (id: string) => request<MedicalFile>(`${BASE}/files/${id}`),
  upload: (formData: FormData) =>
    request<MedicalFile>(`${BASE}/files`, { method: "POST", body: formData }),
  update: (id: string, data: { title: string; description?: string; categoryId: string }) =>
    request<MedicalFile>(`${BASE}/files/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ success: boolean }>(`${BASE}/files/${id}`, { method: "DELETE" }),
};

// Stats
export interface DashboardStats {
  totalFiles: number;
  totalCategories: number;
  totalSize: number;
  filesByType: { fileType: string; _count: number }[];
  recentFiles: MedicalFile[];
}

export const statsApi = {
  get: () => request<DashboardStats>(`${BASE}/stats`),
};
