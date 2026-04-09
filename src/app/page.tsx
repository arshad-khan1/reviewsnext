"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Building2, 
  ArrowRight, 
  BarChart3, 
  ShieldCheck, 
  QrCode, 
  Sparkles,
  CheckCircle2,
  Globe,
  TrendingUp,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BarChart3,
    title: "Insightful Analytics",
    description: "Track performance across all locations with real-time conversion and rating analytics.",
    color: "hsl(var(--primary))"
  },
  {
    icon: ShieldCheck,
    title: "Smart Routing",
    description: "Filter negative feedback privately while directing positive reviews to Google Maps.",
    color: "hsl(152, 60%, 45%)"
  },
  {
    icon: Sparkles,
    title: "AI Response Assistant",
    description: "Generate professional, context-aware responses to boost engagement and brand voice.",
    color: "hsl(25, 95%, 53%)"
  },
  {
    icon: QrCode,
    title: "QR Code Management",
    description: "Manage unique QR assets for every physical branch with a click of a button.",
    color: "hsl(221, 83%, 53%)"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-xl">ReviewFunnel</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Business Login</Button>
            </Link>
            <Link href="/onboard">
              <Button className="shadow-lg shadow-primary/20">Join Now</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        {/* Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl -z-10 h-full pointer-events-none opacity-40">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-secondary/30 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Review Management for Modern SaaS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight"
          >
            Turn every customer visit into <span className="text-primary italic">positive</span> feedback.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            ReviewFunnel helps multi-location businesses capture feedback at the point of scan, 
            route high ratings to Google, and use AI to grow their online reputation automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/onboard">
              <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 gap-2">
                Onboard Your Business
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                Business Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Check-ins Today", value: "24.5k+", icon: Fingerprint },
            { label: "New Reviews", value: "1.2m+", icon: TrendingUp },
            { label: "Active Brands", value: "850+", icon: Building2 },
            { label: "Google Redirects", value: "98%", icon: Globe }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/5 text-primary mb-2">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-center">Engineered for conversion and trust.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed text-center">
              We built the platform we wanted ourselves—fast, intelligent, and focused on tangible growth metrics for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-primary p-12 lg:p-20 text-primary-foreground text-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">Ready to transform your business reputation?</h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Join 800+ businesses using ReviewFunnel to capture more reviews and dominate their local market.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/onboard">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-black/20">
                  Start Onboarding
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-primary" />
                  ))}
                </div>
                <p>12,000+ happy customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 border-t border-border/50 bg-card/20 text-center">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-xl">ReviewFunnel</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/" className="hover:text-primary transition-colors">Features</Link>
            <Link href="/" className="hover:text-primary transition-colors">Testimonials</Link>
            <Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-xs text-muted-foreground pt-8 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            © 2026 ReviewFunnel SaaS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
