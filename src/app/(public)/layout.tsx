"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <PublicNavbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
