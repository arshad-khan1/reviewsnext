import type { Metadata } from "next";
import SettingsClient from "./settings-client";

interface PageProps {
  params: Promise<{ business: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business } = await params;
  return {
    title: `Settings | ${business}`,
    description: `Configure review routing, AI responses, and business details for ${business}.`,
  };
}

export default function SettingsPage() {
  return <SettingsClient />;
}
