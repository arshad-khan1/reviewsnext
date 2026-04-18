import type { Metadata } from "next";
import PricingClient from "./pricing-client";

interface PageProps {
  params: Promise<{ business: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business } = await params;
  return {
    title: `Pricing & Plans | ${business}`,
    description: `View and upgrade subscription plans for ${business} on ReviewFunnel.`,
  };
}

export default function PricingPage() {
  return <PricingClient />;
}
