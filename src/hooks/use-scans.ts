"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DashboardScan } from "./use-dashboard-data";

export interface ScansResponse {
  data: DashboardScan[];
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
  from?: Date | null;
  to?: Date | null;
}

export function useScans(businessSlug: string, options: useScansOptions = {}) {
  const {
    page = 1,
    limit = 8,
    qrCodeId,
    resultedInReview,
    search,
    from,
    to,
  } = options;

  return useQuery<ScansResponse>({
    queryKey: [
      "scans",
      businessSlug,
      page,
      limit,
      qrCodeId,
      resultedInReview,
      search,
      from,
      to,
    ],
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
      if (from) params.append("from", from.toISOString());
      if (to) params.append("to", to.toISOString());

      const res = await apiClient.get(
        `/api/businesses/${businessSlug}/scans?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch scans");
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });
}
