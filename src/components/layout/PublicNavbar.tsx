"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground transition-transform group-hover:scale-110">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-xl">ReviewFunnel</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm hover:text-primary transition-colors hidden md:block"
          >
            Pricing
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Business Login
            </Button>
          </Link>
          <Link href="/onboard">
            <Button className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
