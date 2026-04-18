"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Sparkles, X, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CommentStyle } from "@/types/prisma-enums";
import { MagicLoading } from "@/components/ui/magic-loading";

interface FeedbackFormProps {
  onComplete: () => void;
  qrCodeId: string;
  scanId: string;
  rating: number;
  googleMapsLink: string;
  businessName: string;
  commentStyle: CommentStyle;
}

const FeedbackForm = ({
  onComplete,
  qrCodeId,
  scanId,
  rating,
  googleMapsLink,
  businessName,
  commentStyle,
}: FeedbackFormProps) => {
  const [whatWentWrong, setWhatWentWrong] = useState("");
  const [howToImprove, setHowToImprove] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState<"wrong" | "improve" | null>(
    null,
  );
  const [showPopup, setShowPopup] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);

  // Local AI credits (4 total per session)
  const [creditsLeft, setCreditsLeft] = useState<number>(4);

  // Load credits on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aiCreditUsage");
      if (saved !== null) setCreditsLeft(parseInt(saved));
    }
  });

  // Helper to count words
  const getWordCount = (str: string) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleEnhance = async (field: "wrong" | "improve") => {
    if (creditsLeft <= 0) {
      toast.error("AI limit reached for this session.");
      return;
    }

    const currentText = field === "wrong" ? whatWentWrong : howToImprove;

    // Check if word count is at least 7
    if (getWordCount(currentText) < 7) {
      toast.error(
        "Please write at least 7 words to allow the AI to enhance it.",
      );
      return;
    }

    setIsEnhancing(field);
    try {
      const response = await fetch("/api/public/ai/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeId,
          scanId,
          rating,
          businessName,
          commentStyle,
          operation: "REVIEW_ENHANCE",
          userInput: currentText,
        }),
      });

      if (!response.ok) throw new Error("Enhance failed");

      const data = await response.json();
      if (field === "wrong") setWhatWentWrong(data.reviewText);
      else setHowToImprove(data.reviewText);

      const newCredits = creditsLeft - 1;
      setCreditsLeft(newCredits);
      localStorage.setItem("aiCreditUsage", newCredits.toString());
      toast.success("Enhanced with AI!");
    } catch {
      toast.error("AI Enhance failed.");
    } finally {
      setTimeout(() => setIsEnhancing(null), 400);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatWentWrong.trim()) {
      toast.error("Please tell us what went wrong.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/public/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeId,
          scanId,
          rating,
          type: "NEGATIVE",
          whatWentWrong,
          howToImprove,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReviewId(data.reviewId);
        setSubmitted(true);
        toast.success("Feedback submitted. Thank you for helping us improve!");

        // Transition to global thank you screen after short delay
        setTimeout(() => {
          onComplete();
        }, 2500);
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Feedback Submission Error:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenGoogle = () => {
    setShowPopup(true);
  };

  const confirmGoToGoogle = async () => {
    if (reviewId) {
      try {
        // We update the existing review record (optional, but let's assume we create a new one or update if we had an endpoint)
        // Actually the prompt says "On this click of go to google review button click make entry that submitted to google to true"
        // Since we already might have a review entry (if they submitted the form first), we should update it.
        // If they didn't submit the form yet, we create a new entry.

        await fetch("/api/public/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrCodeId,
            scanId,
            rating,
            type: "NEGATIVE",
            whatWentWrong:
              whatWentWrong || "User chose to leave a public review directly",
            submittedToGoogle: true,
          }),
        });
      } catch (e) {
        console.error("Failed to log Google redirect:", e);
      }
    } else {
      // User clicked directly without submitting form
      try {
        await fetch("/api/public/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrCodeId,
            scanId,
            rating,
            type: "NEGATIVE",
            whatWentWrong: "Chose public review directly",
            submittedToGoogle: true,
          }),
        });
      } catch {}
    }

    setTimeout(() => {
      window.open(googleMapsLink, "_blank");
      setShowPopup(false);
      onComplete();
    }, 800);
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="thanks"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 py-8"
        >
          <div className="w-12 h-12 bg-success/5 rounded-full flex items-center justify-center mx-auto border border-success/10">
            <CheckCircle2 size={24} className="text-success" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground transition-all">
              Thank you for your honesty
            </h3>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
              We truly regret that your experience wasn&apos;t perfect. Your
              feedback is already with our management team.
            </p>
          </div>
          <div className="pt-4 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground mb-3 uppercase tracking-widest font-bold">
              Alternatively
            </p>
            <button
              onClick={handleOpenGoogle}
              className="text-xs font-semibold text-muted-foreground hover:text-(--brand-primary) transition-colors underline underline-offset-4 cursor-pointer"
            >
              Post a public review on Google instead
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-base font-bold text-foreground transition-all leading-tight">
              We value your experience
            </h3>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
              Please tell us what went wrong so we can make it right.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 flex flex-col items-stretch">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">
                What went wrong?
              </label>
              <div className="relative overflow-hidden rounded-(--brand-radius)">
                <MagicLoading isVisible={isEnhancing === "wrong"} />
                <Textarea
                  value={whatWentWrong}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setWhatWentWrong(e.target.value)
                  }
                  placeholder="Share your thoughts..."
                  className={cn(
                    "min-h-[100px] bg-secondary/10 border-border/40 focus:border-(--brand-primary) focus:ring-0 transition-all rounded-(--brand-radius) text-sm duration-300",
                    isEnhancing === "wrong" && "opacity-0",
                  )}
                />
                <motion.button
                  type="button"
                  whileHover={
                    creditsLeft > 0 &&
                    !isEnhancing &&
                    getWordCount(whatWentWrong) >= 7
                      ? { scale: 1.02 }
                      : {}
                  }
                  whileTap={
                    creditsLeft > 0 &&
                    !isEnhancing &&
                    getWordCount(whatWentWrong) >= 7
                      ? { scale: 0.98 }
                      : {}
                  }
                  onClick={() => handleEnhance("wrong")}
                  disabled={
                    creditsLeft <= 0 ||
                    !!isEnhancing ||
                    getWordCount(whatWentWrong) < 7
                  }
                  className={cn(
                    "absolute bottom-3 right-3 bg-background border border-border/60 shadow-sm rounded-[calc(var(--brand-radius)*0.75)] px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-(--brand-primary) transition-all cursor-pointer",
                    (creditsLeft <= 0 ||
                      !!isEnhancing ||
                      getWordCount(whatWentWrong) < 7) &&
                      "opacity-50 grayscale cursor-not-allowed",
                  )}
                >
                  {isEnhancing === "wrong" ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Sparkles size={11} className="text-(--brand-primary)" />
                  )}
                  {isEnhancing === "wrong"
                    ? "Enhancing..."
                    : `AI Enhance (${creditsLeft})`}
                </motion.button>
                {/* Word Count Indicator */}
                {whatWentWrong.length > 0 &&
                  getWordCount(whatWentWrong) < 7 && (
                    <p className="absolute -bottom-5 left-1 text-[9px] text-muted-foreground/60 transition-all">
                      Write {7 - getWordCount(whatWentWrong)} more words to
                      enhance with AI
                    </p>
                  )}
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col items-stretch">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">
                How can we improve?
              </label>
              <div className="relative overflow-hidden rounded-xl">
                <MagicLoading isVisible={isEnhancing === "improve"} />
                <Textarea
                  value={howToImprove}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setHowToImprove(e.target.value)
                  }
                  placeholder="We are listening..."
                  className={cn(
                    "min-h-[100px] bg-secondary/10 border-border/40 focus:border-(--brand-primary) focus:ring-0 transition-all rounded-xl text-sm duration-300",
                    isEnhancing === "improve" && "opacity-0",
                  )}
                />
                <motion.button
                  type="button"
                  whileHover={
                    creditsLeft > 0 &&
                    !isEnhancing &&
                    getWordCount(howToImprove) >= 7
                      ? { scale: 1.02 }
                      : {}
                  }
                  whileTap={
                    creditsLeft > 0 &&
                    !isEnhancing &&
                    getWordCount(howToImprove) >= 7
                      ? { scale: 0.98 }
                      : {}
                  }
                  onClick={() => handleEnhance("improve")}
                  disabled={
                    creditsLeft <= 0 ||
                    !!isEnhancing ||
                    getWordCount(howToImprove) < 7
                  }
                  className={cn(
                    "absolute bottom-3 right-3 bg-background border border-border/60 shadow-sm rounded-[calc(var(--brand-radius)*0.75)] px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-(--brand-primary) transition-all cursor-pointer",
                    (creditsLeft <= 0 ||
                      !!isEnhancing ||
                      getWordCount(howToImprove) < 7) &&
                      "opacity-50 grayscale cursor-not-allowed",
                  )}
                >
                  {isEnhancing === "improve" ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Sparkles size={11} className="text-(--brand-primary)" />
                  )}
                  {isEnhancing === "improve"
                    ? "Enhancing..."
                    : `AI Enhance (${creditsLeft})`}
                </motion.button>
                {/* Word Count Indicator */}
                {howToImprove.length > 0 && getWordCount(howToImprove) < 7 && (
                  <p className="absolute -bottom-5 left-1 text-[9px] text-muted-foreground/60 transition-all">
                    Write {7 - getWordCount(howToImprove)} more words to enhance
                    with AI
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-sm font-bold rounded-(--brand-radius) bg-(--brand-primary) text-(--brand-foreground) hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>

            <button
              type="button"
              onClick={handleOpenGoogle}
              className="w-full text-center text-[10px] font-semibold text-muted-foreground/60 hover:text-(--brand-primary) transition-colors cursor-pointer"
            >
              I still want to leave a public Google review
            </button>
          </div>
        </motion.form>
      )}

      {/* Redirect Popup */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xs bg-card border border-border rounded-3xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => setShowPopup(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
                  <ExternalLink size={24} />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold">We value your opinion</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed px-2">
                    We truly regret any inconvenience and are continuously
                    improving our services.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={confirmGoToGoogle}
                    className="w-full h-10 text-[11px] font-black rounded-xl bg-(--brand-primary) text-(--brand-foreground) transition-all cursor-pointer"
                  >
                    Go to Google Review
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPopup(false)}
                    className="w-full h-10 text-[11px] font-bold text-muted-foreground transition-all cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default FeedbackForm;
