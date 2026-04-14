"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-business";
import { useUserProfile, useUpdateProfile } from "@/hooks/use-auth";
import { BusinessProfileSection } from "./components/BusinessProfileSection";
import { UserProfileSection } from "./components/UserProfileSection";
import { RoutingSettingsSection } from "./components/RoutingSettingsSection";
import { AdvancedBrandingSection } from "./components/AdvancedBrandingSection";

export default function SettingsPage() {
  const params = useParams();
  const slug = params.business as string;

  // Data
  const { data: business, isLoading: isBusinessLoading } = useBusiness(slug);
  const { data: user, isLoading: isUserLoading } = useUserProfile();

  // Mutations
  const updateBusinessMutation = useUpdateBusiness(slug);
  const updateProfileMutation = useUpdateProfile();

  if (isBusinessLoading || isUserLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-500">
        Business not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-12 pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <BusinessProfileSection
          business={business}
          updateBusinessMutation={updateBusinessMutation}
        />
        <UserProfileSection
          user={user}
          business={business}
          updateProfileMutation={updateProfileMutation}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-1">
          <AdvancedBrandingSection
            business={business}
            updateBusinessMutation={updateBusinessMutation}
          />
        </div>
        <div className="lg:col-span-2 text-slate-800">
          <RoutingSettingsSection
            business={business}
            updateBusinessMutation={updateBusinessMutation}
          />
        </div>
      </div>
    </div>
  );
}
