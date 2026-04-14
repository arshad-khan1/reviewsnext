"use client";

import { useState } from "react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutDialog, type CheckoutPlan } from "@/components/shared/pricing/checkout-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User,
  Save,
  Loader2,
  Edit3,
  Mail,
  Phone,
  CreditCard,
  BadgeCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import PlanBadge from "@/app/[business]/dashboard/components/PlanBadge";

interface UserProfileSectionProps {
  user: any;
  business: any;
  updateProfileMutation: any;
}

export function UserProfileSection({
  user,
  business,
  updateProfileMutation,
}: UserProfileSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const handleOpen = () => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    await updateProfileMutation.mutateAsync(form);
    setIsOpen(false);
  };

  const expiryDate = business?.subscription?.currentPeriodEnd
    ? new Date(business.subscription.currentPeriodEnd)
    : null;
  const daysRemaining = expiryDate
    ? Math.max(0, differenceInDays(expiryDate, new Date()))
    : null;
  const showWarning =
    daysRemaining !== null &&
    daysRemaining <= 10 &&
    business?.subscription?.status === "ACTIVE";
  const formattedExpiry = expiryDate ? format(expiryDate, "MMM dd, yyyy") : null;

  // Prepare plan metadata for CheckoutDialog
  const currentPlan: CheckoutPlan | null = business?.subscription
    ? {
        id: business.subscription.planId,
        name: business.subscription.plan,
        price: business.subscription.price,
        currency: business.subscription.currency,
        credits: business.subscription.credits,
        planTier: business.subscription.planTier,
        type: business.subscription.type,
      }
    : null;

  return (
    <>
      <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col group">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                User Profile
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-indigo-600 font-bold gap-2"
              onClick={handleOpen}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 h-full">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 border-4 border-white ring-1 ring-indigo-50">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {user?.name || "Member"}
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {user?.email || "No Email Provided"}
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {user?.phone || "No Phone Number Provided"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 rounded-[28px] border border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <PlanBadge 
                      plan={business?.subscription?.planTier || business?.subscription?.plan || "FREE"} 
                      status={business?.subscription?.status}
                    />
                    {business?.subscription?.status === "ACTIVE" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  {formattedExpiry && (
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      Valid till: {formattedExpiry}
                    </p>
                  )}
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-emerald-100 font-black text-[10px] text-emerald-600 shadow-sm">
                <BadgeCheck className="w-3 h-3" />
                {business?.subscription?.status || "ACTIVE"}
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2"
              >
                <Link href={`/${business?.slug}/pricing`}>
                  Upgrade
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {showWarning && (
            <div className="mt-2 p-4 rounded-2xl border border-red-100 bg-red-50 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-red-100 shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-xs font-bold text-red-900 leading-relaxed">
                  Your subscription is going to end in{" "}
                  <span className="text-red-600">
                    {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                  </span>
                  . Please make a payment to keep your system and QR&apos;s running.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsCheckoutOpen(true)}
                className="h-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider px-4 shrink-0 shadow-sm"
              >
                Renew Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white p-10 rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Account Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              Update your personal information including name and email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-900 font-black text-xs uppercase tracking-wider">
                  Full Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-900 font-black text-xs uppercase tracking-wider">
                  Email
                </Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2 opacity-60">
                <Label className="text-slate-400 font-black text-xs uppercase tracking-wider">
                  Phone Number (Account Primary)
                </Label>
                <Input
                  value={user?.phone || ""}
                  readOnly
                  className="h-12 rounded-xl bg-slate-50 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="font-bold h-10 px-6 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-slate-900 font-black px-6 h-10 rounded-xl"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {currentPlan && (
        <CheckoutDialog
          open={isCheckoutOpen}
          onOpenChange={setIsCheckoutOpen}
          plan={currentPlan}
          businessId={business?.id}
          businessSlug={business?.slug}
          businessName={business?.name}
        />
      )}
    </>
  );
}
