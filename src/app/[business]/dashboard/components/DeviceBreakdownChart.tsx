"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { getDeviceBreakdown } from "@/data/mockDashboardData";

const CHART_COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(152, 60%, 45%)",
  "hsl(45, 97%, 54%)",
  "hsl(220, 70%, 55%)",
  "hsl(340, 70%, 55%)",
];

const DeviceBreakdownChart = () => {
  const deviceData = getDeviceBreakdown();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Device Brands</CardTitle>
        <CardDescription>Which devices scan your QR code</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={{}} className="h-[250px] w-full">
          <PieChart>
            <Pie
              data={deviceData}
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
              {deviceData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DeviceBreakdownChart;
