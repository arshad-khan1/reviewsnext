import { Building2, Fingerprint, Globe, TrendingUp } from "lucide-react";

export default function Stats() {
  return (
    <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm py-5">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Check-ins Today", value: "24.5k+", icon: Fingerprint },
          { label: "New Reviews", value: "1.2m+", icon: TrendingUp },
          { label: "Active Brands", value: "850+", icon: Building2 },
          { label: "Google Redirects", value: "98%", icon: Globe },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center space-y-2"
          >
            <div className="p-2 rounded-lg bg-primary/5 text-primary mb-2">
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
