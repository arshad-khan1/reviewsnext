"use client";

import {
  MapPin,
  Signal,
  TrendingUp,
  Star,
  Edit,
  Trash2,
  Loader2,
  ArrowUpRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ReviewType } from "@/types/prisma-enums";

import { useBusiness } from "@/hooks/use-business";
import { useLocationDetail, useDeleteLocation } from "@/hooks/use-locations";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReviews } from "@/hooks/use-reviews";
import { useScans } from "@/hooks/use-scans";
import { useParams, useRouter } from "next/navigation";
import { PlanType } from "@/types/prisma-enums";
import { UpgradePrompt } from "@/components/shared/UpgradePrompt";
import { getLimit } from "@/config/plan-limits";
import DashboardFilters from "../../../components/DashboardFilters";
import DashboardTabSwitcher from "../../../components/DashboardTabSwitcher";
import ReviewsTable from "../../../components/ReviewsTable";
import QRScansTable from "../../../components/QRScansTable";
import ReviewDetailDialog from "../../../components/ReviewDetailDialog";
import ScanDetailDialog from "../../../components/ScanDetailDialog";
import { useAuthStore } from "@/store/auth-store";
import { Pagination } from "@/components/shared/Pagination";

const DEFAULT_LIMIT = 10;

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.business as string;
  const locationSlug = params.locationSlug as string;

  const { data: business, isLoading: isBizLoading } = useBusiness(businessSlug);
  const {
    data: lData,
    isLoading,
    error,
  } = useLocationDetail(businessSlug, locationSlug);
  const deleteMutation = useDeleteLocation(businessSlug);

  const { user } = useAuthStore();
  const planTier = user?.planTier || PlanType.FREE;

  // Analytics State
  const [activeTab, setActiveTab] = useState<"reviews" | "scans">("reviews");
  const [currentPage, setCurrentPage] = useState(1);
  const [scansPage, setScansPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [scansLimit, setScansLimit] = useState(DEFAULT_LIMIT);

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

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const loc = lData?.location;

  const { data: reviewsData, isLoading: isLoadingReviews } = useReviews(
    businessSlug,
    {
      page: currentPage,
      limit: limit,
      locationId: loc?.id,
      type: typeFilter,
      rating: ratingFilter,
      search: searchQuery,
      from: dateRange?.from,
      to: dateRange?.to,
      enabled: !!loc,
    },
  );

  const { data: scansData, isLoading: isLoadingScans } = useScans(
    businessSlug,
    {
      page: scansPage,
      limit: scansLimit,
      locationId: loc?.id,
      search: scansSearchQuery,
      resultedInReview: scansResultFilter,
      from: scansDateRange?.from,
      to: scansDateRange?.to,
      enabled: !!loc,
    },
  );

  const totalPages = reviewsData?.pagination.totalPages || 1;
  const totalScansPages = scansData?.pagination.totalPages || 1;

  if (
    getLimit(planTier, user?.subscriptionStatus, "maxLocations") === 0 &&
    !isBizLoading
  ) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <UpgradePrompt
          requiredPlan={PlanType.PRO}
          featureName="Location Hub & Multi-location Analytics"
          description="The Location Hub is a premium feature designed for multi-unit businesses. Upgrade to Pro to manage unlimited locations and view siloed analytics."
        />
      </div>
    );
  }

  const handleDelete = async () => {
    if (!loc) return;
    if (
      confirm(
        `Are you sure you want to delete ${loc.name}? All its QR codes will fall back to 'Unassigned'.`,
      )
    ) {
      try {
        await deleteMutation.mutateAsync(loc.slug);
        router.push(`/${businessSlug}/dashboard/locations`);
      } catch {}
    }
  };

  if (isBizLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !business || !loc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-slate-500 font-medium">
          Failed to load location details.
        </p>
        <Link href={`/${businessSlug}/dashboard/locations`}>
          <Button variant="outline">Back to Locations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <Link href={`/${businessSlug}/dashboard/qr-codes`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground mb-4 -ml-2 group transition-all"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to QR Code Management
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {loc.name.charAt(0).toUpperCase() + loc.name.slice(1)} Dashboard
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {loc.address || "No address set"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 font-bold text-slate-600"
              disabled
            >
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="h-9 border-red-100 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        {/* Aggregated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Scans",
              value: loc.stats.totalScans,
              icon: Signal,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Total Reviews",
              value: loc.stats.totalReviews,
              icon: Star,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Google Conversions",
              value: loc.stats.googleSubmissions,
              icon: ArrowUpRight,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Conversion Rate",
              value: `${loc.stats.conversionRate}%`,
              icon: TrendingUp,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-400 tracking-wide uppercase">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Scan Activity Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={loc.charts.scansOverTime}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScans)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="h-fit border-none shadow-sm bg-white flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loc.charts.ratingDistribution
                  .slice()
                  .reverse()
                  .map((dist) => (
                    <div key={dist.rating} className="flex items-center gap-3">
                      <div className="w-12 text-sm font-bold text-slate-500">
                        {dist.rating}
                      </div>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${loc.stats.totalReviews > 0 ? (dist.count / loc.stats.totalReviews) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="w-8 text-right text-sm font-bold text-slate-900">
                        {dist.count}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <section className="space-y-6">
          <DashboardTabSwitcher
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reviewCount={reviewsData?.pagination.total || 0}
            scanCount={scansData?.pagination.total || 0}
          />

          {activeTab === "reviews" ? (
            <div className="space-y-6">
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

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm relative">
                {isLoadingReviews && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                )}
                {reviewsData && reviewsData.data.length > 0 ? (
                  <ReviewsTable
                    onViewReview={(r) => setSelectedReviewId(r.id)}
                    reviews={reviewsData.data}
                  />
                ) : (
                  !isLoadingReviews && (
                    <div className="py-12 text-center bg-muted/5">
                      <p className="text-sm font-bold text-muted-foreground/60 tracking-wide">
                        No reviews found for this location.
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="pt-4"
              />
            </div>
          ) : (
            <div className="space-y-6">
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

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm relative">
                {isLoadingScans && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                )}
                {scansData && scansData.data.length > 0 ? (
                  <QRScansTable
                    onViewScan={(s) => setSelectedScanId(s.id)}
                    scans={scansData.data}
                  />
                ) : (
                  !isLoadingScans && (
                    <div className="py-12 text-center bg-muted/5">
                      <p className="text-sm font-bold text-muted-foreground/60 tracking-wide">
                        No scan events recorded for this location yet.
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={scansPage}
                totalPages={totalScansPages}
                onPageChange={setScansPage}
                className="pt-4"
              />
            </div>
          )}
        </section>
      </main>

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
