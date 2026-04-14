"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  PenLine,
  Lock,
  Sparkles,
  Loader2,
} from "lucide-react";
import ManualReview from "./ManualReview";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useCallback } from "react";
import { CommentStyle } from "@prisma/client";

interface GeneratedReviewProps {
  onComplete: () => void;
  qrCodeId: string;
  scanId: string;
  rating: number;
  businessName: string;
  googleMapsLink: string;
  commentStyle: CommentStyle;
  aiGuidingPrompt: string;
}

const GeneratedReview = ({ 
  onComplete, 
  qrCodeId, 
  scanId, 
  rating, 
  businessName, 
  googleMapsLink,
  commentStyle,
  aiGuidingPrompt,
}: GeneratedReviewProps) => {
  const [reviewText, setReviewText] = useState("");
  const [hasCopied, setHasCopied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wasCopiedBeforeSubmission, setWasCopiedBeforeSubmission] = useState(false);
  
  // Local AI credits (4 total per session)
  const [creditsLeft, setCreditsLeft] = useState<number>(4);

  const generateReview = useCallback(async (isRegeneration = false) => {
    if (creditsLeft <= 0) {
      toast.error("AI generation limit reached for this session.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/public/ai/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeId,
          scanId,
          rating,
          businessName,
          aiGuidingPrompt,
          commentStyle,
          operation: isRegeneration ? "REVIEW_REGENERATE" : "REVIEW_DRAFT",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.code === "INSUFFICIENT_CREDITS") {
          toast.error("Monthly AI limit reached for this business.");
        } else {
          toast.error("Failed to generate review. Please try again.");
        }
        return;
      }

      const data = await response.json();
      setReviewText(data.reviewText);
      setHasCopied(false);
      
      const newCredits = creditsLeft - 1;
      setCreditsLeft(newCredits);
      localStorage.setItem("aiCreditUsage", newCredits.toString());

    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [qrCodeId, scanId, rating, businessName, aiGuidingPrompt, commentStyle, creditsLeft]);

  // Initial generation
  useEffect(() => {
    const savedCredits = localStorage.getItem("aiCreditUsage");
    if (savedCredits !== null) {
      const left = parseInt(savedCredits);
      setCreditsLeft(left);
      // If we already have credits left and review is empty, let's not auto-generate if we're out
    }
    
    if (reviewText === "") {
      generateReview(false);
    }
  }, []);

  const handleCopy = async () => {
    if (!reviewText) return;
    await navigator.clipboard.writeText(reviewText);
    setHasCopied(true);
    setWasCopiedBeforeSubmission(true);
    toast.success("Review copied! Now you can post it.", {
      description: "Step 1 complete. Proceed to Step 2.",
    });
  };

  const handleRegenerate = () => {
    generateReview(true);
  };

  const handleOpenGoogle = async () => {
    if (!wasCopiedBeforeSubmission) {
      toast.error("Please copy the review text first!");
      return;
    }

    setIsCompleted(true);

    try {
      // Create review entry in DB
      await fetch("/api/public/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeId,
          scanId,
          rating,
          type: "POSITIVE",
          reviewText,
          reviewWasAiDraft: true,
          submittedToGoogle: true,
        }),
      });
    } catch (error) {
      console.error("Failed to save review:", error);
    }

    toast.success("Step 2 completed! Opening Google Review...");

    setTimeout(() => {
      window.open(googleMapsLink, "_blank");
      setTimeout(() => setIsCompleted(false), 2000);
      onComplete(); // Transition to thank you screen
    }, 800);
  };

  if (showManual) {
    return (
      <ManualReview
        onBack={() => setShowManual(false)}
        onComplete={onComplete}
        qrCodeId={qrCodeId}
        scanId={scanId}
        rating={rating}
        businessName={businessName}
        googleMapsLink={googleMapsLink}
        commentStyle={commentStyle}
        aiGuidingPrompt={aiGuidingPrompt}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-base font-bold text-foreground transition-all">
          Ready to help us grow?
        </h3>
        <p className="text-xs text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
          Follow the 2 simple steps below to share your experience on Google.
        </p>
      </div>

      {/* Review box - Editable */}
      <div className="relative group">
        <div
          className={cn(
            "absolute -inset-0.5 rounded-[1.25rem] blur opacity-[0.03] transition duration-500",
            hasCopied ? "bg-green-500 opacity-[0.08]" : "bg-(--brand-primary)",
          )}
        ></div>
        <div className="relative bg-secondary/10 border border-border/30 rounded-[1.25rem] p-4 shadow-inner">
          <Textarea
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value);
              setHasCopied(false);
            }}
            className="bg-transparent border-none focus:ring-0 p-0 text-sm text-foreground/90 leading-relaxed italic resize-none min-h-[100px]"
          />
          <div className="absolute bottom-2 right-2">
            <motion.button
              whileHover={creditsLeft > 0 && !isLoading ? { scale: 1.02 } : {}}
              whileTap={creditsLeft > 0 && !isLoading ? { scale: 0.98 } : {}}
              onClick={handleRegenerate}
              disabled={creditsLeft <= 0 || isLoading}
              className={cn(
                "bg-background border border-border/60 shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-(--brand-primary) transition-all cursor-pointer",
                (creditsLeft <= 0 || isLoading) && "opacity-50 cursor-not-allowed grayscale"
              )}
            >
              {isLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} className="text-(--brand-primary)" />
              )}
              {isLoading ? "Generating..." : `Regenerate: ${creditsLeft} left`}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {/* Step 1 Row */}
        <div className="flex gap-2.5">
          <Button
            onClick={handleCopy}
            variant={hasCopied ? "outline" : "default"}
            className={cn(
              "flex-2 h-11 gap-2 rounded-(--brand-radius) text-xs font-bold transition-all cursor-pointer",
              !hasCopied &&
                "bg-(--brand-primary) text-(--brand-foreground) shadow-lg shadow-(--brand-primary)/20 animate-pulse-subtle",
              hasCopied && "border-green-500/50 text-green-600 bg-green-50/50",
            )}
          >
            {hasCopied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} />
            )}
            {hasCopied ? "Copied!" : "Copy Review Text"}
          </Button>

          <Button
            onClick={() => {
              // Redirect to a manual flow or just show it
              // For now we keep existing setShowManual but pass necessary context if needed
              setShowManual(true);
            }}
            variant="outline"
            className="flex-1 h-11 gap-2 border-border/50 hover:bg-secondary/50 rounded-(--brand-radius) text-xs font-semibold transition-all cursor-pointer text-muted-foreground"
          >
            <PenLine size={14} />
            Write My Own
          </Button>
        </div>

        {/* Step 2 Primary Action */}
        <motion.div
          animate={
            hasCopied
              ? {
                  scale: [1, 1.02, 1],
                  transition: { repeat: Infinity, duration: 2 },
                }
              : {}
          }
        >
          <Button
            onClick={handleOpenGoogle}
            disabled={!hasCopied || isCompleted}
            className={cn(
              "w-full h-14 gap-2 font-bold rounded-(--brand-radius) text-sm transition-all shadow-sm cursor-pointer",
              isCompleted
                ? "bg-green-600 text-white"
                : hasCopied
                  ? "bg-(--brand-primary) text-(--brand-foreground) hover:opacity-90 shadow-lg shadow-(--brand-primary)/20"
                  : "bg-(--brand-primary)/10 text-(--brand-primary)/50 border border-(--brand-primary)/20 cursor-not-allowed",
            )}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={18} />
                Step 2: Completed!
              </>
            ) : (
              <>
                {!hasCopied && <Lock size={16} className="mr-1" />}
                <ExternalLink size={18} />
                2. Post on Google Review
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Quick Visual Guide */}
      {!hasCopied && (
        <p className="text-center text-[10px] text-muted-foreground/60 animate-bounce">
          👇 Click copy to unlock the next step
        </p>
      )}

      {/* Instructions Summary */}
      <div className="bg-secondary/5 rounded-(--brand-radius) p-5 border border-border/20">
        <div className="space-y-3.5">
          {[
            { step: 1, text: "Click Copy (above)" },
            { step: 2, text: "Choose 5 stars on Google" },
            { step: 3, text: "Paste your review & Submit" },
          ].map(({ step, text }) => (
            <div key={step} className="flex gap-3 items-center">
              <span
                className={cn(
                  "shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border transition-colors shadow-sm",
                  (hasCopied && step === 1) || (isCompleted && step === 2)
                    ? "bg-green-500 border-green-600 text-white"
                    : "bg-background text-muted-foreground border-border/40",
                )}
              >
                {step}
              </span>
              <p
                className={cn(
                  "text-[11px] font-medium tracking-wide transition-colors",
                  (hasCopied && step === 1) || (isCompleted && step === 2)
                    ? "text-green-600"
                    : "text-foreground/80",
                )}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GeneratedReview;
