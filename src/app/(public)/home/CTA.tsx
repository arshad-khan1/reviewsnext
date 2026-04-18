import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-4">
      <div className="max-w-5xl mx-auto rounded-[3rem] bg-primary p-12 lg:p-20 text-primary-foreground text-center relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
            Ready to transform your business reputation?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Join 800+ businesses using ReviewFunnel to capture more reviews and
            dominate their local market.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/onboard">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-black/20"
              >
                Start Onboarding
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/20 border-2 border-primary"
                  />
                ))}
              </div>
              <p>12,000+ happy customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
