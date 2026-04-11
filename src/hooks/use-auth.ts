"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, setAccessToken } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

/**
 * Hook for Normal User Login (OTP)
 */
export function useLoginMutation() {
  const setUser = useAuthStore((state) => state.setUser);
  
  return useMutation({
    mutationFn: async (data: { phone: string; otp: string; deviceLabel?: string }) => {
      const res = await apiClient.post("/api/auth/verify-otp", data);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to verify OTP");
      return json;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
      toast.success("Successfully signed in!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook for Admin Login (Email/Pass)
 */
export function useAdminLoginMutation() {
  const setUser = useAuthStore((state) => state.setUser);
  
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiClient.post("/api/admin/login", data);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Admin login failed");
      return json;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
      toast.success("Admin access granted!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook for Logout
 */
export function useLogoutMutation() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/api/auth/logout");
    },
    onSettled: () => {
      setAccessToken(null);
      logout();
      queryClient.clear();
      toast.info("Logged out successfully");
    },
  });
}
