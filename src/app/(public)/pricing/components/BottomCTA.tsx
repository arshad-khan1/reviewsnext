import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BottomCTA() {
  return (
    <section className="py-32 px-4">
      <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-slate-900 p-12 lg:p-16 text-white text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl lg:text-5xl font-black tracking-tight">
            Still have questions?
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Our team is ready to help you find the best setup for your unique
            business needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboard">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20"
              >
                Try Risk Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10 h-14 px-8 text-lg font-bold rounded-2xl"
            >
              Chat with Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
