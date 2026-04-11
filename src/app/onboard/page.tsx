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
  Sparkles,
  Phone,
  Star,
  Lock,
  QrCode,
  ArrowRightCircle,
  Building2,
  LayoutGrid,
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
import Image from "next/image";

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
  "Professional & Polite",
  "Friendly & Casual",
  "Concise & Direct",
  "Enthusiastic & Warm",
];

import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    phone: "+91",
    logo: null as string | null,
    minRatingToExternal: "4",
    googleMapsUrl: "",
    aiPrompt: "",
    commentStyle: "Professional & Polite",
    location: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

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

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const isStepValid = () => {
    if (step === 1)
      return (
        formData.name && formData.industry && formData.phone && formData.location && isPhoneVerified
      );
    if (step === 2) return true; // Threshold always has default
    if (step === 3) return formData.googleMapsUrl && formData.aiPrompt;
    return true;
  };

  const handleSendOtp = () => {
    if (!formData.phone) return;
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otpCode.length < 4) return;
    // Simulate verification
    setIsPhoneVerified(true);
  };

  const handleSubmit = () => {
    // Simulate API call
    router.push("/businesses");
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
                    accept="image/*"
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
                />
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
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  <Label htmlFor="industry">Industry</Label>
                </div>
                <select
                  id="industry"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all border-border/50"
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
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpCode.length < 4}
                      >
                        Verify
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* The Customer Journey Visualization */}
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold tracking-tight">
                  The Customer Journey
                </h3>
                <p className="text-xs text-muted-foreground">
                  See exactly what your customer experiences
                </p>
              </div>

              <div className="relative flex justify-between items-center px-4 max-w-sm mx-auto">
                {/* Step 1: Scan */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-tighter">
                    1. Scan QR
                  </span>
                </div>

                <div className="flex-1 h-px border-t border-dashed border-muted-foreground/30 mx-2 relative top-[-8px]">
                  <ArrowRightCircle className="absolute right-0 -top-1.5 w-3 h-3 text-muted-foreground/30" />
                </div>

                {/* Step 2: Rate */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 shadow-inner">
                    <Star className="w-5 h-5 fill-yellow-500/20" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-tighter">
                    2. Leave Rating
                  </span>
                </div>

                <div className="flex-1 h-px border-t border-dashed border-muted-foreground/30 mx-2 relative top-[-8px]">
                  <ArrowRightCircle className="absolute right-0 -top-1.5 w-3 h-3 text-muted-foreground/30" />
                </div>

                {/* Step 3: Result (Mockup) */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-14 h-24 rounded-xl border-[3px] border-muted bg-card shadow-xl flex flex-col items-center p-1 relative overflow-hidden ring-1 ring-border">
                    <div className="w-3 h-1 bg-muted rounded-full mb-1" />

                    {/* Dynamic Content inside Mockup */}
                    <AnimatePresence mode="wait">
                      {Number(formData.minRatingToExternal) <= 4 ? (
                        <motion.div
                          key="google-result"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex flex-col items-center justify-center h-full gap-1 w-full"
                        >
                          <div className="w-5 h-5 rounded bg-green-500/10 flex items-center justify-center text-green-600">
                            <MapPin className="w-3 h-3" />
                          </div>
                          <span
                            className="text-center font-bold text-green-600"
                            style={{ fontSize: "4px", lineHeight: "1.2" }}
                          >
                            TO GOOGLE MAPS
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="form-result"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex flex-col items-center justify-center h-full gap-1 w-full"
                        >
                          <div className="w-5 h-5 rounded bg-orange-500/10 flex items-center justify-center text-orange-600">
                            <Lock className="w-3 h-3" />
                          </div>
                          <div className="w-full space-y-[2px] px-1">
                            <div className="w-full h-[1px] bg-muted-foreground/20" />
                            <div className="w-3/4 h-[1px] bg-muted-foreground/20" />
                            <div className="w-full h-1 bg-primary/20 rounded-[1px]" />
                          </div>
                          <span
                            className="text-center font-bold uppercase"
                            style={{ fontSize: "4px", lineHeight: "1.2" }}
                          >
                            INTERNAL FEEDBACK
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-tighter">
                    3. Outcome
                  </span>
                </div>
              </div>
            </div>

            {/* Threshold Selector with intuitive labels */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex justify-between items-center px-1">
                <div className="space-y-1">
                  <Label className="text-base font-bold">
                    Route Rating to Google if:
                  </Label>
                  <p className="text-[10px] text-muted-foreground font-medium italic">
                    Ratings below this will be caught by our internal form.
                  </p>
                </div>
                <div className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase tracking-widest border border-orange-500/20">
                  Recommended: 4
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center">
                {["1", "2", "3", "4", "5"].map((val) => {
                  const isPublic =
                    Number(val) >= Number(formData.minRatingToExternal);
                  const isSelected = formData.minRatingToExternal === val;

                  return (
                    <button
                      key={val}
                      onClick={() =>
                        updateFormData({ minRatingToExternal: val })
                      }
                      className={`group relative p-3 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? "border-orange-500 bg-orange-500/5 ring-4 ring-orange-500/10 scale-[1.05] shadow-lg shadow-orange-500/5"
                          : "border-border hover:border-primary/50 bg-card/30"
                      }`}
                    >
                      <div
                        className={`text-lg font-black mb-0.5 transition-colors ${
                          isSelected
                            ? isPublic
                              ? "text-green-500"
                              : "text-red-500"
                            : isPublic
                              ? "text-green-500/50 group-hover:text-green-500"
                              : "text-red-500/50 group-hover:text-red-500"
                        }`}
                      >
                        {val} ★
                      </div>
                      {isSelected && (
                        <div
                          className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in-50 duration-300 ${
                            isPublic ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Summary Note */}
              <motion.div
                key={formData.minRatingToExternal}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-[13px] font-medium flex items-start gap-3 shadow-sm ${
                  Number(formData.minRatingToExternal) <= 3
                    ? "bg-red-500/5 border-red-500/10 text-red-600"
                    : "bg-green-500/5 border-green-500/10 text-green-600"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${Number(formData.minRatingToExternal) <= 3 ? "bg-red-500/10" : "bg-green-500/10"}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="leading-relaxed">
                  Currently, ratings from{" "}
                  <span className="font-bold underline text-foreground">
                    {formData.minRatingToExternal} to 5 stars
                  </span>{" "}
                  will go directly to your Google listing. All lower ratings
                  will stay private for you to resolve internally and will be
                  visible only to you in dashboard.
                </p>
              </motion.div>
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
                <Input
                  id="map"
                  placeholder="https://g.page/r/..."
                  value={formData.googleMapsUrl}
                  onChange={(e) =>
                    updateFormData({ googleMapsUrl: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  <Label htmlFor="prompt">AI Custom Guiding Prompt</Label>
                </div>
                <Textarea
                  id="prompt"
                  placeholder="Tell the AI what to focus on (e.g. 'Mention the fresh beans' or 'Highlight our friendly staff')"
                  rows={4}
                  value={formData.aiPrompt}
                  onChange={(e) => updateFormData({ aiPrompt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">AI Voice Style</Label>
                <select
                  id="style"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all border-border/50"
                  value={formData.commentStyle}
                  onChange={(e) =>
                    updateFormData({ commentStyle: e.target.value })
                  }
                >
                  {COMMENT_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Onboard Your Business
          </h1>
        </div>

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
              <Button
                onClick={nextStep}
                className="gap-2 px-8"
                disabled={!isStepValid()}
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gap-2 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                disabled={!isStepValid()}
              >
                Finish Onboarding
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
