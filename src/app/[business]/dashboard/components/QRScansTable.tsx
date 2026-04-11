"use client";

import { Star, Smartphone, Globe, Hash, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
}

const QRScansTable = ({ onViewScan, scans }: QRScansTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">QR Code Scans</CardTitle>
      <CardDescription>
        {scans.length} total scans • Includes device &amp; session details
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Browser</TableHead>
            <TableHead>OS</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Reviewed</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="text-xs whitespace-nowrap">
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-slate-700">
                    {s.formattedAt}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.device || "—"}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                <div className="flex items-center gap-1.5">
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
                {s.resultedInReview ? (
                  <Badge
                    variant="outline"
                    className="text-success border-success/30 text-xs"
                  >
                    {s.rating && (
                      <>
                        <Star className="h-3 w-3 fill-star text-star mr-1" />
                        {s.rating}
                      </>
                    )}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">No</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onViewScan(s)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default QRScansTable;
