"use client";

import { useQuery } from "@tanstack/react-query";
import { ReviewType } from "@prisma/client";
import { apiClient } from "@/lib/api-client";
import { DashboardReview } from "./use-dashboard-data";

export interface ReviewsResponse {
  data: DashboardReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface useReviewsOptions {
  page?: number;
  limit?: number;
  type?: ReviewType | null;
  rating?: number | null;
  search?: string;
  submittedToGoogle?: boolean | null;
  from?: Date | null;
  to?: Date | null;
}

export function useReviews(
  businessSlug: string,
  options: useReviewsOptions = {},
) {
  const {
    page = 1,
    limit = 8,
    type,
    rating,
    search,
    submittedToGoogle,
    from,
    to,
  } = options;

  return useQuery<ReviewsResponse>({
    queryKey: [
      "reviews",
      businessSlug,
      page,
      limit,
      type,
      rating,
      search,
      submittedToGoogle,
      from,
      to,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) params.append("type", type);
      if (rating) params.append("rating", rating.toString());
      if (search) params.append("search", search);
      if (submittedToGoogle !== null && submittedToGoogle !== undefined) {
        params.append("submittedToGoogle", submittedToGoogle.toString());
      }
      if (from) params.append("from", from.toISOString());
      if (to) params.append("to", to.toISOString());

      const res = await apiClient.get(
        `/api/businesses/${businessSlug}/reviews?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });
}
