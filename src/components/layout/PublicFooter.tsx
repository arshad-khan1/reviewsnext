"use client";

import Link from "next/link";
import { Building2, CheckCircle2 } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="py-20 px-4 border-t border-border/50 bg-card/20 text-center">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-xl">
            ReviewFunnel
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground font-medium">
          <Link
            href="/pricing"
            className="hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          <Link href="/" className="hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/" className="hover:text-primary transition-colors">
            Testimonials
          </Link>
          <Link href="/" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
        </div>
        <p className="text-xs text-muted-foreground pt-8 flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-primary" />
          © 2026 ReviewFunnel SaaS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
