"use client";

import { useState, useEffect } from "react";
import { Filter, Search, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
import BusinessCard from "../dashboard/components/BusinessCard";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 12;

interface FilterOptions {
  cities: string[];
  industries: string[];
  plans: string[];
  subscriptionStatuses: string[];
  businessStatuses: string[];
}

export default function BusinessesClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null,
  );

  const fetchFilters = async () => {
    try {
      const res = await apiClient.get("/api/admin/filters");
      const data = await res.json();
      if (res.ok) setFilterOptions(data);
    } catch (e) {
      console.error("Failed to load filters", e);
    }
  };

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: searchQuery,
        sortBy,
        sortOrder,
      });

      if (selectedCity !== "all") queryParams.set("city", selectedCity);
      if (selectedIndustry !== "all")
        queryParams.set("industry", selectedIndustry);
      if (selectedPlan !== "all") queryParams.set("plan", selectedPlan);
      if (selectedStatus !== "all")
        queryParams.set("businessStatus", selectedStatus);

      const res = await apiClient.get(
        `/api/admin/businesses?${queryParams.toString()}`,
      );
      const data = await res.json();

      if (res.ok && data) {
        setBusinesses(data.data || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalCount(data.pagination?.total || 0);
      } else {
        toast.error(data?.message || "Failed to load businesses");
      }
    } catch {
      toast.error("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [
    currentPage,
    searchQuery,
    selectedCity,
    selectedIndustry,
    selectedPlan,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  const resetFilters = () => {
    setSelectedCity("all");
    setSelectedIndustry("all");
    setSelectedPlan("all");
    setSelectedStatus("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCity !== "all" ||
    selectedIndustry !== "all" ||
    selectedPlan !== "all" ||
    selectedStatus !== "all" ||
    searchQuery !== "";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Business Directory
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage and monitor all platform businesses ({totalCount} total)
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, slug, or owner phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full rounded-lg h-10 border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Sort by:
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] font-medium h-10 text-xs">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Latest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="subscriptionEnd">
                  Subscription End
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 mr-2">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-tight">
              Quick Filters:
            </span>
          </div>

          {/* City Filter */}
          <Select
            value={selectedCity}
            onValueChange={(val) => {
              setSelectedCity(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px] font-medium h-8 text-[11px]">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {filterOptions?.cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Industry Filter */}
          <Select
            value={selectedIndustry}
            onValueChange={(val) => {
              setSelectedIndustry(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] font-medium h-8 text-[11px]">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {filterOptions?.industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Plan Filter */}
          <Select
            value={selectedPlan}
            onValueChange={(val) => {
              setSelectedPlan(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[120px] font-medium h-8 text-[11px]">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              {filterOptions?.plans.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px] font-medium h-8 text-[11px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {filterOptions?.businessStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-50"
            >
              <X className="w-3 h-3 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[320px] rounded-xl" />
              ))
            : businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}

          {!isLoading && businesses.length === 0 && (
            <div className="col-span-full text-center py-20 bg-card rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
              <Search className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-muted-foreground font-medium">
                No results found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-4"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center pt-8 border-t border-border/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {!isLoading && businesses.length > 0 && (
          <div className="text-center text-[11px] text-muted-foreground">
            Showing{" "}
            {Math.min(totalCount, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-
            {Math.min(totalCount, currentPage * ITEMS_PER_PAGE)} of {totalCount}{" "}
            businesses
          </div>
        )}
      </div>
    </main>
  );
}
