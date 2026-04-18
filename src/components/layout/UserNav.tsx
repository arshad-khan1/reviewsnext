import { useState } from "react";
import { useParams } from "next/navigation";
import { PlanType } from "@/types/prisma-enums";
import Image from "next/image";
import {
  LogOut,
  LayoutDashboard,
  Settings,
  PlusCircle,
  Check,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useLogoutMutation } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

export function UserNav() {
  const { user } = useAuthStore();
  const params = useParams();
  const logoutMutation = useLogoutMutation();
  const [showUpgradeGate, setShowUpgradeGate] = useState(false);

  if (!user) return null;

  const currentSlug = params.business as string;
  const businesses = user.businesses || [];
  const currentBusiness = businesses.find((b) => b.slug === currentSlug);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.phone.slice(-2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20 flex items-center justify-center p-0 overflow-hidden group"
        >
          <span className="text-sm font-bold text-primary group-hover:scale-110 transition-transform">
            {initials}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.phone || user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        {user.isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/admin/dashboard">
                <DropdownMenuItem className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 py-2">
          Switch Business
        </DropdownMenuLabel>
        <DropdownMenuGroup className="max-h-[200px] overflow-y-auto">
          {businesses.map((b) => (
            <Link key={b.id} href={`/${b.slug}/dashboard`}>
              <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="mr-3 w-6 h-6 rounded-md bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shrink-0">
                    {b.logoUrl ? (
                      <Image
                        src={b.logoUrl}
                        alt={b.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    ) : (
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "truncate",
                      b.slug === currentSlug && "font-bold text-primary",
                    )}
                  >
                    {b.name}
                  </span>
                </div>
                {b.slug === currentSlug && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            </Link>
          ))}
          {user.planTier === PlanType.PRO || user.isAdmin ? (
            <Link href="/onboard">
              <DropdownMenuItem className="cursor-pointer text-primary focus:text-primary focus:bg-primary/5">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Add Business</span>
              </DropdownMenuItem>
            </Link>
          ) : (
            <DropdownMenuItem
              onSelect={() => setShowUpgradeGate(true)}
              className="cursor-pointer text-primary focus:text-primary focus:bg-primary/5"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Add Business</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        {currentBusiness && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href={`/${currentSlug}/settings`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Business Settings</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={showUpgradeGate} onOpenChange={setShowUpgradeGate}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl min-h-[400px]">
          <DialogTitle className="sr-only">
            Multiple Businesses Access
          </DialogTitle>
          <DialogDescription className="sr-only">
            Upgrade to Pro plan to manage multiple businesses under one account.
          </DialogDescription>
          <SubscriptionGateOverlay
            title="Multi-Business Support"
            planDisplayName={
              user.subscriptionStatus === "TRIALING"
                ? "Trial"
                : user.planTier === PlanType.FREE
                  ? "Free"
                  : user.planTier === PlanType.STARTER
                    ? "Starter"
                    : user.planTier === PlanType.GROWTH
                      ? "Growth"
                      : "Pro"
            }
            description={
              <>
                Managing multiple businesses from a single dashboard is an
                exclusive feature for <PlanBadge name="Pro" /> users.
              </>
            }
            onUpgrade={() => {
              window.location.href = currentSlug
                ? `/${currentSlug}/dashboard/topup`
                : "/businesses";
              setShowUpgradeGate(false);
            }}
            onClose={() => setShowUpgradeGate(false)}
            iconType="lock"
          />
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
