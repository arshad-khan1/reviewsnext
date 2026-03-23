"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { companyConfig } from "@/config/companyConfig";
import { Sparkles, ExternalLink, Copy, Check, ArrowLeft } from "lucide-react";

interface ManualReviewProps {
  onBack: () => void;
}

const ManualReview = ({ onBack }: ManualReviewProps) => {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const enhanced = text.trim()
      ? `${text.trim()} Highly recommended!`
      : "Had a wonderful experience! Highly recommended!";
    setText(enhanced);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGoogle = () => {
    window.open(companyConfig.reviewLink, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="text-center space-y-1">
        <h3 className="text-xl font-semibold text-foreground">Write your review</h3>
        <p className="text-sm text-muted-foreground">Share your experience in your own words</p>
      </div>

      <Textarea
        value={text}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        placeholder="Write your review here..."
        className="min-h-[120px] bg-secondary/50 border-border"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleGenerate} variant="secondary" className="flex-1 gap-2" size="lg">
          <Sparkles size={18} />
          Enhance Review
        </Button>
        <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2" size="lg" disabled={!text.trim()}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? "Copied!" : "Copy Review"}
        </Button>
        <Button onClick={handleOpenGoogle} className="flex-1 gap-2" size="lg">
          <ExternalLink size={18} />
          Open Google Review
        </Button>
      </div>
    </motion.div>
  );
};

export default ManualReview;
