"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import BusinessForm, { BusinessFormData } from "@/components/forms/BusinessForm";

export default function CreateBusinessPage() {
  const router = useRouter();

  const handleSubmit = (data: BusinessFormData) => {
    console.log("Creating new business", data);
    // Simulate generating default QR code
    console.log("Generating default QR code with settings:", {
      aiPrompt: data.aiPrompt,
      commentStyle: data.commentStyle,
      googleMapsLink: data.googleMapsLink
    });
    
    // In a real app, you'd call an API here
    // Redirect back to businesses list
    router.push("/businesses");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center p-1">
              <Building className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Create New Business
              </h1>
              <p className="text-xs text-muted-foreground">
                Set up a new business profile
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-transparent">
          <BusinessForm 
            onSubmit={handleSubmit} 
            onCancel={() => router.back()} 
          />
        </div>
      </main>
    </div>
  );
}
