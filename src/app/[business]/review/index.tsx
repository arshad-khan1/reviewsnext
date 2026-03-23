"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { companyConfig } from "@/config/companyConfig";
import ReviewStars from "./components/ReviewStars";
import FeedbackForm from "./components/FeedbackForm";
import GeneratedReview from "./components/GeneratedReview";

type Flow = "idle" | "low" | "high";

const ReviewPage = () => {
  const [flow, setFlow] = useState<Flow>("idle");

  const handleRate = (rating: number) => {
    setFlow(rating <= 2 ? "low" : "high");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 space-y-6">
          {/* Logo & Name */}
          <div className="text-center space-y-3">
            <img
              src={companyConfig.logo}
              alt={`${companyConfig.name} logo`}
              className="w-16 h-16 mx-auto rounded-xl object-contain bg-secondary p-2"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <h1 className="text-2xl font-bold text-foreground">{companyConfig.name}</h1>
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

        <p className="text-center text-xs text-muted-foreground mt-4">
          Powered by Review Funnel
        </p>
      </motion.div>
    </div>
  );
};

export default ReviewPage;
