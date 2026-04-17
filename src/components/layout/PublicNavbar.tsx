"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Building2, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group relative z-50">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground transition-transform group-hover:scale-110">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-xl">ReviewFunnel</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <Button
                variant="ghost"
                className={
                  pathname === link.href
                    ? "text-primary bg-primary/10 hover:bg-primary/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {link.name}
              </Button>
            </Link>
          ))}
          <Link href="/login">
            <Button
              variant="ghost"
              className={
                pathname === "/login"
                  ? "text-primary bg-primary/10 hover:bg-primary/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              Business Login
            </Button>
          </Link>
          <div className="w-px h-4 bg-border/60 mx-1" />
          <Link href="/onboard">
            <Button className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-bold ml-1">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/onboard">
            <Button size="sm" className="h-9 px-4 text-xs font-bold">
              Join Now
            </Button>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 -mr-2 text-foreground focus:outline-none relative z-50"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border/10 bg-background overflow-hidden"
          >
            <div className="px-4 py-8 space-y-6">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                      pathname === link.href
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-lg font-bold">{link.name}</span>
                    <ArrowRight
                      className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${pathname === link.href ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    />
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                    pathname === "/login"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-lg font-bold">Business Login</span>
                  <ArrowRight
                    className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${pathname === "/login" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  />
                </Link>
              </div>

              <div className="pt-4 border-t border-border/10">
                <Link href="/onboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full h-14 rounded-2xl text-lg font-bold gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
