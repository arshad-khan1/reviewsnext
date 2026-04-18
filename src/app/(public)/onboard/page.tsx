import type { Metadata } from "next";
import OnboardClient from "./onboard-client";

export const metadata: Metadata = {
  title: "Get Started | ReviewFunnel Onboarding",
  description: "Set up your business on ReviewFunnel in minutes. Automate your reputation management and start growing your Google reviews today.",
};

export default function OnboardPage() {
  return <OnboardClient />;
}
