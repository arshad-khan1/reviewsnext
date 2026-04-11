"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Zap, CheckCircle2, ArrowRight, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { mockBusinesses } from "@/data/mockBusinesses";
import { cn } from "@/lib/utils";

const PACKAGES = [
  {
    id: "booster",
    name: "Small Booster",
    credits: 200,
    price: 500,
    savings: 0,
    features: [
      "200 One-time Credits",
      "Instant Activation",
      "Valid indefinitely",
    ],
    color: "slate",
  },
  {
    id: "accelerator",
    name: "Growth Booster",
    credits: 450,
    price: 1000,
    savings: 10,
    popular: true,
    features: [
      "450 One-time Credits",
      "Instant Activation",
      "Valid indefinitely",
      "Priority Support",
    ],
    color: "indigo",
  },
  {
    id: "mega",
    name: "Power Bundle",
    credits: 1000,
    price: 2000,
    savings: 20,
    features: [
      "1,000 One-time Credits",
      "Instant Activation",
      "Valid indefinitely",
      "Best Value Applied",
    ],
    color: "amber",
  },
];

export default function TopupPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.business as string;
  const business = mockBusinesses.find((b) => b.slug === businessSlug);

  const [selectedPackage, setSelectedPackage] = useState<
    (typeof PACKAGES)[0] | null
  >(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!business) return null;

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setIsCheckoutOpen(false);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden text-center p-10 space-y-8 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto transition-transform hover:scale-105 duration-300">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Top-up Successful!
            </h1>
            <p className="text-muted-foreground font-medium px-4 leading-relaxed">
              We&apos;ve added{" "}
              <span className="text-indigo-600 font-black">
                {selectedPackage?.credits} credits
              </span>{" "}
              to your account. You&apos;re all set!
            </p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between text-sm mx-2">
            <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">
              Reference ID
            </span>
            <span className="font-mono text-slate-900 font-black">
              #TOP-{(Math.random() * 10000).toFixed(0)}
            </span>
          </div>
          <Button
            onClick={() => router.push(`/${businessSlug}/dashboard`)}
            className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-2xl shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Recharge AI Credits
            </h1>
            <p className="text-slate-500 font-medium">
              Top up your balance instantly and never miss a review.
            </p>
          </div>

          <div className="flex items-center gap-5 bg-slate-50 p-4 pl-6 rounded-3xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Available Balance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {business.usage.monthlyAllocation + business.usage.topupAllocation - business.usage.monthlyUsed - business.usage.topupUsed}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Credits
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-white border border-slate-200 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Zap className="w-7 h-7 fill-current" />
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "group relative flex flex-col bg-white rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden cursor-pointer",
                selectedPackage?.id === pkg.id
                  ? "border-slate-900 shadow-2xl shadow-slate-200 -translate-y-2"
                  : "border-slate-300 shadow-sm hover:border-slate-200 hover:-translate-y-1",
              )}
              onClick={() => setSelectedPackage(pkg)}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2.5 px-10 rounded-bl-3xl">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-10 space-y-8 flex-1">
                <div
                  className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110",
                    pkg.color === "indigo"
                      ? "bg-indigo-50 text-indigo-600"
                      : pkg.color === "amber"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-600",
                  )}
                >
                  <Zap className="w-8 h-8 fill-current" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900">
                      ₹{pkg.price}
                    </span>
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest ml-2">
                      One-time
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-slate-900 text-white border-none font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">
                    {pkg.credits} Credits
                  </Badge>
                  {pkg.savings > 0 && (
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">
                      Save {pkg.savings}%
                    </Badge>
                  )}
                </div>

                <div className="space-y-5 pt-4">
                  {pkg.features.map((feature) => (
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
                {selectedPackage?.id === pkg.id ? (
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
          ))}
        </div>

        {/* Checkout Modal */}
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="min-w-xl p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 pointer-events-none" />
              <DialogClose asChild>
                <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-20 group">
                  <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </button>
              </DialogClose>
              <DialogHeader className="relative z-10 text-left">
                <DialogTitle className="text-3xl font-black tracking-tight text-white mb-2">
                  Checkout Summary
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                  Complete your purchase via secure payment gateway.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-8 bg-white max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Selected Plan Details */}
              {selectedPackage && (
                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <div className="flex items-center gap-6">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm",
                        selectedPackage.color === "indigo"
                          ? "bg-indigo-600 text-white"
                          : selectedPackage.color === "amber"
                            ? "bg-amber-500 text-white"
                            : "bg-slate-900 text-white",
                      )}
                    >
                      <Zap className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xl tracking-tight">
                        {selectedPackage.name}
                      </h4>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                        {selectedPackage.credits} AI Credits
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{selectedPackage.price}
                    </span>
                  </div>
                </div>
              )}

              {/* Secure Info */}
              <div className="flex items-start gap-4 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-sm">
                    Secure Payment Redirection
                  </p>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    You will be redirected to our secure payment partner
                    (Razorpay) to complete the transaction.
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    Plan Amount
                  </span>
                  <span className="text-slate-900 font-black">
                    ₹{selectedPackage?.price}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    Processing Fee
                  </span>
                  <span className="text-slate-900 font-black">₹0</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    GST (0%)
                  </span>
                  <span className="text-slate-900 font-black">₹0</span>
                </div>
                <div className="h-px bg-slate-100 my-4" />
                <div className="flex justify-between items-center px-2">
                  <span className="text-slate-900 font-black uppercase tracking-widest text-xs font-bold">
                    Total Payable
                  </span>
                  <span className="text-4xl font-black text-slate-900">
                    ₹{selectedPackage?.price}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-white font-black text-xl rounded-[2rem] transition-all shadow-2xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Pay via Razorpay
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                  Trusted by 10,000+ Businesses
                  <br />
                  Encrypted & Secure Transaction
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
