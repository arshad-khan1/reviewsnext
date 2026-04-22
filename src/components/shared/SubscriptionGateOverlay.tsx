"use client";

import React from "react";
import { Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionGateOverlayProps {
  title: string;
  description: React.ReactNode;
  planDisplayName: string;
  onUpgrade: () => void;
  onClose: () => void;
  iconType?: "limit" | "lock";
  upgradeText?: string;
}

export function SubscriptionGateOverlay({
  title,
  description,
  planDisplayName,
  onUpgrade,
  onClose,
  iconType = "limit",
  upgradeText = "Upgrade Plan",
}: SubscriptionGateOverlayProps) {
  const Icon = iconType === "limit" ? Zap : Lock;

  return (
    <div className="absolute inset-0 z-50 bg-white/98 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100/50">
        <Icon className="w-6 h-6 text-indigo-600 animate-pulse" />
      </div>

      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
        {title}
      </h3>

      <div className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed font-medium">
        {description}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-[240px]">
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          onClick={onUpgrade}
        >
          {upgradeText}
        </Button>
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-slate-600 h-12 font-bold rounded-2xl"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}

export function PlanBadge({ name }: { name: string }) {
  return (
    <span className="text-indigo-700 font-bold uppercase tracking-wider text-[10px] bg-indigo-100/50 px-2.5 py-1 rounded-md border border-indigo-200 inline-flex items-center justify-center min-w-[60px]">
      {name}
    </span>
  );
}
