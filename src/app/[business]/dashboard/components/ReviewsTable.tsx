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
}

const ReviewsTable = ({ onViewReview, reviews }: ReviewsTableProps) => (
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
      {reviews.map((r) => (
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
            {r.reviewText || "—"}
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
              <span className="text-xs text-muted-foreground">No</span>
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
      ))}
    </TableBody>
  </Table>
);

export default ReviewsTable;
