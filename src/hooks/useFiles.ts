"use client";
import { useState, useEffect, useCallback } from "react";
import { filesApi, FilesQuery } from "@/services/api";
import type { MedicalFile, PaginatedResponse } from "@/types";

export function useFiles(initialQuery: FilesQuery = {}) {
  const [query, setQuery] = useState<FilesQuery>({ page: 1, limit: 12, ...initialQuery });
  const [result, setResult] = useState<PaginatedResponse<MedicalFile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.getAll(query);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateQuery = (updates: Partial<FilesQuery>) => {
    setQuery((prev) => ({
      ...prev,
      ...updates,
      // Reset to page 1 on any filter change unless page is explicitly set
      page: updates.page ?? (Object.keys(updates).some((k) => k !== "page") ? 1 : prev.page),
    }));
  };

  return { result, loading, error, query, updateQuery, refetch: fetch };
}
