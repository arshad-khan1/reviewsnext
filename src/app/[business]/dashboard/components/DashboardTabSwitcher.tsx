"use client";

import { MessageSquare, QrCode } from "lucide-react";

interface DashboardTabSwitcherProps {
  activeTab: "reviews" | "scans";
  setActiveTab: (tab: "reviews" | "scans") => void;
  reviewCount?: number;
  scanCount?: number;
}

export default function DashboardTabSwitcher({
  activeTab,
  setActiveTab,
  reviewCount,
  scanCount,
}: DashboardTabSwitcherProps) {
  return (
    <div className="flex justify-start">
      <div className="p-1 bg-card border border-border rounded-xl flex items-center gap-0.5 shadow-sm relative">
        <div
          className={`absolute top-1 bottom-1 transition-all duration-300 ease-in-out bg-primary rounded-lg shadow-lg shadow-primary/20 ${
            activeTab === "reviews"
              ? "left-1 w-[calc(50%-0.375rem)]"
              : "left-[50%] w-[calc(50%-0.375rem)]"
          }`}
        />
        <button
          onClick={() => setActiveTab("reviews")}
          className={`relative cursor-pointer z-10 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 ${
            activeTab === "reviews"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Reviews {reviewCount !== undefined && `(${reviewCount})`}
        </button>
        <button
          onClick={() => setActiveTab("scans")}
          className={`relative cursor-pointer z-10 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 ${
            activeTab === "scans"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          QR Scans {scanCount !== undefined && `(${scanCount})`}
        </button>
      </div>
    </div>
  );
}
