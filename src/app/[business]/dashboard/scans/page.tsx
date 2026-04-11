"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { 
  Search, 
  QrCode, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockScans } from "@/data/mockDashboardData";
import { mockBusinesses } from "@/data/mockBusinesses";
import QRScansTable from "../components/QRScansTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { QRScan } from "@/data/mockDashboardData";
import DetailRow from "../components/DetailRow";

const ITEMS_PER_PAGE = 8;

export default function ScansPage() {
  const params = useParams();
  const businessSlug = params.business as string;
  const business = mockBusinesses.find(b => b.slug === businessSlug);

  const [searchQuery, setSearchQuery] = useState("");
  const [reviewFilter, setReviewFilter] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScan, setSelectedScan] = useState<QRScan | null>(null);

  const filteredScans = useMemo(() => {
    return mockScans.filter(scan => {
      const searchStr = `${scan.device} ${scan.browser} ${scan.os} ${scan.city} ${scan.country} ${scan.ip}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesReview = reviewFilter === null || scan.resultedInReview === reviewFilter;
      return matchesSearch && matchesReview;
    });
  }, [searchQuery, reviewFilter]);

  const totalPages = Math.ceil(filteredScans.length / ITEMS_PER_PAGE);
  const paginatedScans = filteredScans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!business) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by device, location, or IP..." 
              className="pl-9 h-11 bg-card/50"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg border border-border/50 lg:col-span-2">
            <button
               onClick={() => { setReviewFilter(null); setCurrentPage(1); }}
               className={`flex-1 h-9 rounded-md text-xs font-bold transition-all ${reviewFilter === null ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              ALL SCANS
            </button>
            <button
               onClick={() => { setReviewFilter(true); setCurrentPage(1); }}
               className={`flex-1 h-9 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${reviewFilter === true ? "bg-success/10 text-success" : "text-muted-foreground hover:text-foreground"}`}
            >
              RESULTED IN REVIEW
            </button>
            <button
               onClick={() => { setReviewFilter(false); setCurrentPage(1); }}
               className={`flex-1 h-9 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${reviewFilter === false ? "bg-orange-500/10 text-orange-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              SCAN ONLY
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
          <QRScansTable 
            onViewScan={setSelectedScan} 
            scans={paginatedScans}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Showing <span className="text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, filteredScans.length)}</span> of <span className="text-foreground">{filteredScans.length}</span> scans
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-10 px-4 rounded-xl font-bold bg-card border-border/50 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                 {Array.from({ length: totalPages }).map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:bg-muted/50"}`}
                   >
                     {i + 1}
                   </button>
                 ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-10 px-4 rounded-xl font-bold bg-card border-border/50 shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Scan Detail Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden border-none p-0 bg-card">
          <div className="bg-orange-500/5 p-6 border-b border-orange-500/10">
             <DialogHeader className="p-0">
               <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                 <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <QrCode className="w-4 h-4" />
                 </div>
                 Scan Details
               </DialogTitle>
             </DialogHeader>
          </div>
          
          {selectedScan && (
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date & Time</span>
                    <p className="text-sm font-semibold">{selectedScan.formattedAt}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Result</span>
                    <div>
                    {selectedScan.resultedInReview ? (
                      <Badge className="bg-success/10 text-success border-success/20">Review Left</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-border/50">Scan Only</Badge>
                    )}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <DetailRow label="Device" value={selectedScan.device} />
                <DetailRow label="Browser" value={selectedScan.browser} />
                <DetailRow label="OS" value={selectedScan.os} />
                <DetailRow label="IP Address" value={selectedScan.ip} />
                <DetailRow
                  label="Location"
                  value={`${selectedScan.city}, ${selectedScan.country}`}
                />
                <DetailRow
                  label="Rating"
                  value={selectedScan.rating ? `${selectedScan.rating} ★` : "N/A"}
                />
              </div>

              <Button onClick={() => setSelectedScan(null)} className="w-full rounded-xl py-6 font-bold text-base shadow-lg shadow-orange-500/20 bg-orange-600 hover:bg-orange-700">
                Close Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
