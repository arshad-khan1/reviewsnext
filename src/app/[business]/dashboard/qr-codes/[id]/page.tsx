import type { Metadata } from "next";
import IndividualQRDashboard from "./qr-detail-client";

interface PageProps {
  params: Promise<{ business: string; id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business, id } = await params;
  return {
    title: `QR Code Dashboard | ${business}`,
    description: `Analytics and performance metrics for QR code ${id}.`,
  };
}

export default function QRDetailPage() {
  return <IndividualQRDashboard />;
}
