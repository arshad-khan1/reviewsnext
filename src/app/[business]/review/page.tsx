import { resolveReviewConfig } from "@/lib/db/config";
import ReviewFlow from "./ReviewFlow";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ business: string }>;
  searchParams: Promise<{
    source: string | undefined;
    qr?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { business } = await params;
  return {
    title: `Review ${business}`,
    description: `Leave your feedback for ${business}`,
  };
}

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const { business: businessSlug } = await params;
  const sParams = await searchParams;
  const sourceTag = sParams.source || sParams.qr;

  const config = await resolveReviewConfig(businessSlug, sourceTag);

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Business Not Found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-xs">
          The business you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </Button>
        </Link>
      </div>
    );
  }

  return <ReviewFlow businessSlug={businessSlug} config={config} />;
}
