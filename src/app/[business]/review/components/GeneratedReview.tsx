"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { companyConfig } from "@/config/companyConfig";
import { Copy, Check, ExternalLink, PenLine, CheckCircle2 } from "lucide-react";
import ManualReview from "./ManualReview";

const GeneratedReview = () => {
  const [review] = useState(() => {
    const idx = Math.floor(Math.random() * companyConfig.suggestedReviews.length);
    return companyConfig.suggestedReviews[idx];
  });
  const [copied, setCopied] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGoogle = () => {
    window.open(companyConfig.reviewLink, "_blank");
  };

  if (showManual) {
    return <ManualReview onBack={() => setShowManual(false)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
          Your review is ready! <CheckCircle2 className="text-success h-6 w-6" />
        </h3>
        <p className="text-muted-foreground">
          Would you mind sharing a quick review on Google?
          <br />
          It helps our small business a lot.
        </p>
      </div>

      {/* Review box */}
      <div className="bg-accent/60 border border-border rounded-lg p-5">
        <p className="text-foreground leading-relaxed italic">&quot;{review}&quot;</p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2" size="lg">
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? "Copied!" : "Copy Review"}
        </Button>
        <Button onClick={() => setShowManual(true)} variant="secondary" className="flex-1 gap-2" size="lg">
          <PenLine size={18} />
          Write My Own
        </Button>
        <Button onClick={handleOpenGoogle} className="flex-1 gap-2" size="lg">
          <ExternalLink size={18} />
          Open Google Review
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-secondary/50 rounded-lg p-5 space-y-4">
        <h4 className="font-semibold text-foreground text-center">How to leave your review</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { step: 1, text: 'Click "Copy Review"' },
            { step: 2, text: 'Click "Open Google Review"' },
            { step: 3, text: "Paste your review and choose your star rating" },
            { step: 4, text: "Submit your review" },
          ].map(({ step, text }) => (
            <div key={step} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {step}
              </span>
              <p className="text-sm text-foreground pt-0.5">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground pt-2">
          This takes only 10 seconds and helps our business grow. Thank you for supporting us! 💛
        </p>
      </div>
    </motion.div>
  );
};

export default GeneratedReview;
