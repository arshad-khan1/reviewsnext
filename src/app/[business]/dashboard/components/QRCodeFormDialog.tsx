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
  Star,
  Lock,
} from "lucide-react";
import {
  type QRCode,
  type CommentStyle,
  useQRCodeDetail,
} from "@/hooks/use-qr-codes";
import { type Location } from "@/hooks/use-locations";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { PLAN_LIMITS, hasFeature, getLimit } from "@/config/plan-limits";
import { PlanType } from "@/types/prisma-enums";
import {
  SubscriptionGateOverlay,
  PlanBadge,
} from "@/components/shared/SubscriptionGateOverlay";
import { cn } from "@/lib/utils";

const STYLE_MAP: Record<string, CommentStyle> = {
  "Professional & Polite": "PROFESSIONAL_POLITE",
  "Friendly & Casual": "FRIENDLY_CASUAL",
  "Concise & Direct": "CONCISE_DIRECT",
  "Enthusiastic & Warm": "ENTHUSIASTIC_WARM",
  "Witty & Fun": "WITTY_FUN",
  "Hinglish (Hindi + English)": "HINGLISH",
};

const REVERSE_STYLE_MAP: Record<CommentStyle, string> = {
  PROFESSIONAL_POLITE: "Professional & Polite",
  FRIENDLY_CASUAL: "Friendly & Casual",
  CONCISE_DIRECT: "Concise & Direct",
  ENTHUSIASTIC_WARM: "Enthusiastic & Warm",
  WITTY_FUN: "Witty & Fun",
  HINGLISH: "Hinglish (Hindi + English)",
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
  const { user } = useAuthStore();
  const planTier = user?.planTier || PlanType.FREE;
  const isEdit = !!qr;

  // Limits Check
  const qrLimit = getLimit(
    planTier,
    user?.subscriptionStatus,
    "maxQrCodesTotal",
  );
  const planDisplayName = PLAN_LIMITS[planTier].displayName;
  const isAtLimit = !isEdit && qrs.length >= qrLimit;
  const canCustomize = hasFeature(
    planTier,
    user?.subscriptionStatus,
    "canCustomAiPrompts",
  );

  const [name, setName] = useState("");
  const [sourceTag, setSourceTag] = useState("");
  const [locationId, setLocationId] = useState("unassigned");
  const [aiPrompt, setAiPrompt] = useState("");
  const [commentStyle, setCommentStyle] = useState<string>(
    "Professional & Polite",
  );
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [acceptedStarsThreshold, setAcceptedStarsThreshold] =
    useState<number>(4);
  const [useDefaultConfig, setUseDefaultConfig] = useState(true);
  const [isAttempted, setIsAttempted] = useState(false);
  const [isSourceEdited, setIsSourceEdited] = useState(false);

  const params = useParams();
  const businessSlug = params.business as string;

  const { data: detailData, isLoading: isDetailLoading } = useQRCodeDetail(
    businessSlug,
    qr?.id || "",
  );

  const qrDetail = detailData?.qrCode;

  // Consolidate initialization and guard against cascading renders
  useEffect(() => {
    if (!open) return;

    // Use the detailed data if available, otherwise fallback to the basic QR data
    const source = qrDetail || qr;

    if (source) {
      setName((prev) => (prev !== source.name ? source.name : prev));
      setSourceTag((prev) =>
        prev !== source.sourceTag ? source.sourceTag : prev,
      );
      setLocationId((prev) => {
        const next = source.locationId || "unassigned";
        return prev !== next ? next : prev;
      });
      setAiPrompt((prev) => {
        const next = source.aiGuidingPrompt || "";
        return prev !== next ? next : prev;
      });
      setCommentStyle((prev) => {
        const next = source.commentStyle
          ? REVERSE_STYLE_MAP[source.commentStyle as CommentStyle]
          : "Inherit from Business Settings";
        return prev !== next ? next : prev;
      });
      setGoogleMapsLink((prev) => {
        const next = source.googleMapsLink || "";
        return prev !== next ? next : prev;
      });
      setAcceptedStarsThreshold((prev) => {
        const next = source.acceptedStarsThreshold || 0;
        return prev !== next ? next : prev;
      });
      setUseDefaultConfig((prev) => {
        const next = source.useDefaultConfig ?? true;
        return prev !== next ? next : prev;
      });
      setIsSourceEdited(true);
    } else {
      // Create Mode Reset
      setName("");
      setSourceTag("");
      setLocationId("unassigned");
      setIsSourceEdited(false);
      setAiPrompt("");
      setGoogleMapsLink("");
      setCommentStyle("Inherit from Business Settings");
      setAcceptedStarsThreshold(0);
      setUseDefaultConfig(true);
    }
  }, [qrDetail, qr, open]);

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
      aiGuidingPrompt: aiPrompt.trim() || null,
      commentStyle: STYLE_MAP[commentStyle] || null,
      googleMapsLink: googleMapsLink.trim() || null,
      acceptedStarsThreshold:
        acceptedStarsThreshold === 0 ? null : acceptedStarsThreshold,
      useDefaultConfig,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[480px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl transition-all duration-500 flex flex-col",
          isAtLimit ? "max-h-[450px]" : "max-h-[90vh]",
        )}
      >
        {isAtLimit && (
          <SubscriptionGateOverlay
            title="QR Limit Reached"
            planDisplayName={planDisplayName}
            description={
              <>
                Your <PlanBadge name={planDisplayName} /> plan allows for up to{" "}
                <span className="text-slate-900 font-bold">{qrLimit}</span> QR
                code
                {qrLimit > 1 ? "s" : ""}.
                <br />
                <span className="opacity-75">
                  Upgrade to Growth or Pro to unlock more tracking points.
                </span>
              </>
            }
            onUpgrade={() =>
              (window.location.href = `/${businessSlug}/dashboard/topup`)
            }
            onClose={() => onOpenChange(false)}
          />
        )}

        <DialogHeader className="px-8 pt-8 pb-4 bg-slate-50/50 border-b border-slate-100">
          <DialogTitle className="text-xl">
            {isEdit ? "Edit QR Settings" : "Create New QR Code"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Configure settings for "${qr.name}"`
              : "Setup your new tracking code and AI instructions."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
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

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <div className="space-y-0.5">
                    <Label className="text-indigo-900 font-bold text-sm flex items-center gap-2">
                      Default Settings
                      {!canCustomize && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-tighter">
                          Starter Lock
                        </span>
                      )}
                    </Label>
                    <p className="text-[11px] text-indigo-600/70 font-medium">
                      Automatically inherit all settings from business profile
                    </p>
                  </div>
                  <label
                    className={cn(
                      "relative inline-flex items-center cursor-pointer",
                      !canCustomize &&
                        "opacity-50 cursor-not-allowed pointer-events-none",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={!canCustomize ? true : useDefaultConfig}
                      onChange={(e) => setUseDefaultConfig(e.target.checked)}
                      className="sr-only peer"
                      disabled={!canCustomize}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {!canCustomize && (
                  <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <p className="text-[10px] text-amber-700 font-medium leading-tight">
                      Upgrade to <strong>Growth</strong> to customize AI prompts
                      and routing filters per QR code.
                    </p>
                  </div>
                )}

                <div
                  className={`space-y-4 transition-all duration-300 ${useDefaultConfig ? "opacity-50 pointer-events-none grayscale-[0.5]" : "opacity-100"}`}
                >
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold px-0.5 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      AI Guiding Prompt
                    </Label>
                    <textarea
                      placeholder={
                        business?.defaultAiPrompt ||
                        "Instructions for the AI..."
                      }
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      disabled={useDefaultConfig}
                      className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-800 italic"
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
                      disabled={useDefaultConfig}
                      className="flex h-11 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                      {Object.keys(STYLE_MAP).map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold px-0.5 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Google Maps Link
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={
                          business?.defaultGoogleMapsLink ||
                          "https://g.page/r/..."
                        }
                        value={googleMapsLink}
                        onChange={(e) => setGoogleMapsLink(e.target.value)}
                        disabled={useDefaultConfig}
                        className="h-11 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-800 italic"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 bg-slate-50 hover:bg-slate-100 border-slate-200"
                        onClick={() => {
                          const effectiveLink = useDefaultConfig
                            ? business?.defaultGoogleMapsLink
                            : googleMapsLink || business?.defaultGoogleMapsLink;
                          if (effectiveLink)
                            window.open(effectiveLink, "_blank");
                        }}
                        disabled={
                          useDefaultConfig
                            ? !business?.defaultGoogleMapsLink
                            : !(
                                googleMapsLink ||
                                business?.defaultGoogleMapsLink
                              )
                        }
                        title="Test Link"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-800" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-50">
                    <Label className="text-slate-700 font-semibold px-0.5 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      Review Routing Filter
                    </Label>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Stars required for Google Review
                        </span>
                        <span className="text-sm font-black text-amber-600">
                          {acceptedStarsThreshold === 0
                            ? business?.acceptedStarsThreshold || 4
                            : acceptedStarsThreshold}
                          + Stars
                        </span>
                        {useDefaultConfig && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-black border border-indigo-100 flex items-center gap-1">
                            <Signal className="w-2 h-2" /> INHERITED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setAcceptedStarsThreshold(stars)}
                            disabled={useDefaultConfig}
                            className={`flex-1 h-10 rounded-lg flex items-center justify-center transition-all border ${
                              acceptedStarsThreshold === stars
                                ? "bg-amber-500 border-amber-600 text-white shadow-sm scale-105"
                                : "bg-white border-slate-200 text-slate-400 hover:border-amber-200 hover:bg-amber-50/30"
                            }`}
                          >
                            <span className="font-bold text-sm tracking-tight">
                              {stars}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 pt-4 bg-slate-50/50 border-t border-slate-100 mt-auto">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
