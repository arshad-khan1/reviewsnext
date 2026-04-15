"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
  Globe,
  Wand2,
  MapPin,
  CheckCircle2,
  Phone,
  Lock,
  Building2,
  LayoutGrid,
  Contact,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react";

import { PhoneInput } from "react-international-phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlanType } from "@prisma/client";

const INDUSTRIES = [
  "Restaurants & Cafes",
  "E-commerce & Retail",
  "Health & Wellness",
  "Real Estate",
  "Automotive Services",
  "Hospitality & Tourism",
  "Professional Services",
  "Beauty & Personal Care",
  "Education & Training",
  "Home Services",
  "Financial Services",
  "Technology & Software",
  "Entertainment & Events",
  "Other",
];

const COMMENT_STYLES = [
  { label: "Professional & Polite", icon: "🏢" },
  { label: "Friendly & Casual", icon: "😊" },
  { label: "Witty & Fun", icon: "🎉" },
  { label: "Enthusiastic & Warm", icon: "❤️" },
  { label: "Hinglish (Hindi + English)", icon: "🇮🇳" },
];

import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import { toast } from "sonner";
import { setAccessToken } from "@/lib/api-client";
import {
  step1Schema,
  step2Schema,
  step3Schema,
} from "@/app/onboard/validation";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    ownerName: "",
    phone: "+91",
    logo: null as string | null,
    logoFile: null as File | null,
    minRatingToExternal: "3",
    googleMapsUrl: "",
    aiPrompt: "",
    commentStyle: "Professional & Polite",
    location: "",
    plan: PlanType.FREE as string,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.phone) {
      setFormData((prev) => ({ ...prev, phone: user.phone }));
      setIsPhoneVerified(true);
    }
  }, [user]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    // Validate current step before proceeding
    let result;
    if (step === 1) result = step1Schema.safeParse(formData);
    if (step === 2) result = step2Schema.safeParse(formData);

    if (result && !result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[String(issue.path[0])] = issue.message;
      });
      setFormErrors(errors);
      toast.error("Please fix the errors before proceeding.");
      return;
    }

    setFormErrors({});
    setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => {
    setFormErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ logoFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone) return;
    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone: formData.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setOtpSent(true);
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const setUser = useAuthStore((state) => state.setUser);

  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) return;
    setIsVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone: formData.phone, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      setFormErrors({});
      updateFormData({ ownerName: data.user.name || "" });
      setIsPhoneVerified(true);
      // Store the access token in localStorage (the shared store used everywhere in the app)
      if (data.accessToken) {
        setAccessToken(data.accessToken);
      }
      setUser(data.user);

      toast.success("Phone verified successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const handleGeneratePrompt = async () => {
    const wordCount = formData.aiPrompt
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    if (wordCount < 10) {
      toast.error(
        "Please provide at least 10 words about your business first.",
      );
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const res = await fetch("/api/public/ai/generate-system-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords: formData.aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate prompt");

      updateFormData({ aiPrompt: data.prompt });
      toast.success("Prompt refined with AI! ✨");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleSubmit = async () => {
    // Validate step 3 fields before final submission
    const step3Result = step3Schema.safeParse(formData);
    if (!step3Result.success) {
      const errors: Record<string, string> = {};
      step3Result.error.issues.forEach(
        (issue: { path: any[]; message: string }) => {
          errors[String(issue.path[0])] = issue.message;
        },
      );
      setFormErrors(errors);
      toast.error("Please fix the errors before finishing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("industry", formData.industry);
      body.append("location", formData.location);
      body.append("ownerName", formData.ownerName);
      body.append("acceptedStarsThreshold", formData.minRatingToExternal);
      body.append("defaultGoogleMapsLink", formData.googleMapsUrl);
      body.append("defaultAiPrompt", formData.aiPrompt);
      body.append("defaultCommentStyle", formData.commentStyle);
      body.append("plan", formData.plan);

      if (formData.logoFile) {
        body.append("logo", formData.logoFile);
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body,
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to complete onboarding");

      // Refresh the token so the JWT payload now includes the newly created business.
      // Without this, ProtectedRoute reads stale user.businesses = [] and bounces back to /onboard.
      try {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setAccessToken(refreshData.accessToken);
          // Re-init auth store from new token so businesses list is up-to-date
          useAuthStore.getState().initFromToken(refreshData.accessToken);
        }
      } catch {
        // Non-fatal: navigation will still proceed; the dashboard may show stale data briefly
      }

      toast.success("Onboarding complete! Welcome aboard.");
      router.push(data.redirectTo);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center border-2 border-dashed border-border group-hover:border-primary/50 transition-colors overflow-hidden">
                    {formData.logo ? (
                      <Image
                        src={formData.logo}
                        alt="Logo Preview"
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    type="file"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*, image/svg+xml, .svg"
                  />
                </div>
                <Label>Business Logo</Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <Label htmlFor="name">Business Name</Label>
                </div>
                <Input
                  id="name"
                  placeholder="e.g. Blue Bottle Coffee"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className={formErrors.name ? "border-destructive" : ""}
                />
                {formErrors.name && (
                  <p className="text-[10px] text-destructive font-medium">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <Label htmlFor="location">Location</Label>
                </div>
                <Input
                  id="location"
                  placeholder="e.g. New York, NY"
                  value={formData.location}
                  onChange={(e) => updateFormData({ location: e.target.value })}
                  className={formErrors.location ? "border-destructive" : ""}
                />
                {formErrors.location && (
                  <p className="text-[10px] text-destructive font-medium">
                    {formErrors.location}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  <Label htmlFor="industry">Industry</Label>
                </div>
                <select
                  id="industry"
                  className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all border-border/50 ${
                    formErrors.industry ? "border-destructive" : ""
                  }`}
                  value={formData.industry}
                  onChange={(e) => updateFormData({ industry: e.target.value })}
                >
                  <option value="" disabled>
                    Select an industry...
                  </option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                {formErrors.industry && (
                  <p className="text-[10px] text-destructive font-medium">
                    {formErrors.industry}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Contact className="w-4 h-4 text-primary" />
                  <Label htmlFor="ownerName">Your Name</Label>
                </div>
                <Input
                  id="ownerName"
                  placeholder="e.g. John Doe"
                  value={formData.ownerName}
                  onChange={(e) =>
                    updateFormData({ ownerName: e.target.value })
                  }
                  className={formErrors.ownerName ? "border-destructive" : ""}
                />
                {formErrors.ownerName && (
                  <p className="text-[10px] text-destructive font-medium">
                    {formErrors.ownerName}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <PhoneInput
                        defaultCountry="in"
                        value={formData.phone}
                        onChange={(phone) => updateFormData({ phone })}
                        disabled={isPhoneVerified}
                        inputClassName="flex-1"
                        forceDialCode={true}
                      />
                    </div>
                    {!isPhoneVerified && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSendOtp}
                        disabled={!formData.phone || isSendingOtp}
                        className="shrink-0"
                      >
                        {isSendingOtp
                          ? "Sending..."
                          : otpSent
                            ? "Resend"
                            : "Send OTP"}
                      </Button>
                    )}
                    {isPhoneVerified && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-500 rounded-md text-xs font-medium border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>

                {otpSent && !isPhoneVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="otp"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="tracking-widest font-mono"
                        maxLength={6}
                        disabled={isVerifyingOtp}
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpCode.length < 4 || isVerifyingOtp}
                      >
                        {isVerifyingOtp ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        const routingCutoff = Number(formData.minRatingToExternal);
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            {/* The Customer Journey Visualization */}
            <div className="space-y-6">
              {/* Interactive Sensitivity Bar */}
              <div className="space-y-8 p-8 rounded-[40px] bg-slate-50/50 border border-slate-100 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Routing Sensitivity
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 py-1 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-white font-black text-[10px]">
                          !
                        </div>
                        <span className="text-slate-600 font-bold text-xs uppercase tracking-tight">
                          {routingCutoff} Stars & Below
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="text-orange-600 text-[10px] font-black uppercase tracking-wider">
                        Internal
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-1 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <span className="text-slate-600 font-bold text-xs uppercase tracking-tight">
                          Above {routingCutoff} Stars
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                        Google
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative px-4">
                  {/* Background Track */}
                  <div className="absolute top-1/2 left-0 w-full h-[6px] -translate-y-1/2 bg-emerald-600/20 rounded-full" />
                  {/* Selection Track */}
                  <div
                    className="absolute top-1/2 left-0 h-[6px] -translate-y-1/2 bg-orange-600 rounded-full transition-all duration-500 z-0 shadow-[0_0_10px_rgba(234,88,12,0.3)]"
                    style={{ width: `${(routingCutoff - 1) * 25}%` }}
                  />

                  <div className="relative flex w-full justify-between px-1">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const isInternal = s <= routingCutoff;
                      const isSelected =
                        s === Number(formData.minRatingToExternal);
                      return (
                        <button
                          key={s}
                          onClick={() =>
                            updateFormData({ minRatingToExternal: String(s) })
                          }
                          className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 font-black border-2 z-10 text-base shadow-lg ring-8 ring-white
                            ${
                              isInternal
                                ? "bg-orange-600 border-orange-600 text-white shadow-orange-200"
                                : "bg-emerald-600 border-emerald-600 text-white shadow-emerald-200"
                            }
                            ${isSelected ? "scale-125 z-20" : "scale-100"}
                            hover:scale-110
                          `}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between w-full text-[10px] font-black text-slate-400 uppercase mt-2 px-1">
                  <span>Critical</span>
                  <span>Perfect</span>
                </div>
              </div>
            </div>

            {/* Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={cn(
                  "p-6 rounded-[32px] border transition-all duration-500 flex flex-col gap-3",
                  "bg-orange-50/50 border-orange-100 shadow-orange-50/50 shadow-lg",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-black text-xs">
                    !
                  </div>
                  <span className="text-orange-900 font-black text-[10px] uppercase tracking-wider">
                    {routingCutoff} Stars & Below
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Internal Feedback
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Customers can tell you what went wrong and how you can
                    improve. This feedback is handled internally so you can
                    resolve issues privately.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2 text-orange-600">
                  <Lock className="w-3 h-3" />
                  <span className="text-[10px] font-bold italic">
                    Private Channel
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "p-6 rounded-[32px] border transition-all duration-500 flex flex-col gap-3",
                  "bg-emerald-50/50 border-emerald-100 shadow-emerald-50/50 shadow-lg",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black italic">
                    ★
                  </div>
                  <span className="text-emerald-800 font-black text-[10px] uppercase tracking-wider">
                    Above {routingCutoff} Stars
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Google Review
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    AI generates a positive comment for the customer, which they
                    can then post directly to Google Maps to boost your ranking.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2 text-emerald-600">
                  <Globe className="w-3 h-3" />
                  <span className="text-[10px] font-bold italic">
                    Public Reputation
                  </span>
                </div>
              </div>
            </div>

            {/* Infographic Summary */}
            <div className="bg-white/50 border border-slate-100 rounded-[32px] p-6 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                Smart Filtering Active
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-sm mx-auto">
                By filtering out lower ratings, you maintain a{" "}
                <span className="text-emerald-600 font-bold italic">
                  higher average score
                </span>{" "}
                while still receiving the feedback you need to improve.
              </p>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <Label htmlFor="map">Google Maps Review URL</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="map"
                    placeholder="https://g.page/r/..."
                    value={formData.googleMapsUrl}
                    onChange={(e) =>
                      updateFormData({ googleMapsUrl: e.target.value })
                    }
                    className={
                      formErrors.googleMapsUrl ? "border-destructive" : ""
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-slate-50 hover:bg-slate-100 border-slate-200"
                    onClick={() => {
                      const effectiveLink = formData.googleMapsUrl;
                      if (effectiveLink) window.open(effectiveLink, "_blank");
                    }}
                    disabled={!formData.googleMapsUrl}
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-800" />
                  </Button>
                </div>

                {formErrors.googleMapsUrl && (
                  <p className="text-[10px] text-destructive font-medium">
                    {formErrors.googleMapsUrl}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-primary" />
                    <Label htmlFor="prompt" className="font-bold">
                      AI Custom Guiding Prompt
                    </Label>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Tell us about your business and what the AI should emphasize
                    (e.g., your specialty, ambiance, or service) to generate
                    more personalized and authentic review suggestions.
                  </p>
                </div>
                <div className="relative group">
                  <Textarea
                    id="prompt"
                    placeholder='e.g., "We are a high-end Italian restaurant in South Mumbai known for our wood-fired pizzas and homemade pasta. Please focus on the quality of our ingredients, the romantic candlelight ambiance, and our extensive wine list curated by our in-house sommelier."'
                    rows={6}
                    value={formData.aiPrompt}
                    onChange={(e) =>
                      updateFormData({ aiPrompt: e.target.value })
                    }
                    className={cn(
                      "resize-none bg-slate-50/50 focus:bg-white transition-all duration-300 pb-12",
                      formErrors.aiPrompt ? "border-destructive" : "",
                    )}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    {formData.aiPrompt.trim().split(/\s+/).filter(Boolean)
                      .length < 10 &&
                      formData.aiPrompt.length > 0 && (
                        <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-full animate-pulse">
                          Tell us more to enable AI{" "}
                          {10 -
                            formData.aiPrompt
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean).length}
                        </span>
                      )}
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleGeneratePrompt}
                      disabled={
                        isGeneratingPrompt ||
                        formData.aiPrompt.trim().split(/\s+/).filter(Boolean)
                          .length < 5
                      }
                      className={cn(
                        "h-8 text-[10px] gap-1.5 rounded-lg transition-all duration-500",
                        formData.aiPrompt.trim().split(/\s+/).filter(Boolean)
                          .length >= 10
                          ? "bg-indigo-600 hover:bg-slate-900 text-white shadow-lg shadow-indigo-200"
                          : "bg-slate-100 text-slate-400 border-slate-200",
                      )}
                    >
                      {isGeneratingPrompt ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Refine with AI
                    </Button>
                  </div>
                </div>
                {formErrors.aiPrompt && (
                  <p className="text-[10px] text-destructive font-medium">
                    {formErrors.aiPrompt}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="style" className="font-bold">
                    AI Voice Style
                  </Label>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Choose the personality that best matches your brand voice.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COMMENT_STYLES.map((style) => {
                    const isSelected = formData.commentStyle === style.label;
                    return (
                      <button
                        key={style.label}
                        type="button"
                        onClick={() =>
                          updateFormData({ commentStyle: style.label })
                        }
                        className={cn(
                          "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/10 shadow-md"
                            : "border-border bg-card/50 hover:border-primary/30 hover:bg-slate-50",
                        )}
                      >
                        <span className="text-xl">{style.icon}</span>
                        <span className="text-xs font-bold text-slate-700">
                          {style.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white scale-110 shadow-sm">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grow flex flex-col items-center justify-center p-4 pt-20 pb-20 min-h-[calc(100vh-64px)] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 blur-[120px] rounded-full" />
      </div>

      <div
        className={cn(
          "w-full transition-all duration-500",
          step === 4 ? "max-w-6xl" : "max-w-xl",
        )}
      >
        {/* Progress Section */}

        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-1.5" />
        </div>

        <Card className="border-border/50 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm relative overflow-hidden">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Basic Information"}
              {step === 2 && "Review Routing"}
              {step === 3 && "AI & Google Integration"}
            </CardTitle>
            <CardDescription>
              {step === 1 &&
                "Tell us about your business and add your branding."}
              {step === 2 &&
                "Configure how reviews are handled across platforms."}
              {step === 3 &&
                "Set up your Google links and customize the AI feedback assistant."}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[380px]">
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/50 pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={nextStep} className="gap-2 px-8">
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gap-2 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Finishing..." : "Finish & Start Free Trial"}
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Globe className="w-3 h-3" />
          Your dashboard will be ready instantly after this.
        </p>
      </div>
    </div>
  );
}
