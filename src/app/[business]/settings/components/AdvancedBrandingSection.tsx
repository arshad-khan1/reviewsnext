"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Palette,
  Sparkles,
  Save,
  Loader2,
  Edit3,
  MessageSquare,
  ImageIcon,
  ShieldCheck,
  Layout,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, getContrastColor } from "@/lib/utils";

interface AdvancedBrandingSectionProps {
  business: any;
  updateBusinessMutation: any;
}

export function AdvancedBrandingSection({
  business,
  updateBusinessMutation,
}: AdvancedBrandingSectionProps) {
  const branding = business.brandingConfig || {};
  const [isOpen, setIsOpen] = useState(false);

  // State for all branding fields
  const [isBrandingEnabled, setIsBrandingEnabled] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [fontFamily, setFontFamily] = useState("var(--font-urbanist)");
  const [buttonStyle, setButtonStyle] = useState<"rounded" | "sharp" | "pill">(
    "rounded",
  );
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [overlayOpacity, setOverlayOpacity] = useState(0.1);
  const [canRemoveWatermark, setCanRemoveWatermark] = useState(false);
  const [starHeadlines, setStarHeadlines] = useState<Record<number, string>>({});
  const [starSubheadlines, setStarSubheadlines] = useState<Record<number, string>>(
    {},
  );
  const [activeStarTab, setActiveStarTab] = useState(5);

  const planTier = business.subscription?.planTier || "FREE";
  const isEligible = planTier === "GROWTH" || planTier === "PRO";
  const isPro = planTier === "PRO";

  const handleOpen = () => {
    setIsBrandingEnabled(branding.isBrandingEnabled || false);
    setPrimaryColor(branding.primaryColor || "#6366f1");
    setFontFamily(branding.fontFamily || "var(--font-urbanist)");
    setButtonStyle(branding.buttonStyle || "rounded");
    setHeadline(branding.headline || "");
    setSubheadline(branding.subheadline || "");
    setThankYouMessage(branding.thankYouMessage || "");
    setBackgroundUrl(branding.backgroundUrl || "");
    setOverlayOpacity(branding.overlayOpacity ?? 0.1);
    setCanRemoveWatermark(branding.canRemoveWatermark || false);
    setStarHeadlines(branding.starHeadlines || {});
    setStarSubheadlines(branding.starSubheadlines || {});
    setIsOpen(true);
  };

  const handleSave = async () => {
    await updateBusinessMutation.mutateAsync({
      brandingConfig: {
        ...branding,
        isBrandingEnabled,
        primaryColor,
        fontFamily,
        buttonStyle,
        headline,
        subheadline,
        thankYouMessage,
        backgroundUrl,
        overlayOpacity,
        starHeadlines,
        starSubheadlines,
        canRemoveWatermark: isPro ? canRemoveWatermark : false,
      },
    });
    setIsOpen(false);
  };

  const isPending = updateBusinessMutation.isPending;

  return (
    <>
      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden relative group h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900">
                  Advanced Branding
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                  White-label your review funnel
                </CardDescription>
              </div>
            </div>
            {isEligible && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-indigo-600 font-bold gap-2 rounded-xl h-8"
                onClick={handleOpen}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Customize
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-md bg-slate-50 border border-slate-100 flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Status
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    branding.isBrandingEnabled
                      ? "bg-green-500"
                      : "bg-slate-300",
                  )}
                />
                <span className="text-xs font-black text-slate-700">
                  {branding.isBrandingEnabled
                    ? "Fully Enabled"
                    : "Default Mode"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-md bg-slate-50 border border-slate-100 flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Primary Color
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-xs"
                  style={{
                    backgroundColor: branding.primaryColor || "#6366f1",
                  }}
                />
                <span className="text-xs font-mono font-bold text-slate-700">
                  {branding.primaryColor || "#6366f1"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <Layout className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Visual Style
                </span>
                <span className="text-xs font-black text-slate-700 capitalize">
                  {branding.buttonStyle || "Rounded"} /{" "}
                  {branding.fontFamily?.includes("urbanist")
                    ? "Urbanist"
                    : "Custom"}
                </span>
              </div>
            </div>
            <button
              onClick={handleOpen}
              disabled={!isEligible}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
                branding.isBrandingEnabled ? "bg-indigo-600" : "bg-slate-300",
                !isEligible && "opacity-50 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  branding.isBrandingEnabled
                    ? "translate-x-5"
                    : "translate-x-0",
                )}
              />
            </button>
          </div>

          {!isEligible && (
            <div className="p-4 rounded-md bg-amber-50 border border-amber-100 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                Custom branding is included with Growth and Pro plans. Elevate
                your presence today.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl bg-white p-0 rounded-[40px] overflow-hidden border-none shadow-2xl">
          <div className="p-10 pb-4">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
                Branding Studio
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Design the perfect review funnel that aligns with your brand.
              </DialogDescription>
            </DialogHeader>
          </div>

          <Tabs defaultValue="appearance" className="w-full">
            <div className="px-10">
              <TabsList className="w-full bg-slate-100  p-1 rounded-md flex items-center justify-around">
                <TabsTrigger
                  value="appearance"
                  className="rounded-md font-bold text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 mr-2" /> Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="messaging"
                  className="rounded-md font-bold text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-2" /> Messaging
                </TabsTrigger>
                <TabsTrigger
                  value="visuals"
                  className="rounded-md font-bold text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 mr-2" /> Visuals
                </TabsTrigger>
                <TabsTrigger
                  value="premium"
                  className="rounded-md font-bold text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Premium
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-10 pt-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <TabsContent value="appearance" className="space-y-6 mt-0">
                <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5">
                    <Label className="text-slate-900 font-black text-sm">
                      Enable Custom Styles
                    </Label>
                    <p className="text-[11px] text-slate-500 font-medium tracking-tight">
                      Globally toggle your branding settings
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBrandingEnabled(!isBrandingEnabled)}
                    className={cn(
                      "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                      isBrandingEnabled ? "bg-indigo-600" : "bg-slate-300",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out",
                        isBrandingEnabled ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                      Primary Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-12 rounded-md bg-slate-50 border-slate-200 font-mono text-xs font-bold"
                        placeholder="#6366f1"
                      />
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-12 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                      Font Family
                    </Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger className="h-12 rounded-md bg-slate-50 border-slate-200 text-xs font-bold">
                        <SelectValue placeholder="Pick a font" />
                      </SelectTrigger>
                      <SelectContent className="rounded-md border-slate-100 bg-white shadow-xl">
                        <SelectItem
                          value="var(--font-urbanist)"
                          className="text-xs font-medium"
                        >
                          Urbanist (Modern)
                        </SelectItem>
                        <SelectItem
                          value="Inter"
                          className="text-xs font-medium"
                        >
                          Inter (Clean)
                        </SelectItem>
                        <SelectItem
                          value="Roboto"
                          className="text-xs font-medium"
                        >
                          Roboto (Tech)
                        </SelectItem>
                        <SelectItem
                          value="Playfair Display"
                          className="text-xs font-medium italic"
                        >
                          Playfair (Premium)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                    Button Architecture
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {["sharp", "rounded", "pill"].map((style) => (
                      <button
                        key={style}
                        onClick={() => setButtonStyle(style as any)}
                        className={cn(
                          "relative h-14 border-2 transition-all cursor-pointer flex items-center justify-center text-xs font-black uppercase tracking-widest",
                          buttonStyle === style
                            ? "border-indigo-600 bg-white shadow-lg shadow-indigo-50"
                            : "border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200",
                          style === "sharp"
                            ? "rounded-none"
                            : style === "pill"
                              ? "rounded-full"
                              : "rounded-xl",
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="messaging" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase text-slate-500 ml-1 leading-none">
                      Main Headline
                    </Label>
                    <Input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. How did you like our food today?"
                      className="h-12 rounded-md bg-slate-50 border-slate-200 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase text-slate-500 ml-1 leading-none">
                      Subheadline Prompt
                    </Label>
                    <Textarea
                      value={subheadline}
                      onChange={(e) => setSubheadline(e.target.value)}
                      placeholder="e.g. Your feedback makes us better every single day."
                      className="min-h-[80px] rounded-md bg-slate-50 border-slate-200 text-sm font-medium p-4 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase text-slate-500 ml-1 leading-none">
                      Success Message
                    </Label>
                    <Textarea
                      value={thankYouMessage}
                      onChange={(e) => setThankYouMessage(e.target.value)}
                      placeholder="e.g. Thanks for your honesty! We appreciate you."
                      className="min-h-[80px] rounded-md bg-slate-50 border-slate-200 text-sm font-medium p-4 resize-none"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-slate-900 font-black text-sm">
                          Sentiment Messaging
                        </Label>
                        <p className="text-[11px] text-slate-500 font-medium tracking-tight">
                          Customize text based on the star rating selected
                        </p>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setActiveStarTab(s)}
                            className={cn(
                              "w-8 h-8 rounded-md flex items-center justify-center transition-all cursor-pointer",
                              activeStarTab === s
                                ? "bg-white shadow-sm text-amber-500"
                                : "text-slate-400 hover:text-slate-600",
                            )}
                          >
                            <span className="text-xs font-black">{s}</span>
                            <Star
                              className={cn(
                                "w-2.5 h-2.5 ml-0.5",
                                activeStarTab === s ? "fill-amber-500" : "",
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Star className="w-20 h-20 fill-slate-900" />
                      </div>
                      <div className="space-y-2 relative z-10">
                        <Label className="text-[10px] font-black uppercase text-indigo-600 ml-1">
                          Headline for {activeStarTab} Star
                          {activeStarTab === 1 ? "" : "s"}
                        </Label>
                        <Input
                          value={starHeadlines[activeStarTab] || ""}
                          onChange={(e) =>
                            setStarHeadlines({
                              ...starHeadlines,
                              [activeStarTab]: e.target.value,
                            })
                          }
                          placeholder="Override main headline..."
                          className="h-10 rounded-md bg-white border-slate-200 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2 relative z-10">
                        <Label className="text-[10px] font-black uppercase text-indigo-600 ml-1">
                          Subheadline for {activeStarTab} Star
                          {activeStarTab === 1 ? "" : "s"}
                        </Label>
                        <Textarea
                          value={starSubheadlines[activeStarTab] || ""}
                          onChange={(e) =>
                            setStarSubheadlines({
                              ...starSubheadlines,
                              [activeStarTab]: e.target.value,
                            })
                          }
                          placeholder="Override subheadline prompt..."
                          className="min-h-[60px] rounded-md bg-white border-slate-200 text-sm font-medium p-3 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="visuals" className="space-y-6 mt-0">
                {isPro ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase text-slate-500 ml-1 leading-none">
                        Banner Background URL
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={backgroundUrl}
                          onChange={(e) => setBackgroundUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="h-12 rounded-md bg-slate-50 border-slate-200 text-xs font-medium"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-md border-slate-200"
                        >
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium italic ml-1">
                        * Landscape images work best for funnel backgrounds.
                      </p>
                    </div>

                    <div className="p-5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-slate-900 font-black text-sm">
                          Overlay Contrast
                        </Label>
                        <p className="text-[11px] font-medium text-slate-500">
                          Darkness intensity of the background overlay
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-1/2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={overlayOpacity}
                          onChange={(e) =>
                            setOverlayOpacity(parseFloat(e.target.value))
                          }
                          className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-black text-slate-900 w-10 text-right">
                          {Math.round(overlayOpacity * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden p-6 rounded-xl bg-slate-900 text-white min-h-[200px] flex flex-col justify-center gap-3">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
                    <div className="space-y-1">
                      <h4 className="font-black text-lg tracking-tight flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-indigo-400" />
                        Custom Visual Backgrounds
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Transform your review funnel with custom hero images and 
                        adjustable contrast overlays for a truly immersive experience.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="w-fit bg-white text-slate-900 hover:bg-white/90 rounded-full h-8 text-[10px] font-black px-6 shadow-xl"
                    >
                      UPGRADE TO PRO
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="premium" className="space-y-6 mt-0">
                <div className="relative overflow-hidden p-6 rounded-xl bg-slate-900 text-white min-h-[140px] flex flex-col justify-center gap-2">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <h4 className="font-black text-lg tracking-tight">
                        White-Labelling
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Remove Review Funnel branding entirely
                      </p>
                    </div>

                    {isPro ? (
                      <button
                        onClick={() =>
                          setCanRemoveWatermark(!canRemoveWatermark)
                        }
                        className={cn(
                          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                          canRemoveWatermark ? "bg-white/50" : "bg-white/10",
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out",
                            canRemoveWatermark
                              ? "translate-x-5"
                              : "translate-x-0",
                          )}
                        />
                      </button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-white text-slate-900 hover:bg-white/90 rounded-full h-8 text-[10px] font-black px-4 shadow-xl"
                      >
                        UPGRADE TO PRO
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[9px] font-black uppercase">
                      Level: {planTier}
                    </div>
                    {!isPro && (
                      <div className="px-2 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-500/30 text-[9px] font-black uppercase text-indigo-300">
                        Feature Locked
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-10 pt-0 w-full flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="w-fit px-6 rounded-md text-slate-900 hover:text-slate-900 transition-all text-xs"
            >
              Discard
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              style={{
                backgroundColor: primaryColor,
                color: getContrastColor(primaryColor),
              }}
              className="w-fit px-6 hover:opacity-90 rounded-md gap-2 transition-all shadow-xl shadow-indigo-100/20 border-none text-xs"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 shadow-sm" />
              )}
              Apply Branding
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
