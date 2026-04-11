"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building,
  Filter,
  Search,
  Plus,
  QrCode,
  MessageSquare,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BusinessCard from "./components/BusinessCard";
import { mockBusinesses } from "@/data/mockBusinesses";
import StatCard from "../[business]/dashboard/components/StatCard";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserNav } from "@/components/layout/UserNav";

const ITEMS_PER_PAGE = 12;

type BusinessTab = "all" | "high-rated" | "needs-attention" | "archived";

export default function BusinessesPage() {
  const [activeTab, setActiveTab] = useState<BusinessTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (tab: BusinessTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const totalBusinesses = mockBusinesses.length;
  const totalReviews = mockBusinesses.reduce(
    (sum, b) => sum + b.totalReviews,
    0,
  );
  const totalScans = mockBusinesses.reduce((sum, b) => sum + b.totalScans, 0);
  const avgConversion =
    mockBusinesses.reduce((sum, b) => sum + b.conversionRate, 0) /
    (totalBusinesses || 1);

  const filteredBusinesses = mockBusinesses.filter((b) => {
    // Search filter
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "all") return true;
    if (activeTab === "high-rated") return b.avgRating >= 4.5;
    if (activeTab === "needs-attention")
      return b.lowRatings > b.highRatings * 0.3;
    if (activeTab === "archived") return false;
    return true;
  });

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE);
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
          <div className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Businesses</h1>
                <p className="text-xs text-muted-foreground">
                  Manage and monitor all onboarded locations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/onboard">
                <Button className="gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" />
                  Add Business
                </Button>
              </Link>
              <UserNav />
            </div>
          </div>
        </header>

        <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Businesses"
              value={totalBusinesses}
              icon={Building}
              color="hsl(var(--primary))"
            />
            <StatCard
              title="Total Reviews"
              value={totalReviews.toLocaleString()}
              subtitle="+12% this month"
              icon={MessageSquare}
              color="hsl(152, 60%, 45%)"
            />
            <StatCard
              title="QR Scans"
              value={totalScans.toLocaleString()}
              subtitle="+8% this month"
              icon={QrCode}
              color="hsl(25, 95%, 53%)"
            />
            <StatCard
              title="Avg Conversion"
              value={`${avgConversion.toFixed(1)}%`}
              subtitle="+2.3% this month"
              icon={TrendingUp}
              color="hsl(45, 97%, 54%)"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-xl border border-border/50">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, industry, or location..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button variant="outline" className="gap-2 flex-1 lg:flex-none">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" className="flex-1 lg:flex-none">Sort: Recent</Button>
            </div>
          </div>

          {/* Data Sections */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1 gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: "high-rated", label: "High Rated" },
                  { id: "needs-attention", label: "Needs Attention" },
                  { id: "archived", label: "Archived" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as BusinessTab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/20"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground">
                {filteredBusinesses.length} results found
              </div>
            </div>

            {activeTab === "archived" ? (
              <div className="text-center py-24 text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
                <Building className="w-12 h-12 mb-4 opacity-10" />
                <p className="font-medium">No archived businesses found</p>
                <p className="text-xs">Businesses you archive will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
                
                {paginatedBusinesses.length === 0 && (
                  <div className="col-span-full text-center py-20 bg-card/30 rounded-2xl border border-dashed border-border">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-muted-foreground">No businesses matching your search/filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1.5 px-4 font-medium text-sm">
                  <span className="text-foreground">{currentPage}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-12 text-center text-sm text-muted-foreground border-t border-border pt-8">
            <p className="flex items-center justify-center gap-1">
              Showing {Math.min(filteredBusinesses.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredBusinesses.length, currentPage * ITEMS_PER_PAGE)} of {filteredBusinesses.length} businesses
              <span className="mx-2 opacity-30">•</span>
              <Button variant="link" className="p-0 h-auto font-semibold">
                Need technical help?
              </Button>
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
