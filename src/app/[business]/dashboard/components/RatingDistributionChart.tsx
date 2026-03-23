"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { getRatingDistribution } from "@/data/mockDashboardData";

const CHART_COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(152, 60%, 45%)",
  "hsl(45, 97%, 54%)",
  "hsl(220, 70%, 55%)",
  "hsl(340, 70%, 55%)",
];

const RatingDistributionChart = () => {
  const ratingDist = getRatingDistribution();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rating Distribution</CardTitle>
        <CardDescription>Breakdown of all ratings</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ count: { label: "Reviews", color: "hsl(45, 97%, 54%)" } }}
          className="h-[250px]"
        >
          <BarChart data={ratingDist}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {ratingDist.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RatingDistributionChart;
