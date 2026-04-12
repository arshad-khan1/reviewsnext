"use client";

import { motion } from "framer-motion";
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  Crown, 
  ArrowRight,
  Sparkles,
  Building2,
  QrCode,
  LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { useBusiness } from "@/hooks/use-business";

const tiers = [
  {
    name: "Starter (Trial)",
    id: "STARTER",
    price: "$0",
    description: "Perfect for exploring the local reputation boost.",
    features: [
      "10 AI Review Credits (Trial)",
      "1 Active QR Code",
      "Basic Analytics",
      "Standard Review Funnel",
      "Public Support"
    ],
    buttonText: "Current Plan",
    icon: ShieldCheck,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200"
  },
  {
    name: "Growth",
    id: "GROWTH",
    price: "$29",
    description: "Scale your reputation with automated AI engagement.",
    features: [
      "500 AI Credits / month",
      "5 Active QR Codes",
      "Priority Analytics",
      "Custom Branding",
      "Email Notifications",
      "Multi-location Support"
    ],
    buttonText: "Upgrade to Growth",
    icon: Zap,
    color: "text-indigo-600",
    bg: "bg-indigo-50/50",
    border: "border-indigo-100",
    popular: true
  },
  {
    name: "Pro",
    id: "PRO",
    price: "$79",
    description: "Full-scale reputation engine for established brands.",
    features: [
      "Unlimited AI Credits",
      "Unlimited QR Codes",
      "Full Custom API Access",
      "Dedicated Manager",
      "White-label Reports",
      "Advanced Sentiment Analysis"
    ],
    buttonText: "Get Pro Access",
    icon: Crown,
    color: "text-amber-600",
    bg: "bg-amber-50/50",
    border: "border-amber-100"
  }
];

export default function PricingPage() {
  const params = useParams();
  const businessSlug = params.business as string;
  const { data: business } = useBusiness(businessSlug);

  const currentPlan = business?.subscription?.plan || "STARTER";
  const isTrial = business?.subscription?.status === "TRIALING";

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600 uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" />
            Simple & Transparent Pricing
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight"
          >
            Choose the right plan for <br/> your <span className="text-indigo-600">business growth.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 max-w-2xl mx-auto text-lg"
          >
            From single locations to established chains, our plans are designed to help you capture more feedback and dominate local search.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.3 }}
            >
              <Card className={`relative flex flex-col h-full overflow-hidden transition-all duration-300 border-2 ${tier.popular ? 'border-indigo-500 shadow-xl scale-105 z-10' : 'border-transparent shadow-md hover:shadow-lg'}`}>
                {tier.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-indigo-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className={`pb-8 ${tier.bg}`}>
                  <div className={`w-12 h-12 rounded-2xl ${tier.bg} flex items-center justify-center ${tier.color} mb-4 shadow-sm border ${tier.border}`}>
                    <tier.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900">{tier.name}</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight text-slate-900">{tier.price}</span>
                    <span className="text-slate-500 font-bold">/mo</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                    {tier.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-8 flex-grow">
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Everything in {idx > 0 ? tiers[idx-1].name : "core"}:</p>
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-4 pb-8">
                  <Button 
                    className={`w-full h-12 rounded-xl font-black transition-all ${
                      (currentPlan === tier.id || (tier.id === 'STARTER' && isTrial))
                        ? "bg-slate-100 text-slate-400 cursor-default hover:bg-slate-100" 
                        : tier.popular
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 translate-y-[-2px]" 
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200"
                    }`}
                  >
                    {(currentPlan === tier.id || (tier.id === 'STARTER' && isTrial)) ? "Current Plan" : tier.buttonText}
                    {!(currentPlan === tier.id || (tier.id === 'STARTER' && isTrial)) && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 max-w-4xl mx-auto rounded-3xl bg-slate-900 p-8 lg:p-12 text-white overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight">Need a custom plan for your franchise?</h2>
              <p className="text-slate-400 font-medium">
                Manage 50+ locations, custom domains, and enterprise-grade reporting with a tailored solution.
              </p>
              <Button variant="outline" className="h-12 border-slate-700 hover:bg-slate-800 text-white font-bold bg-transparent gap-2 px-8">
                Contact Enterprise Support
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                 <Building2 className="w-6 h-6 text-indigo-400 mb-3" />
                 <h4 className="font-black text-lg">Multi-unit</h4>
                 <p className="text-xs text-slate-400 font-medium">Centralized control for chains.</p>
               </div>
               <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                 <LineChart className="w-6 h-6 text-emerald-400 mb-3" />
                 <h4 className="font-black text-lg">API First</h4>
                 <p className="text-xs text-slate-400 font-medium">Headless review management.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
