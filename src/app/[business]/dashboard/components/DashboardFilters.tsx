"use client";

import {
  Search,
  ThumbsUp,
  ThumbsDown,
  FilterX,
  Star,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ReviewType } from "@/types/prisma-enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";

interface DashboardFiltersProps {
  mode: "reviews" | "scans";
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Review specific
  typeFilter?: ReviewType | null;
  setTypeFilter?: (type: ReviewType | null) => void;
  ratingFilter?: number | null;
  setRatingFilter?: (rating: number | null) => void;
  // Scan specific
  resultFilter?: boolean | null;
  setResultFilter?: (result: boolean | null) => void;
  // Common
  dateRange: { from?: Date; to?: Date } | undefined;
  setDateRange: (range: { from?: Date; to?: Date } | undefined) => void;
  onClearAll: () => void;
}

export default function DashboardFilters({
  mode,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  ratingFilter,
  setRatingFilter,
  resultFilter,
  setResultFilter,
  dateRange,
  setDateRange,
  onClearAll,
}: DashboardFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input - Main */}
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={
              mode === "reviews"
                ? "Search reviews (content, name...)"
                : "Search scans (IP, device, city...)"
            }
            className="pl-11 h-11 bg-card/50 border-border rounded-md font-medium focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all placeholder:text-muted-foreground/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <DateRangePicker value={dateRange} onChange={setDateRange} />

        {/* Clear Filters Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-11 px-4 rounded-md font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all gap-2 cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <FilterX className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Filters</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {mode === "reviews" ? (
          <>
            {/* Review Type Dropdown */}
            <Select
              value={typeFilter || "ALL"}
              onValueChange={(val) =>
                setTypeFilter?.(val === "ALL" ? null : (val as ReviewType))
              }
            >
              <SelectTrigger className="h-11 w-[180px] rounded-md focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <SelectValue placeholder="Feedback Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  <span className="text-muted-foreground/80 font-medium">
                    All Types
                  </span>
                </SelectItem>
                <SelectItem value="POSITIVE">
                  <div className="flex items-center gap-2 text-success font-medium">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Positive
                  </div>
                </SelectItem>
                <SelectItem value="NEGATIVE">
                  <div className="flex items-center gap-2 text-destructive font-medium">
                    <ThumbsDown className="w-3.5 h-3.5" />
                    Negative
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Rating Dropdown */}
            <Select
              value={ratingFilter?.toString() || "ALL"}
              onValueChange={(val) =>
                setRatingFilter?.(val === "ALL" ? null : parseInt(val))
              }
            >
              <SelectTrigger className="h-11 w-[150px] rounded-md focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  <span className="text-muted-foreground/80 font-medium">
                    All Ratings
                  </span>
                </SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Star className="w-3.5 h-3.5 fill-star text-star" />
                      {r} Stars
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <>
            {/* Scan Result Dropdown */}
            <Select
              value={resultFilter == null ? "ALL" : resultFilter.toString()}
              onValueChange={(val) =>
                setResultFilter?.(val === "ALL" ? null : val === "true")
              }
            >
              <SelectTrigger className="h-11 w-[200px] rounded-md focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <SelectValue placeholder="Scan Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  <span className="text-muted-foreground/80 font-medium">
                    All Scans
                  </span>
                </SelectItem>
                <SelectItem value="true">
                  <div className="flex items-center gap-1.5 text-success font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Successful
                  </div>
                </SelectItem>
                <SelectItem value="false">
                  <div className="flex items-center gap-1.5 text-destructive font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    Failed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}
