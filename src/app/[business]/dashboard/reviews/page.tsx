"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewsTable from "../components/ReviewsTable";
import QRScansTable from "../components/QRScansTable";
import DashboardTabSwitcher from "../components/DashboardTabSwitcher";
import DashboardFilters from "../components/DashboardFilters";
import ReviewDetailDialog from "../components/ReviewDetailDialog";
import ScanDetailDialog from "../components/ScanDetailDialog";
import { useReviews } from "@/hooks/use-reviews";
import { useScans } from "@/hooks/use-scans";
import { ReviewType } from "@prisma/client";

const DEFAULT_LIMIT = 10;
const LIMIT_OPTIONS = [10, 20, 50];

export default function ReviewsPage() {
  const params = useParams();
  const businessSlug = params.business as string;

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<ReviewType | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();

  const [scansSearchQuery, setScansSearchQuery] = useState("");
  const [scansResultFilter, setScansResultFilter] = useState<boolean | null>(null);
  const [scansDateRange, setScansDateRange] = useState<{ from?: Date; to?: Date } | undefined>();

  // Pagination State
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [currentPage, setCurrentPage] = useState(1);
  const [scansPage, setScansPage] = useState(1);
  const [scansLimit, setScansLimit] = useState(DEFAULT_LIMIT);

  // Tab State
  const [activeTab, setActiveTab] = useState<"reviews" | "scans">("reviews");

  // Selection State (for Dialogs)
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const { data: reviewsData, isLoading: isLoadingReviews } = useReviews(
    businessSlug,
    {
      page: currentPage,
      limit: limit,
      type: typeFilter,
      rating: ratingFilter,
      search: searchQuery,
      from: dateRange?.from,
      to: dateRange?.to,
    },
  );

  // Fetch Scans
  const { data: scansData, isLoading: isLoadingScans } = useScans(
    businessSlug,
    {
      page: scansPage,
      limit: scansLimit,
      search: scansSearchQuery,
      resultedInReview: scansResultFilter,
      from: scansDateRange?.from,
      to: scansDateRange?.to,
    },
  );

  const totalPages = reviewsData?.pagination.totalPages || 1;
  const totalScansPages = scansData?.pagination.totalPages || 1;

  return (
    <div className="min-h-screen bg-background pb-12">
      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-8 space-y-8">
        <DashboardTabSwitcher
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reviewCount={reviewsData?.pagination.total || 0}
          scanCount={scansData?.pagination.total || 0}
        />

        {activeTab === "reviews" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardFilters
              mode="reviews"
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
              dateRange={dateRange}
              setDateRange={(range) => {
                setDateRange(range);
                setCurrentPage(1);
              }}
              onClearAll={() => {
                setSearchQuery("");
                setTypeFilter(null);
                setRatingFilter(null);
                setDateRange(undefined);
                setCurrentPage(1);
              }}
            />

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5 relative">
              {isLoadingReviews && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-bold text-primary animate-pulse tracking-widest uppercase">
                    Fetching Reviews...
                  </p>
                </div>
              )}
              {reviewsData && reviewsData.data.length > 0 ? (
                <ReviewsTable
                  onViewReview={(r) => setSelectedReviewId(r.id)}
                  reviews={reviewsData.data}
                />
              ) : (
                !isLoadingReviews && (
                  <div className="py-12 text-center bg-muted/5 animate-in fade-in duration-500">
                    <p className="text-sm font-bold text-muted-foreground/60 tracking-wide">
                      No reviews found matching your filters.
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Showing{" "}
                  <span className="text-foreground">
                    {(currentPage - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-foreground">
                    {Math.min(
                      currentPage * limit,
                      reviewsData?.pagination.total || 0,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-foreground">
                    {reviewsData?.pagination.total || 0}
                  </span>{" "}
                  entries
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Limit:
                  </label>
                  <div className="flex bg-muted rounded-lg p-0.5 border border-border">
                    {LIMIT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setLimit(opt);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${limit === opt ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardFilters
              mode="scans"
              searchQuery={scansSearchQuery}
              setSearchQuery={(q) => {
                setScansSearchQuery(q);
                setScansPage(1);
              }}
              resultFilter={scansResultFilter}
              setResultFilter={(r) => {
                setScansResultFilter(r);
                setScansPage(1);
              }}
              dateRange={scansDateRange}
              setDateRange={(range) => {
                setScansDateRange(range);
                setScansPage(1);
              }}
              onClearAll={() => {
                setScansSearchQuery("");
                setScansResultFilter(null);
                setScansDateRange(undefined);
                setScansPage(1);
              }}
            />

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5 relative">
              {isLoadingScans && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-orange-600 animate-pulse tracking-widest uppercase">
                    Scanning Activity...
                  </p>
                </div>
              )}
              {scansData && scansData.data.length > 0 ? (
                <QRScansTable
                  onViewScan={(s) => setSelectedScanId(s.id)}
                  scans={scansData.data}
                />
              ) : (
                !isLoadingScans && (
                  <div className="py-12 text-center bg-muted/5 animate-in fade-in duration-500">
                    <p className="text-sm font-bold text-muted-foreground/60 tracking-wide">
                      No scan events recorded yet.
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Showing{" "}
                  <span className="text-foreground">
                    {(scansPage - 1) * scansLimit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-foreground">
                    {Math.min(
                      scansPage * scansLimit,
                      scansData?.pagination.total || 0,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-foreground">
                    {scansData?.pagination.total || 0}
                  </span>{" "}
                  scans
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Limit:
                  </label>
                  <div className="flex bg-muted rounded-lg p-0.5 border border-border">
                    {LIMIT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setScansLimit(opt);
                          setScansPage(1);
                        }}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${scansLimit === opt ? "bg-white text-orange-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScansPage((prev) => Math.max(prev - 1, 1))}
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
                    setScansPage((prev) => Math.min(prev + 1, totalScansPages))
                  }
                  disabled={scansPage === totalScansPages}
                  className="h-10 px-4 rounded-xl font-bold bg-card border-border/50 shadow-sm transition-all active:scale-95"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Reusable Detail Dialogs */}
      <ReviewDetailDialog
        reviewId={selectedReviewId}
        businessSlug={businessSlug}
        onClose={() => setSelectedReviewId(null)}
      />
      <ScanDetailDialog
        scanId={selectedScanId}
        businessSlug={businessSlug}
        onClose={() => setSelectedScanId(null)}
      />
    </div>
  );
}
