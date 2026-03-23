"use client";

import { Star, Smartphone, Globe, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockScans } from "@/data/mockDashboardData";
import type { QRScan } from "@/data/mockDashboardData";

const formatDate = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface QRScansTableProps {
  onViewScan: (scan: QRScan) => void;
}

const QRScansTable = ({ onViewScan }: QRScansTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">QR Code Scans</CardTitle>
      <CardDescription>
        {mockScans.length} total scans • Includes device &amp; location details
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Device</TableHead>
            <TableHead className="hidden md:table-cell">Browser</TableHead>
            <TableHead className="hidden md:table-cell">OS</TableHead>
            <TableHead className="hidden lg:table-cell">Location</TableHead>
            <TableHead>Reviewed</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockScans.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="text-xs whitespace-nowrap">
                {formatDate(s.timestamp)}
              </TableCell>
              <TableCell className="text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.device}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.browser}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                {s.os}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                {s.city}, {s.country}
              </TableCell>
              <TableCell>
                {s.resultedInReview ? (
                  <Badge variant="outline" className="text-success border-success/30 text-xs">
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
