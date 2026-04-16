"use client";

import { motion } from "framer-motion";
import { PricingPlans } from "@/components/shared/pricing/pricing-plans";
import { Sparkles } from "lucide-react";

export default function PricingClient() {
  const handleSelectPlan = (planId: string) => {
    // For public users, selecting a plan takes them to onboarding with that plan pre-selected if possible,
    // or just to the start of onboarding.
    window.location.href = `/onboard?plan=${planId}`;
  };

  return (
    <div className="text-foreground overflow-x-hidden pt-40">
      <section className="relative pb-12 px-4">
        {/* Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl -z-10 h-full pointer-events-none opacity-40">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-secondary/30 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
          >
            <Sparkles className="w-3 h-3" />
            Plans built for growth and impact
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-black tracking-tight"
          >
            Simple pricing for{" "}
            <span className="text-primary italic">unlimited</span> results.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Whether you&apos;re starting out with a single location or scaling a
            nationwide franchise, we have a plan that fits your ambition. No
            credit card required to start.
          </motion.p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <PricingPlans showTitle={false} onSelect={handleSelectPlan} />
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-20 bg-card/30 backdrop-blur-sm border-y border-border/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center gap-1 text-orange-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <Sparkles key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            &quot;ReviewFunnel doubled our Google reviews in specifically 3
            weeks. The AI responses are a game changer for our manager&apos;s
            time.&quot;
          </h3>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
            — Management, Urban Brew Coffee
          </p>
        </div>
      </section>
    </div>
  );
}
