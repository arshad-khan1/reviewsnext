"use client";

import { useState, useEffect, use } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Building,
  Plus,
  ExternalLink,
  TrendingUp,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PushSubscriptionModal } from "@/components/admin/PushSubscriptionModal";

export default function UserDetailClient({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const userId = params.id;
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        toast.error("Failed to load user details");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1 rounded-xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <User className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold">User not found</h2>
        <Button asChild variant="link" className="mt-2">
          <Link href="/admin/users">Back to User list</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
          >
            <Link href="/admin/users">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {user.name || "Unnamed User"}
              </h1>
              {user.isAdmin && (
                <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-200 gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm uppercase font-mono tracking-widest mt-1">
              User ID: {user.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            onClick={() => setIsPushModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Push Subscription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="rounded-2xl shadow-sm border-muted/60 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground group">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/50">
                  Email
                </span>
                <span className="text-foreground font-medium">
                  {user.email || "No email provided"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground group">
              <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                <Phone className="w-4 h-4 text-pink-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/50">
                  Phone
                </span>
                <span className="text-foreground font-medium">
                  {user.phone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground group">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/50">
                  Joined On
                </span>
                <span className="text-foreground font-medium">
                  {format(new Date(user.createdAt), "MMMM d, yyyy")}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verified Status</span>
                <Badge
                  variant={user.isVerified ? "default" : "outline"}
                  className={
                    user.isVerified
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                      : ""
                  }
                >
                  {user.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Credits */}
        <Card className="rounded-2xl shadow-sm border-muted/60 lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Subscription & Usage
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plan Info */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-linear-to-br from-indigo-50 to-white border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Current Plan
                    </span>
                    <Badge className="bg-indigo-600 text-white border-none">
                      {user.subscription.plan}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold">
                    {user.subscription.planName || "Trial Plan"}
                  </h3>
                  <div className="mt-4 flex flex-col gap-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium capitalize">
                        {user.subscription.status}
                      </span>
                    </div>
                    {user.subscription.currentPeriodEnd && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Expiry</span>
                        <span className="font-medium">
                          {format(
                            new Date(user.subscription.currentPeriodEnd),
                            "PPP",
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Credits Info */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-slate-50 border-slate-200">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    AI Credits
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold">
                      {user.aiCredits.total - user.aiCredits.used}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      / {user.aiCredits.total} available
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">
                        Monthly Balance
                      </span>
                      <span className="font-medium">
                        {user.aiCredits.monthly.allocation -
                          user.aiCredits.monthly.used}{" "}
                        / {user.aiCredits.monthly.allocation}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">
                        Top-up Balance
                      </span>
                      <span className="font-medium">
                        {user.aiCredits.topup.allocation -
                          user.aiCredits.topup.used}{" "}
                        / {user.aiCredits.topup.allocation}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Businesses Table */}
        <Card className="rounded-2xl shadow-sm border-muted/60 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-4 h-4" /> Registered Businesses
            </CardTitle>
            <Badge variant="secondary" className="font-normal">
              {user.businesses.length}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5 font-medium hover:bg-transparent">
                  <TableHead className="pl-6">Business</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead className="pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.businesses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-48 text-center text-muted-foreground"
                    >
                      No businesses registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  user.businesses.map((b: any) => (
                    <TableRow key={b.id} className="group transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{b.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            slug: {b.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span>{b.industry}</span>
                          <span className="text-muted-foreground">
                            {b.city}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-12 text-muted-foreground">
                              Scans:
                            </span>
                            <span className="font-medium">{b.scans}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-12 text-muted-foreground">
                              Reviews:
                            </span>
                            <span className="font-medium">{b.reviews}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="group-hover:bg-primary/5"
                        >
                          <Link href={`/admin/businesses?slug=${b.slug}`}>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="rounded-2xl shadow-sm border-muted/60 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/3 font-medium hover:bg-transparent">
                  <TableHead className="pl-6">Plan/Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-6 text-right">Ref</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.paymentHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center text-muted-foreground"
                    >
                      No payment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  user.paymentHistory.map((h: any) => (
                    <TableRow
                      key={h.id}
                      className="text-xs hover:bg-muted/10 transition-colors"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {h.planName || "Manual Topup"}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {h.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-foreground">
                          ₹{h.amount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-normal uppercase px-1.5 py-0 ${
                            h.method === "CASH"
                              ? "bg-orange-50 text-orange-600 border-orange-200"
                              : h.method === "UPI"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : h.method === "RAZORPAY"
                                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {h.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {format(new Date(h.createdAt), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right text-[10px] font-mono text-muted-foreground">
                        {h.paymentId?.slice(-8) || h.id.slice(-8)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <PushSubscriptionModal
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        userId={user.id}
        onSuccess={fetchUserDetails}
      />
    </main>
  );
}
