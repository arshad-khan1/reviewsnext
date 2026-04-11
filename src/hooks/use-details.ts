"use client";

import { useQuery } from "@tanstack/react-query";

export function useReviewDetails(businessSlug: string, reviewId: string | null) {
  return useQuery({
    queryKey: ["review", businessSlug, reviewId],
    queryFn: async () => {
      if (!reviewId) return null;
      const res = await fetch(`/api/businesses/${businessSlug}/reviews/${reviewId}`);
      if (!res.ok) throw new Error("Failed to fetch review details");
      const data = await res.json();
      return data.review;
    },
    enabled: !!reviewId,
  });
}

export function useScanDetails(businessSlug: string, scanId: string | null) {
  return useQuery({
    queryKey: ["scan", businessSlug, scanId],
    queryFn: async () => {
      if (!scanId) return null;
      const res = await fetch(`/api/businesses/${businessSlug}/scans/${scanId}`);
      if (!res.ok) throw new Error("Failed to fetch scan details");
      const data = await res.json();
      return data.scan;
    },
    enabled: !!scanId,
  });
}
