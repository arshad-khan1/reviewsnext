"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Location {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  isActive: boolean;
  createdAt: string;
  qrCodeCount: number;
  stats?: {
    totalScans: number;
    totalReviews: number;
    conversionRate: number;
    avgRating: number;
  };
}

export interface LocationsResponse {
  data: Location[];
  unassignedQRCodes: number;
}

export interface LocationDetail extends Location {
  stats: {
    totalScans: number;
    totalReviews: number;
    conversionRate: number;
    avgRating: number;
    positiveCount: number;
    negativeCount: number;
    googleSubmissions: number;
  };
  charts: {
    scansOverTime: { date: string; scans: number }[];
    ratingDistribution: { rating: string; count: number }[];
  };
  qrCodes: {
    id: string;
    name: string;
    sourceTag: string;
    isActive: boolean;
    scans: number;
    conversions: number;
    conversionRate: number;
  }[];
}

export function useLocations(businessSlug: string, includeStats: boolean = false) {
  return useQuery<LocationsResponse>({
    queryKey: ["locations", businessSlug, { includeStats }],
    queryFn: async () => {
      const qs = includeStats ? "?includeStats=true" : "";
      const res = await apiClient.get(`/api/businesses/${businessSlug}/locations${qs}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("PLAN_REQUIRED");
        throw new Error("Failed to fetch locations");
      }
      return res.json();
    },
    enabled: !!businessSlug,
  });
}

export function useLocationDetail(businessSlug: string, locationSlug: string, period: string = "30d") {
  return useQuery<{ location: LocationDetail }>({
    queryKey: ["locations", businessSlug, locationSlug, period],
    queryFn: async () => {
      const res = await apiClient.get(`/api/businesses/${businessSlug}/locations/${locationSlug}?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch location details");
      return res.json();
    },
    enabled: !!businessSlug && !!locationSlug,
  });
}

export function useCreateLocation(businessSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; address?: string; city?: string }) => {
      const res = await apiClient.post(`/api/businesses/${businessSlug}/locations`, data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create location");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", businessSlug] });
      toast.success("Location created successfully");
    },
    onError: (error: Error) => {
      if (error.message !== "PLAN_REQUIRED") toast.error(error.message);
    },
  });
}

export function useUpdateLocation(businessSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, ...data }: { slug: string; name?: string; address?: string; city?: string; isActive?: boolean }) => {
      const res = await apiClient.patch(`/api/businesses/${businessSlug}/locations/${slug}`, data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update location");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["locations", businessSlug] });
      queryClient.invalidateQueries({ queryKey: ["locations", businessSlug, variables.slug] });
      toast.success("Location updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteLocation(businessSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const res = await apiClient.delete(`/api/businesses/${businessSlug}/locations/${slug}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete location");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", businessSlug] });
      queryClient.invalidateQueries({ queryKey: ["qr-codes", businessSlug] });
      toast.success("Location deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAssignQrToLocation(businessSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ qrId, locationId }: { qrId: string; locationId: string | null }) => {
      const res = await apiClient.patch(`/api/businesses/${businessSlug}/qr-codes/${qrId}/location`, { locationId });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to assign location");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes", businessSlug] });
      queryClient.invalidateQueries({ queryKey: ["locations", businessSlug] });
    },
  });
}
