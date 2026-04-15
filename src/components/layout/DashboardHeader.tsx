"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  Eye,
  MessageSquare,
  MapPin,
  Crown,
  Menu,
  LayoutDashboard,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { UserNav } from "./UserNav";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/hooks/use-business";
import PlanBadge from "@/app/[business]/dashboard/components/PlanBadge";
import { FeatureGate } from "@/components/auth/FeatureGate";
import { PlanType } from "@prisma/client";

export default function DashboardHeader() {
  const params = useParams();
  const pathname = usePathname();
  const businessSlug = params.business as string;

  const { data: business, isLoading: isBizLoading } = useBusiness(businessSlug);

  if (isBizLoading || !business)
    return (
      <header className="border-b border-border bg-card h-16 sticky top-0 z-50" />
    );

  // Determine active states for nav items
  const isDashboardPage = pathname === `/${businessSlug}/dashboard`;
  const isReviewsPage = pathname.includes("/reviews");
  const isQRCodesPage = pathname.includes("/qr-codes");
  const isLocationHub = pathname.includes("/qr-codes/location/");

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-2">
          {/* Mobile Hamburger Drawer */}
          <div className="flex lg:hidden shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-10 w-10 mr-1 border-primary/20"
                >
                  <Menu className="h-5 w-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] sm:w-[320px] pt-12 border-r bg-card flex flex-col gap-6"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Access reviews, QR codes, and business settings.
                </SheetDescription>

                {/* Logo in drawer for solid UX */}
                <SheetClose asChild>
                  <Link
                    href={`/${businessSlug}/dashboard`}
                    className="flex items-center gap-3 px-2 mb-2 group transition-opacity hover:opacity-80"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center p-1 border shadow-sm overflow-hidden relative shrink-0">
                      <Image
                        src={
                          business.logoUrl ||
                          "https://res.cloudinary.com/dly7lqtr3/image/upload/q_auto/f_auto/v1775932121/default_logo_uwesod.png"
                        }
                        alt={`${business.name} logo`}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">
                        {business.name}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Navigation Menu
                      </p>
                    </div>
                  </Link>
                </SheetClose>

                <div className="flex flex-col gap-2 flex-1">
                  <SheetClose asChild>
                    <Link href={`/${businessSlug}/dashboard`}>
                      <Button
                        variant={isDashboardPage ? "secondary" : "ghost"}
                        className={`w-full justify-start relative overflow-hidden h-12 ${
                          isDashboardPage
                            ? "bg-slate-100 text-slate-900 border-l-4 border-l-slate-900 rounded-l-none"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <LayoutDashboard
                          className={`mr-3 h-5 w-5 ${isDashboardPage ? "text-slate-900" : ""}`}
                        />
                        <span className="font-semibold">Dashboard</span>
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href={`/${businessSlug}/dashboard/reviews`}>
                      <Button
                        variant={isReviewsPage ? "secondary" : "ghost"}
                        className={`w-full justify-start relative overflow-hidden h-12 ${
                          isReviewsPage
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border-l-4 border-l-blue-600 rounded-l-none"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MessageSquare
                          className={`mr-3 h-5 w-5 ${isReviewsPage ? "text-blue-600" : ""}`}
                        />
                        <span className="font-semibold">Reviews</span>
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href={`/${businessSlug}/dashboard/qr-codes`}>
                      <Button
                        variant={isQRCodesPage ? "secondary" : "ghost"}
                        className={`w-full justify-start relative overflow-hidden h-12 ${
                          isQRCodesPage
                            ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-l-4 border-l-indigo-600 rounded-l-none"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <QrCode
                          className={`mr-3 h-5 w-5 ${isQRCodesPage ? "text-indigo-600" : ""}`}
                        />
                        <span className="font-semibold">QR Codes</span>
                      </Button>
                    </Link>
                  </SheetClose>

                  <FeatureGate feature="maxLocations" variant="hide">
                    <SheetClose asChild>
                      <Link
                        href={`/${businessSlug}/dashboard/qr-codes/location/hub`}
                      >
                        <Button
                          variant={isLocationHub ? "secondary" : "ghost"}
                          className={`w-full justify-start relative overflow-hidden h-12 ${
                            isLocationHub
                              ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-l-4 border-l-indigo-600 rounded-l-none"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <MapPin
                            className={`mr-3 h-5 w-5 ${isLocationHub ? "text-indigo-600" : ""}`}
                          />
                          <span className="font-semibold">Locations</span>
                        </Button>
                      </Link>
                    </SheetClose>
                  </FeatureGate>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="flex flex-col gap-2 mt-auto">
                  <SheetClose asChild>
                    <Link href={`/${businessSlug}/review`} target="_blank">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="mr-3 h-5 w-5" />
                        View Public Page
                      </Button>
                    </Link>
                  </SheetClose>
                  {business.subscription?.plan === PlanType.FREE && (
                    <SheetClose asChild>
                      <Link href={`/${businessSlug}/pricing`}>
                        <Button
                          variant="default"
                          className="w-full justify-start bg-amber-100 text-amber-700 hover:bg-amber-200"
                        >
                          <Crown className="mr-3 h-5 w-5" />
                          Upgrade to Pro
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link
            href={`/${businessSlug}/dashboard`}
            className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-secondary flex items-center justify-center p-1 border shadow-sm overflow-hidden relative">
              <Image
                src={
                  business.logoUrl ||
                  "https://res.cloudinary.com/dly7lqtr3/image/upload/q_auto/f_auto/v1775932121/default_logo_uwesod.png"
                }
                alt={`${business.name} logo`}
                fill
                className="object-contain p-1.5"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-foreground leading-tight truncate">
                {business.name}
              </h1>
              <div className="mt-0.5 sm:mt-1">
                <PlanBadge
                  plan={
                    business.subscription?.planTier ||
                    business.subscription?.plan ||
                    PlanType.FREE
                  }
                  status={business.subscription?.status}
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Link href={`/${businessSlug}/dashboard`}>
            <Button
              variant={isDashboardPage ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 font-medium ${isDashboardPage ? "bg-slate-100 text-slate-900 border-none hover:bg-slate-200" : ""}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href={`/${businessSlug}/dashboard/reviews`}>
            <Button
              variant={isReviewsPage ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 font-medium ${isReviewsPage ? "bg-blue-50 text-blue-600 border-none hover:bg-blue-100" : ""}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reviews</span>
            </Button>
          </Link>
          <Link href={`/${businessSlug}/dashboard/qr-codes`}>
            <Button
              variant={isQRCodesPage ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 font-medium ${isQRCodesPage ? "bg-indigo-50 text-indigo-600 border-none hover:bg-indigo-100" : ""}`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR Codes</span>
            </Button>
          </Link>

          <FeatureGate feature="maxLocations" variant="hide">
            <Link href={`/${businessSlug}/dashboard/qr-codes/location/hub`}>
              <Button
                variant={isLocationHub ? "secondary" : "ghost"}
                size="sm"
                className={`gap-2 font-medium ${isLocationHub ? "bg-indigo-50 text-indigo-600 border-none hover:bg-indigo-100" : ""}`}
              >
                <MapPin className="w-4 h-4" />
                <span>Locations</span>
              </Button>
            </Link>
          </FeatureGate>

          <Link href={`/${businessSlug}/review`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-indigo-600 hover:text-white transition-all font-medium border-slate-200"
            >
              <Eye className="w-4 h-4" />
              <span>View Page</span>
            </Button>
          </Link>

          {business.subscription?.plan === PlanType.FREE && (
            <Link href={`/${businessSlug}/pricing`}>
              <Button
                variant="default"
                size="sm"
                className="gap-2 bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-none shadow-md shadow-amber-500/20 font-bold transition-all px-4 group animate-pulse hover:animate-none"
              >
                <Crown className="w-4 h-4 fill-white group-hover:rotate-12 transition-transform" />
                <span>Upgrade Now</span>
              </Button>
            </Link>
          )}

          <UserNav />
        </div>

        {/* Mobile Navigation - Only shows UserNav now since main nav moved to Drawer */}
        <div className="flex lg:hidden items-center gap-1 sm:gap-2 shrink-0">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
