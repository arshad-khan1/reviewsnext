"use client";
import Hero from "./home/Hero";
import Stats from "./home/Stats";
import Features from "./home/Features";
import CTA from "./home/CTA";

export default function LandingPage() {
  return (
    <div className="py-40 flex flex-col gap-40 text-foreground overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl -z-10 h-full pointer-events-none opacity-40">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-secondary/30 blur-[120px] rounded-full" />
      </div>

      <Hero />
      <Stats />
      <Features />
      <CTA />
    </div>
  );
}
