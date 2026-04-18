"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Signal, TrendingUp, ArrowUpRight, Calendar, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { useQRCodeDetail } from "@/hooks/use-qr-codes";
import { useReviews } from "@/hooks/use-reviews";
import { useScans } from "@/hooks/use-scans";
import { ReviewType } from "@/types/prisma-enums";

import DashboardTabSwitcher from "../../components/DashboardTabSwitcher";
import DashboardFilters from "../../components/DashboardFilters";
import ReviewsTable from "../../components/ReviewsTable";
import QRScansTable from "../../components/QRScansTable";
import StatCard from "../../components/StatCard";

export default function IndividualQRDashboard() {
  const params = useParams();
  const businessSlug = params.business as string;
  const qrId = params.id as string; // Will actually be the sourceTag now!

  const [activeTab, setActiveTab] = useState<"reviews" | "scans">("reviews");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReviewType | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [resultFilter, setResultFilter] = useState<boolean | null>(null);
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date} | undefined>();

  // Queries
  const { data: qrData, isLoading: isQrLoading } = useQRCodeDetail(businessSlug, qrId);
  const qrCode = qrData?.qrCode;

  // Real ID from returned QR object
  const realQrId = qrCode?.id;

  const { data: reviewsData, isLoading: isReviewsLoading } = useReviews(businessSlug, {
    qrCodeId: realQrId,
    search: searchQuery,
    type: typeFilter,
    rating: ratingFilter,
    from: dateRange?.from,
    to: dateRange?.to,
  });

  const { data: scansData, isLoading: isScansLoading } = useScans(businessSlug, {
    qrCodeId: realQrId,
    search: searchQuery,
    resultedInReview: resultFilter,
    from: dateRange?.from,
    to: dateRange?.to,
  });

  if (isQrLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">QR code not found.</p>
      </div>
    );
  }

  const stats = qrCode.stats;
  const filteredReviews = reviewsData?.data || [];
  const filteredScans = scansData?.data || [];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <Link href={`/${businessSlug}/dashboard/qr-codes`}>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground mb-4 -ml-2 group transition-all">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to QR Code Management
          </Button>
        </Link>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900">{qrCode.name}</h1>
          <p className="text-slate-500 font-mono mt-1 pr-12 text-sm">{qrCode.sourceTag}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Scans"
            value={stats?.totalScans || 0}
            icon={Signal}
            color="hsl(220, 70%, 55%)"
          />
          <StatCard
            title="Conversions"
            value={stats?.totalReviews || 0}
            icon={ArrowUpRight}
            color="hsl(152, 60%, 45%)"
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats?.conversionRate || 0}%`}
            icon={TrendingUp}
            color="hsl(25, 95%, 53%)"
          />
          <StatCard
            title="Avg Rating"
            value={stats?.avgRating || 0}
            icon={Calendar}
            color="hsl(45, 97%, 54%)"
          />
        </div>

        <div className="space-y-6">
          <DashboardTabSwitcher
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reviewCount={reviewsData?.pagination.total || 0}
            scanCount={scansData?.pagination.total || 0}
          />

          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
              <DashboardFilters
                mode={activeTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={(val) => setTypeFilter(val as any)}
                ratingFilter={ratingFilter}
                setRatingFilter={setRatingFilter}
                resultFilter={resultFilter}
                setResultFilter={setResultFilter}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onClearAll={() => {
                  setSearchQuery("");
                  setTypeFilter(null);
                  setRatingFilter(null);
                  setResultFilter(null);
                  setDateRange(undefined);
                }}
              />
            </div>
            
            <div className="p-6 relative min-h-[300px]">
              {(activeTab === "reviews" ? isReviewsLoading : isScansLoading) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-b-3xl">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              )}
              
              <div className="rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                {activeTab === "reviews" ? (
                  <ReviewsTable onViewReview={() => {}} reviews={filteredReviews as any} />
                ) : (
                  <QRScansTable onViewScan={() => {}} scans={filteredScans as any} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
