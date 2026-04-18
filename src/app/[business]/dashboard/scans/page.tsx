import type { Metadata } from "next";
import ScansClient from "./scans-client";

interface PageProps {
  params: Promise<{ business: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business } = await params;
  return {
    title: `QR Scans History | ${business}`,
    description: `Track all QR code scan interactions for ${business}.`,
  };
}

export default function ScansPage() {
  return <ScansClient />;
}
