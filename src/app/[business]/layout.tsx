"use client";

import { usePathname } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHeader = pathname.includes("/dashboard") || pathname.includes("/settings") || pathname.includes("/pricing");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {showHeader && <DashboardHeader />}
        {children}
      </div>
    </ProtectedRoute>
  );
}
