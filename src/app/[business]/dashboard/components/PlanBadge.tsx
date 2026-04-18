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
    FREE: {
      color:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      icon: ShieldCheck,
      label: "Free Plan",
    },
    STARTER: {
      color:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
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

  // Robust normalization: take first word, remove non-alphanumeric, uppercase
  const firstWord = plan
    ?.split(/\s+/)[0]
    ?.replace(/[^a-zA-Z0-9]/g, "")
    ?.toUpperCase();
  const normalizedPlan = (firstWord as keyof typeof planConfig) || "FREE";
  const config = planConfig[normalizedPlan] || planConfig.FREE;

  const label = isTrial
    ? normalizedPlan === "FREE"
      ? "Free Trial"
      : `Trial - ${config.label.split(" ")[0]}`
    : config.label;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        className={cn(
          "px-2.5 py-1 rounded-sm font-bold text-[11px] flex gap-1.5 items-center border shadow-sm transition-all hover:scale-105 cursor-default",
          config.color,
        )}
        variant="outline"
      >
        <config.icon className="w-3.5 h-3.5" />
        {label}
      </Badge>
    </div>
  );
};

export default PlanBadge;
