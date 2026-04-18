"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Pagination } from "@/components/shared/Pagination";
import ReviewsTable from "../components/ReviewsTable";
import QRScansTable from "../components/QRScansTable";
import DashboardTabSwitcher from "../components/DashboardTabSwitcher";
import DashboardFilters from "../components/DashboardFilters";
import ReviewDetailDialog from "../components/ReviewDetailDialog";
import ScanDetailDialog from "../components/ScanDetailDialog";
import { useReviews } from "@/hooks/use-reviews";
import { useScans } from "@/hooks/use-scans";
import { ReviewType } from "@/types/prisma-enums";

const DEFAULT_LIMIT = 10;
const LIMIT_OPTIONS = [10, 20, 50];

export default function ReviewsClient() {
  const params = useParams();
  const businessSlug = params.business as string;

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<ReviewType | null>(null);
  const [dateRange, setDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >();

  const [scansSearchQuery, setScansSearchQuery] = useState("");
  const [scansResultFilter, setScansResultFilter] = useState<boolean | null>(
    null,
  );
  const [scansDateRange, setScansDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >();

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
    <div className="min-h-screen bg-white pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        {/* Page Heading */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="mb-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Reviews & Customer Feedback
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Monitor and manage what your customers are saying about your
              business.
            </p>
          </div>
        </section>
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
              <ReviewsTable
                onViewReview={(r) => setSelectedReviewId(r.id)}
                reviews={reviewsData?.data || []}
                isLoading={isLoadingReviews}
              />
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
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${limit === opt ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
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
              <QRScansTable
                onViewScan={(s) => setSelectedScanId(s.id)}
                scans={scansData?.data || []}
                isLoading={isLoadingScans}
              />
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
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${scansLimit === opt ? "bg-white text-orange-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Pagination
                currentPage={scansPage}
                totalPages={totalScansPages}
                onPageChange={setScansPage}
              />
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
