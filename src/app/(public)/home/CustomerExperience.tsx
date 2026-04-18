"use client";

import { motion } from "framer-motion";
import { QrCode, Sparkles, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomerExperience() {
  const steps = [
    {
      icon: QrCode,
      title: "1. Instant Scan",
      description:
        "Customers scan a unique QR code at your location. No apps to download, no URLs to type.",
      color: "bg-blue-500/10 text-blue-600",
      accent: "blue",
    },
    {
      icon: Star,
      title: "2. Fast Rating",
      description:
        "A beautiful, branded interface lets customers rate their experience in seconds.",
      color: "bg-orange-500/10 text-orange-600",
      accent: "orange",
    },
    {
      icon: Sparkles,
      title: "3. AI Magic",
      description:
        "Our AI helps customers write positive, impactful reviews by turning their thoughts into professional drafts.",
      color: "bg-purple-500/10 text-purple-600",
      accent: "purple",
    },
    {
      icon: Zap,
      title: "4. One-Tap Share",
      description:
        "Positive reviews go to Google Maps. Others go to you privately for resolution.",
      color: "bg-emerald-500/10 text-emerald-600",
      accent: "emerald",
    },
  ];

  return (
    <section className="px-4 py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
          >
            <UsersIcon className="w-3 h-3" />
            The Customer Journey
          </motion.div>
          <h2 className="text-3xl lg:text-6xl font-black tracking-tight leading-tight">
            Powerful for Business. <br />
            <span className="text-primary italic">Effortless</span> for
            Customers.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            We&apos;ve removed every friction point between your customer&apos;s
            great experience and your 5-star Google review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-border/50 -z-10 -translate-y-12" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center text-center space-y-6 group"
            >
              <div
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl shadow-primary/5",
                  step.color,
                )}
              >
                <step.icon className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Highlight Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-32 p-8 lg:p-16 rounded-[4rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-64 h-64 text-primary" />
          </div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                AI-Enhanced Impact
              </div>
              <h3 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
                No more <br />
                <span className="text-white italic underline decoration-primary/50 underline-offset-8">
                  writer&apos;s block
                </span>
                .
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Most customers want to help, but don&apos;t know what to write.
                Our AI engine takes their basic thoughts and turns them into
                positive, impactful reviews that rank you higher.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2Icon className="w-4 h-4" />
                  Higher Search Rankings
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2Icon className="w-4 h-4" />
                  Authentic Growth
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-4xl p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Customer Input
                </p>
                <p className="text-sm italic text-white/90 font-medium">
                  &quot;The pasta was great and the waiter was very nice!&quot;
                </p>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">
                    AI Refined Draft
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  &quot;Incredible experience at [Your Brand]! The pasta was
                  cooked to perfection and the service was exceptionally warm
                  and attentive. Definitly a 5-star spot!&quot;
                </p>
              </div>
              <div className="pt-4">
                <div className="w-full h-12 rounded-xl bg-primary flex items-center justify-center font-bold text-sm shadow-xl shadow-primary/20">
                  Post to Google Maps
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckCircle2Icon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
