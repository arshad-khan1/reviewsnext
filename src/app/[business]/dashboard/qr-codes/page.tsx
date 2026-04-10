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
  Sparkles,
  MessageSquare,
  MapPin,
} from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { mockQRCodes, type QRCodeData } from "@/data/mockQRCodes";
import { mockBusinesses } from "@/data/mockBusinesses";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function QRCodeManager() {
  const params = useParams();
  const businessSlug = params.business as string;
  const business = mockBusinesses.find((b) => b.slug === businessSlug);

  const [qrs, setQrs] = useState<QRCodeData[]>(mockQRCodes);
  const [newName, setNewName] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newAiPrompt, setNewAiPrompt] = useState("");
  const [newCommentStyle, setNewCommentStyle] = useState(
    "Professional & Polite",
  );
  const [newGoogleMapsLink, setNewGoogleMapsLink] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingQR, setEditingQR] = useState<QRCodeData | null>(null);

  const stats = useMemo(() => {
    const totalScans = qrs.reduce((acc, qr) => acc + qr.scans, 0);
    const totalConversions = qrs.reduce(
      (acc, qr) => acc + (qr.conversions || 0),
      0,
    );
    const avgConversion =
      totalScans > 0 ? (totalConversions / totalScans) * 100 : 0;

    return {
      totalScans,
      activeQRs: qrs.length,
      conversionRate: avgConversion.toFixed(1),
    };
  }, [qrs]);

  const filteredQRs = useMemo(() => {
    return qrs.filter(
      (qr) =>
        qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.source.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [qrs, searchQuery]);

  const generateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSource) {
      toast.error("Please fill in both name and source tag");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const newQR: QRCodeData = {
        id: `qr-${Date.now()}`,
        name: newName,
        source: newSource,
        scans: 0,
        conversions: 0,
        createdAt: new Date().toISOString(),
        aiGuidingPrompt: newAiPrompt,
        generatedCommentStyle: newCommentStyle,
        googleMapsReviewLink: newGoogleMapsLink,
      };

      setQrs([newQR, ...qrs]);
      setNewName("");
      setNewSource("");
      setNewAiPrompt("");
      setNewCommentStyle("Professional & Polite");
      setNewGoogleMapsLink("");
      setIsGenerating(false);
      toast.success("QR Code generated successfully!");
    }, 800);
  };

  const updateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQR) return;

    setQrs(qrs.map((qr) => (qr.id === editingQR.id ? editingQR : qr)));
    setEditingQR(null);
    toast.success("QR Code settings updated!");
  };

  const deleteQR = (id: string) => {
    setQrs(qrs.filter((qr) => qr.id !== id));
    toast.success("QR Code deleted");
  };

  const copyLink = (qr: QRCodeData) => {
    const url = `review.yourapp.com/${businessSlug}?source=${qr.source}`;
    navigator.clipboard.writeText(url);
    setCopiedId(qr.id);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadPNG = (qr: QRCodeData) => {
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

  const downloadSVG = (qr: QRCodeData) => {
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

  if (!business) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Total QR Scans",
              value: stats.totalScans,
              icon: Signal,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Active QR Codes",
              value: stats.activeQRs,
              icon: Layers,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Avg. Conversion",
              value: `${stats.conversionRate}%`,
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Generation Section */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <div className="h-1.5 bg-indigo-600 w-full" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Plus className="w-5 h-5 text-indigo-600" />
                  </div>
                  Create New QR
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium pt-1">
                  Create a unique source tag to track where your reviews are
                  coming from.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={generateQR} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="qr-name"
                      className="text-slate-700 font-semibold px-0.5"
                    >
                      QR Name
                    </Label>
                    <Input
                      id="qr-name"
                      placeholder='e.g., "Table 1", "Counter"'
                      value={newName}
                      onChange={(e) => {
                        setNewName(e.target.value);
                        if (!newSource) {
                          setNewSource(
                            e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(/\s+/g, "-")
                              .replace(/[^a-z0-9-]/g, ""),
                          );
                        }
                      }}
                      required
                      className="h-11 border-slate-200 focus:ring-indigo-600 focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="source-tag"
                        className="text-slate-700 font-semibold px-0.5"
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
                        value={newSource}
                        onChange={(e) =>
                          setNewSource(
                            e.target.value.toLowerCase().replace(/\s+/g, "-"),
                          )
                        }
                        required
                        className="h-11 border-slate-200 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-mono text-sm pr-12"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Signal className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold px-0.5 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                        AI Guiding Prompt
                      </Label>
                      <textarea
                        placeholder="Instructions for the AI..."
                        value={newAiPrompt}
                        onChange={(e) => setNewAiPrompt(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold px-0.5 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        Comment Style
                      </Label>
                      <select
                        value={newCommentStyle}
                        onChange={(e) => setNewCommentStyle(e.target.value)}
                        className="flex h-11 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option>Professional & Polite</option>
                        <option>Friendly & Casual</option>
                        <option>Concise & Direct</option>
                        <option>Enthusiastic & Warm</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold px-0.5 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Google Maps Link
                      </Label>
                      <Input
                        placeholder="https://g.page/r/..."
                        value={newGoogleMapsLink}
                        onChange={(e) => setNewGoogleMapsLink(e.target.value)}
                        className="h-11 border-slate-200 focus:ring-indigo-600 focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 gap-2 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5" />
                        Generate QR Code
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-3 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-indigo-900">Track Performance</p>
                  <p className="text-indigo-700/70 text-sm leading-relaxed mt-1">
                    Use unique tags for different locations to see which
                    touchpoint drives the best reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: List Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-2xl shadow-sm">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Filter by name or tag..."
                  className="pl-11 h-11 bg-slate-50 border-none focus-visible:ring-indigo-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider">
                {filteredQRs.length} Generated Codes
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredQRs.length > 0 ? (
                  filteredQRs.map((qr) => (
                    <motion.div
                      key={qr.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <Card className="group border-none shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden bg-white ring-1 ring-slate-200/60 hover:ring-indigo-200">
                        <CardContent className="p-0">
                          <div className="flex h-full">
                            {/* Left: Mini QR */}
                            <div className="w-40 bg-slate-50/50 flex flex-col items-center justify-center p-5 border-r border-slate-100 group-hover:bg-indigo-50/30 transition-colors shrink-0">
                              <div className="relative p-3 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 group-hover:ring-indigo-100 transition-all group-hover:scale-105">
                                <QRCodeCanvas
                                  id={`canvas-${qr.id}`}
                                  value={`review.yourapp.com/${businessSlug}?source=${qr.source}`}
                                  size={100}
                                  level="H"
                                  className="rounded-lg"
                                />
                                <div className="hidden">
                                  <QRCodeSVG
                                    id={`svg-${qr.id}`}
                                    value={`review.yourapp.com/${businessSlug}?source=${qr.source}`}
                                    size={1024}
                                    level="H"
                                  />
                                </div>
                              </div>
                              <div className="mt-4 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                {qr.source}
                              </div>
                            </div>

                            {/* Right: Info */}
                            <div className="flex-1 p-6 flex flex-col min-w-0">
                              <div className="flex justify-between items-start mb-4 gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {qr.name}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase">
                                      <MousePointerClick className="w-3 h-3" />
                                      {qr.scans} Scans
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">
                                      <ArrowUpRight className="w-3 h-3" />
                                      {qr.conversions} Conv.
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Dialog
                                    open={!!editingQR}
                                    onOpenChange={(open) =>
                                      !open && setEditingQR(null)
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                        onClick={() => setEditingQR(qr)}
                                      >
                                        <Settings className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-lg bg-white">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Edit QR Settings
                                        </DialogTitle>
                                        <DialogDescription>
                                          Configure AI and redirection settings
                                          for &quot;{qr.name}&quot;
                                        </DialogDescription>
                                      </DialogHeader>
                                      <form
                                        onSubmit={updateQR}
                                        className="space-y-4 mt-4"
                                      >
                                        <div className="space-y-2">
                                          <Label>AI Guiding Prompt</Label>
                                          <textarea
                                            value={
                                              editingQR?.aiGuidingPrompt || ""
                                            }
                                            onChange={(e) =>
                                              setEditingQR((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      aiGuidingPrompt:
                                                        e.target.value,
                                                    }
                                                  : null,
                                              )
                                            }
                                            className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Comment Style</Label>
                                          <select
                                            value={
                                              editingQR?.generatedCommentStyle ||
                                              ""
                                            }
                                            onChange={(e) =>
                                              setEditingQR((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      generatedCommentStyle:
                                                        e.target.value,
                                                    }
                                                  : null,
                                              )
                                            }
                                            className="flex h-11 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                                          >
                                            <option>
                                              Professional & Polite
                                            </option>
                                            <option>Friendly & Casual</option>
                                            <option>Concise & Direct</option>
                                            <option>Enthusiastic & Warm</option>
                                          </select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Google Maps Review Link</Label>
                                          <Input
                                            value={
                                              editingQR?.googleMapsReviewLink ||
                                              ""
                                            }
                                            onChange={(e) =>
                                              setEditingQR((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      googleMapsReviewLink:
                                                        e.target.value,
                                                    }
                                                  : null,
                                              )
                                            }
                                            className="h-11 border-slate-200 focus:ring-indigo-600 focus:border-indigo-600"
                                          />
                                        </div>
                                        <Button
                                          type="submit"
                                          className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4"
                                        >
                                          Save Changes
                                        </Button>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 -mr-2 -mt-1"
                                    onClick={() => deleteQR(qr.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/${businessSlug}/dashboard/qr-codes/${qr.id}`}
                                    className="flex-1"
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-9 text-xs gap-2 px-3 w-full border-slate-200 shadow-none hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-bold text-slate-700 group/btn"
                                    >
                                      <BarChart3 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                                      View Dashboard
                                    </Button>
                                  </Link>
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
                                          <span className="text-indigo-600 font-mono">
                                            review.yourapp.com/{businessSlug}
                                            ?source={qr.source}
                                          </span>
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="flex flex-col items-center justify-center py-6">
                                        <div className="p-8 bg-slate-50 rounded-3xl shadow-inner border border-slate-100 flex items-center justify-center relative group">
                                          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
                                          <QRCodeCanvas
                                            value={`review.yourapp.com/${businessSlug}?source=${qr.source}`}
                                            size={240}
                                            level="H"
                                            className="relative z-10"
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 mt-4">
                                        <Button
                                          className="h-12 gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl"
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
                  ))
                ) : (
                  <div className="col-span-full py-28 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 relative">
                      <QrCode className="w-12 h-12" />
                      <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <Plus className="w-4 h-4 text-indigo-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-black text-2xl text-slate-900">
                        No QR Codes Found
                      </h3>
                      <p className="text-slate-500 text-base max-w-[320px] mx-auto font-medium leading-relaxed">
                        Generate your first QR code to start tracking review
                        traffic from physical locations.
                      </p>
                    </div>
                    <Button
                      className="gap-2 h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-base font-bold shadow-xl shadow-indigo-200 rounded-2xl"
                      onClick={() =>
                        document.getElementById("qr-name")?.focus()
                      }
                    >
                      <Plus className="w-5 h-5" />
                      Create My First QR
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
