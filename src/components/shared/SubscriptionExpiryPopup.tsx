"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { SubscriptionStatus, PlanType } from "@/types/prisma-enums";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  SubscriptionGateOverlay,
  PlanBadge,
} from "@/components/shared/SubscriptionGateOverlay";

export function SubscriptionExpiryPopup() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const shouldShowPopupRef = useRef(false);

  // Calculate days remaining based on subscription status
  const daysRemaining = useMemo(() => {
    if (!user) return null;

    let expiryDate: Date | null = null;

    if (user.subscriptionStatus === SubscriptionStatus.TRIALING && user.trialEndsAt) {
      expiryDate = new Date(user.trialEndsAt);
    } else if (
      user.subscriptionStatus === SubscriptionStatus.ACTIVE &&
      user.currentPeriodEnd
    ) {
      expiryDate = new Date(user.currentPeriodEnd);
    }

    if (!expiryDate) return null;

    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }, [user]);

  // Check localStorage and update ref (synchronizing with external system)
  useEffect(() => {
    if (!user || daysRemaining === null) {
      shouldShowPopupRef.current = false;
      return;
    }

    // Show popup if 3 days or less remaining, OR if expired
    if (daysRemaining <= 3) {
      // Check if user has already dismissed this popup
      const expiryDate =
        user.subscriptionStatus === SubscriptionStatus.TRIALING
          ? user.trialEndsAt
          : user.currentPeriodEnd;
      
      if (expiryDate) {
        const dismissedKey = `subscription-expiry-dismissed-${user.id}-${new Date(expiryDate).toISOString().split('T')[0]}`;
        const wasDismissed = localStorage.getItem(dismissedKey);

        shouldShowPopupRef.current = !wasDismissed;
      }
    } else {
      shouldShowPopupRef.current = false;
    }
  }, [user, daysRemaining]);

  // Set state based on ref value - using a separate effect to avoid synchronous setState
  useEffect(() => {
    setShowPopup(shouldShowPopupRef.current);
  }, [user]);

  const handleUpgrade = () => {
    setShowPopup(false);
    // Navigate to business-specific pricing page
    if (user?.businesses && user.businesses.length > 0) {
      const firstBusiness = user.businesses[0];
      router.push(`/${firstBusiness.slug}/pricing`);
    } else {
      router.push("/pricing");
    }
  };

  const handleClose = () => {
    if (user && daysRemaining) {
      // Mark as dismissed for today
      const expiryDate =
        user.subscriptionStatus === SubscriptionStatus.TRIALING
          ? user.trialEndsAt
          : user.currentPeriodEnd;
      if (expiryDate) {
        const dismissedKey = `subscription-expiry-dismissed-${user.id}-${new Date(expiryDate).toISOString().split('T')[0]}`;
        localStorage.setItem(dismissedKey, "true");
      }
    }
    setShowPopup(false);
  };

  if (!user || !showPopup || daysRemaining === null || daysRemaining > 3) {
    return null;
  }

  const isTrial = user.subscriptionStatus === SubscriptionStatus.TRIALING;
  const isExpired = daysRemaining <= 0;
  const planName =
    user.planTier === PlanType.FREE
      ? "Free"
      : user.planTier === PlanType.STARTER
        ? "Starter"
        : user.planTier === PlanType.GROWTH
          ? "Growth"
          : "Pro";

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl min-h-[400px]">
        <DialogTitle className="sr-only">
          {isExpired
            ? (isTrial ? "Trial Expired" : "Subscription Expired")
            : (isTrial ? "Trial Expiring Soon" : "Subscription Expiring Soon")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isExpired
            ? (isTrial
              ? "Your trial has expired. Upgrade to continue using all features."
              : "Your subscription has expired. Renew to continue using all features.")
            : (isTrial
              ? `Your trial expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. Upgrade to continue using all features.`
              : `Your subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. Renew to continue using all features.`)}
        </DialogDescription>
        <SubscriptionGateOverlay
          title={isExpired
            ? (isTrial ? "Trial Expired" : "Subscription Expired")
            : (isTrial ? "Trial Expiring Soon" : "Subscription Expiring Soon")}
          planDisplayName={planName}
          description={
            <>
              {isExpired ? (
                isTrial ? (
                  <>
                    Your <PlanBadge name="Trial" /> has expired.
                    Upgrade to a paid plan to continue using all features.
                  </>
                ) : (
                  <>
                    Your <PlanBadge name={planName} /> subscription has expired.
                    Renew your plan to continue using all features.
                  </>
                )
              ) : isTrial ? (
                <>
                  Your <PlanBadge name="Trial" /> expires in{" "}
                  <span className="font-bold text-rose-600">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</span>.
                  Upgrade to a paid plan to continue using all features.
                </>
              ) : (
                <>
                  Your <PlanBadge name={planName} /> subscription expires in{" "}
                  <span className="font-bold text-rose-600">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</span>.
                  Renew your plan to continue using all features.
                </>
              )}
            </>
          }
          onUpgrade={handleUpgrade}
          onClose={handleClose}
          iconType="limit"
          upgradeText={isTrial ? "Upgrade Now" : "Renew Now"}
        />
      </DialogContent>
    </Dialog>
  );
}
