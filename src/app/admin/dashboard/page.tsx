"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  Plus,
  QrCode,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "../../[business]/dashboard/components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface PlatformStats {
  totalUsers: number;
  totalBusinesses: number;
  activeSubscriptions: number;
  totalScansAllTime: number;
  totalReviewsAllTime: number;
  totalScansThisMonth: number;
  totalReviewsThisMonth: number;
  platformConversionRate: number;
  platformConversionRateThisMonth: number;
  totalAiCreditsConsumed: number;
  totalRevenue: {
    allTime: number;
    thisMonth: number;
    currency: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await apiClient.get("/api/admin/dashboard");
      const data = await res.json();
      if (res.ok && data) {
        setStats(data.stats);
      } else {
        toast.error(data?.message || "Failed to fetch platform statistics");
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      toast.error("A network error occurred while fetching statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
          <p className="text-muted-foreground text-sm">
            Real-time statistics and management controls for the entire platform
          </p>
        </div>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Businesses"
              value={stats?.totalBusinesses || 0}
              icon={Building}
              color="hsl(var(--primary))"
            />
            <StatCard
              title="Total Reviews"
              value={(stats?.totalReviewsThisMonth || 0).toLocaleString()}
              subtitle="This month"
              icon={MessageSquare}
              color="hsl(152, 60%, 45%)"
            />
            <StatCard
              title="QR Scans"
              value={(stats?.totalScansThisMonth || 0).toLocaleString()}
              subtitle="This month"
              icon={QrCode}
              color="hsl(25, 95%, 53%)"
            />
            <StatCard
              title="Avg Conversion"
              value={`${stats?.platformConversionRateThisMonth || 0}%`}
              subtitle="Scan to Review (Month)"
              icon={TrendingUp}
              color="hsl(45, 97%, 54%)"
            />
          </>
        )}
      </div>

      {/* Call to Actions / Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/businesses"
          className="group bg-card hover:bg-primary/5 transition-all p-8 rounded-2xl border border-border flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Manage Businesses</h3>
            <p className="text-muted-foreground text-sm max-w-xs mt-2">
              View full business directory, apply filters, and manage
              subscriptions across the platform.
            </p>
          </div>
          <Button
            variant="outline"
            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            View Directory
          </Button>
        </Link>

        <div className="bg-card p-8 rounded-2xl border border-border flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Plus className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Onboard New Entity</h3>
            <p className="text-muted-foreground text-sm max-w-xs mt-2">
              Rapidly onboard a new business entity or location to the
              ReviewFunnel platform.
            </p>
          </div>
          <Link target="_blank" href="/onboard">
            <Button
              variant="outline"
              className="hover:bg-amber-600 hover:text-white transition-colors"
            >
              Start Onboarding
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
