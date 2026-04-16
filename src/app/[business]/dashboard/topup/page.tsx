import type { Metadata } from "next";
import TopupClient from "./topup-client";

interface PageProps {
  params: Promise<{ business: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business } = await params;
  return {
    title: `Top-up Credits | ${business}`,
    description: `Recharge AI credits for ${business} to continue automating review responses.`,
  };
}

export default function TopupPage() {
  return <TopupClient />;
}
