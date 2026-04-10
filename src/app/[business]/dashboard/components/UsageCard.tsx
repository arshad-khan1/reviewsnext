"use client";

import React from "react";
import { Info, ArrowUpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

interface UsageCardProps {
  used: number;
  total: number;
  className?: string;
}

const UsageCard = ({ used, total, className }: UsageCardProps) => {
  const params = useParams();
  const businessSlug = params.business as string;
  const percentage = Math.min(Math.round((used / total) * 100), 100);

  const getProgressColor = () => {
    if (percentage > 85) return "bg-destructive";
    if (percentage > 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-all duration-300 border-border/50 flex flex-col relative overflow-hidden group", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          AI Review Usage
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-0.5 hover:bg-muted rounded-full transition-colors cursor-help">
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                <p>Each AI review generation or enhancement consumes 1 credit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between relative z-10">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Credits Used</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight text-slate-900">{used}</span>
                <span className="text-sm font-bold text-muted-foreground">/ {total}</span>
              </div>
            </div>
            <div className={cn(
              "text-sm font-black px-3 py-1 rounded-full",
              percentage > 85 ? "text-destructive bg-destructive/10" : "text-emerald-600 bg-emerald-50"
            )}>
              {percentage}%
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Monthly Progress</span>
              <span>{total - used} remaining</span>
            </div>
            <Progress 
              value={percentage} 
              indicatorClassName={cn("transition-all duration-1000", getProgressColor())} 
              className="h-2.5 bg-slate-100"
            />
            
            {percentage > 85 && (
              <p className="text-[11px] font-bold text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-500 bg-destructive/5 p-2 rounded-lg border border-destructive/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Usage limit reached. Upgrade to keep generating reviews.
              </p>
            )}
          </div>
        </div>

        <Link href={`/${businessSlug}/dashboard/topup`} className="block w-full">
          <Button className="w-full h-12 gap-2 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all active:scale-[0.98] rounded-xl">
            <ArrowUpCircle className="w-4 h-4" />
            Topup Credits
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default UsageCard;
