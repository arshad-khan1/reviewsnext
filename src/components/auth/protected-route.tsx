"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Ensures user is authenticated and has access to the current business context. 
 * Redirects to /login if not authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isInitialized, initFromToken } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    if (!isInitialized) {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      initFromToken(token);
    }
  }, [isInitialized, initFromToken]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        // Avoid redirecting if already on login page
        if (pathname !== "/login" && pathname !== "/admin") {
          router.push("/login?redirect=" + encodeURIComponent(pathname));
        }
      } else if (user) {
        // Business isolation check
        const businessSlug = params?.business as string;
        
        // If we are in a business context /[business]/...
        if (businessSlug && !user.isAdmin) {
          const hasAccess = user.businesses?.some(b => b.slug === businessSlug);
          
          if (!hasAccess) {
            console.warn(`Access denied for business: ${businessSlug}`);
            // Redirect to their first available business or onboarding
            if (user.businesses && user.businesses.length > 0) {
              router.push(`/${user.businesses[0].slug}/dashboard`);
            } else {
              router.push("/onboard");
            }
          }
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, params]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

/**
 * Ensures user is authenticated AND an admin.
 * Redirects to /login if not.
 */
export function AdminRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isInitialized, initFromToken } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized) {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      initFromToken(token);
    }
  }, [isInitialized, initFromToken]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=" + encodeURIComponent(pathname));
      } else if (!user?.isAdmin) {
        // Logged in but not admin
        if (user?.businesses && user.businesses.length > 0) {
          router.push(`/${user.businesses[0].slug}/dashboard`);
        } else {
          router.push("/onboard");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) return null;

  return <>{children}</>;
}
