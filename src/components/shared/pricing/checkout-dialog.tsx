import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Zap,
  Sparkles,
  ShieldCheck,
  Loader2,
  ArrowRight,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadRazorpayScript } from "@/lib/razorpay-client";

export interface CheckoutPlan {
  id: string; // DB Plan CUID
  name: string;
  price: number; // in paise
  currency: string;
  credits: number;
  planTier: string;
  billingInterval?: string | null;
  type: "SUBSCRIPTION" | "TOPUP";
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: CheckoutPlan | null;
  businessId: string;
  businessSlug: string;
  businessName?: string;
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  STARTER: Sparkles,
  GROWTH: Zap,
  PRO: Crown,
  TOPUP: Zap,
};

const PLAN_COLORS: Record<string, string> = {
  STARTER: "text-blue-600",
  GROWTH: "text-indigo-600",
  PRO: "text-amber-600",
  TOPUP: "text-slate-900",
};

const PLAN_BG: Record<string, string> = {
  STARTER: "bg-blue-50 border-blue-200",
  GROWTH: "bg-indigo-50 border-indigo-200",
  PRO: "bg-amber-50 border-amber-200",
  TOPUP: "bg-slate-50 border-slate-200",
};

export function CheckoutDialog({
  open,
  onOpenChange,
  plan,
  businessId,
  businessSlug,
  businessName,
}: CheckoutDialogProps) {
  const router = useRouter();
  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || ""
      : "";

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimate, setEstimate] = useState<{
    upgradeCredit: number;
    originalPrice: number;
  } | null>(null);
  const isSuccessRef = useRef(false);

  useEffect(() => {
    isSuccessRef.current = isSuccess;
  }, [isSuccess]);

  // Intercept open change to block closing during critical states
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      // If we are currently loading or successfully completed, don't allow manual/auto-close
      if ((isLoading || isSuccess) && !newOpen) {
        return;
      }
      onOpenChange(newOpen);
    },
    [isLoading, isSuccess, onOpenChange],
  );

  // Trigger automatic redirect after 4 seconds of success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        // Here we finally allow the dialog to close as we navigate away
        onOpenChange(false);
        router.push(`/${businessSlug}/dashboard`);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, businessSlug, router, onOpenChange]);

  // Trigger confetti on success
  useEffect(() => {
    if (isSuccess) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.7, 0.9) },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.7, 0.9) },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isSuccess]);

  // Adjust state during render when 'open' prop changes (avoids cascading renders)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIsSuccess(false);
      setIsLoading(false);
      setEstimate(null); // Clear previous estimates
    }
  }

  // Fetch prorated estimate when dialog opens
  useEffect(() => {
    if (open && plan && businessId) {
      setIsEstimating(true);
      apiClient
        .get(
          `/api/payments/estimate?planId=${plan.id}&businessId=${businessId}`,
        )
        .then((res) => res.json())
        .then((data) => {
          if (data.upgradeCredit !== undefined) {
            setEstimate({
              upgradeCredit: data.upgradeCredit,
              originalPrice: data.originalPrice,
            });
          }
        })
        .catch((err) => console.error("[ESTIMATE_FETCH_ERROR]", err))
        .finally(() => setIsEstimating(false));
    }
  }, [open, plan, businessId]);

  const handlePay = useCallback(async () => {
    if (!plan) return;
    setIsLoading(true);

    try {
      // 1. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Check your connection.");
        setIsLoading(false);
        return;
      }

      // 2. Create order on our backend
      const orderRes = await apiClient.post("/api/payments/create-order", {
        planId: plan.id,
        businessId,
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.message || "Failed to create order");
        setIsLoading(false);
        return;
      }

      // 3. Open Razorpay modal
      const rzpOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ReviewFunnel",
        description:
          plan.type === "TOPUP"
            ? `${orderData.planName} – AI Credit Topup`
            : `${orderData.planName} – 1 Year Access`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.prefill?.name || "",
          email: orderData.prefill?.email || "",
          contact: orderData.prefill?.contact || "",
        },
        notes: {
          businessName: businessName || orderData.prefill?.businessName || "",
          planTier: orderData.planTier,
        },
        theme: { color: "#f97316" },
        modal: {
          ondismiss: () => {
            // Only set loading false if we haven't already succeeded
            setIsLoading((prev) => (isSuccessRef.current ? prev : false));
            if (!isSuccessRef.current) {
              toast.info("Payment window closed.");
              // Ping cancel endpoint to update status in DB
              apiClient
                .post("/api/payments/cancel", {
                  paymentRecordId: orderData.paymentRecordId,
                })
                .catch((err) => console.error("[CANCEL_ERROR]", err));
            }
          },
        },
        // Handle payment failures (declined, rejected, etc.)
        onpaymentfailed: (response: any) => {
          setIsLoading(false);
          toast.error(
            `Payment failed: ${response.error.description || "The transaction was declined."}`,
          );
          console.error("Razorpay Payment Failed:", response.error);
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify payment on our backend
          try {
            const verifyRes = await apiClient.post("/api/payments/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentRecordId: orderData.paymentRecordId,
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              toast.error("Payment verification failed. Contact support.");
              setIsLoading(false);
              return;
            }

            // 5. Success!
            setIsSuccess(true);
            setIsLoading(false);
            toast.success(
              plan.type === "TOPUP"
                ? `🎉 Added ${(plan.credits ?? 0).toLocaleString()} credits!`
                : `🎉 You're now on the ${plan.name}!`,
            );
          } catch {
            toast.error("Verification request failed. Contact support.");
            setIsLoading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.open();
    } catch (error) {
      console.error("[CHECKOUT_ERROR]", error);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }, [plan, businessId, businessName]);

  if (!plan) return null;

  const Icon =
    plan.type === "TOPUP" ? Zap : PLAN_ICONS[plan.planTier] || ShieldCheck;
  const colorClass =
    plan.type === "TOPUP"
      ? "text-slate-900"
      : PLAN_COLORS[plan.planTier] || "text-slate-600";
  const bgClass =
    plan.type === "TOPUP"
      ? "bg-slate-50 border-slate-200"
      : PLAN_BG[plan.planTier] || "bg-slate-50 border-slate-200";
  const priceInRupees = plan.price / 100;

  return (
    <Dialog
      open={open || isSuccess}
      onOpenChange={handleOpenChange}
      modal={false}
    >
      <AnimatePresence>
        {(open || isSuccess) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40"
            onClick={() => handleOpenChange(false)}
          />
        )}
      </AnimatePresence>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden gap-0 bg-white border border-slate-100 rounded-[2.5rem] shadow-3xl z-50"
        onPointerDownOutside={(e) => {
          if (isLoading || isSuccess) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isLoading || isSuccess) e.preventDefault();
        }}
      >
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center justify-center p-10 py-14 gap-8 text-center bg-white relative rounded-[2.5rem]"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="w-28 h-28 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner relative z-10"
              >
                <PartyPopper className="w-14 h-14" />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-md border-4 border-white"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                {plan.type === "TOPUP"
                  ? "Recharge Successful!"
                  : "You're All Set!"}
              </h2>
              <p className="text-slate-500 font-medium max-w-[300px] leading-relaxed mx-auto text-sm">
                {plan.type === "TOPUP"
                  ? `We've successfully added ${plan.credits.toLocaleString()} credits to your account.`
                  : `Welcome to the ${plan.name} family! Your premium features are now active.`}
              </p>
            </div>

            <div className="w-full space-y-4 pt-2">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/${businessSlug}/dashboard`);
                }}
                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-[0.98]"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Redirecting in a few seconds...
              </p>
            </div>
          </motion.div>
        ) : (
          <div key="checkout" className="bg-white">
            {/* Header */}
            <div
              className={cn(
                "px-6 pt-8 pb-6 border-b border-slate-100",
                bgClass,
              )}
            >
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm",
                      bgClass,
                      colorClass,
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                      {plan.name}
                    </DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                      {plan.type === "TOPUP"
                        ? "One-time Credit Topup"
                        : "1-Year Access · No auto-renewal"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-6 bg-white">
              {/* Price summary */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-4">
                {isEstimating ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                ) : estimate && estimate.upgradeCredit > 0 ? (
                  <>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        New Plan Price
                      </span>
                      <span className="font-black text-slate-900">
                        ₹
                        {(estimate.originalPrice / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-emerald-600">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Upgrade Credit
                        </span>
                        <p className="text-[9px] font-medium opacity-80 leading-tight">
                          Unused time from your current plan
                        </p>
                      </div>
                      <span className="font-black">
                        -₹
                        {(estimate.upgradeCredit / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Selected Package
                    </span>
                    <span className="font-black text-slate-900 text-xl">
                      ₹{priceInRupees.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    AI Credits Included
                  </span>
                  <span className="font-black text-slate-900">
                    {(plan.credits ?? 0).toLocaleString()}{" "}
                    {plan.type === "TOPUP" ? "one-time" : "monthly"}
                  </span>
                </div>
                {plan.type !== "TOPUP" && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Billing
                    </span>
                    <span className="font-black text-slate-900">
                      1 Year Access
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                  <span className="text-slate-900 font-black uppercase tracking-widest text-[11px]">
                    Total Due Today
                  </span>
                  <span className="text-slate-900 font-black text-2xl">
                    {isEstimating ? (
                      <div className="h-8 bg-slate-200 rounded w-24 animate-pulse" />
                    ) : (
                      <>
                        ₹
                        {estimate
                          ? (
                              (estimate.originalPrice -
                                estimate.upgradeCredit) /
                              100
                            ).toLocaleString("en-IN")
                          : priceInRupees.toLocaleString("en-IN")}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  "Secure SSL",
                  "No Auto-Debit",
                  plan.type === "TOPUP" ? "Instant Grant" : "1 Year Valid",
                ].map((t) => (
                  <div
                    key={t}
                    className="text-[9px] font-black uppercase tracking-tighter text-slate-500 bg-white border border-slate-100 rounded-xl py-2.5 text-center shadow-sm"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-8 bg-white flex flex-col gap-3">
              <Button
                onClick={handlePay}
                disabled={isLoading}
                className={cn(
                  "w-full h-16 font-black text-lg shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98]",
                  plan.type === "TOPUP"
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : plan.planTier === "PRO"
                      ? "bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-200/50"
                      : plan.planTier === "GROWTH"
                        ? "bg-linear-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white shadow-indigo-200/50"
                        : "bg-linear-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-blue-200/50",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />{" "}
                    Finalising...
                  </>
                ) : (
                  <>
                    <Icon className="w-5 h-5 mr-3" />
                    Pay via Razorpay
                  </>
                )}
              </Button>
              <button
                onClick={() => onOpenChange(false)}
                className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors py-1"
              >
                Back to selections
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
