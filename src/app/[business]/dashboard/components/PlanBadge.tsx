"use client";

import { Crown, Zap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: string;
  status?: string;
  showTag?: boolean;
  className?: string;
}

const PlanBadge = ({ plan, status, className }: PlanBadgeProps) => {
  const planConfig = {
    TRIAL: {
      color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
      icon: Zap,
      label: "Trial Mode",
    },
    STARTER: {
      color:
        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      icon: ShieldCheck,
      label: "Starter Plan",
    },
    GROWTH: {
      color:
        "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
      icon: Zap,
      label: "Growth Plan",
    },
    PRO: {
      color:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
      icon: Crown,
      label: "Pro Plan",
    },
  };

  const isTrial = status === "TRIALING";
  const normalizedPlan = isTrial ? "TRIAL" : (plan?.toUpperCase() as keyof typeof planConfig) || "STARTER";
  const config = planConfig[normalizedPlan as keyof typeof planConfig] || planConfig.STARTER;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        className={cn(
          "px-2.5 py-1 font-bold text-[11px] flex gap-1.5 items-center border shadow-sm transition-all hover:scale-105 cursor-default",
          config.color,
        )}
        variant="outline"
      >
        <config.icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    </div>
  );
};

export default PlanBadge;
