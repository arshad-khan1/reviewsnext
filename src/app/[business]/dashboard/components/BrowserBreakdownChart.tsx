"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { getBrowserBreakdown } from "@/data/mockDashboardData";

const CHART_COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(152, 60%, 45%)",
  "hsl(45, 97%, 54%)",
  "hsl(220, 70%, 55%)",
  "hsl(340, 70%, 55%)",
];

const BrowserBreakdownChart = () => {
  const browserData = getBrowserBreakdown();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Browser Usage</CardTitle>
        <CardDescription>Browsers used to scan QR codes</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={{}} className="h-[250px] w-full">
          <PieChart>
            <Pie
              data={browserData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {browserData.map((_, i) => (
                <Cell
                  key={i}
                  fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BrowserBreakdownChart;
