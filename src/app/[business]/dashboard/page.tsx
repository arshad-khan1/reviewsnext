"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  MessageSquare,
  TrendingUp,
  ThumbsDown,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  QrCode,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "./components/StatCard";
import DetailRow from "./components/DetailRow";
import ScansOverTimeChart from "./components/ScansOverTimeChart";
import RatingDistributionChart from "./components/RatingDistributionChart";
import ReviewsTable from "./components/ReviewsTable";
import QRScansTable from "./components/QRScansTable";
import UsageCard from "./components/UsageCard";
import ReviewDetailDialog from "./components/ReviewDetailDialog";
import ScanDetailDialog from "./components/ScanDetailDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useBusiness } from "@/hooks/use-business";
import { useDashboardData, type DashboardReview, type DashboardScan } from "@/hooks/use-dashboard-data";

const formatDate = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BusinessDashboard = () => {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.business as string;

  const { data: business, isLoading: isBusinessLoading, error: businessError } = useBusiness(businessSlug);
  const { data: dashboard, isLoading: isDashboardLoading, error: dashboardError } = useDashboardData(businessSlug);

  const [activeTab, setActiveTab] = useState<"reviews" | "scans">("reviews");
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const isLoading = isBusinessLoading || isDashboardLoading;
  const error = businessError || dashboardError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!business || error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Business Not Found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-xs">
          The business you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button
          onClick={() => router.push("/businesses")}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Businesses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-6 space-y-10">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                title="QR Scans"
                value={dashboard?.stats.totalScans || 0}
                icon={QrCode}
                color="hsl(25, 95%, 53%)"
              />
              <StatCard
                title="Reviews"
                value={dashboard?.stats.totalReviews || 0}
                icon={MessageSquare}
                color="hsl(220, 70%, 55%)"
              />
              <StatCard
                title="Conversion"
                value={`${dashboard?.stats.conversionRate || 0}%`}
                subtitle="Scans → Reviews"
                icon={TrendingUp}
                color="hsl(152, 60%, 45%)"
              />
              <StatCard
                title="Avg Rating"
                value={dashboard?.stats.avgRating || 0}
                icon={Star}
                color="hsl(45, 97%, 54%)"
              />
              <StatCard
                title="Google Reviews"
                value={dashboard?.stats.googleSubmissions || 0}
                icon={ExternalLink}
                color="hsl(25, 95%, 53%)"
              />
              <StatCard
                title="Complaints"
                value={dashboard?.stats.negativeFeedbacks || 0}
                icon={ThumbsDown}
                color="hsl(0, 84%, 60%)"
              />
            </div>
          </div>
          <div className="lg:col-span-1">
            <UsageCard
              monthlyUsed={business.aiCredits?.monthlyUsed || 0}
              monthlyTotal={business.aiCredits?.monthlyAllocation || 0}
              topupUsed={business.aiCredits?.topupUsed || 0}
              topupTotal={business.aiCredits?.topupAllocation || 0}
              className="h-full"
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScansOverTimeChart data={dashboard?.charts.scansOverTime || []} />
          <RatingDistributionChart data={dashboard?.charts.ratingDistribution || []} />
        </div>

        {/* Active QR Codes List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-600" />
              Active QR Codes
            </h2>
            <Link href={`/${businessSlug}/dashboard/qr-codes`}>
              <Button
                variant="ghost"
                className="text-indigo-600 hover:text-indigo-700 font-bold gap-1"
              >
                Manage All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(dashboard?.activeQRCodes || []).map((qr) => (
              <Link
                key={qr.id}
                href={`/${businessSlug}/dashboard/qr-codes/${qr.id}`}
              >
                <Card className="hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer border-none shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <QrCode className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-0.5">
                          {qr.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          {qr.sourceTag}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600">
                        {qr.scans}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        Scans
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Data Tables */}
        <div className="space-y-4">
          {/* Toggle Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="inline-flex rounded-lg border border-border bg-muted p-1 gap-1">
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "reviews"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Reviews &amp; Feedback
              </button>
              <button
                onClick={() => setActiveTab("scans")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "scans"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                QR Scans
              </button>
            </div>

            <Link href={`/${businessSlug}/dashboard/${activeTab}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/5 font-semibold gap-1"
              >
                View All {activeTab === "reviews" ? "Reviews" : "Scans"}
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {activeTab === "reviews" && (
            <ReviewsTable
              onViewReview={(r) => setSelectedReviewId(r.id)}
              reviews={dashboard?.recentReviews || []}
            />
          )}
          {activeTab === "scans" && (
            <QRScansTable
              onViewScan={(s) => setSelectedScanId(s.id)}
              scans={dashboard?.recentScans || []}
            />
          )}
        </div>
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
};

export default BusinessDashboard;
