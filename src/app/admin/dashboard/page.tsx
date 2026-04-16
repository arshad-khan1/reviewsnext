import type { Metadata } from "next";
import AdminDashboardClient from "./admin-dashboard-client";

export const metadata: Metadata = {
  title: "Admin Dashboard | ReviewFunnel",
  description: "Platform-wide analytics and management for ReviewFunnel.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
