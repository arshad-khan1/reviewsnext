"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

const FeedbackForm = () => {
  const [whatWentWrong, setWhatWentWrong] = useState("");
  const [howToImprove, setHowToImprove] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="thanks"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 py-6"
        >
          <CheckCircle2 size={48} className="mx-auto text-success" />
          <h3 className="text-xl font-semibold text-foreground">Thank you for your feedback</h3>
          <p className="text-muted-foreground">We truly appreciate you taking the time to help us improve.</p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="text-center space-y-1 mb-6">
            <h3 className="text-xl font-semibold text-foreground">We&apos;re really sorry your experience wasn&apos;t great.</h3>
            <p className="text-muted-foreground">Your feedback helps us improve.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">What went wrong?</label>
            <Textarea
              value={whatWentWrong}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWhatWentWrong(e.target.value)}
              placeholder="Tell us what happened..."
              className="min-h-[80px] bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">How can we improve?</label>
            <Textarea
              value={howToImprove}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHowToImprove(e.target.value)}
              placeholder="Any suggestions are welcome..."
              className="min-h-[80px] bg-secondary/50 border-border"
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Submit Feedback
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
};

export default FeedbackForm;
