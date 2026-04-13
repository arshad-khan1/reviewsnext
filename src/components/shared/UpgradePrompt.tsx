"use client";

import React from "react";
import { Lock, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { PLAN_LIMITS } from "@/config/plan-limits";
import { PlanType } from "@prisma/client";

interface UpgradePromptProps {
  title?: string;
  description?: string;
  featureName?: string;
  requiredPlan?: PlanType;
}

/**
 * A conversion-focused prompt component to encourage users to upgrade.
 */
export function UpgradePrompt({
  title = "Unlock Premium Potential",
  description,
  featureName = "this feature",
  requiredPlan = PlanType.GROWTH,
}: UpgradePromptProps) {
  const { user } = useAuthStore();
  const currentPlan = user?.planTier || PlanType.FREE;
  const targetPlan = PLAN_LIMITS[requiredPlan];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-indigo-50/30 border border-indigo-100 rounded-3xl animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <Lock className="w-6 h-6" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {title}
      </h3>
      
      <p className="text-slate-600 max-w-sm mb-8">
        {description || `Access to ${featureName} is reserved for members on the ${targetPlan.displayName} plan. Scale your business and capture more reviews today.`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mb-8 text-left">
        <Benefit 
          icon={<Zap className="w-4 h-4 text-amber-500" />} 
          text={`${PLAN_LIMITS[requiredPlan].monthlyAiCredits.toLocaleString()} AI Credits / mo`} 
        />
        <Benefit 
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} 
          text={`${PLAN_LIMITS[requiredPlan].maxLocations} Locations Support`} 
        />
        <Benefit 
          icon={<Sparkles className="w-4 h-4 text-indigo-500" />} 
          text="Custom Branding Control" 
        />
        <Benefit 
          icon={<Lock className="w-4 h-4 text-slate-400" />} 
          text="Advanced Review Logic" 
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Button 
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12"
          onClick={() => {
            // This would normally open a billing modal or redirect to /settings/billing
            console.log("Redirecting to upgrade flow...");
          }}
        >
          View Plans & Upgrade
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 border-slate-200 text-slate-600 rounded-xl h-12"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
      <div className="shrink-0 mt-0.5">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  );
}
