"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ScansResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface useScansOptions {
  page?: number;
  limit?: number;
  qrCodeId?: string;
  resultedInReview?: boolean | null;
  search?: string;
  from?: string;
  to?: string;
}

export function useScans(businessSlug: string, options: useScansOptions = {}) {
  const { page = 1, limit = 8, qrCodeId, resultedInReview, search, from, to } = options;

  return useQuery<ScansResponse>({
    queryKey: ["scans", businessSlug, page, limit, qrCodeId, resultedInReview, search, from, to],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (qrCodeId) params.append("qrCodeId", qrCodeId);
      if (resultedInReview !== null && resultedInReview !== undefined) {
        params.append("resultedInReview", resultedInReview.toString());
      }
      if (search) params.append("search", search);
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const res = await apiClient.get(`/api/businesses/${businessSlug}/scans?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch scans");
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });
}
