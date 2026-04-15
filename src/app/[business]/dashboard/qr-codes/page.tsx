"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Plus,
  Copy,
  Trash2,
  Check,
  Search,
  FileCode,
  ImageIcon,
  TrendingUp,
  Layers,
  MousePointerClick,
  Eye,
  BarChart3,
  Signal,
  ArrowUpRight,
  Settings,
  MapPin,
  Loader2,
  FolderPlus,
} from "lucide-react";
import {
  SubscriptionGateOverlay,
  PlanBadge,
} from "@/components/shared/SubscriptionGateOverlay";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { PLAN_LIMITS, hasFeature, getLimit } from "@/config/plan-limits";
import { PlanType } from "@prisma/client";
import { useBusiness } from "@/hooks/use-business";
import {
  useQRCodes,
  useCreateQRCode,
  useUpdateQRCode,
  useDeleteQRCode,
  type CommentStyle,
  type QRCode,
} from "@/hooks/use-qr-codes";
import {
  useLocations,
  useCreateLocation,
  useAssignQrToLocation,
} from "@/hooks/use-locations";
import { QRCodeFormDialog } from "../components/QRCodeFormDialog";

export default function QRCodeManager() {
  const params = useParams();
  const businessSlug = params.business as string;

  const { user } = useAuthStore();
  const planTier = user?.planTier || PlanType.FREE;
  const locationLimit = getLimit(
    planTier,
    user?.subscriptionStatus,
    "maxLocations",
  );

  const { data: business, isLoading: isBusinessLoading } =
    useBusiness(businessSlug);
  const { data: qrsData, isLoading: isQRsLoading } = useQRCodes(businessSlug);

  const createMutation = useCreateQRCode(businessSlug);
  const updateMutation = useUpdateQRCode(businessSlug);
  const deleteMutation = useDeleteQRCode(businessSlug);

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingQR, setEditingQR] = useState<QRCode | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [analyticsGateId, setAnalyticsGateId] = useState<string | null>(null);

  const { data: locationsData, error: locationsError } =
    useLocations(businessSlug);
  const locations = locationsData?.data || [];
  const planDisplayName = PLAN_LIMITS[planTier].displayName;

  // If data is missing but we know it's a restricted tier, or it's an error, or count is over limit
  const isLocationAtLimit = useMemo(() => {
    if (locationsError) return true;
    if (!locationsData) return false;
    return locations.length >= locationLimit;
  }, [locationsData, locationsError, locations.length, locationLimit]);

  const createLocationMutation = useCreateLocation(businessSlug);
  const assignQrLocationMutation = useAssignQrToLocation(businessSlug);

  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationCity, setNewLocationCity] = useState("");

  const [isLocationAttempted, setIsLocationAttempted] = useState(false);

  const calculatedLocationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!newLocationName.trim()) {
      errors.name = "Location name is required";
    }
    return errors;
  }, [newLocationName]);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLocationAttempted(true);

    if (Object.keys(calculatedLocationErrors).length > 0) {
      return;
    }

    try {
      await createLocationMutation.mutateAsync({
        name: newLocationName.trim(),
        city: newLocationCity.trim() || undefined,
      });
      setNewLocationName("");
      setNewLocationCity("");
      setIsLocationAttempted(false);
      setIsAddLocationOpen(false);
    } catch {
      toast.error("Failed to create location. Please try again.");
    }
  };

  const qrs = useMemo(() => qrsData?.data || [], [qrsData?.data]);
  const summary = qrsData?.summary;

  const filteredQRs = useMemo(() => {
    return qrs.filter(
      (qr) =>
        qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.sourceTag.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [qrs, searchQuery]);

  const handleSaveQR = async (data: {
    id?: string;
    name: string;
    sourceTag?: string;
    locationId?: string | null;
    aiGuidingPrompt?: string;
    commentStyle?: CommentStyle;
    googleMapsLink?: string;
    acceptedStarsThreshold?: number;
  }) => {
    try {
      if (data.id) {
        await updateMutation.mutateAsync({
          id: data.id,
          name: data.name,
          aiGuidingPrompt: data.aiGuidingPrompt,
          commentStyle: data.commentStyle,
          googleMapsLink: data.googleMapsLink,
          acceptedStarsThreshold: data.acceptedStarsThreshold,
        });
        await assignQrLocationMutation.mutateAsync({
          qrId: data.id,
          locationId: data.locationId ?? null,
        });
      } else {
        const result = await createMutation.mutateAsync({
          name: data.name,
          sourceTag: data.sourceTag as string,
          aiGuidingPrompt: data.aiGuidingPrompt,
          commentStyle: data.commentStyle,
          googleMapsLink: data.googleMapsLink,
          acceptedStarsThreshold: data.acceptedStarsThreshold,
        });

        const newId =
          (result as any)?.data?.id ||
          (result as any)?.id ||
          (result as any)?.qrCode?.id;
        if (newId) {
          await assignQrLocationMutation.mutateAsync({
            qrId: newId,
            locationId: data.locationId ?? null,
          });
        }
      }
      setIsFormOpen(false);
      setEditingQR(null);
    } catch {
      // Error handled by mutation
    }
  };

  const deleteQR = async (id: string) => {
    if (confirm("Are you sure you want to delete this QR code?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        // Error handled by mutation
      }
    }
  };

  const copyLink = (qr: QRCode) => {
    navigator.clipboard.writeText(qr.reviewUrl);
    setCopiedId(qr.id);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadPNG = (qr: QRCode) => {
    const canvas = document.getElementById(
      `canvas-${qr.id}`,
    ) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${qr.name}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("Downloading PNG...");
    }
  };

  const downloadSVG = (qr: QRCode) => {
    const svg = document.getElementById(`svg-${qr.id}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `${qr.name}-qr.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("Downloading SVG...");
    }
  };

  if (isBusinessLoading || isQRsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!business)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">
          Business not found or access denied.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Total QR Scans",
              value: summary?.totalScans || 0,
              icon: Signal,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Active QR Codes",
              value: qrs.length,
              icon: Layers,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Avg. Conversion",
              value: `${summary?.avgConversionRate || 0}%`,
              icon: TrendingUp,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="border-none shadow-sm bg-white overflow-hidden"
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="space-y-10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Filter by name or tag..."
                  className="pl-11 h-11 bg-slate-50 border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Dialog
                open={isAddLocationOpen}
                onOpenChange={setIsAddLocationOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 gap-2 font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
                  >
                    <FolderPlus className="w-4 h-4" /> Create Location
                  </Button>
                </DialogTrigger>

                <DialogContent
                  className={cn(
                    "sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden transition-all duration-500",
                    isLocationAtLimit ? "min-h-[450px]" : "min-h-auto",
                  )}
                >
                  {isLocationAtLimit && (
                    <SubscriptionGateOverlay
                      title={
                        locationLimit === 0
                          ? "Pro Feature"
                          : "Location Limit Reached"
                      }
                      planDisplayName={planDisplayName}
                      description={
                        locationLimit === 0 ? (
                          <div className="space-y-2">
                            <p>
                              Managing multiple branches and facility groups is
                              a <PlanBadge name="PRO" /> only feature.
                            </p>
                            <p className="text-xs text-slate-400 font-normal italic">
                              You are currently on the {planDisplayName} plan.
                            </p>
                            <p className="mt-4 text-xs font-semibold text-slate-600">
                              Upgrade to Pro to manage multiple business
                              branches and view unified analytics.
                            </p>
                          </div>
                        ) : (
                          <>
                            Your <PlanBadge name={planDisplayName} /> plan
                            allows for up to{" "}
                            <span className="text-slate-900 font-bold">
                              {locationLimit}
                            </span>{" "}
                            location
                            {locationLimit > 1 ? "s" : ""}.
                          </>
                        )
                      }
                      onUpgrade={() =>
                        (window.location.href = `/${businessSlug}/dashboard/topup`)
                      }
                      onClose={() => setIsAddLocationOpen(false)}
                    />
                  )}

                  <DialogHeader className="px-8 pt-8 pb-4 bg-slate-50/50 border-b border-slate-100">
                    <DialogTitle className="text-xl">
                      New Location Tag
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500">
                      Create a location group to better organize your QR codes.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddLocation} className="p-8 space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          className={
                            isLocationAttempted && calculatedLocationErrors.name
                              ? "text-red-500 font-semibold"
                              : "text-slate-700 font-semibold"
                          }
                        >
                          Location Name
                        </Label>
                        <Input
                          value={newLocationName}
                          onChange={(e) => setNewLocationName(e.target.value)}
                          placeholder="e.g. Downtown Branch"
                          className={`h-11 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 ${isLocationAttempted && calculatedLocationErrors.name ? "border-red-500 bg-red-50/30" : ""}`}
                        />
                        {isLocationAttempted &&
                          calculatedLocationErrors.name && (
                            <p className="text-[11px] font-bold text-red-500 px-1">
                              {calculatedLocationErrors.name}
                            </p>
                          )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">
                          City (Optional)
                        </Label>
                        <Input
                          value={newLocationCity}
                          onChange={(e) => setNewLocationCity(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="h-11 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className={`w-full h-11 font-bold transition-all ${isLocationAttempted && Object.keys(calculatedLocationErrors).length > 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                    >
                      Add Location
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => {
                  setEditingQR(null);
                  setIsFormOpen(true);
                }}
                className="h-11 gap-2 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 px-6"
              >
                <Plus className="w-5 h-5" /> Create QR Code
              </Button>
            </div>
          </div>

          {/* Locations Listing */}
          <div className="space-y-12">
            {locations.map((loc) => {
              const locQRs = filteredQRs.filter(
                (qr) => qr.locationId === loc.id,
              );

              return (
                <section key={loc.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">
                      {loc.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      {locQRs.length} items
                    </span>
                    <div className="flex-1 h-px bg-slate-100 mx-4" />
                    <Link
                      href={`/${businessSlug}/dashboard/qr-codes/location/${loc.slug}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 border-slate-200 text-indigo-600 bg-white hover:bg-indigo-50 font-bold shrink-0"
                      >
                        View Location Analytics
                      </Button>
                    </Link>
                  </div>

                  {locQRs.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/60">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <p className="text-slate-400 font-medium text-sm">
                        No QR codes in this location.
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-indigo-600 font-bold mt-1"
                        onClick={() => {
                          setEditingQR(null);
                          setIsFormOpen(true);
                        }}
                      >
                        + Create One
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <AnimatePresence mode="popLayout">
                        {locQRs.map((qr) => (
                          <motion.div
                            key={qr.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <Card className="group border-none shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden bg-white ring-1 ring-slate-200/60 hover:ring-indigo-200">
                              <CardContent className="p-0">
                                <div className="flex h-full flex-col sm:flex-row">
                                  <div className="w-full sm:w-40 bg-slate-50/50 flex flex-col items-center justify-center p-5 border-b sm:border-b-0 sm:border-r border-slate-100 group-hover:bg-indigo-50/30 transition-colors shrink-0">
                                    <div className="relative p-3 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 group-hover:ring-indigo-100 transition-all group-hover:scale-105">
                                      <QRCodeCanvas
                                        id={`canvas-${qr.id}`}
                                        value={qr.reviewUrl}
                                        size={100}
                                        level="H"
                                        className="rounded-lg"
                                      />
                                      <div className="hidden">
                                        <QRCodeSVG
                                          id={`svg-${qr.id}`}
                                          value={qr.reviewUrl}
                                          size={1024}
                                          level="H"
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-4 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                      {qr.sourceTag}
                                    </div>
                                  </div>
                                  <div className="flex-1 p-6 flex flex-col min-w-0">
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                      <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                          {qr.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase">
                                            <MousePointerClick className="w-3 h-3" />{" "}
                                            {qr.scans} Scans
                                          </div>
                                          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">
                                            <ArrowUpRight className="w-3 h-3" />{" "}
                                            {qr.conversions} Conv.
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                          onClick={() => {
                                            setEditingQR(qr);
                                            setIsFormOpen(true);
                                          }}
                                        >
                                          <Settings className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 -mr-2 -mt-1"
                                          onClick={() => deleteQR(qr.id)}
                                          disabled={deleteMutation.isPending}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="mt-auto space-y-3">
                                      <div className="flex items-center gap-2">
                                        {!hasFeature(
                                          planTier,
                                          user?.subscriptionStatus,
                                          "canAdvancedAnalytics",
                                        ) ? (
                                          <Dialog
                                            open={analyticsGateId === qr.id}
                                            onOpenChange={(open) =>
                                              setAnalyticsGateId(
                                                open ? qr.id : null,
                                              )
                                            }
                                          >
                                            <DialogTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 text-xs gap-2 px-3 w-fit border-slate-200 shadow-none hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-bold text-slate-700 group/btn"
                                              >
                                                <BarChart3 className="w-3.5 h-3.5" />
                                                View Dashboard
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl min-h-[400px]">
                                              <DialogTitle className="sr-only">
                                                Advanced Analytics Access
                                              </DialogTitle>
                                              <DialogDescription className="sr-only">
                                                Upgrade to Growth or Pro plan to
                                                view detailed analytics for this
                                                QR code.
                                              </DialogDescription>
                                              <SubscriptionGateOverlay
                                                title="Advanced Analytics"
                                                planDisplayName="Starter"
                                                description={
                                                  <>
                                                    Detailed scan analytics,
                                                    conversion tracking, and
                                                    geographic data are
                                                    available on{" "}
                                                    <PlanBadge name="Growth" />{" "}
                                                    and <PlanBadge name="Pro" />{" "}
                                                    plans.
                                                  </>
                                                }
                                                onUpgrade={() =>
                                                  (window.location.href = `/${businessSlug}/dashboard/topup`)
                                                }
                                                onClose={() =>
                                                  setAnalyticsGateId(null)
                                                }
                                                iconType="lock"
                                              />
                                            </DialogContent>
                                          </Dialog>
                                        ) : (
                                          <Link
                                            href={`/${businessSlug}/dashboard/qr-codes/${qr.sourceTag}`}
                                            className="flex-1"
                                          >
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-9 text-xs gap-2 px-3 w-fit border-slate-200 shadow-none hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-bold text-slate-700 group/btn"
                                            >
                                              <BarChart3 className="w-3.5 h-3.5" />
                                              View Dashboard
                                            </Button>
                                          </Link>
                                        )}
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-9 text-xs gap-2 px-3 border-slate-200 shadow-none hover:bg-slate-50 font-bold text-slate-700"
                                          onClick={() => copyLink(qr)}
                                        >
                                          {copiedId === qr.id ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                        </Button>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-9 w-9 border-slate-200 shadow-none hover:bg-slate-50 text-slate-600"
                                            >
                                              <Eye className="w-4 h-4" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-8">
                                            <DialogHeader className="space-y-3">
                                              <DialogTitle className="text-2xl font-black text-center text-slate-900">
                                                {qr.name}
                                              </DialogTitle>
                                              <DialogDescription className="text-center font-medium text-slate-500 pb-2">
                                                Scan to visit:{" "}
                                                <span className="text-indigo-600 font-mono break-all">
                                                  {qr.reviewUrl}
                                                </span>
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex flex-col items-center justify-center py-6">
                                              <div className="p-8 bg-slate-50 rounded-3xl shadow-inner border border-slate-100 flex items-center justify-center relative group">
                                                <QRCodeCanvas
                                                  value={qr.reviewUrl}
                                                  size={240}
                                                  level="L"
                                                  className="relative z-10"
                                                />
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                              <Button
                                                className="h-12 gap-2 bg-slate-900 text-white font-bold rounded-2xl"
                                                onClick={() => downloadPNG(qr)}
                                              >
                                                <ImageIcon className="w-4 h-4" />
                                                PNG HD
                                              </Button>
                                              <Button
                                                variant="outline"
                                                className="h-12 gap-2 border-slate-200 hover:bg-slate-50 text-slate-900 font-bold rounded-2xl"
                                                onClick={() => downloadSVG(qr)}
                                              >
                                                <FileCode className="w-4 h-4" />
                                                Vector SVG
                                              </Button>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </section>
              );
            })}

            {/* Unassigned Fallback */}
            {(() => {
              const unassigned = filteredQRs.filter((qr) => !qr.locationId);
              if (unassigned.length === 0 && filteredQRs.length > 0)
                return null;

              if (filteredQRs.length === 0) {
                return (
                  <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <QrCode className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-slate-900">
                        No Codes Found
                      </h3>
                      <p className="text-slate-500 font-medium">
                        Create your first QR code to start tracking.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingQR(null);
                        setIsFormOpen(true);
                      }}
                      className="gap-2 h-12 px-8 bg-indigo-600"
                    >
                      Create My First QR
                    </Button>
                  </div>
                );
              }

              if (unassigned.length > 0)
                return (
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-slate-400" />
                      </div>
                      <h2 className="text-xl font-black text-slate-400">
                        Unassigned
                      </h2>
                      <div className="flex-1 h-px bg-slate-100 ml-4" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {unassigned.map((qr) => (
                        <div key={qr.id}>
                          <Card className="group border-none shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden bg-white ring-1 ring-slate-200/60 hover:ring-indigo-200">
                            <CardContent className="p-0">
                              <div className="flex h-full flex-col sm:flex-row">
                                <div className="w-full sm:w-40 flex flex-col items-center justify-center p-5 border-b sm:border-b-0 sm:border-r border-slate-100 transition-colors shrink-0">
                                  <div className="relative p-3 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 group-hover:ring-indigo-100 transition-all group-hover:scale-105">
                                    <QRCodeCanvas
                                      id={`canvas-${qr.id}`}
                                      value={qr.reviewUrl}
                                      size={100}
                                      level="H"
                                      className="rounded-lg"
                                    />
                                    <div className="hidden">
                                      <QRCodeSVG
                                        id={`svg-${qr.id}`}
                                        value={qr.reviewUrl}
                                        size={1024}
                                        level="H"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-4 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                    {qr.sourceTag}
                                  </div>
                                </div>
                                <div className="flex-1 p-6 flex flex-col min-w-0">
                                  <div className="flex justify-between items-start mb-4 gap-2">
                                    <div className="min-w-0 flex-1">
                                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        {qr.name}
                                      </h3>
                                      <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase">
                                          <MousePointerClick className="w-3 h-3" />{" "}
                                          {qr.scans} Scans
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">
                                          <ArrowUpRight className="w-3 h-3" />{" "}
                                          {qr.conversions} Conv.
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                        onClick={() => {
                                          setEditingQR(qr);
                                          setIsFormOpen(true);
                                        }}
                                      >
                                        <Settings className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 -mr-2 -mt-1"
                                        onClick={() => deleteQR(qr.id)}
                                        disabled={deleteMutation.isPending}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="mt-auto space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                      {!hasFeature(
                                        planTier,
                                        user?.subscriptionStatus,
                                        "canAdvancedAnalytics",
                                      ) ? (
                                        <Dialog
                                          open={analyticsGateId === qr.id}
                                          onOpenChange={(open) =>
                                            setAnalyticsGateId(
                                              open ? qr.id : null,
                                            )
                                          }
                                        >
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-9 text-xs gap-2 px-3 w-fit border-slate-200 shadow-none hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-bold text-slate-700 group/btn"
                                            >
                                              <BarChart3 className="w-3.5 h-3.5" />
                                              View Analytics
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl min-h-[400px]">
                                            <DialogTitle className="sr-only">
                                              Advanced Analytics Access
                                            </DialogTitle>
                                            <DialogDescription className="sr-only">
                                              Upgrade to Growth or Pro plan to
                                              view detailed analytics for this
                                              QR code.
                                            </DialogDescription>
                                            <SubscriptionGateOverlay
                                              title="Advanced Analytics"
                                              planDisplayName="Starter"
                                              description={
                                                <>
                                                  Detailed scan analytics,
                                                  conversion tracking, and
                                                  geographic data are available
                                                  on <PlanBadge name="Growth" />{" "}
                                                  and <PlanBadge name="Pro" />{" "}
                                                  plans.
                                                </>
                                              }
                                              onUpgrade={() =>
                                                (window.location.href = `/${businessSlug}/dashboard/topup`)
                                              }
                                              onClose={() =>
                                                setAnalyticsGateId(null)
                                              }
                                              iconType="lock"
                                            />
                                          </DialogContent>
                                        </Dialog>
                                      ) : (
                                        <Link
                                          href={`/${businessSlug}/dashboard/qr-codes/${qr.sourceTag}`}
                                          className="flex-1"
                                        >
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 text-xs gap-2 px-3 w-fit border-slate-200 shadow-none hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-bold text-slate-700 group/btn"
                                          >
                                            <BarChart3 className="w-3.5 h-3.5" />
                                            View Analytics
                                          </Button>
                                        </Link>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-9 text-xs gap-2 px-3 border-slate-200 shadow-none hover:bg-slate-50 font-bold text-slate-700"
                                          onClick={() => copyLink(qr)}
                                        >
                                          {copiedId === qr.id ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                        </Button>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-9 w-9 border-slate-200 shadow-none hover:bg-slate-50 text-slate-600"
                                            >
                                              <Eye className="w-4 h-4" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-8">
                                            <DialogHeader className="space-y-3">
                                              <DialogTitle className="text-2xl font-black text-center text-slate-900">
                                                {qr.name}
                                              </DialogTitle>
                                              <DialogDescription className="text-center font-medium text-slate-500 pb-2">
                                                Scan to visit:{" "}
                                                <span className="text-indigo-600 font-mono break-all">
                                                  {qr.reviewUrl}
                                                </span>
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex flex-col items-center justify-center py-6">
                                              <div className="p-8 bg-slate-50 rounded-3xl shadow-inner border border-slate-100 flex items-center justify-center relative group">
                                                <QRCodeCanvas
                                                  value={qr.reviewUrl}
                                                  size={240}
                                                  level="L"
                                                  className="relative z-10"
                                                />
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                              <Button
                                                className="h-12 gap-2 bg-slate-900 text-white font-bold rounded-2xl"
                                                onClick={() => downloadPNG(qr)}
                                              >
                                                <ImageIcon className="w-4 h-4" />
                                                PNG HD
                                              </Button>
                                              <Button
                                                variant="outline"
                                                className="h-12 gap-2 border-slate-200 hover:bg-slate-50 text-slate-900 font-bold rounded-2xl"
                                                onClick={() => downloadSVG(qr)}
                                              >
                                                <FileCode className="w-4 h-4" />
                                                Vector SVG
                                              </Button>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              return null;
            })()}
          </div>
        </div>
      </main>

      <QRCodeFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        qr={editingQR}
        locations={locations}
        business={business}
        qrs={qrs}
        onSave={handleSaveQR}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
