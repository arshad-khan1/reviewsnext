"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockBusinesses } from "@/data/mockBusinesses";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ReviewStars from "./components/ReviewStars";
import FeedbackForm from "./components/FeedbackForm";
import GeneratedReview from "./components/GeneratedReview";

type Flow = "idle" | "low" | "high";

const ReviewPage = () => {
  const params = useParams();
  const businessSlug = params.business as string;
  const business = mockBusinesses.find(b => b.slug === businessSlug);

  const [flow, setFlow] = useState<Flow>("idle");

  const handleRate = (rating: number) => {
    setFlow(rating <= 2 ? "low" : "high");
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Business Not Found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-xs">
          The business you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => window.location.href = "/"} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
          {/* Logo & Name */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center p-2 border shadow-sm overflow-hidden relative">
              <Image
                src={business.logo}
                alt={`${business.name} logo`}
                fill
                className="object-contain p-3"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{business.name}</h1>
              <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full" />
            </div>
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

        <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground mt-8 font-medium">
          Powered by Review Funnel
        </p>
      </motion.div>
    </div>
  );
};

export default ReviewPage;
