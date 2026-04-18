"use client";

import { useState, useMemo, useEffect } from "react";
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
import { cn, getContrastColor } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";

type Flow = "idle" | "low" | "high" | "completed";

interface ReviewFlowProps {
  businessSlug: string;
  config: {
    businessName: string;
    logoUrl: string | null;
    threshold: number;
    qrCodeId: string | null;
    sourceTag: string | null;
    googleMapsLink: string | null;
    aiGuidingPrompt: string | null;
    commentStyle: any;
    planTier: PlanType;
    branding: BrandingConfig;
  };
}

const ReviewFlow = ({
  businessSlug,
  config: initialConfig,
}: ReviewFlowProps) => {
  const [flow, setFlow] = useState<Flow>("idle");
  const [rating, setRating] = useState<number>(0);
  const [tempRating, setTempRating] = useState<number>(0);
  const [scanId, setScanId] = useState<string | null>(null);
  const [qrCodeId, setQrCodeId] = useState<string | null>(
    initialConfig.qrCodeId,
  );
  const [activeConfig, setActiveConfig] = useState(initialConfig);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Track scan on mount and fetch fresh config
  useEffect(() => {
    const trackScan = async () => {
      try {
        const ua = window.navigator.userAgent;
        // Simple UA parsing
        let browser = "Unknown";
        if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari")) browser = "Safari";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Edge")) browser = "Edge";

        let os = "Unknown";
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "MacOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iOS")) os = "iOS";

        const response = await fetch("/api/public/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessSlug,
            sourceTag: initialConfig.sourceTag,
            device: /Mobile|Android|iPhone/i.test(ua) ? "Mobile" : "Desktop",
            browser,
            os,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setScanId(data.scanId);
          if (data.qrCodeId) setQrCodeId(data.qrCodeId);

          // Update active config with values from API (database source of truth)
          setActiveConfig((prev) => ({
            ...prev,
            threshold: data.acceptedStarsThreshold ?? prev.threshold,
            googleMapsLink: data.googleMapsLink ?? prev.googleMapsLink,
            aiGuidingPrompt: data.aiGuidingPrompt ?? prev.aiGuidingPrompt,
            commentStyle: data.commentStyle ?? prev.commentStyle,
          }));
          setIsConfigLoaded(true);
        } else {
          // Even if tracking fails, allow the user to proceed with initial config
          setIsConfigLoaded(true);
        }
      } catch (error) {
        console.error("Failed to track scan:", error);
        setIsConfigLoaded(true);
      }
    };

    trackScan();
  }, [businessSlug, initialConfig.sourceTag]);

  // Resolve branding based on tier and config
  const branding = useMemo(
    () =>
      resolveEffectiveBranding(activeConfig.planTier, activeConfig.branding),
    [activeConfig.planTier, activeConfig.branding],
  );

  const borderRadius = useMemo(() => {
    if (branding.buttonStyle === "sharp") return "0px";
    if (branding.buttonStyle === "pill") return "9999px";
    return "1rem"; // rounded (16px)
  }, [branding.buttonStyle]);

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

    if (r < activeConfig.threshold) {
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
    return branding.starHeadlines[r] || branding.headline;
  };

  const getSubheadline = () => {
    const r = tempRating || rating;
    if (r === 0) return branding.subheadline;
    return branding.starSubheadlines[r] || branding.subheadline;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={
        {
          fontFamily: `${branding.fontFamily}, sans-serif`,
          ["--brand-primary" as any]: branding.primaryColor,
          ["--brand-foreground" as any]: getContrastColor(
            branding.primaryColor,
          ),
          ["--brand-radius" as any]: borderRadius,
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
            className="absolute inset-0 z-0 bg-slate-950"
          >
            <div className="absolute inset-0 opacity-60">
              <Image
                src={branding.backgroundUrl}
                alt="Business background"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div
              className="absolute inset-0 bg-black/40"
              style={{
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
            "rounded-4xl shadow-2xl border transition-all duration-700 overflow-hidden relative",
            branding.isGlassmorphismEnabled
              ? "glass-card"
              : "bg-card border-border/50",
            branding.backgroundUrl &&
              branding.isGlassmorphismEnabled &&
              "bg-white/80 backdrop-blur-3xl",
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
                className="w-16 h-16 mx-auto rounded-full bg-secondary/30 flex items-center justify-center p-3 border border-border/50 overflow-hidden relative"
              >
                {activeConfig.logoUrl ? (
                  <Image
                    src={activeConfig.logoUrl}
                    alt={`${activeConfig.businessName} logo`}
                    fill
                    className="object-contain p-3"
                  />
                ) : (
                  <div className="text-xl font-bold text-muted-foreground">
                    {activeConfig.businessName[0]}
                  </div>
                )}
              </motion.div>
              <h1 className="text-sm font-bold tracking-widest uppercase text-muted-foreground/80">
                {activeConfig.businessName}
              </h1>
            </div>

            <AnimatePresence mode="wait">
              {!isConfigLoaded ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center space-y-4"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-(--brand-primary)" />
                  <p className="text-xs text-muted-foreground animate-pulse font-medium">
                    Initializing your experience...
                  </p>
                </motion.div>
              ) : (
                flow === "idle" && (
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
                )
              )}

              {flow === "low" && (
                <motion.div
                  key="low"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <FeedbackForm
                    onComplete={handleComplete}
                    qrCodeId={qrCodeId || ""}
                    scanId={scanId || ""}
                    rating={rating}
                    googleMapsLink={activeConfig.googleMapsLink || ""}
                    businessName={activeConfig.businessName}
                    commentStyle={activeConfig.commentStyle}
                  />
                </motion.div>
              )}

              {flow === "high" && (
                <motion.div
                  key="high"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <GeneratedReview
                    onComplete={handleComplete}
                    qrCodeId={qrCodeId || ""}
                    scanId={scanId || ""}
                    rating={rating}
                    businessName={activeConfig.businessName}
                    googleMapsLink={activeConfig.googleMapsLink || ""}
                    commentStyle={activeConfig.commentStyle}
                    aiGuidingPrompt={activeConfig.aiGuidingPrompt || ""}
                  />
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
                    businessName={activeConfig.businessName}
                    branding={branding}
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
