import type { Metadata } from "next";
import QRCodesClient from "./qr-codes-client";

interface PageProps {
  params: Promise<{ business: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business } = await params;
  return {
    title: `QR Code Management | ${business}`,
    description: `Create and manage QR codes for different locations and sources for ${business}.`,
  };
}

export default function QRCodesPage() {
  return <QRCodesClient />;
}
