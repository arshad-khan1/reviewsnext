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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Settings2,
  Globe,
  Lock,
  Edit3,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { GoogleStarIcon } from "./GoogleStarIcon";

interface RoutingSettingsSectionProps {
  business: any;
  updateBusinessMutation: any;
}

export function RoutingSettingsSection({
  business,
  updateBusinessMutation,
}: RoutingSettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    defaultGoogleMapsLink: "",
    defaultAiPrompt: "",
    defaultCommentStyle: "PROFESSIONAL_POLITE",
    acceptedStarsThreshold: 4,
  });

  const handleOpen = () => {
    if (business) {
      setForm({
        defaultGoogleMapsLink: business.defaultGoogleMapsLink || "",
        defaultAiPrompt: business.defaultAiPrompt || "",
        defaultCommentStyle:
          business.defaultCommentStyle || "PROFESSIONAL_POLITE",
        acceptedStarsThreshold: business.acceptedStarsThreshold || 4,
      });
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    await updateBusinessMutation.mutateAsync(form);
    setIsOpen(false);
  };

  const routingCutoff = form.acceptedStarsThreshold - 1;
  const currentVisualizationCutoff =
    (business?.acceptedStarsThreshold || 4) - 1;

  return (
    <>
      <Card className="border-slate-200 shadow-sm overflow-hidden group">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Settings2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Review Routing Settings
                </CardTitle>
                <CardDescription>
                  Global default configurations for your review funnels.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-indigo-600 font-bold gap-2"
              onClick={handleOpen}
            >
              <Edit3 className="w-4 h-4" />
              Configure Logic
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="p-8 rounded-[40px] border border-slate-100 flex items-center justify-center">
              <div className="space-y-6 text-center">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  Current Visualization
                </p>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const isInternal = s <= currentVisualizationCutoff;
                      return (
                        <div
                          key={s}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all font-black text-white shadow-sm
                              ${isInternal ? "bg-orange-600 shadow-orange-100" : "bg-emerald-600 shadow-emerald-100"}
                            `}
                        >
                          {s}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between w-full text-[10px] font-black text-slate-400 uppercase mt-2 px-1">
                    <span>Internal</span>
                    <span>Google</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  Direct Review Redirect
                </Label>
                <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm text-slate-600 truncate">
                      {business?.defaultGoogleMapsLink || "No link configured"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0 bg-slate-50 hover:bg-slate-100 border-slate-200"
                    onClick={() => {
                      const effectiveLink = business?.defaultGoogleMapsLink;
                      if (effectiveLink) window.open(effectiveLink, "_blank");
                    }}
                    disabled={!business?.defaultGoogleMapsLink}
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-800" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  AI personality
                </Label>
                <p className="text-sm font-medium text-slate-500 italic bg-white p-4 rounded-2xl border border-slate-100 leading-relaxed line-clamp-2">
                  &quot;
                  {business?.defaultAiPrompt || "Default helpful assistant."}
                  &quot;
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl bg-white rounded-[40px] p-0 overflow-hidden outline-none border-none max-h-[90vh] flex flex-col">
          <div className="p-8 pb-2 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Review Routing Settings
              </h2>
              <p className="text-slate-400 text-xs font-bold leading-none">
                Global funnel redirection logic.
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                  Sensitivity
                </span>
                <span className="text-orange-600 font-black text-lg">
                  {routingCutoff} Stars
                </span>
              </div>
              <div className="relative px-4">
                <div className="absolute top-1/2 left-0 w-full h-[4px] -translate-y-1/2 bg-emerald-600 rounded-full" />
                <div
                  className="absolute top-1/2 left-0 h-[4px] -translate-y-1/2 bg-orange-600 rounded-full transition-all duration-500 z-0"
                  style={{ width: `${(routingCutoff - 1) * 25}%` }}
                />
                <div className="relative flex w-full justify-between px-1">
                  {[1, 2, 3, 4, 5].map((step) => {
                    const isInternal = step <= routingCutoff;
                    return (
                      <button
                        key={step}
                        onClick={() =>
                          setForm({
                            ...form,
                            acceptedStarsThreshold: step + 1,
                          })
                        }
                        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 font-black border-2 z-10 text-sm shadow-lg ring-4 ring-white
                          ${
                            isInternal
                              ? "bg-orange-600 border-orange-600 text-white shadow-orange-200"
                              : "bg-emerald-600 border-emerald-600 text-white shadow-emerald-200"
                          }
                          ${step === routingCutoff ? "scale-110" : "scale-100"}
                        `}
                      >
                        {step}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-700 flex items-center justify-center text-white font-black text-[10px]">
                    !
                  </div>
                  <span className="text-orange-900 font-black text-[10px] uppercase">
                    {routingCutoff} Stars & Below
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 leading-tight">
                  Internal Feedback
                </h3>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Lock className="w-3 h-3" />
                  <span className="text-[10px] font-bold italic">
                    Secure private channel
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-[24px] bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="flex items-center gap-2">
                  <GoogleStarIcon className="w-6 h-6 border-2 border-white" />
                  <span className="text-emerald-800 font-black text-[10px] uppercase">
                    Above {routingCutoff} Stars
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 leading-tight">
                  Google Review
                </h3>
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <Globe className="w-3 h-3" />
                  <span className="text-[10px] font-bold italic">
                    Public reputation
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-wider px-1">
                    Google Review Link
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.defaultGoogleMapsLink}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          defaultGoogleMapsLink: e.target.value,
                        })
                      }
                      className="h-10 rounded-xl"
                      placeholder="https://maps.google.com/..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-3 rounded-xl border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200"
                      onClick={() =>
                        window.open(form.defaultGoogleMapsLink, "_blank")
                      }
                      title="Visit Link"
                    >
                      <Globe className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-wider px-1">
                    AI Response Style
                  </Label>
                  <select
                    value={form.defaultCommentStyle}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        defaultCommentStyle: e.target.value,
                      })
                    }
                    className="w-full h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-0 transition-all"
                  >
                    <option value="PROFESSIONAL_POLITE">Professional</option>
                    <option value="FRIENDLY_CASUAL">Friendly</option>
                    <option value="CONCISE_DIRECT">Concise</option>
                    <option value="ENTHUSIASTIC_WARM">Warm</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-900 font-black text-[10px] uppercase tracking-wider px-1">
                  AI Guiding Prompt
                </Label>
                <Textarea
                  value={form.defaultAiPrompt}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      defaultAiPrompt: e.target.value,
                    })
                  }
                  className="min-h-[100px] rounded-xl p-4 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-8 pt-4 flex justify-end gap-3 border-t border-slate-50 bg-slate-50/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="font-bold h-10 px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-slate-900 font-black px-6 h-10 rounded-xl"
              disabled={updateBusinessMutation.isPending}
            >
              {updateBusinessMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply Logic"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
