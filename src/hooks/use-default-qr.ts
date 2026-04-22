"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useDefaultQR(businessSlug: string) {
  return useQuery<{ sourceTag: string }>({
    queryKey: ["default-qr", businessSlug],
    queryFn: async () => {
      const res = await apiClient.get(`/api/businesses/${businessSlug}/default-qr`);
      if (!res.ok) throw new Error("Failed to fetch default QR");
      return res.json();
    },
    enabled: !!businessSlug,
  });
}
