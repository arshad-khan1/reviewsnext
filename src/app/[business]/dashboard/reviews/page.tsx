import type { Metadata } from "next";
import ReviewsClient from "./reviews-client";

interface PageProps {
  params: Promise<{ business: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business } = await params;
  return {
    title: `All Reviews | ${business}`,
    description: `Browse and manage all customer reviews and feedback for ${business}.`,
  };
}

export default function ReviewsPage() {
  return <ReviewsClient />;
}
