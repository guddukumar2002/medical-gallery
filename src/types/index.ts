export type Role = "ADMIN";
export type FileType = "IMAGE" | "PDF";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
  _count?: { medicalFiles: number };
}

export interface MedicalFile {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileKey: string;
  fileType: FileType;
  fileSize: number;
  categoryId: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// Extend next-auth session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}
