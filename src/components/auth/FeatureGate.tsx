"use client";

import React from "react";
import { useAuthStore } from "@/store/auth-store";
import { PlanFeatures, hasFeature } from "@/config/plan-limits";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureGateProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  variant?: "hide" | "lock" | "blur";
  className?: string;
}

/**
 * A wrapper component that restricts visibility of features based on subscription tier.
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  variant = "lock",
  className,
}: FeatureGateProps) {
  const { user } = useAuthStore();
  const planTier = user?.planTier || "STARTER";
  
  const isAllowed = hasFeature(planTier, user?.subscriptionStatus, feature);

  if (isAllowed) {
    return <>{children}</>;
  }

  // Handle unauthorized state based on variant
  if (variant === "hide") {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (variant === "blur") {
    return (
      <div className={cn("relative group cursor-not-allowed", className)}>
        <div className="blur-[2px] opacity-40 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm border shadow-xl rounded-2xl p-4 flex flex-col items-center gap-2 max-w-[200px] text-center transform transition-transform group-hover:scale-105">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-xs font-bold text-slate-800">Premium Feature</p>
            <p className="text-[10px] text-slate-500 italic">Upgrade your plan to unlock this tool.</p>
          </div>
        </div>
      </div>
    );
  }

  // Default: Lock (Disabled feel)
  return (
    <div 
      className={cn(
        "relative cursor-not-allowed opacity-75 grayscale-[0.5]", 
        className
      )}
      title="This feature requires a higher plan tier."
    >
      <div className="pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute top-2 right-2">
        <div className="bg-white/90 border shadow-sm rounded-lg p-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-600" />
        </div>
      </div>
    </div>
  );
}
