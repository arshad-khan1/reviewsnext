"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Save,
  Loader2,
  Edit3,
  Mail,
  MapPin,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

interface BusinessProfileSectionProps {
  business: any;
  updateBusinessMutation: any;
}

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

export function BusinessProfileSection({
  business,
  updateBusinessMutation,
}: BusinessProfileSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    location: "",
    description: "",
  });

  const handleOpen = () => {
    if (business) {
      setForm({
        name: business.name || "",
        industry: business.industry || "",
        location: business.location || "",
        description: business.description || "",
      });
      setLogoPreview(business.logoUrl || null);
      setLogoFile(null);
    }
    setIsOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("industry", form.industry);
    formData.append("location", form.location);
    formData.append("description", form.description);

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    await updateBusinessMutation.mutateAsync(formData);
    setIsOpen(false);
  };

  return (
    <>
      <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col group">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Business Profile
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-indigo-600 font-bold gap-2"
              onClick={handleOpen}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-8">
            <div className="relative w-28 h-28 rounded-3xl border-2 border-slate-100 bg-white flex items-center justify-center p-4 shadow-sm overflow-hidden">
              {business?.logoUrl ? (
                <Image
                  src={business.logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain p-4"
                />
              ) : (
                <Building2 className="w-10 h-10 text-slate-200" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {business?.name || "No Name Set"}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-black tracking-wider">
                    {business?.location || "Global"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-400 bg-indigo-50/30 px-2 py-0.5 rounded-full border border-indigo-50/50">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] uppercase font-black tracking-wider">
                    {business?.industry || "Enterprise"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2">
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Description
              </p>
              <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                &quot;
                {business?.description ||
                  "No company description provided yet."}
                &quot;
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl bg-white p-10 rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Edit Business Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            {/* Logo Upload Section */}
            <div className="flex flex-col items-center gap-4 mb-2">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-indigo-400 transition-all overflow-hidden">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo Preview"
                      fill
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                    <div className="bg-white/90 p-2 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform">
                      <Edit3 className="w-4 h-4 text-indigo-600" />
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  onChange={handleLogoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*, image/svg+xml, .svg"
                />
              </div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Business Logo
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-900 font-black text-xs uppercase tracking-wider">
                  Business Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-black text-xs uppercase tracking-wider">
                    Industry
                  </Label>
                  <select
                    value={form.industry}
                    onChange={(e) =>
                      setForm({ ...form, industry: e.target.value })
                    }
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-0 transition-all border-slate-200 cursor-pointer"
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
                <div className="space-y-2">
                  <Label className="text-slate-900 font-black text-xs uppercase tracking-wider">
                    Location
                  </Label>
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-900 font-black text-xs uppercase tracking-wider">
                  Bio / Description
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="min-h-[100px] rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
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
                className="bg-indigo-600 hover:bg-slate-900 font-black px-6 h-10 rounded-xl"
                disabled={updateBusinessMutation.isPending}
              >
                {updateBusinessMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
