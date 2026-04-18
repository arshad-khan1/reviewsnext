"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { PlanData } from "@/config/plan-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  plan: PlanData;
  isCurrent?: boolean;
  isDowngrade?: boolean;
  onSelect?: (planId: string) => void;
  isLoading?: boolean;
  anyPlanActive?: boolean;
}

export function PricingCard({
  plan,
  isCurrent = false,
  isDowngrade = false,
  onSelect,
  isLoading = false,
  anyPlanActive = false,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative flex flex-col h-full overflow-hidden transition-all duration-300 border-2",
          isCurrent
            ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02] md:scale-105 z-20 ring-4 ring-emerald-500/10"
            : plan.popular
              ? "border-orange-500 shadow-xl scale-[1.01] md:scale-[1.02] z-10"
              : "border-border shadow-md hover:shadow-lg",
        )}
      >
        {isCurrent && (
          <div className="absolute top-0 left-0 w-full">
            <div className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-widest shadow-lg text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Your Current Plan
            </div>
          </div>
        )}

        {plan.popular && !isCurrent && (
          <div className="absolute top-0 right-0">
            <div className="bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-lg">
              Most Popular
            </div>
          </div>
        )}

        <CardHeader className={cn("pb-8", plan.bgColor, isCurrent && "pt-12")}>
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm border",
              plan.bgColor,
              plan.color,
              plan.borderColor,
            )}
          >
            <plan.icon className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-900">
            {plan.name}
          </CardTitle>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tight text-slate-900">
              ₹{plan.price.toLocaleString()}
            </span>
            <span className="text-slate-500 font-bold">/year</span>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed min-h-[40px]">
            {plan.description}
          </p>
        </CardHeader>

        <CardContent className="pt-8 grow">
          <div className="space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              What&apos;s Included:
            </p>
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
                    feature.included
                      ? "bg-emerald-50 border-emerald-100"
                      : "bg-slate-50 border-slate-100",
                  )}
                >
                  <Check
                    className={cn(
                      "w-3 h-3",
                      feature.included ? "text-emerald-600" : "text-slate-300",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-sm font-bold",
                    feature.included ? "text-slate-600" : "text-slate-400",
                    feature.highlight && "text-slate-900",
                  )}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-4 pb-8">
          <Button
            onClick={() => onSelect?.(plan.id)}
            disabled={isCurrent || isDowngrade || isLoading}
            className={cn(
              "w-full h-12 rounded-xl font-black transition-all",
              isCurrent
                ? "bg-emerald-500 text-white cursor-default hover:bg-emerald-500 shadow-lg shadow-emerald-200"
                : isDowngrade
                  ? "bg-slate-100 text-slate-400 cursor-default hover:bg-slate-100"
                  : plan.popular
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-200 translate-y-[-2px]"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200",
            )}
          >
            {isCurrent
              ? "Active Plan"
              : isDowngrade
                ? "Contact Support"
                : anyPlanActive
                  ? `Upgrade to ${plan.name}`
                  : plan.buttonText}
            {!(isCurrent || isDowngrade) && (
              <ArrowRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
