"use client";

import {
  Star,
  TrendingUp,
  MapPin,
  Activity,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Business } from "@/data/mockBusinesses";

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const {
    slug,
    name,
    logo,
    totalScans,
    totalReviews,
    conversionRate,
    avgRating,
    lowRatings,
    highRatings,
    industry,
    location,
  } = business;

  return (
    <Card className="group relative overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 border-border">
      <CardContent className="flex-1 flex flex-col">
        {/* Top Header Section */}
        <div className="flex items-start justify-between border-b pb-4 border-border/50">
          <div className="flex items-center gap-3 w-full">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-background border shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src={logo}
                alt={`${name} logo`}
                width={48}
                height={48}
                className="object-contain p-1.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-muted-foreground"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>`;
                  }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground truncate">
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground truncate">
                <span className="truncate">{industry}</span>
                <span>•</span>
                <span className="flex items-center truncate">
                  <MapPin className="w-3 h-3 mr-1 shrink-0" />
                  {location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">
                Reviews
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold">{totalReviews}</span>
                <div className="flex items-center text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded text-xs font-medium">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                  {avgRating.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">
                Conversion
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl font-bold">
                  {conversionRate.toFixed(1)}%
                </span>
                <div className="flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {totalScans} SCANS
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-foreground">{highRatings}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                  Positive
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                <ThumbsDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-foreground">{lowRatings}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                  Negative
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="pt-0 mt-auto">
          <Button asChild className="w-full shadow-sm" variant="default">
            <Link href={`/${slug}/dashboard`}>View Dashboard</Link>
          </Button>
          <div className="mt-3 flex items-center justify-center text-[11px] text-muted-foreground">
            <Activity className="w-3 h-3 mr-1" />
            Active {business.formattedLastActive}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
