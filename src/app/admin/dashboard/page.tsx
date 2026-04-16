"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  Plus,
  QrCode,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowRight,
  User,
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
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await apiClient.get("/api/admin/dashboard");
      const data = await res.json();
      if (res.ok && data) {
        setStats(data.stats);
        setExpiringSubscriptions(data.expiringSubscriptions || []);
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
      
      {/* Expiring Subscriptions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Subscriptions Ending Soon</h3>
              <p className="text-xs text-muted-foreground">Top 10 businesses needing resubscription (30 days)</p>
            </div>
          </div>
          <Link href="/admin/businesses?sortBy=subscriptionEnd&sortOrder=asc">
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Business / Owner</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Expiry Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingStats ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-4">
                      <Skeleton className="h-12 w-full" />
                    </td>
                  </tr>
                ))
              ) : expiringSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No subscriptions ending in the next 30 days
                  </td>
                </tr>
              ) : (
                expiringSubscriptions.map((sub: any) => (
                  <tr key={sub.userId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {sub.businessName || "No Business Name"}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <User className="w-2.5 h-2.5" />
                          <span>{sub.userName}</span>
                          <span className="mx-1">•</span>
                          <span>{sub.owner.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.subscription.plan === 'PRO' ? 'bg-purple-100 text-purple-700' :
                        sub.subscription.plan === 'GROWTH' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {sub.subscription.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{sub.subscription.currentPeriodEnd ? new Date(sub.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <span className={`text-[10px] ${
                          sub.subscription.daysUntilExpiry <= 3 ? 'text-rose-500 font-bold' : 
                          sub.subscription.daysUntilExpiry <= 7 ? 'text-amber-500' : 
                          'text-muted-foreground'
                        }`}>
                          Ends in {sub.subscription.daysUntilExpiry} days
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/users/${sub.userId}`}>
                        <Button variant="outline" size="sm" className="h-8 text-[11px]">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
