import type { Metadata } from "next";
import PricingClient from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing Plans | Transparent & Scaleable",
  description: "Find the perfect plan for your business needs. From free trials to enterprise-level reputation management, ReviewFunnel scales with you.",
};

export default function PricingPage() {
  return <PricingClient />;
}
