"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Palette, Lock, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureGate } from "@/components/auth/FeatureGate";

interface AdvancedBrandingSectionProps {
  business: any;
}

export function AdvancedBrandingSection({ business }: AdvancedBrandingSectionProps) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden relative group h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900">Advanced Branding</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">
                Customize your funnel's look and feel
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">Premium</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1">
        <FeatureGate feature="canRemoveWatermark" variant="blur">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <Label className="text-slate-900 font-bold text-sm">Remove Platform Branding</Label>
                <p className="text-[11px] text-slate-500 font-medium">Hide the "Powered by ReviewFunnel" watermark</p>
              </div>
              <Switch checked={true} disabled={true} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <Label className="text-slate-900 font-bold text-sm">Custom Colors</Label>
                <p className="text-[11px] text-slate-500 font-medium">Match the funnel to your brand's palette</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600 border border-white shadow-sm" />
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-white shadow-sm" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                White-labeling is active. Your customers will only see your business branding.
              </p>
            </div>
          </div>
        </FeatureGate>

        {/* This part only shows if the FeatureGate is NOT allowed (handled by variant="blur") */}
        <div className="pt-2">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest text-center">
            Scale your brand with Pro
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
