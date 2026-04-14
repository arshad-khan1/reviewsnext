"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { companyConfig } from "@/config/companyConfig";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ManualReviewProps {
  onBack: () => void;
  onComplete: () => void;
}

const ManualReview = ({ onBack, onComplete }: ManualReviewProps) => {
  const [text, setText] = useState("");
  const [hasCopied, setHasCopied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleGenerate = () => {
    const enhanced = text.trim()
      ? `${text.trim()} - Exceptional service and a truly wonderful atmosphere. Highly recommended!`
      : "I had a wonderful experience! The service was top-notch and everything was perfect. I will definitely be back.";
    setText(enhanced);
    setHasCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast.success("Review copied! Now you can post it.");
  };

  const handleOpenGoogle = () => {
    setIsCompleted(true);
    toast.success("Step 2 completed! Opening Google Review...");
    setTimeout(() => {
      window.open(companyConfig.reviewLink, "_blank");
      setTimeout(() => setIsCompleted(false), 2000);
      onComplete(); // Transition to thank you screen
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-base font-bold text-foreground transition-all">
          Make it your own
        </h3>
        <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
          Step 1: Write or Enhance. Step 2: Copy and Post.
        </p>
      </div>

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setText(e.target.value);
            setHasCopied(false);
          }}
          placeholder="I had an amazing time because..."
          className="min-h-[140px] bg-secondary/10 border-border/40 focus:border-(--brand-primary) focus:ring-0 transition-all rounded-[1.25rem] p-5 text-sm italic leading-relaxed"
        />
        <motion.button
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          className="absolute bottom-3 right-3 bg-background border border-border/60 shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-(--brand-primary) transition-colors cursor-pointer"
        >
          <Sparkles size={12} className="text-(--brand-primary)" />
          AI Enhance
        </motion.button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Step 1: Copy Button */}
        <Button
          onClick={handleCopy}
          disabled={!text.trim()}
          variant={hasCopied ? "outline" : "default"}
          className={cn(
            "w-full h-11 gap-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            !hasCopied &&
              text.trim() &&
              "bg-(--brand-primary) text-white animate-pulse-subtle",
            hasCopied && "border-green-500/50 text-green-600 bg-green-50/50",
            !text.trim() && "opacity-50",
          )}
        >
          {hasCopied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} />
          )}
          {hasCopied ? "Copied!" : "Copy Review Text"}
        </Button>

        {/* Step 2: Post Button */}
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
              "w-full h-14 gap-2 font-bold rounded-2xl text-sm transition-all shadow-sm cursor-pointer",
              isCompleted
                ? "bg-green-600 text-white"
                : hasCopied
                  ? "bg-slate-900 text-white hover:bg-black"
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

        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full gap-1.5 text-[10px] flex items-center justify-center font-bold text-muted-foreground/60 hover:text-foreground transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Suggestions
        </Button>
      </div>

      {/* Instructions Summary */}
      <div className="bg-secondary/5 rounded-[1.25rem] p-5 border border-border/20">
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

export default ManualReview;
