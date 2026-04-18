import type { Metadata } from "next";
import UserDetailClient from "./user-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `User Details: ${id} | Admin Portal`,
    description: `Full overview and management for user ${id}.`,
  };
}

export default function UserDetailPage({ params }: PageProps) {
  return <UserDetailClient params={params} />;
}
