import type { Metadata } from "next";
import BusinessesClient from "./businesses-client";

export const metadata: Metadata = {
  title: "Business Directory | Admin Portal",
  description: "Monitor and manage all businesses onboarded to the ReviewFunnel platform.",
};

export default function BusinessesPage() {
  return <BusinessesClient />;
}
