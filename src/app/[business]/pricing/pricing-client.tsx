"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Building2, LineChart, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBusiness } from "@/hooks/use-business";
import { PricingPlans } from "@/components/shared/pricing/pricing-plans";
import {
  CheckoutDialog,
  type CheckoutPlan,
} from "@/components/shared/pricing/checkout-dialog";
import { PlanType } from "@prisma/client";

interface DbPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  credits: number;
  planTier: string | null;
  billingInterval: string | null;
}

export default function PricingClient() {
  const params = useParams();
  const businessSlug = params.business as string;
  const { data: business } = useBusiness(businessSlug);

  const currentPlan = business?.subscription?.planTier || PlanType.FREE;

  // DB plans fetched at runtime for live prices
  const [dbPlans, setDbPlans] = useState<DbPlan[]>([]);
  const [checkoutPlan, setCheckoutPlan] = useState<CheckoutPlan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    fetch("/api/payments/plans")
      .then((r) => r.json())
      .then((d) => setDbPlans(d.plans || []))
      .catch(() => {});
  }, []);

  const handleSelectPlan = (planTier: string) => {
    // Find the matching DB plan by planTier
    const dbPlan = dbPlans.find((p) => p.planTier === planTier);
    if (!dbPlan || !business) return;

    setCheckoutPlan({
      id: dbPlan.id,
      name: dbPlan.name,
      price: dbPlan.price,
      currency: dbPlan.currency,
      credits: dbPlan.credits,
      planTier: dbPlan.planTier!,
      billingInterval: dbPlan.billingInterval,
      type: "SUBSCRIPTION",
    });
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href={`/${businessSlug}/dashboard`}>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground mb-8 -ml-2 group transition-all">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[10px] font-bold text-orange-600 uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" />
            Flexible Plans for Every Business
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight"
          >
            Choose the right plan for <br /> your{" "}
            <span className="text-orange-600">business growth.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 max-w-2xl mx-auto text-lg"
          >
            One-time yearly payment. No auto-renewal. No hidden fees.
          </motion.p>
        </div>

        <PricingPlans
          showTitle={false}
          currentPlanId={currentPlan}
          onSelect={handleSelectPlan}
        />

        {/* Custom Multi-location Section */}
        <div className="mt-20 max-w-4xl mx-auto rounded-3xl bg-slate-900 p-8 lg:p-12 text-white overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-white">
                Need a custom plan for your franchise?
              </h2>
              <p className="text-slate-400 font-medium">
                Manage 50+ locations, custom domains, and enterprise-grade
                reporting with a tailored solution.
              </p>
              <Button
                variant="outline"
                className="h-12 border-slate-700 text-white font-bold bg-transparent gap-2 px-8"
              >
                Contact Enterprise Support
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-orange-400 mb-3" />
                <h4 className="font-black text-lg text-white">Multi-unit</h4>
                <p className="text-xs text-slate-400 font-medium">
                  Centralized control for chains.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <LineChart className="w-6 h-6 text-emerald-400 mb-3" />
                <h4 className="font-black text-lg text-white">API First</h4>
                <p className="text-xs text-slate-400 font-medium">
                  Headless review management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        plan={checkoutPlan}
        businessId={business?.id || ""}
        businessSlug={businessSlug}
        businessName={business?.name}
      />
    </div>
  );
}
