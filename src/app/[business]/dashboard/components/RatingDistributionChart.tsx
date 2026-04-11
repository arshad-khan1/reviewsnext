"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";


const CHART_COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(152, 60%, 45%)",
  "hsl(45, 97%, 54%)",
  "hsl(220, 70%, 55%)",
  "hsl(340, 70%, 55%)",
];

interface RatingDistributionChartProps {
  data: { rating: string; count: number }[];
}

const RatingDistributionChart = ({ data }: RatingDistributionChartProps) => {

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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
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
