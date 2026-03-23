"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, color }: StatCardProps) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <Card className="relative overflow-hidden">
      <CardContent className="p-6 h-[120px] flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="min-w-0 mr-3">
            <p className="text-sm font-medium text-muted-foreground whitespace-nowrap truncate">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: `${color}20` }}>
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default StatCard;
