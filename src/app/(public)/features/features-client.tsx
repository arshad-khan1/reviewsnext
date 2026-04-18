"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Sparkles,
  BarChart3,
  QrCode,
  ArrowRight,
  Building2,
  Lock,
  Globe,
  MessageSquare,
  Target,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function FeaturesClient() {
  const customerFeatures = [
    {
      title: "AI-Enhanced Impact",
      description: "Leave a positive, impactful review with one click.",
      longDescription:
        "Our AI assistant helps customers articulate their positive experiences perfectly. It transforms their thoughts into professional, detailed reviews that resonate with potential leads.",
      icon: Sparkles,
      tag: "Customer AI",
    },
    {
      title: "Smart Internal Routing",
      description: "If expectations weren't met, we listen privately.",
      longDescription:
        "If a customer isn't satisfied, our system automatically directs them to a private internal feedback form. This ensures their voice is heard directly by management without impacting your public reputation.",
      icon: ShieldCheck,
      tag: "Resolution",
    },
  ];

  const businessFeatures = [
    {
      title: "Rank at the Top",
      description: "Dominate local search rankings.",
      longDescription:
        "By focusing on positive review generation and filtering negative noise, we help your business climb Google Maps rankings and stay there.",
      icon: Target,
      tag: "Growth",
    },
    {
      title: "QR & Interaction Tracking",
      description: "Monitor every scan and review.",
      longDescription:
        "Track exactly how many customers are scanning your codes versus how many are leaving reviews. Optimize your physical locations with real-time conversion data.",
      icon: QrCode,
      tag: "Analytics",
    },
    {
      title: "Sentiment Intelligence",
      description: "A broader look at your business health.",
      longDescription:
        "We analyze the language and patterns in your feedback to give you a 'sentiment score' across branches. Understand the 'why' behind the ratings.",
      icon: BarChart3,
      tag: "Insights",
    },
    {
      title: "Multi-Branch Management",
      description: "One dashboard for every location.",
      longDescription:
        "Whether you have 2 locations or 200, track and compare performance, manage QR assets, and respond to feedback from a single, unified interface.",
      icon: Building2,
      tag: "Enterprise",
    },
  ];

  return (
    <div className="text-foreground pt-40 pb-32 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl -z-10 h-full pointer-events-none opacity-40">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-secondary/30 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600"
          >
            <Search className="w-3 h-3" />
            Designed for Local SEO Dominance
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05]"
          >
            Rank your business at the{" "}
            <span className="text-emerald-600 italic">top</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed"
          >
            We help you capture positive momentum and resolve friction
            privately. The result? A pristine public reputation and higher
            search rankings.
          </motion.p>
        </div>

        {/* Section 1: The Customer Experience */}
        <section className="mb-40">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  The Customer Journey
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Seamless for them. <br />
                  <span className="text-muted-foreground">
                    Strategic for you.
                  </span>
                </h2>
              </div>

              <div className="space-y-6">
                {customerFeatures.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 p-6 rounded-[2.5rem] bg-card/50 border border-border/50 hover:bg-card hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.longDescription}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex-1 order-1 lg:order-2">
              {/* Mockup Element: Visual representation of routing */}
              <div className="p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative">
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent rounded-[3rem]" />
                <div className="relative space-y-8">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-50">
                      Review Funnel Preview
                    </span>
                  </div>

                  <div className="space-y-8 py-4">
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                        Positive Outcome
                      </p>
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium">
                          Redirecting to Google Maps + AI Help ✨
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
                        Resolution Needed
                      </p>
                      <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium">
                          Opening Internal Resolution Desk
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Business Intelligence */}
        <section className="space-y-16 mb-40">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              For Your Business
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Intelligence that drives{" "}
              <span className="text-primary italic">growth</span>.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Go beyond simple ratings. Get the data you need to improve your
              operations without ever risking your public standing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="rounded-[2.5rem] border-border/50 h-full overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group border-b-4 border-b-transparent hover:border-b-primary">
                  <CardContent className="p-8 space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black tracking-tight">
                          {feature.title}
                        </h3>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                          {feature.tag}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.longDescription}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-24 rounded-[4rem] bg-slate-900 text-white text-center space-y-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary blur-[120px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-10">
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight">
                Stop losing leads to <br />
                <span className="text-destructive">mediocre ratings</span>.
              </h2>
              <p className="text-white/70 text-xl max-w-2xl mx-auto leading-relaxed">
                Start your journey to the top of Google Search today. Resolve
                issues privately and showcase your excellence publicly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link href="/onboard">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 h-16 px-12 text-xl font-black rounded-2xl shadow-2xl shadow-primary/20 gap-3 group"
                >
                  Start Your Growth
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-12 text-xl font-bold border-white/20 hover:bg-white/10 text-white hover:text-white/90 bg-transparent"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>

            <div className="pt-10 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
              {/* Minimalist Trust Badges */}
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">
                  SLA Guaranteed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Data Private
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
