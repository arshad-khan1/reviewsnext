"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Sparkles,
  MessageSquare,
  MapPin,
  ExternalLink,
  Loader2,
  Signal,
} from "lucide-react";
import { type QRCode, type CommentStyle } from "@/hooks/use-qr-codes";
import { type Location } from "@/hooks/use-locations";
import { toast } from "sonner";

const STYLE_MAP: Record<string, CommentStyle> = {
  "Professional & Polite": "PROFESSIONAL_POLITE",
  "Friendly & Casual": "FRIENDLY_CASUAL",
  "Concise & Direct": "CONCISE_DIRECT",
  "Enthusiastic & Warm": "ENTHUSIASTIC_WARM",
};

const REVERSE_STYLE_MAP: Record<CommentStyle, string> = {
  PROFESSIONAL_POLITE: "Professional & Polite",
  FRIENDLY_CASUAL: "Friendly & Casual",
  CONCISE_DIRECT: "Concise & Direct",
  ENTHUSIASTIC_WARM: "Enthusiastic & Warm",
};

interface QRCodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qr?: QRCode | null;
  locations: Location[];
  business: any;
  qrs: QRCode[];
  onSave: (data: any) => Promise<void>;
  isPending: boolean;
}

export function QRCodeFormDialog({
  open,
  onOpenChange,
  qr,
  locations,
  business,
  qrs,
  onSave,
  isPending,
}: QRCodeFormDialogProps) {
  const isEdit = !!qr;

  const [name, setName] = useState("");
  const [sourceTag, setSourceTag] = useState("");
  const [locationId, setLocationId] = useState("unassigned");
  const [aiPrompt, setAiPrompt] = useState("");
  const [commentStyle, setCommentStyle] = useState<string>(
    "Professional & Polite",
  );
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [isAttempted, setIsAttempted] = useState(false);
  const [isSourceEdited, setIsSourceEdited] = useState(false);

  useEffect(() => {
    if (open) {
      setIsAttempted(false);
      if (qr) {
        setName(qr.name);
        setSourceTag(qr.sourceTag);
        setLocationId(qr.locationId || "unassigned");
        setAiPrompt(qr.aiGuidingPrompt || "");
        setCommentStyle(
          REVERSE_STYLE_MAP[qr.commentStyle] || "Professional & Polite",
        );
        setGoogleMapsLink(qr.googleMapsLink || "");
        setIsSourceEdited(true);
      } else {
        // Reset for Create
        setName("");
        setSourceTag("");
        setLocationId("unassigned");
        setIsSourceEdited(false);

        const defaultQR =
          qrs?.find((q) => q.sourceTag === "default") || qrs?.[0] || {};
        const promptToUse =
          defaultQR?.aiGuidingPrompt ||
          business?.defaultAiPrompt ||
          "Please share your honest feedback about our services.";
        const linkToUse =
          defaultQR?.googleMapsLink || business?.defaultGoogleMapsLink || "";
        const styleToUse =
          defaultQR?.commentStyle ||
          business?.defaultCommentStyle ||
          "PROFESSIONAL_POLITE";

        setAiPrompt(promptToUse);
        setGoogleMapsLink(linkToUse);
        setCommentStyle(
          REVERSE_STYLE_MAP[styleToUse] || "Professional & Polite",
        );
      }
    }
  }, [open, qr, business, qrs]);

  const errors = useMemo(() => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";

    const finalSourceTag = isEdit
      ? sourceTag
      : sourceTag ||
        name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

    if (!finalSourceTag) {
      newErrors.sourceTag = "Source tag is required";
    } else if (!isEdit || finalSourceTag !== qr?.sourceTag) {
      if (
        qrs.some(
          (q) => q.sourceTag === finalSourceTag && (!isEdit || q.id !== qr?.id),
        )
      ) {
        newErrors.sourceTag = "This tag is already in use";
      }
    }

    if (googleMapsLink && !googleMapsLink.startsWith("http")) {
      newErrors.googleMapsLink = "Please enter a valid URL";
    }

    return newErrors;
  }, [name, sourceTag, googleMapsLink, qrs, isEdit, qr]);

  const hasErrors = Object.keys(errors).length > 0;

  const showError = (field: string) => {
    if (!errors[field]) return false;
    if (errors[field].includes("required")) return isAttempted;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAttempted(true);

    if (hasErrors) {
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    const finalSourceTag =
      sourceTag ||
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    await onSave({
      id: qr?.id,
      name: name.trim(),
      sourceTag: isEdit ? undefined : finalSourceTag,
      locationId: locationId === "unassigned" ? null : locationId,
      aiGuidingPrompt: aiPrompt.trim(),
      commentStyle: STYLE_MAP[commentStyle] || "PROFESSIONAL_POLITE",
      googleMapsLink: googleMapsLink.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? "Edit QR Settings" : "Create New QR Code"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Configure settings for "${qr.name}"`
              : "Setup your new tracking code and AI instructions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="qr-name"
                className={
                  showError("name")
                    ? "text-red-500 font-semibold px-0.5"
                    : "text-slate-700 font-semibold px-0.5"
                }
              >
                QR Name
              </Label>
              <Input
                id="qr-name"
                placeholder='e.g., "Table 1", "Counter"'
                value={name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setName(newName);
                  if (!isSourceEdited && !isEdit) {
                    setSourceTag(
                      newName
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    );
                  }
                }}
                className={`h-11 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 ${showError("name") ? "border-red-500 bg-red-50/30" : ""}`}
              />
              {showError("name") && (
                <p className="text-[11px] font-bold text-red-500 px-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold px-0.5">
                Location grouping
              </Label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="flex h-11 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <option value="unassigned">Unassigned</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="source-tag"
                    className={
                      showError("sourceTag")
                        ? "text-red-500 font-semibold px-0.5"
                        : "text-slate-700 font-semibold px-0.5"
                    }
                  >
                    Source Tag
                  </Label>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Unique Identifier
                  </span>
                </div>
                <div className="relative group">
                  <Input
                    id="source-tag"
                    placeholder="e.g., table1"
                    value={sourceTag}
                    onChange={(e) => {
                      setSourceTag(
                        e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      );
                      setIsSourceEdited(true);
                    }}
                    className={`h-11 border-slate-200 transition-all font-mono text-sm pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 ${showError("sourceTag") ? "border-red-500 bg-red-50/30" : ""}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Signal className="w-4 h-4" />
                  </div>
                </div>
                {showError("sourceTag") && (
                  <p className="text-[11px] font-bold text-red-500 px-1">
                    {errors.sourceTag}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold px-0.5 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  AI Guiding Prompt
                </Label>
                <textarea
                  placeholder="Instructions for the AI..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold px-0.5 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  Comment Style
                </Label>
                <select
                  value={commentStyle}
                  onChange={(e) => setCommentStyle(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  {Object.keys(STYLE_MAP).map((style) => (
                    <option key={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label
                  className={
                    showError("googleMapsLink")
                      ? "text-red-500 font-semibold px-0.5 flex items-center gap-2"
                      : "text-slate-700 font-semibold px-0.5 flex items-center gap-2"
                  }
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Google Maps Link
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="https://g.page/r/..."
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    className={`h-11 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 ${showError("googleMapsLink") ? "border-red-500 bg-red-50/30" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0 bg-slate-50 hover:bg-slate-100 border-slate-200"
                    onClick={() => window.open(googleMapsLink, "_blank")}
                    disabled={!googleMapsLink}
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>
                {showError("googleMapsLink") && (
                  <p className="text-[11px] font-bold text-red-500 px-1">
                    {errors.googleMapsLink}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full h-12 gap-2 text-base font-bold transition-all ${hasErrors && isAttempted ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <QrCode className="w-5 h-5" />
            )}
            {isEdit ? "Save Changes" : "Generate QR Code"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
