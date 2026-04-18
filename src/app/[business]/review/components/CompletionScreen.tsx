"use client";

import { motion } from "framer-motion";
import { CheckCircle2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useEffect } from "react";

import { BrandingConfig, EffectiveBranding } from "@/types/branding";

interface CompletionScreenProps {
  businessName: string;
  branding: EffectiveBranding;
  onReset: () => void;
}

const CompletionScreen = ({
  businessName,
  branding,
  onReset,
}: CompletionScreenProps) => {
  const primaryColor = branding.primaryColor;

  useEffect(() => {
    // Final celebratory confetti burst
    const end = Date.now() + 1000;
    const colors = [primaryColor, "#ffffff", "#ffd700"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [primaryColor]);

  return (
    <div className="text-center space-y-8 py-4">
      <div className="relative inline-block">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20"
        >
          <CheckCircle2 size={40} className="text-green-500" />
        </motion.div>
      </div>

      <div className="space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-black text-foreground"
        >
          Review Submitted!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed"
        >
          {branding.thankYouMessage}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-4 space-y-4"
      >
        <Button
          onClick={() => window.close()}
          className="w-full h-14 hover:opacity-90 font-bold rounded-(--brand-radius) shadow-xl transition-all"
          style={{ 
            backgroundColor: primaryColor,
            color: 'var(--brand-foreground)'
          }}
        >
          Close Page
        </Button>

        <div className="pt-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 mx-auto text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors group cursor-pointer"
          >
            <RefreshCcw
              size={12}
              className="group-hover:rotate-180 transition-transform duration-500"
            />
            I haven&apos;t submitted yet
          </button>
        </div>
      </motion.div>

      <div className="bg-secondary/10 border border-border/40 rounded-2xl p-4">
        <p className="text-[10px] text-muted-foreground font-medium italic">
          &quot;Supporting small businesses keeps our community vibrant.&quot;
        </p>
      </div>
    </div>
  );
};

export default CompletionScreen;
