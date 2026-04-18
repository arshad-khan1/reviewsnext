import { create } from "zustand";
import * as jose from "jose";
import { PlanType, SubscriptionStatus } from "@/types/prisma-enums";

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  planTier: PlanType;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
  businesses: {
    logoUrl: any;
    id: string;
    slug: string;
    name: string;
  }[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  initFromToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      isInitialized: true,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    });
  },
  initFromToken: (token: string | null) => {
    // Cleanup legacy persistence if present
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
    }

    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      return;
    }

    try {
      const payload = jose.decodeJwt(token) as any;

      // Ensure we have the minimum required fields
      if (!payload.sub) {
        throw new Error("Invalid token payload");
      }

      const user: User = {
        id: payload.sub,
        phone: payload.phone || "",
        name: payload.name || null,
        email: payload.email || null,
        avatarUrl: payload.avatarUrl || null,
        isAdmin: !!payload.isAdmin,
        planTier: payload.planTier || PlanType.FREE,
        subscriptionStatus:
          payload.subscriptionStatus || SubscriptionStatus.TRIALING,
        isVerified: true, // If they have a token, they passed OTP
        createdAt: payload.iat
          ? new Date(payload.iat * 1000).toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        businesses: payload.businesses || [],
      };

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("[AUTH_STORE] Failed to decode token", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },
}));
