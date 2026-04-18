import type { Metadata } from "next";
import FeaturesClient from "./features-client";

export const metadata: Metadata = {
  title: "Features & Solutions | ReviewFunnel",
  description: "Discover how ReviewFunnel solves reputation management pain points with smart review routing, AI responses, and multi-location analytics.",
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}
