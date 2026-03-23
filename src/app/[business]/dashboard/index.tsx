"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  QrCode,
  Star,
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  ThumbsDown,
  ExternalLink,
} from "lucide-react";
import { companyConfig } from "@/config/companyConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { stats } from "@/data/mockDashboardData";
import type { QRScan, ReviewEntry } from "@/data/mockDashboardData";

import StatCard from "./components/StatCard";
import DetailRow from "./components/DetailRow";
import ScansOverTimeChart from "./components/ScansOverTimeChart";
import RatingDistributionChart from "./components/RatingDistributionChart";
import DeviceBreakdownChart from "./components/DeviceBreakdownChart";
import BrowserBreakdownChart from "./components/BrowserBreakdownChart";
import ReviewsTable from "./components/ReviewsTable";
import QRScansTable from "./components/QRScansTable";
import Image from "next/image";

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
  const [activeTab, setActiveTab] = useState<"reviews" | "scans">("reviews");
  const [selectedScan, setSelectedScan] = useState<QRScan | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewEntry | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={companyConfig.logo}
              alt="Logo"
              width={32}
              height={32}
              className="w-14 h-14 rounded-lg object-contain bg-secondary p-1"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {companyConfig.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                Dashboard & Analytics
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Mock Data
          </Badge>
        </div>
      </header>

      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="QR Scans"
            value={stats.totalScans}
            icon={QrCode}
            color="hsl(25, 95%, 53%)"
          />
          <StatCard
            title="Reviews"
            value={stats.totalReviews}
            icon={MessageSquare}
            color="hsl(220, 70%, 55%)"
          />
          <StatCard
            title="Conversion"
            value={`${stats.conversionRate}%`}
            subtitle="Scans → Reviews"
            icon={TrendingUp}
            color="hsl(152, 60%, 45%)"
          />
          <StatCard
            title="Avg Rating"
            value={stats.averageRating}
            icon={Star}
            color="hsl(45, 97%, 54%)"
          />
          <StatCard
            title="Google Reviews"
            value={stats.googleSubmissions}
            icon={ExternalLink}
            color="hsl(25, 95%, 53%)"
          />
          <StatCard
            title="Complaints"
            value={stats.negativeFeedbacks}
            icon={ThumbsDown}
            color="hsl(0, 84%, 60%)"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScansOverTimeChart />
          <RatingDistributionChart />
          <DeviceBreakdownChart />
          <BrowserBreakdownChart />
        </div>

        {/* Data Tables */}
        <div className="space-y-4">
          {/* Toggle Buttons */}
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

          {activeTab === "reviews" && (
            <ReviewsTable onViewReview={setSelectedReview} />
          )}
          {activeTab === "scans" && (
            <QRScansTable onViewScan={setSelectedScan} />
          )}
        </div>
      </main>

      {/* Scan Detail Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Details</DialogTitle>
          </DialogHeader>
          {selectedScan && (
            <div className="space-y-3 text-sm">
              <DetailRow
                label="Date"
                value={formatDate(selectedScan.timestamp)}
              />
              <DetailRow label="Device" value={selectedScan.device} />
              <DetailRow label="Browser" value={selectedScan.browser} />
              <DetailRow label="OS" value={selectedScan.os} />
              <DetailRow label="IP Address" value={selectedScan.ip} />
              <DetailRow
                label="Location"
                value={`${selectedScan.city}, ${selectedScan.country}`}
              />
              <DetailRow
                label="Left Review"
                value={
                  selectedScan.resultedInReview
                    ? `Yes (${selectedScan.rating}★)`
                    : "No"
                }
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Detail Dialog */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={() => setSelectedReview(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-3 text-sm">
              <DetailRow
                label="Date"
                value={formatDate(selectedReview.timestamp)}
              />
              <DetailRow
                label="Type"
                value={
                  selectedReview.type === "positive"
                    ? "👍 Positive"
                    : "👎 Negative"
                }
              />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < selectedReview.rating ? "fill-star text-star" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              {selectedReview.review && (
                <DetailRow label="Review" value={selectedReview.review} />
              )}
              {selectedReview.whatWentWrong && (
                <DetailRow
                  label="What Went Wrong"
                  value={selectedReview.whatWentWrong}
                />
              )}
              {selectedReview.howToImprove && (
                <DetailRow
                  label="How to Improve"
                  value={selectedReview.howToImprove}
                />
              )}
              <DetailRow label="Device" value={selectedReview.device} />
              <DetailRow label="Browser" value={selectedReview.browser} />
              <DetailRow label="OS" value={selectedReview.os} />
              <DetailRow
                label="Submitted to Google"
                value={selectedReview.submittedToGoogle ? "Yes ✅" : "No"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessDashboard;
