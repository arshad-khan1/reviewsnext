import type { Metadata } from "next";
import DashboardClient from "./dashboard-client";

interface PageProps {
  params: Promise<{ business: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business } = await params;
  return {
    title: `Dashboard | ${business}`,
    description: `Manage your business reputation and view analytics for ${business} on ReviewFunnel.`,
  };
}

export default function DashboardPage() {
  return <DashboardClient />;
}
