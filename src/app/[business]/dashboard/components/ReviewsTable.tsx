"use client";

import { Star, ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { DashboardReview } from "@/hooks/use-dashboard-data";

interface ReviewsTableProps {
  onViewReview: (review: any) => void;
  reviews: DashboardReview[];
  isLoading?: boolean;
}

const ReviewsTable = ({ onViewReview, reviews, isLoading }: ReviewsTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="font-bold text-slate-900">Date</TableHead>
        <TableHead className="font-bold text-slate-900">Type</TableHead>
        <TableHead className="font-bold text-slate-900">Rating</TableHead>
        <TableHead className="font-bold text-slate-900 hidden md:table-cell">
          Content
        </TableHead>
        <TableHead className="font-bold text-slate-900">Google</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
            <TableCell>
              <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-5 w-20 bg-muted/60 rounded-full animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="h-4 w-48 bg-muted/60 rounded animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-5 w-12 bg-muted/60 rounded-full animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-8 w-8 bg-muted/60 rounded-full animate-pulse" />
            </TableCell>
          </TableRow>
        ))
      ) : reviews.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-12 text-muted-foreground bg-muted/5">
            <p className="text-sm font-bold opacity-60 tracking-wide">No reviews found.</p>
          </TableCell>
        </TableRow>
      ) : (
        reviews.map((r) => (
          <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
            <TableCell className="text-xs whitespace-nowrap text-muted-foreground font-medium">
              {r.formattedAt}
            </TableCell>
            <TableCell>
              {r.type === "POSITIVE" ? (
                <Badge className="bg-success/10 text-success border-success/20 font-medium">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Positive
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="bg-destructive/10 text-destructive border-destructive/20 font-medium"
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  Negative
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < r.rating ? "fill-star text-star" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell max-w-[200px] truncate text-sm text-slate-600">
              {r.reviewText || r.whatWentWrong || "—"}
            </TableCell>
            <TableCell>
              {r.submittedToGoogle ? (
                <Badge
                  variant="outline"
                  className="text-success border-success/30 text-xs font-medium"
                >
                  Yes
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-muted-foreground/30 text-xs font-medium bg-muted/10"
                >
                  No
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                onClick={() => onViewReview(r)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

export default ReviewsTable;
