"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  Eye,
  Settings,
  ArrowLeft,
  MessageSquare,
  BarChart3,
  Zap,
  MapPin,
} from "lucide-react";
import { useLocations } from "@/hooks/use-locations";
import { UserNav } from "./UserNav";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/hooks/use-business";
import PlanBadge from "@/app/[business]/dashboard/components/PlanBadge";

export default function DashboardHeader() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const businessSlug = params.business as string;
  const locationSlug = params.locationSlug as string;
  const { data: business, isLoading: isBizLoading } = useBusiness(businessSlug);
  const { data: locationsData } = useLocations(businessSlug);
  const locations = locationsData?.data || [];
  const currentLocation = locations.find((l) => l.slug === locationSlug);

  if (isBizLoading || !business)
    return (
      <header className="border-b border-border bg-card h-16 sticky top-0 z-50" />
    );

  // Determine page type and metadata
  const isMainDashboard = pathname === `/${businessSlug}/dashboard`;
  const isReviewsPage = pathname.includes("/reviews");
  const isScansPage = pathname.includes("/scans");
  const isQRCodesPage = pathname.includes("/qr-codes");
  const isSettingsPage = pathname.includes("/settings");
  const isTopupPage = pathname.includes("/topup");
  const isLocationHub = pathname.includes("/qr-codes/location/");

  const getPageConfig = () => {
    if (isReviewsPage)
      return {
        title: "Reviews & Feedback",
        icon: MessageSquare,
        color: "text-blue-600",
        bg: "bg-blue-500/10",
      };
    if (isScansPage)
      return {
        title: "Scan History",
        icon: BarChart3,
        iconAlt: QrCode,
        color: "text-orange-600",
        bg: "bg-orange-500/10",
      };
    if (isQRCodesPage)
      return {
        title: "QR Code Manager",
        icon: QrCode,
        color: "text-indigo-600",
        bg: "bg-indigo-500/10",
      };
    if (isSettingsPage)
      return {
        title: "Business Settings",
        icon: Settings,
        color: "text-slate-600",
        bg: "bg-slate-500/10",
      };
    if (isTopupPage)
      return {
        title: "Topup Credits",
        icon: Zap,
        color: "text-indigo-600",
        bg: "bg-indigo-500/10",
      };
    if (isLocationHub)
      return {
        title: currentLocation
          ? `Location: ${currentLocation.name}`
          : "Location Hub",
        icon: MapPin,
        color: "text-indigo-600",
        bg: "bg-indigo-500/10",
      };
    return null;
  };

  const config = getPageConfig();
  const showBackButton = !isMainDashboard;

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-[calc(100vw-20rem)] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href={`/${businessSlug}/dashboard`}
          className="flex items-center gap-3"
        >
          {showBackButton ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isLocationHub) {
                    router.push(`/${businessSlug}/dashboard/qr-codes`);
                  } else {
                    router.back();
                  }
                }}
                className="rounded-xl hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {config && (
                <>
                  <div
                    className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center ${config.color} shadow-sm border border-current/10`}
                  >
                    <config.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base font-bold text-foreground">
                        {business.name}
                      </h1>
                      <PlanBadge plan={business.subscription?.plan || "FREE"} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {config.title}
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center p-1 border shadow-sm overflow-hidden relative">
                <Image
                  src={
                    business.logoUrl ||
                    "https://res.cloudinary.com/dly7lqtr3/image/upload/q_auto/f_auto/v1775932121/default_logo_uwesod.png"
                  }
                  alt={`${business.name} logo`}
                  fill
                  className="object-contain p-1.5"
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement, Event>,
                  ) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-foreground">
                    {business.name}
                  </h1>
                  <PlanBadge plan={business.subscription?.plan || "FREE"} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Dashboard & Analytics
                </p>
              </div>
            </>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/${businessSlug}/dashboard/reviews`}>
            <Button
              variant={isReviewsPage ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 font-medium ${isReviewsPage ? "bg-blue-50 text-blue-600 border-none hover:bg-blue-100" : ""}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Reviews</span>
            </Button>
          </Link>
          <Link href={`/${businessSlug}/dashboard/qr-codes`}>
            <Button
              variant={isQRCodesPage ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 font-medium ${isQRCodesPage ? "bg-indigo-50 text-indigo-600 border-none hover:bg-indigo-100" : ""}`}
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden md:inline">QR Codes</span>
            </Button>
          </Link>
          <Link href={`/${businessSlug}/settings`}>
            <Button
              variant={isSettingsPage ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 font-medium ${isSettingsPage ? "bg-slate-100 text-slate-900" : ""}`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Settings</span>
            </Button>
          </Link>
          <Link href={`/${businessSlug}/review`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-indigo-600 hover:text-white transition-all font-medium border-slate-200"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">View Page</span>
              <span className="md:hidden">View</span>
            </Button>
          </Link>

          <UserNav />
        </div>
      </div>
    </header>
  );
}
