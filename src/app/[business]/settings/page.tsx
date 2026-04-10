"use client";

import { useRouter, useParams } from "next/navigation";
import BusinessForm, { BusinessFormData } from "@/components/forms/BusinessForm";
import { companyConfig } from "@/config/companyConfig";

// Mock mapping companyConfig to BusinessFormData
const initialData: Partial<BusinessFormData> = {
  logo: companyConfig.logo,
  name: companyConfig.name,
  industry: "Restaurant & Food", // Mock default industry
  phone: "+1 (555) 123-4567", // Mock default phone
  description: "A great place for customers.", // Mock default description
  aiPrompt: "You are a helpful assistant responding to reviews.",
  acceptedStars: 4,
  notAcceptedStars: 3,
  commentStyle: "Professional & Polite",
  googleMapsLink: "https://g.page/r/example",
};

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessSlug = params.business as string;

  const handleSubmit = (data: BusinessFormData) => {
    console.log("Updating business", businessSlug, data);
    // In a real app, you'd call an API here
    router.push(`/${businessSlug}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-transparent">
          <BusinessForm 
            initialData={initialData}
            onSubmit={handleSubmit} 
            onCancel={() => router.back()} 
            disablePhone={true}
          />
        </div>
      </main>
    </div>
  );
}
