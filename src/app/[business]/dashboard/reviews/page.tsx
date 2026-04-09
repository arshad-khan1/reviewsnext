"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockReviews } from "@/data/mockDashboardData";
import { mockBusinesses } from "@/data/mockBusinesses";
import ReviewsTable from "../components/ReviewsTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReviewEntry } from "@/data/mockDashboardData";
import DetailRow from "../components/DetailRow";

const ITEMS_PER_PAGE = 8;

const formatDate = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.business as string;
  const business = mockBusinesses.find(b => b.slug === businessSlug);

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<"positive" | "negative" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ReviewEntry | null>(null);

  const filteredReviews = useMemo(() => {
    return mockReviews.filter(review => {
      const searchStr = (review.review || review.whatWentWrong || "").toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesRating = ratingFilter === null || review.rating === ratingFilter;
      const matchesType = typeFilter === null || review.type === typeFilter;
      return matchesSearch && matchesRating && matchesType;
    });
  }, [searchQuery, ratingFilter, typeFilter]);

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!business) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push(`/${businessSlug}/dashboard`)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-foreground">All Reviews & Feedback</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{business.name}</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-muted text-muted-foreground font-mono">
            {filteredReviews.length} Results
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search feedback content..." 
              className="pl-9 h-11 bg-card/50"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg border border-border/50">
            <button
               onClick={() => { setTypeFilter(null); setCurrentPage(1); }}
               className={`flex-1 h-9 rounded-md text-xs font-bold transition-all ${typeFilter === null ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              ALL
            </button>
            <button
               onClick={() => { setTypeFilter("positive"); setCurrentPage(1); }}
               className={`flex-1 h-9 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${typeFilter === "positive" ? "bg-success/10 text-success" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              HAPPY
            </button>
            <button
               onClick={() => { setTypeFilter("negative"); setCurrentPage(1); }}
               className={`flex-1 h-9 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${typeFilter === "negative" ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              SAD
            </button>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto no-scrollbar">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => { setRatingFilter(ratingFilter === rating ? null : rating); setCurrentPage(1); }}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center shrink-0 ${
                  ratingFilter === rating 
                  ? "bg-star/10 text-star border-star/30 shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)] scale-110" 
                  : "bg-background text-muted-foreground border-border hover:border-star/20"
                }`}
              >
                {rating}★
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
          <ReviewsTable 
            onViewReview={setSelectedReview} 
            reviews={paginatedReviews}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Showing <span className="text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, filteredReviews.length)}</span> of <span className="text-foreground">{filteredReviews.length}</span> entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-10 px-4 rounded-xl font-bold bg-card border-border/50 shadow-sm transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                 {Array.from({ length: totalPages }).map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:bg-muted/50"}`}
                   >
                     {i + 1}
                   </button>
                 ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-10 px-4 rounded-xl font-bold bg-card border-border/50 shadow-sm transition-all active:scale-95"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Review Detail Dialog */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={() => setSelectedReview(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden border-none p-0 bg-card">
          <div className="bg-primary/5 p-6 border-b border-primary/10">
             <DialogHeader className="p-0">
               <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="w-4 h-4" />
                 </div>
                 Review Details
               </DialogTitle>
             </DialogHeader>
          </div>
          
          {selectedReview && (
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date & Time</span>
                    <p className="text-sm font-semibold">{formatDate(selectedReview.timestamp)}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</span>
                    <div>
                    {selectedReview.type === "positive" ? (
                      <Badge className="bg-success/10 text-success border-success/20">Positive</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Negative</Badge>
                    )}
                    </div>
                 </div>
              </div>

              <div className="space-y-1">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-star">Rating</span>
                 <div className="flex gap-0.5">
                   {Array.from({ length: 5 }).map((_, i) => (
                     <Star
                       key={i}
                       className={`h-4 w-4 ${i < selectedReview.rating ? "fill-star text-star" : "text-muted-foreground/30"}`}
                     />
                   ))}
                 </div>
              </div>

              {selectedReview.review && (
                <div className="space-y-1 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Review Content</span>
                  <p className="text-sm leading-relaxed italic">&quot;{selectedReview.review}&quot;</p>
                </div>
              )}

              {selectedReview.whatWentWrong && (
                <div className="space-y-1 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                  <span className="text-[10px] font-bold text-destructive uppercase tracking-widest">What Went Wrong</span>
                  <p className="text-sm font-medium">{selectedReview.whatWentWrong}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-border/50">
                <DetailRow label="Device" value={selectedReview.device} />
                <DetailRow label="Browser" value={selectedReview.browser} />
                <DetailRow label="OS" value={selectedReview.os} />
                <DetailRow
                  label="To Google"
                  value={selectedReview.submittedToGoogle ? "Yes ✅" : "No"}
                />
              </div>

              <Button onClick={() => setSelectedReview(null)} className="w-full rounded-xl py-6 font-bold text-base shadow-lg shadow-primary/20">
                Close Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
