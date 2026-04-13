"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import ReviewStars from "./components/ReviewStars";
import FeedbackForm from "./components/FeedbackForm";
import GeneratedReview from "./components/GeneratedReview";
import { PlanType } from "@prisma/client";
import { hasFeature } from "@/config/plan-limits";

type Flow = "idle" | "low" | "high";

interface ReviewFlowProps {
  businessSlug: string;
  config: {
    businessName: string;
    logoUrl: string | null;
    threshold: number;
    qrCodeId: string | null;
    planTier: PlanType;
  };
}

const ReviewFlow = ({ businessSlug, config }: ReviewFlowProps) => {
  const [flow, setFlow] = useState<Flow>("idle");
  const [rating, setRating] = useState<number>(0);

  const handleRate = (r: number) => {
    setRating(r);
    // Use the effective threshold from DB
    if (r <= config.threshold) {
      setFlow("low");
    } else {
      setFlow("high");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
          {/* Logo & Name */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center p-2 border shadow-sm overflow-hidden relative">
              {config.logoUrl ? (
                <Image
                  src={config.logoUrl}
                  alt={`${config.businessName} logo`}
                  fill
                  className="object-contain p-3"
                />
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">
                  {config.businessName[0]}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{config.businessName}</h1>
              <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {flow === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">How was your experience with us?</h2>
                  <p className="text-sm text-muted-foreground">Your feedback helps us improve and helps others discover us.</p>
                </div>
                <ReviewStars onRate={handleRate} />
              </motion.div>
            )}

            {flow === "low" && (
              <motion.div
                key="low"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <FeedbackForm />
              </motion.div>
            )}

            {flow === "high" && (
              <motion.div
                key="high"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GeneratedReview />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!hasFeature(config.planTier, "canRemoveWatermark") && (
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground mt-8 font-medium">
            Powered by Review Funnel
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ReviewFlow;
