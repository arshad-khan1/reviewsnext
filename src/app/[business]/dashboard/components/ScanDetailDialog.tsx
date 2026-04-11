"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Smartphone, Globe, Shield, MapPin, MessageSquare, Star, Clock } from "lucide-react";
import DetailRow from "./DetailRow";
import { useScanDetails } from "@/hooks/use-details";

interface ScanDetailDialogProps {
  scanId: string | null;
  businessSlug: string;
  onClose: () => void;
}

const formatDate = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ScanDetailDialog({ scanId, businessSlug, onClose }: ScanDetailDialogProps) {
  const { data: scan, isLoading } = useScanDetails(businessSlug, scanId);

  return (
    <Dialog open={!!scanId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-3xl overflow-hidden border-none p-0 bg-card shadow-2xl">
        <div className="bg-orange-500/5 p-6 border-b border-orange-500/10">
          <DialogHeader className="p-0">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                <Search className="w-5 h-5" />
              </div>
              Scan Event Details
            </DialogTitle>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading scan context...</p>
          </div>
        ) : scan ? (
          <div className="p-6 space-y-8 overflow-y-auto max-h-[80vh]">
            <div className="flex flex-wrap gap-6 items-start justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Scanned At
                </span>
                <p className="text-sm font-bold text-slate-700">
                  {formatDate(scan.scannedAt)}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Review Conversion
                </span>
                <div>
                  {scan.resultedInReview ? (
                    <Badge className="bg-success/10 text-success border-success/20 font-bold px-3 py-1">
                      Converted ✅
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold px-3 py-1">
                      Scan Only
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  QR Source
                </span>
                <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  {scan.qrCode?.name || "Global QR"}
                </p>
              </div>
            </div>

            {/* Device & Session Info */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Device &amp; Session Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-5 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <Smartphone className="w-4.5 h-4.5" />
                  </div>
                  <DetailRow label="Device" value={scan.device || "Unknown Hardware"} />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <Globe className="w-4.5 h-4.5" />
                  </div>
                  <DetailRow label="Browser/OS" value={`${scan.browser || "Unknown"} on ${scan.os || "N/A"}`} />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <DetailRow label="IP Address" value={scan.ipAddress || "Private IP"} />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <DetailRow label="Location" value={scan.city ? `${scan.city}, ${scan.country || ""}` : "Location Hidden"} />
                </div>
              </div>
            </div>

            {/* If there's a linked review, show it */}
            {scan.review && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">
                  Linked Customer Feedback
                </h3>
                <div className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4.5 w-4.5 ${i < scan.review.rating ? "fill-star text-star" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                    <Badge variant="outline" className="bg-white border-indigo-100 text-indigo-600 text-[9px] font-black">
                      ID: {scan.review.id.slice(-6).toUpperCase()}
                    </Badge>
                  </div>

                  {scan.review.reviewText && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                        &quot;{scan.review.reviewText}&quot;
                      </p>
                    </div>
                  )}

                  {(scan.review.whatWentWrong || scan.review.howToImprove) && (
                    <div className="grid grid-cols-1 gap-3 pt-2">
                       {scan.review.whatWentWrong && (
                         <div className="space-y-1">
                           <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Pain Point</span>
                           <p className="text-xs font-bold text-slate-700">{scan.review.whatWentWrong}</p>
                         </div>
                       )}
                       {scan.review.howToImprove && (
                         <div className="space-y-1">
                           <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Suggestion</span>
                           <p className="text-xs font-bold text-slate-700">{scan.review.howToImprove}</p>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={onClose}
              className="w-full rounded-2xl py-6 font-black text-base bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-600/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Close Details
            </Button>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground font-bold">
            Scan record not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
