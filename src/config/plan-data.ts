import { PlanType } from "@prisma/client";
import { ShieldCheck, Zap, Crown, Sparkles, LucideIcon } from "lucide-react";

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanData {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  bgColor: string;
  popular?: boolean;
  features: PlanFeature[];
  buttonText: string;
  rank: number;
}

export const PLAN_DATA: PlanData[] = [
  {
    id: PlanType.FREE,
    name: "Free",
    description: "Perfect for testing the waters and small setups.",
    price: 0,
    icon: ShieldCheck,
    color: "text-slate-500",
    borderColor: "border-slate-200",
    bgColor: "bg-white",
    buttonText: "Start for Free",
    rank: 0,
    features: [
      { text: "1 Active QR Code", included: true },
      { text: "100 AI Credits", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Standard Support", included: true },
      { text: "ReviewFunnel Branding", included: false },
    ],
  },
  {
    id: PlanType.STARTER,
    name: "Starter",
    description: "Essential tools for growing local businesses.",
    price: 2499,
    icon: Sparkles,
    color: "text-orange-500",
    borderColor: "border-orange-200",
    bgColor: "bg-white",
    buttonText: "Go Starter",
    rank: 1,
    features: [
      { text: "1 Active QR Code", included: true },
      { text: "300 AI Credits", included: true },
      { text: "Priority Analytics", included: true },
      { text: "Standard Support", included: true },
      { text: "Custom Branding", included: false },
    ],
  },
  {
    id: PlanType.GROWTH,
    name: "Growth",
    description: "Scale your engagement with powerful AI tools.",
    price: 4999,
    icon: Zap,
    color: "text-orange-600",
    borderColor: "border-orange-300",
    bgColor: "bg-white",
    popular: true,
    buttonText: "Upgrade to Growth",
    rank: 2,
    features: [
      { text: "10 Active QR Codes", included: true, highlight: true },
      { text: "1,000 AI Credits", included: true, highlight: true },
      { text: "Advanced Analytics", included: true },
      { text: "Custom Branding", included: true },
      { text: "Custom AI Prompts", included: true },
    ],
  },
  {
    id: PlanType.PRO,
    name: "Pro",
    description: "Enterprise features for established chains.",
    price: 9999,
    icon: Crown,
    color: "text-orange-700",
    borderColor: "border-orange-400",
    bgColor: "bg-white",
    buttonText: "Get Pro Access",
    rank: 3,
    features: [
      { text: "100 Locations Support", included: true, highlight: true },
      { text: "1,000 QR Codes", included: true },
      { text: "10,000 AI Credits", included: true, highlight: true },
      { text: "Multi-user Access", included: true },
      { text: "White-label Reports", included: true },
    ],
  },
];
