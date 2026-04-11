import { useParams } from "next/navigation";
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

export function UserNav() {
  const { user } = useAuthStore();
  const params = useParams();
  const logoutMutation = useLogoutMutation();

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
      <DropdownMenuContent className="w-64" align="end" forceMount>
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
                <div className="flex items-center">
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span
                    className={cn(
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
          <Link href="/onboard">
            <DropdownMenuItem className="cursor-pointer text-primary focus:text-primary focus:bg-primary/5">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="font-bold">Add Business</span>
            </DropdownMenuItem>
          </Link>
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
    </DropdownMenu>
  );
}
