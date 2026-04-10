"use client";

import { Search, ThumbsUp, ThumbsDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: "positive" | "negative" | null;
  setTypeFilter: (type: "positive" | "negative" | null) => void;
  ratingFilter: number | null;
  setRatingFilter: (rating: number | null) => void;
}

export default function DashboardFilters({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  ratingFilter,
  setRatingFilter,
}: DashboardFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-2 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search feedback content..."
          className="pl-9 h-11 bg-card/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg border border-border/50">
        <button
          onClick={() => setTypeFilter(null)}
          className={`flex-1 h-9 rounded-md text-xs font-bold transition-all ${
            typeFilter === null
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ALL
        </button>
        <button
          onClick={() => setTypeFilter("positive")}
          className={`flex-1 h-9 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            typeFilter === "positive"
              ? "bg-success/10 text-success"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          HAPPY
        </button>
        <button
          onClick={() => setTypeFilter("negative")}
          className={`flex-1 h-9 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            typeFilter === "negative"
              ? "bg-destructive/10 text-destructive"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          SAD
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto no-scrollbar">
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() =>
              setRatingFilter(ratingFilter === rating ? null : rating)
            }
            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center shrink-0 ${
              ratingFilter === rating
                ? "bg-star/10 text-star border-star/30 shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)] scale-110"
                : "bg-background text-muted-foreground border-border hover:border-star/20"
            }`}
          >
            {rating}★
          </button>
        ))}
      </div>
    </div>
  );
}
