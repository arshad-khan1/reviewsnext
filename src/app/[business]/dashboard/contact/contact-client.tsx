"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Headphones,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactChannels = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Support & Sales",
    value: "reveiwsnext.ai@gmail.com",
    href: "mailto:reveiwsnext.ai@gmail.com",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "All days, 9am-9pm",
    value: "+91-8668721925",
    href: "tel:+918668721925",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    description: "Quick chat",
    value: "+91 86687 21925",
    href: "https://wa.me/918668721925",
    isWhatsApp: true,
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

export default function ContactClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = contactSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof ContactFormData] =
              issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors in the form.");
        setIsSubmitting(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Headphones className="w-3 h-3" />
            Support
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            Contact Us
          </h1>
          <p className="text-slate-500 max-w-lg">
            Have questions or need help? Our team is ready to assist you with anything related to your ReviewFunnel account.
          </p>
        </div>

        {/* Quick Contact Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {contactChannels.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={
                channel.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all duration-200 flex items-center gap-4"
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  channel.bg,
                  channel.color,
                )}
              >
                <channel.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
                  {channel.description}
                </p>
                <h3 className="font-bold text-sm text-slate-900 leading-tight truncate">
                  {channel.value}
                </h3>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <Card className="lg:col-span-3 border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-900">
                Send us a message
              </CardTitle>
              <CardDescription>
                Fill out the form and we&apos;ll respond within a few hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className={cn(
                        "bg-slate-50/50 border-slate-200 rounded-xl h-11 focus:bg-white transition-all",
                        errors.name && "border-destructive",
                      )}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive font-medium">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        "bg-slate-50/50 border-slate-200 rounded-xl h-11 focus:bg-white transition-all",
                        errors.email && "border-destructive",
                      )}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive font-medium">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={handleChange}
                    className={cn(
                      "bg-slate-50/50 border-slate-200 rounded-xl h-11 focus:bg-white transition-all",
                      errors.subject && "border-destructive",
                    )}
                  />
                  {errors.subject && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={cn(
                      "bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white transition-all resize-none",
                      errors.message && "border-destructive",
                    )}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl text-base font-bold gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Response Time */}
            <Card className="border-slate-200 shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock className="w-20 h-20" />
              </div>
              <CardContent className="p-6 relative z-10 space-y-3">
                <CheckCircle2 className="w-8 h-8" />
                <h3 className="text-lg font-bold">Fast Response</h3>
                <p className="text-primary-foreground/80 text-sm leading-relaxed">
                  Our support team typically responds within 2-4 hours during business hours (9am - 9pm IST, all days).
                </p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Priority support for Pro
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Common Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    q: "How do I add more QR codes?",
                    a: "Go to QR Codes page and click 'Create QR Code'. Free plan allows 1 code, Pro allows unlimited.",
                  },
                  {
                    q: "Can I change my Google review link?",
                    a: "Yes! Edit any QR code and update the Google Maps link in its settings.",
                  },
                  {
                    q: "How do I upgrade my plan?",
                    a: "Click 'Upgrade Now' in the header or visit the Pricing page from settings.",
                  },
                ].map((faq, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">
                      {faq.q}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
