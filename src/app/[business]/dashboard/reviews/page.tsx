"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockReviews, mockScans } from "@/data/mockDashboardData";
import { mockBusinesses } from "@/data/mockBusinesses";
import ReviewsTable from "../components/ReviewsTable";
import QRScansTable from "../components/QRScansTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReviewEntry, QRScan } from "@/data/mockDashboardData";
import DetailRow from "../components/DetailRow";
import DashboardTabSwitcher from "../components/DashboardTabSwitcher";
import DashboardFilters from "../components/DashboardFilters";

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
  const businessSlug = params.business as string;
  const business = mockBusinesses.find((b) => b.slug === businessSlug);

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<"positive" | "negative" | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [scansPage, setScansPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"reviews" | "scans">("reviews");
  const [selectedReview, setSelectedReview] = useState<ReviewEntry | null>(
    null,
  );
  const [selectedScan, setSelectedScan] = useState<QRScan | null>(null);

  const filteredReviews = useMemo(() => {
    return mockReviews.filter((review) => {
      const searchStr = (
        review.review ||
        review.whatWentWrong ||
        ""
      ).toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesRating =
        ratingFilter === null || review.rating === ratingFilter;
      const matchesType = typeFilter === null || review.type === typeFilter;
      return matchesSearch && matchesRating && matchesType;
    });
  }, [searchQuery, ratingFilter, typeFilter]);

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const totalScansPages = Math.ceil(mockScans.length / ITEMS_PER_PAGE);
  const paginatedScans = mockScans.slice(
    (scansPage - 1) * ITEMS_PER_PAGE,
    scansPage * ITEMS_PER_PAGE,
  );

  if (!business) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      {/* Main Content */}
      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Tab Switcher & Filters */}
        <DashboardTabSwitcher
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reviewCount={filteredReviews.length}
          scanCount={mockScans.length}
        />

        {activeTab === "reviews" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardFilters
              searchQuery={searchQuery}
              setSearchQuery={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              typeFilter={typeFilter}
              setTypeFilter={(t) => {
                setTypeFilter(t);
                setCurrentPage(1);
              }}
              ratingFilter={ratingFilter}
              setRatingFilter={(r) => {
                setRatingFilter(r);
                setCurrentPage(1);
              }}
            />

            {/* Reviews Table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
              <ReviewsTable
                onViewReview={setSelectedReview}
                reviews={paginatedReviews}
              />
            </div>

            {/* Reviews Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Showing{" "}
                  <span className="text-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-foreground">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredReviews.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-foreground">
                    {filteredReviews.length}
                  </span>{" "}
                  entries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="h-10 px-4 rounded-xl font-bold bg-card border-border/50 shadow-sm transition-all active:scale-95"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Scans Table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
              <QRScansTable
                onViewScan={setSelectedScan}
                scans={paginatedScans}
              />
            </div>

            {/* Scans Pagination */}
            {totalScansPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Showing{" "}
                  <span className="text-foreground">
                    {(scansPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-foreground">
                    {Math.min(scansPage * ITEMS_PER_PAGE, mockScans.length)}
                  </span>{" "}
                  of <span className="text-foreground">{mockScans.length}</span>{" "}
                  scans
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setScansPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={scansPage === 1}
                    className="h-10 px-4 rounded-xl font-bold bg-card border-border/50 shadow-sm transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalScansPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setScansPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${scansPage === i + 1 ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20 scale-105" : "text-muted-foreground hover:bg-muted/50"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setScansPage((prev) =>
                        Math.min(prev + 1, totalScansPages),
                      )
                    }
                    disabled={scansPage === totalScansPages}
                    className="h-10 px-4 rounded-xl font-bold bg-card border-border/50 shadow-sm transition-all active:scale-95"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Date & Time
                  </span>
                  <p className="text-sm font-semibold">
                    {formatDate(selectedReview.timestamp)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Type
                  </span>
                  <div>
                    {selectedReview.type === "positive" ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        Positive
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="bg-destructive/10 text-destructive border-destructive/20"
                      >
                        Negative
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-star">
                  Rating
                </span>
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Review Content
                  </span>
                  <p className="text-sm leading-relaxed italic">
                    &quot;{selectedReview.review}&quot;
                  </p>
                </div>
              )}

              {selectedReview.whatWentWrong && (
                <div className="space-y-1 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                  <span className="text-[10px] font-bold text-destructive uppercase tracking-widest">
                    What Went Wrong
                  </span>
                  <p className="text-sm font-medium">
                    {selectedReview.whatWentWrong}
                  </p>
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

              <Button
                onClick={() => setSelectedReview(null)}
                className="w-full rounded-xl py-6 font-bold text-base shadow-lg shadow-primary/20"
              >
                Close Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scan Detail Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden border-none p-0 bg-card">
          <div className="bg-orange-500/5 p-6 border-b border-orange-500/10">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Search className="w-4 h-4" />
                </div>
                Scan Details
              </DialogTitle>
            </DialogHeader>
          </div>

          {selectedScan && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Timestamp
                  </span>
                  <p className="text-sm font-semibold">
                    {formatDate(selectedScan.timestamp)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Converted
                  </span>
                  <div>
                    {selectedScan.resultedInReview ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        Yes ✅
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground border-border"
                      >
                        No
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                <DetailRow label="Device" value={selectedScan.device} />
                <DetailRow label="OS" value={selectedScan.os} />
                <DetailRow label="Browser" value={selectedScan.browser} />
                <DetailRow label="IP Address" value={selectedScan.ip} />
                <DetailRow
                  label="Location"
                  value={`${selectedScan.city}, ${selectedScan.country}`}
                />
                {selectedScan.resultedInReview && (
                  <DetailRow
                    label="Rating"
                    value={`${selectedScan.rating} ★`}
                  />
                )}
              </div>

              <Button
                onClick={() => setSelectedScan(null)}
                className="w-full rounded-xl py-6 font-bold text-base bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20"
              >
                Close Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
