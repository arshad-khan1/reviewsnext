import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-10">
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
        Turn every customer visit into{" "}
        <span className="text-primary italic">positive</span> feedback.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
      >
        Reviews Next AI helps multi-location businesses capture feedback at the
        point of scan, route high ratings to Google, and use AI to grow their
        online reputation automatically.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
      >
        <Link href="/onboard">
          <Button
            size="lg"
            className="h-14 px-8 text-lg shadow-xl shadow-primary/20 gap-2"
          >
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
  );
}
