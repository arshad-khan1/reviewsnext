import type { Metadata } from "next";
import LandingPageClient from "./home-client";

export const metadata: Metadata = {
  title: "ReviewFunnel | Top-Tier Review Management for Growth",
  description: "Join hundreds of businesses using ReviewFunnel to double their Google reviews, improve customer sentiment, and dominate local search.",
};

export default function LandingPage() {
  return <LandingPageClient />;
}
