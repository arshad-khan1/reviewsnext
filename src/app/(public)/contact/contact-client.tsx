"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
            fieldErrors[issue.path[0] as keyof ContactFormData] = issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors in the form.");
        setIsSubmitting(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Message sent! We'll get back to you soon. ✨");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Support & Sales",
      value: "reveiwsnext.ai@gmail.com",
      href: "mailto:reveiwsnext.ai@gmail.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Mon-Fri, 9am-6pm",
      value: "+91-8668721925",
      href: "tel:+918668721925",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      description: "Say Hi",
      value: "+91 86687 21925",
      href: "https://wa.me/918668721925",
      isWhatsApp: true,
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Headquarters",
      value: "Nagpur, MH",
      href: "https://maps.google.com/?q=Nagpur+MH",
    },
  ];

  return (
    <div className="text-foreground pt-40 pb-32 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl -z-10 h-full pointer-events-none opacity-40">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-secondary/30 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Info & Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
              >
                <MessageSquare className="w-3 h-3" />
                We&apos;re here to help
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1]"
              >
                Let&apos;s start a{" "}
                <span className="text-primary italic">conversation</span>.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-lg max-w-lg leading-relaxed"
              >
                Have questions about our AI features or pricing? Our team is
                ready to help you scale your business reputation.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contactInfo.map((info, i) => (
                <motion.a
                  key={info.title}
                  href={info.href}
                  target={info.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    info.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="group p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-300 flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                      info.isWhatsApp
                        ? "bg-green-500/10 text-green-600"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <info.icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1 truncate">
                      {info.description}
                    </p>
                    <h3 className="font-bold text-sm leading-tight truncate">
                      {info.value}
                    </h3>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="p-8 rounded-4xl bg-primary text-primary-foreground relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Clock className="w-24 h-24" />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-bold">Fast Response Times</h3>
                <p className="text-primary-foreground/80 text-sm">
                  Our support team typically responds within 2-4 hours during
                  business hours. For urgent enterprise issues, we offer 24/7
                  priority support.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  SLA Guaranteed for Enterprise
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="rounded-[3rem] border-border/50 shadow-2xl shadow-primary/5 overflow-hidden glass-card">
              <CardHeader className="p-8 lg:p-12 pb-0">
                <CardTitle className="text-3xl font-bold">
                  Send a message
                </CardTitle>
                <CardDescription className="text-base">
                  Fill out the form below and we&apos;ll get back to you as soon
                  as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 lg:px-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className={cn(
                          "bg-muted/30 border-border/50 rounded-xl h-12 focus:bg-background transition-all",
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
                          "bg-muted/30 border-border/50 rounded-xl h-12 focus:bg-background transition-all",
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
                        "bg-muted/30 border-border/50 rounded-xl h-12 focus:bg-background transition-all",
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
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className={cn(
                        "bg-muted/30 border-border/50 rounded-2xl focus:bg-background transition-all resize-none",
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
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
