"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ReviewStars from "./components/ReviewStars";
import FeedbackForm from "./components/FeedbackForm";
import GeneratedReview from "./components/GeneratedReview";
import CompletionScreen from "./components/CompletionScreen";
import { PlanType } from "@prisma/client";
import { BrandingConfig } from "@/types/branding";
import { resolveEffectiveBranding } from "@/lib/utils/branding";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Flow = "idle" | "low" | "high" | "completed";

interface ReviewFlowProps {
  businessSlug: string;
  config: {
    businessName: string;
    logoUrl: string | null;
    threshold: number;
    qrCodeId: string | null;
    planTier: PlanType;
    branding: BrandingConfig;
  };
}

const ReviewFlow = ({ config }: ReviewFlowProps) => {
  const [flow, setFlow] = useState<Flow>("idle");
  const [rating, setRating] = useState<number>(0);
  const [tempRating, setTempRating] = useState<number>(0);

  // Resolve branding based on tier and config
  const branding = useMemo(
    () => resolveEffectiveBranding(config.planTier, config.branding),
    [config.planTier, config.branding],
  );

  const handleRate = (r: number) => {
    setRating(r);

    if (r === 5) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [branding.primaryColor, "#ffffff", "#ffd700"],
      });
    }

    if (r <= config.threshold) {
      setFlow("low");
    } else {
      setFlow("high");
    }
  };

  const handleComplete = () => {
    setFlow("completed");
  };

  const handleBack = () => {
    setFlow("idle");
    setRating(0);
  };

  // Smart Emotional Sentiment Headlines
  const getHeadline = () => {
    const r = tempRating || rating;
    if (r === 0) return branding.headline;
    if (r === 1) return "We're deeply sorry for your experience.";
    if (r === 2) return "We regret that we missed the mark.";
    if (r === 3) return "We're striving for better.";
    if (r === 4) return "We're so glad you enjoyed it!";
    return "Excellent! We're thrilled!";
  };

  const getSubheadline = () => {
    const r = tempRating || rating;
    if (r === 0) return branding.subheadline;
    if (r <= 2)
      return "Making you comfortable is our priority. We truly regret the inconvenience caused.";
    if (r === 3) return "Your feedback helps us close the gap to excellence.";
    return "Your support helps others discover our business!";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={
        {
          fontFamily: "var(--font-urbanist), sans-serif",
          ["--brand-primary" as any]: branding.primaryColor,
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          backgroundColor: "var(--background)",
        } as React.CSSProperties
      }
    >
      <AnimatePresence>
        {branding.backgroundUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={branding.backgroundUrl}
              alt="Business background"
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "black",
                opacity: branding.overlayOpacity,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md z-10"
      >
        <div
          className={cn(
            "rounded-4xl shadow-sm border transition-all duration-700 overflow-hidden relative",
            branding.isGlassmorphismEnabled
              ? "glass-card"
              : "bg-card border-border/50",
          )}
        >
          {/* Back Button */}
          {flow !== "idle" && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="absolute top-6 left-6 z-20 p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </motion.button>
          )}

          <div className="p-8 space-y-8">
            {/* Logo & Name */}
            <div className="text-center space-y-3">
              <motion.div
                layoutId="logo"
                className="w-16 h-16 mx-auto rounded-2xl bg-secondary/30 flex items-center justify-center p-3 border border-border/50 overflow-hidden relative"
              >
                {config.logoUrl ? (
                  <Image
                    src={config.logoUrl}
                    alt={`${config.businessName} logo`}
                    fill
                    className="object-contain p-3"
                  />
                ) : (
                  <div className="text-xl font-bold text-muted-foreground">
                    {config.businessName[0]}
                  </div>
                )}
              </motion.div>
              <h1 className="text-sm font-bold tracking-widest uppercase text-muted-foreground/80">
                {config.businessName}
              </h1>
            </div>

            <AnimatePresence mode="wait">
              {flow === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <motion.h2
                      key={getHeadline()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg font-semibold text-foreground"
                    >
                      {getHeadline()}
                    </motion.h2>
                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                      {getSubheadline()}
                    </p>
                  </div>

                  <ReviewStars
                    onRate={handleRate}
                    onHoverChange={setTempRating}
                  />
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
                  <GeneratedReview onComplete={handleComplete} />
                </motion.div>
              )}

              {flow === "completed" && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CompletionScreen 
                    businessName={config.businessName}
                    primaryColor={branding.primaryColor}
                    onReset={handleBack} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {!branding.canRemoveWatermark && (
          <p className="text-center text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mt-8 font-bold">
            Powered by Review Funnel
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ReviewFlow;
