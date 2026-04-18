"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface DashboardStats {
  totalScans: number;
  totalReviews: number;
  conversionRate: number;
  avgRating: number;
  googleSubmissions: number;
  negativeFeedbacks: number;
  lowRatings: number;
  highRatings: number;
}

export interface DashboardChartData {
  scansOverTime: { date: string; scans: number }[];
  ratingDistribution: { rating: string; count: number }[];
  deviceBreakdown: { name: string; value: number }[];
  browserBreakdown: { name: string; value: number }[];
}

export interface DashboardQRCode {
  id: string;
  name: string;
  sourceTag: string;
  scans: number;
  conversions: number;
  conversionRate: number;
}

export interface DashboardReview {
  id: string;
  type: "POSITIVE" | "NEGATIVE";
  rating: number;
  reviewText: string | null;
  whatWentWrong?: string | null;
  submittedToGoogle: boolean;
  submittedAt: string;
  formattedAt?: string;
}

export interface DashboardScan {
  review: any;
  id: string;
  scannedAt: string;
  formattedAt?: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  resultedInReview: boolean;
  rating: number | null;
  city: string | null;
  country: string | null;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardChartData;
  activeQRCodes: DashboardQRCode[];
  recentReviews: DashboardReview[];
  recentScans: DashboardScan[];
  aiCredits: {
    used: number;
    total: number;
  };
  plan: string;
}

export function useDashboardData(slug: string, period: string = "30d") {
  return useQuery({
    queryKey: ["dashboard", slug, period],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/businesses/${slug}/dashboard?period=${period}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return (await response.json()) as DashboardData;
    },
    enabled: !!slug,
  });
}
