import type { Metadata } from "next";
import ContactClient from "./contact-client";

interface PageProps {
  params: Promise<{ business: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business } = await params;
  return {
    title: `Contact Support | ${business}`,
    description: `Get help and support for your ReviewFunnel account.`,
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
