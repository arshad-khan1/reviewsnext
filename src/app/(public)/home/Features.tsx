import { motion } from "framer-motion";
import { BarChart3, QrCode, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Insightful Analytics",
    description:
      "Track performance across all locations with real-time conversion and rating analytics.",
    color: "hsl(var(--primary))",
  },
  {
    icon: ShieldCheck,
    title: "Smart Routing",
    description:
      "Filter negative feedback privately while directing positive reviews to Google Maps.",
    color: "hsl(152, 60%, 45%)",
  },
  {
    icon: Sparkles,
    title: "AI Response Assistant",
    description:
      "Generate professional, context-aware responses to boost engagement and brand voice.",
    color: "hsl(25, 95%, 53%)",
  },
  {
    icon: QrCode,
    title: "QR Code Management",
    description:
      "Manage unique QR assets for every physical branch with a click of a button.",
    color: "hsl(221, 83%, 53%)",
  },
];

export default function Features() {
  return (
    <section className="px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-center">
            Engineered for conversion and trust.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed text-center">
            We built the platform we wanted ourselves—fast, intelligent, and
            focused on tangible growth metrics for your business.
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
                style={{
                  backgroundColor: `${feature.color}15`,
                  color: feature.color,
                }}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
