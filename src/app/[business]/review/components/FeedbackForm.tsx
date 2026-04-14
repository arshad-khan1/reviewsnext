"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Sparkles } from "lucide-react";
import { companyConfig } from "@/config/companyConfig";

const FeedbackForm = () => {
  const [whatWentWrong, setWhatWentWrong] = useState("");
  const [howToImprove, setHowToImprove] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleEnhance = (field: "wrong" | "improve") => {
    if (field === "wrong") {
      const enhanced = whatWentWrong.trim() 
        ? `I felt that the experience didn't meet my expectations today. Specifically: ${whatWentWrong.trim()}. I'm sharing this in hope of improvement.`
        : "I found the overall experience to be slightly below expectations and felt some areas needed more attention.";
      setWhatWentWrong(enhanced);
    } else {
      const enhanced = howToImprove.trim()
        ? `I suggest focusing on ${howToImprove.trim()} to ensure a smoother experience for future guests. Thank you for listening.`
        : "I would appreciate more attention to detail in service speed and overall communication with guests.";
      setHowToImprove(enhanced);
    }
  };

  const handleOpenGoogle = () => {
    window.open(companyConfig.reviewLink, "_blank");
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
              <div className="relative">
                <Textarea
                  value={whatWentWrong}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setWhatWentWrong(e.target.value)
                  }
                  placeholder="Share your thoughts..."
                  className="min-h-[100px] bg-secondary/10 border-border/40 focus:border-(--brand-primary) focus:ring-0 transition-all rounded-(--brand-radius) text-sm"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEnhance("wrong")}
                  className="absolute bottom-3 right-3 bg-background border border-border/60 shadow-sm rounded-[calc(var(--brand-radius)*0.75)] px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-(--brand-primary) transition-colors cursor-pointer"
                >
                  <Sparkles size={11} className="text-(--brand-primary)" />
                  AI Enhance
                </motion.button>
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col items-stretch">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">
                How can we improve?
              </label>
              <div className="relative">
                <Textarea
                  value={howToImprove}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setHowToImprove(e.target.value)
                  }
                  placeholder="We are listening..."
                  className="min-h-[100px] bg-secondary/10 border-border/40 focus:border-(--brand-primary) focus:ring-0 transition-all rounded-xl text-sm"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEnhance("improve")}
                  className="absolute bottom-3 right-3 bg-background border border-border/60 shadow-sm rounded-[calc(var(--brand-radius)*0.75)] px-2.5 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-(--brand-primary) transition-colors cursor-pointer"
                >
                  <Sparkles size={11} className="text-(--brand-primary)" />
                  AI Enhance
                </motion.button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold rounded-(--brand-radius) bg-(--brand-primary) text-(--brand-foreground) hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              Submit Feedback
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
    </AnimatePresence>
  );
};

export default FeedbackForm;
