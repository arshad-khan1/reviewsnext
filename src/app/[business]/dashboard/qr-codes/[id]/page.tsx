"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Signal, TrendingUp, ArrowUpRight, Calendar } from "lucide-react";
import { mockQRCodes, type QRCodeData } from "@/data/mockQRCodes";
import {
  mockScans,
  mockReviews,
  getStatsForQR,
} from "@/data/mockDashboardData";
import DashboardTabSwitcher from "../../components/DashboardTabSwitcher";
import DashboardFilters from "../../components/DashboardFilters";
import ReviewsTable from "../../components/ReviewsTable";
import QRScansTable from "../../components/QRScansTable";
import StatCard from "../../components/StatCard";

export default function IndividualQRDashboard() {
  const params = useParams();
  const qrId = params.id as string;

  const initialQR = mockQRCodes.find((q) => q.id === qrId);
  const [qr, setQr] = useState<QRCodeData | undefined>(initialQR);
  const [activeTab, setActiveTab] = useState<"reviews" | "scans">("reviews");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"positive" | "negative" | null>(
    null,
  );
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // Filtered data for this specific QR
  const qrStats = useMemo(() => getStatsForQR(qrId), [qrId]);

  const filteredScans = useMemo(
    () => mockScans.filter((s) => s.qrId === qrId),
    [qrId],
  );

  const filteredReviews = useMemo(() => {
    return mockReviews.filter((r) => {
      const isThisQR = r.qrId === qrId;
      if (!isThisQR) return false;

      const searchStr = (r.review || r.whatWentWrong || "").toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesRating = ratingFilter === null || r.rating === ratingFilter;
      const matchesType = typeFilter === null || r.type === typeFilter;

      return matchesSearch && matchesRating && matchesType;
    });
  }, [qrId, searchQuery, ratingFilter, typeFilter]);

  if (!qr) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Specific Scans"
            value={qrStats.totalScans}
            icon={Signal}
            color="hsl(220, 70%, 55%)"
          />
          <StatCard
            title="Conversions"
            value={qrStats.totalReviews}
            icon={ArrowUpRight}
            color="hsl(152, 60%, 45%)"
          />
          <StatCard
            title="Conversion Rate"
            value={`${qrStats.conversionRate}%`}
            icon={TrendingUp}
            color="hsl(25, 95%, 53%)"
          />
          <StatCard
            title="Avg Rating"
            value={qrStats.avgRating}
            icon={Calendar}
            color="hsl(45, 97%, 54%)"
          />
        </div>

        <div className="space-y-6">
          <DashboardTabSwitcher
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reviewCount={filteredReviews.length}
            scanCount={filteredScans.length}
          />

          {activeTab === "reviews" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DashboardFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                ratingFilter={ratingFilter}
                setRatingFilter={setRatingFilter}
              />
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
                <ReviewsTable
                  onViewReview={() => {}}
                  reviews={filteredReviews}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
                <QRScansTable onViewScan={() => {}} scans={filteredScans} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
