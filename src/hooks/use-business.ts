"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Business {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  industry: string;
  location: string;
  description: string | null;
  contactEmail: string | null;
  acceptedStarsThreshold: number;
  defaultGoogleMapsLink: string | null;
  defaultAiPrompt: string | null;
  defaultCommentStyle: string;
  createdAt: string;
  updatedAt: string;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
  aiCredits: {
    monthlyAllocation: number;
    monthlyUsed: number;
    topupAllocation: number;
    topupUsed: number;
  } | null;
}

export function useBusiness(slug: string) {
  return useQuery({
    queryKey: ["business", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/api/businesses/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch business");
      }
      const data = await response.json();
      return data.business as Business;
    },
    enabled: !!slug,
  });
}
