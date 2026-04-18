"use client";

import { PLAN_DATA } from "@/config/plan-data";
import { PricingCard } from "./pricing-card";

interface PricingPlansProps {
  onSelect?: (planId: string) => void;
  currentPlanId?: string;
  isLoading?: boolean;
  showTitle?: boolean;
  allowDowngrade?: boolean;
}

export function PricingPlans({
  onSelect,
  currentPlanId,
  isLoading = false,
  showTitle = true,
  allowDowngrade = false,
}: PricingPlansProps) {
  return (
    <div className="w-full space-y-12">
      {showTitle && (
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Simple & Transparent Pricing
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Choose the perfect plan to boost your local reputation. No hidden
            fees, cancel anytime.
          </p>
        </div>
      )}

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {PLAN_DATA.map((plan) => {
          const currentPlan = PLAN_DATA.find((p) => p.id === currentPlanId);
          const isDowngrade =
            !allowDowngrade && currentPlan
              ? plan.rank < currentPlan.rank
              : false;

          return (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrent={currentPlanId === plan.id}
              isDowngrade={isDowngrade}
              onSelect={onSelect}
              isLoading={isLoading}
              anyPlanActive={!!currentPlanId}
            />
          );
        })}
      </div>
    </div>
  );
}
