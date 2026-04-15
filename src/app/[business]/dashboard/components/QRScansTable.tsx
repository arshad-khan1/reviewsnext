"use client";

import { Smartphone, Globe, Hash, Eye } from "lucide-react";
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

import type { DashboardScan } from "@/hooks/use-dashboard-data";

interface QRScansTableProps {
  onViewScan: (scan: any) => void;
  scans: DashboardScan[];
  isLoading?: boolean;
}

const QRScansTable = ({ onViewScan, scans, isLoading }: QRScansTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="font-bold text-slate-900">Date</TableHead>
        <TableHead className="font-bold text-slate-900">Device</TableHead>
        <TableHead className="font-bold text-slate-900">Browser</TableHead>
        <TableHead className="font-bold text-slate-900">OS</TableHead>
        <TableHead className="font-bold text-slate-900">IP Address</TableHead>
        <TableHead className="font-bold text-slate-900">Reviewed</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
            <TableCell>
              <div className="h-4 w-20 bg-muted/60 rounded animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-16 bg-muted/60 rounded animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-5 w-16 bg-muted/60 rounded-full animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="h-8 w-8 bg-muted/60 rounded-full animate-pulse" />
            </TableCell>
          </TableRow>
        ))
      ) : scans.length === 0 ? (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-12 text-muted-foreground bg-muted/5">
            <p className="text-sm font-bold opacity-60 tracking-wide">No scans found.</p>
          </TableCell>
        </TableRow>
      ) : (
        scans.map((s) => (
          <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
            <TableCell className="text-xs whitespace-nowrap">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-slate-600">
                  {s.formattedAt}
                </p>
              </div>
            </TableCell>
            <TableCell className="text-sm">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                {s.device || "—"}
              </div>
            </TableCell>
            <TableCell className="text-sm">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                {s.browser || "—"}
              </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {s.os || "—"}
            </TableCell>
            <TableCell className="text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                {s.ipAddress || "—"}
              </div>
            </TableCell>
            <TableCell>
              {s.review ? (
                <Badge
                  variant="outline"
                  className="text-success border-success/30 text-xs px-2 py-0.5 rounded-full font-medium bg-success/5"
                >
                  Reviewed
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-muted-foreground/30 text-xs px-2 py-0.5 rounded-full font-medium bg-muted/10"
                >
                  Just closed
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                onClick={() => onViewScan(s)}
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

export default QRScansTable;
