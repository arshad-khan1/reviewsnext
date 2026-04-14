"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

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
    planId: string;
    price: number;
    currency: string;
    credits: number;
    planTier: string;
    type: "SUBSCRIPTION" | "TOPUP";
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

export function useUpdateBusiness(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Business>) => {
      const res = await apiClient.patch(`/api/businesses/${slug}`, data);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update business settings");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", slug] });
      toast.success("Business settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
