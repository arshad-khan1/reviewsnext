"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export type CommentStyle =
  | "PROFESSIONAL_POLITE"
  | "FRIENDLY_CASUAL"
  | "CONCISE_DIRECT"
  | "ENTHUSIASTIC_WARM";

export interface QRCode {
  useDefaultConfig: boolean;
  id: string;
  name: string;
  sourceTag: string;
  isActive: boolean;
  googleMapsLink: string | null;
  aiGuidingPrompt: string | null;
  commentStyle: CommentStyle | null;
  acceptedStarsThreshold: number | null;
  locationId: string | null;
  scans: number;
  conversions: number;
  conversionRate: number;
  createdAt: string;
  reviewUrl: string;
}

export interface QRCodesResponse {
  data: QRCode[];
  summary: {
    totalQRCodes: number;
    totalScans: number;
    avgConversionRate: number;
  };
}

export function useQRCodes(businessSlug: string) {
  return useQuery<QRCodesResponse>({
    queryKey: ["qr-codes", businessSlug],
    queryFn: async () => {
      const res = await apiClient.get(
        `/api/businesses/${businessSlug}/qr-codes`,
      );
      if (!res.ok) throw new Error("Failed to fetch QR codes");
      return res.json();
    },
    enabled: !!businessSlug,
  });
}

export function useQRCodeDetail(businessSlug: string, qrId: string) {
  return useQuery<{ qrCode: QRCode & { stats: any } }>({
    queryKey: ["qr-codes", businessSlug, qrId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/api/businesses/${businessSlug}/qr-codes/${qrId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch QR code details");
      return res.json();
    },
    enabled: !!businessSlug && !!qrId,
  });
}

export function useCreateQRCode(businessSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      sourceTag?: string;
      googleMapsLink?: string | null;
      aiGuidingPrompt?: string | null;
      commentStyle?: CommentStyle | null;
      acceptedStarsThreshold?: number | null;
    }) => {
      const res = await apiClient.post(
        `/api/businesses/${businessSlug}/qr-codes`,
        data,
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create QR code");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes", businessSlug] });
      toast.success("QR Code generated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateQRCode(businessSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      isActive?: boolean;
      googleMapsLink?: string | null;
      aiGuidingPrompt?: string | null;
      commentStyle?: CommentStyle | null;
      acceptedStarsThreshold?: number | null;
    }) => {
      const res = await apiClient.patch(
        `/api/businesses/${businessSlug}/qr-codes/${id}`,
        data,
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update QR code");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes", businessSlug] });
      toast.success("QR Code settings updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteQRCode(businessSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(
        `/api/businesses/${businessSlug}/qr-codes/${id}`,
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete QR code");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes", businessSlug] });
      toast.success("QR Code deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
