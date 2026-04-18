"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Clock, Smartphone, Globe, Shield, MapPin } from "lucide-react";
import DetailRow from "./DetailRow";
import { useReviewDetails } from "@/hooks/use-details";

interface ReviewDetailDialogProps {
  reviewId: string | null;
  businessSlug: string;
  onClose: () => void;
}

export default function ReviewDetailDialog({ reviewId, businessSlug, onClose }: ReviewDetailDialogProps) {
  const { data: review, isLoading } = useReviewDetails(businessSlug, reviewId);

  return (
    <Dialog open={!!reviewId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-3xl overflow-hidden border-none p-0 bg-card shadow-2xl">
        <div className="bg-primary/5 p-6 border-b border-primary/10">
          <DialogHeader className="p-0">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              Review Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              View full details of the customer review, including scan metadata and device information.
            </DialogDescription>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading record details...</p>
          </div>
        ) : review ? (
          <div className="p-6 space-y-8 overflow-y-auto max-h-[80vh]">
            {/* Header / Meta Info */}
            <div className="flex flex-wrap gap-6 items-start justify-between">
              <div className="space-y-4">
                <DetailRow label="Submitted At" value={review.formattedAt} />
                {review.scan && (
                  <DetailRow label="First Scanned At" value={review.scan.formattedAt} />
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Status
                </span>
                <div>
                  {review.type === "POSITIVE" ? (
                    <Badge className="bg-success/10 text-success border-success/20 font-bold px-3 py-1">
                      <ThumbsUp className="w-3 h-3 mr-1.5" />
                      Positive
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 font-bold px-3 py-1">
                      <ThumbsDown className="w-3 h-3 mr-1.5" />
                      Negative
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-star uppercase tracking-[0.2em]">
                  Rating Given
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < review.rating ? "fill-star text-star" : "text-slate-200"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-4">
              {review.reviewText && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 relative">
                  <span className="absolute -top-2.5 left-4 bg-white px-2 py-0.5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                    Review Content
                  </span>
                  <p className="text-sm leading-relaxed text-slate-600 font-medium italic">
                    &quot;{review.reviewText}&quot;
                  </p>
                  {review.reviewWasAiDraft && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] font-bold bg-indigo-50 text-indigo-600 border-indigo-100">
                        ✨ AI Drafted
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {review.whatWentWrong && (
                <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100 relative">
                  <span className="absolute -top-2.5 left-4 bg-white px-2 py-0.5 rounded-full text-[9px] font-black text-red-500 uppercase tracking-widest border border-red-100">
                    What Went Wrong
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    {review.whatWentWrong}
                  </p>
                </div>
              )}

              {review.howToImprove && (
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 relative">
                  <span className="absolute -top-2.5 left-4 bg-white px-2 py-0.5 rounded-full text-[9px] font-black text-indigo-500 uppercase tracking-widest border border-indigo-100">
                    Improvement Suggestion
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    {review.howToImprove}
                  </p>
                </div>
              )}
            </div>

            {/* Scan Metadata (Linked Data) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                Customer Session & Device info
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <DetailRow label="Device" value={review.scan?.device || "Unknown"} />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                    <Globe className="w-4 h-4" />
                  </div>
                  <DetailRow label="Browser" value={`${review.scan?.browser || "Unknown"} (${review.scan?.os || "N/A"})`} />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                    <Shield className="w-4 h-4" />
                  </div>
                  <DetailRow label="IP Address" value={review.scan?.ipAddress || "Hidden"} />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <DetailRow 
                    label="Location" 
                    value={review.scan?.city ? `${review.scan.city}, ${review.scan.country || ""}` : "Location not captured"} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <DetailRow
                label="Public Submission"
                value={
                  review.submittedToGoogle ? (
                    <Badge variant="outline" className="bg-success/5 text-success border-success/20 text-[10px] font-black">
                      PUBLISHED TO GOOGLE MAPS ✅
                    </Badge>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Captured internally only</span>
                  )
                }
              />
            </div>

            <Button
              onClick={onClose}
              className="w-full rounded-2xl py-6 font-black text-base shadow-xl shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Close Details
            </Button>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground font-bold">
            Record not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
