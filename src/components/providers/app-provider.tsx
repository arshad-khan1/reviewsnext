"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "./query-provider";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { SubscriptionExpiryPopup } from "@/components/shared/SubscriptionExpiryPopup";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  // Use react-query to fetch the initial user session
  // This will naturally use the apiFetch interceptor which handles refresh
  const { data, isLoading } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await apiClient.get("/api/auth/me");
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    } else if (!isLoading) {
      setUser(null);
    }
  }, [data, isLoading, setUser]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  return <>{children}</>;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthInitializer>
        {children}
        <SubscriptionExpiryPopup />
        <Toaster richColors position="top-right" />
      </AuthInitializer>
    </ReactQueryProvider>
  );
}
