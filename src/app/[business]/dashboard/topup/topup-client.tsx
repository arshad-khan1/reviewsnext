"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Zap, CheckCircle2, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/hooks/use-business";
import { CheckoutDialog } from "@/components/shared/pricing/checkout-dialog";

interface TopupPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  metadata?: any;
}

const PACKAGE_METADATA: Record<string, any> = {
  BOOSTER: {
    color: "slate",
    icon: Zap,
    popular: false,
    savings: 0,
    features: [
      "200 One-time Credits",
      "Instant Activation",
      "Valid indefinitely",
    ],
  },
  ACCELERATOR: {
    color: "indigo",
    icon: Zap,
    popular: true,
    savings: 10,
    features: [
      "450 One-time Credits",
      "Instant Activation",
      "Valid indefinitely",
      "Priority Support",
    ],
  },
  MEGA: {
    color: "amber",
    icon: Zap,
    popular: false,
    savings: 20,
    features: [
      "1,000 One-time Credits",
      "Instant Activation",
      "Valid indefinitely",
      "Best Value Applied",
    ],
  },
};

export default function TopupClient() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.business as string;

  const { data: business, isLoading: isBusinessLoading } =
    useBusiness(businessSlug);

  const [plans, setPlans] = useState<TopupPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<TopupPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/payments/plans?type=topup");
        const data = await res.json();
        if (res.ok) {
          setPlans(data.plans);
        }
      } catch (error) {
        console.error("Failed to fetch topup plans:", error);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  if ((isBusinessLoading || isLoadingPlans) && !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/30">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/30 p-4">
        <h2 className="text-xl font-bold mb-4">Business Not Found</h2>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  const monthlyRemaining = Math.max(0, (business.aiCredits?.monthlyAllocation || 0) - (business.aiCredits?.monthlyUsed || 0));
  const topupRemaining = Math.max(0, (business.aiCredits?.topupAllocation || 0) - (business.aiCredits?.topupUsed || 0));

  return (
    <div className="min-h-screen bg-white pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <Link href={`/${businessSlug}/dashboard`}>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground mb-4 -ml-2 group transition-all">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <section className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="mb-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Recharge AI Credits
              </h1>
              <p className="text-muted-foreground font-medium mt-1">
                Top up your balance instantly and never miss a customer review.
              </p>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-4">
            {/* Monthly Credits Card */}
            <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1 min-w-[160px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                Monthly Balance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {monthlyRemaining}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Credits
                </span>
              </div>
            </div>

            {/* Topup Credits Card */}
            <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1 min-w-[160px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                One-time Credits
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {topupRemaining}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const meta =
              PACKAGE_METADATA[plan.id.split("_").pop()?.toUpperCase() || ""] ||
              PACKAGE_METADATA.BOOSTER;
            const Icon = meta.icon;

            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative flex flex-col bg-white rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden cursor-pointer",
                  selectedPlan?.id === plan.id
                    ? "border-slate-900 shadow-2xl shadow-slate-200 -translate-y-2"
                    : "border-slate-300 shadow-sm hover:border-slate-200 hover:-translate-y-1",
                )}
                onClick={() => setSelectedPlan(plan)}
              >
                {meta.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2.5 px-10 rounded-bl-3xl">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-10 space-y-8 flex-1">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110",
                      meta.color === "indigo"
                        ? "bg-indigo-50 text-indigo-600"
                        : meta.color === "amber"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-100 text-slate-600",
                    )}
                  >
                    <Icon className="w-8 h-8 fill-current" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-slate-900">
                        ₹{plan.price / 100}
                      </span>
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest ml-2">
                        One-time
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-slate-900 text-white border-none font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">
                      {plan.credits} Credits
                    </Badge>
                    {meta.savings > 0 && (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">
                        Save {meta.savings}%
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-5 pt-4">
                    {(meta.features as string[]).map((feature) => (
                      <div key={feature} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-600">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-10 pt-0 mt-auto">
                  {selectedPlan?.id === plan.id ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  ) : (
                    <div className="w-full h-16 rounded-2xl flex items-center justify-center font-black bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                      Select Package
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Checkout Dialog */}
        <CheckoutDialog
          open={isCheckoutOpen}
          onOpenChange={setIsCheckoutOpen}
          plan={
            selectedPlan
              ? {
                  id: selectedPlan.id,
                  name: selectedPlan.name,
                  price: selectedPlan.price,
                  currency: selectedPlan.currency,
                  credits: selectedPlan.credits,
                  planTier: "TOPUP", // Set as TOPUP for icon/color logic
                  type: "TOPUP",
                }
              : null
          }
          businessId={business.id}
          businessSlug={businessSlug}
          businessName={business.name}
        />
      </main>
    </div>
  );
}
