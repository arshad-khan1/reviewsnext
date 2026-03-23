"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { getScansPerDay } from "@/data/mockDashboardData";

const ScansOverTimeChart = () => {
  const scansPerDay = getScansPerDay();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">QR Scans Over Time</CardTitle>
        <CardDescription>Daily scan activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ scans: { label: "Scans", color: "hsl(25, 95%, 53%)" } }}
          className="h-[250px]"
        >
          <AreaChart data={scansPerDay}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => v.slice(5)}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="scans"
              fill="hsl(25, 95%, 53%)"
              fillOpacity={0.2}
              stroke="hsl(25, 95%, 53%)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ScansOverTimeChart;
