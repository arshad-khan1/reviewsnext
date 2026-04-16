"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Database,
  Menu,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { AdminRoute } from "@/components/auth/protected-route";
import { UserNav } from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show header on login page
  const isLoginPage = pathname === "/admin";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/dashboard",
      activeStyle:
        "bg-slate-100 text-slate-900 border-l-4 border-l-slate-900 lg:border-none",
      desktopActive: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    },
    {
      label: "Businesses",
      href: "/admin/businesses",
      icon: Database,
      active: pathname.startsWith("/admin/businesses"),
      activeStyle:
        "bg-indigo-50 text-indigo-700 border-l-4 border-l-indigo-600 lg:border-none",
      desktopActive: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    },
  ];

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background text-foreground">
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
                    <SheetTitle className="sr-only">
                      Admin Navigation
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      Access dashboard and business management.
                    </SheetDescription>

                    <SheetClose asChild>
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 px-2 mb-2 group transition-opacity hover:opacity-80"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center p-1 border shadow-sm relative shrink-0">
                          <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">
                            Admin Portal
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            System Management
                          </p>
                        </div>
                      </Link>
                    </SheetClose>

                    <div className="flex flex-col gap-2 flex-1">
                      {navItems.map((item) => (
                        <SheetClose key={item.href} asChild>
                          <Link href={item.href}>
                            <Button
                              variant={item.active ? "secondary" : "ghost"}
                              className={`w-full justify-start relative overflow-hidden h-12 ${
                                item.active
                                  ? item.activeStyle
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <item.icon
                                className={`mr-3 h-5 w-5 ${item.active ? "text-current" : ""}`}
                              />
                              <span className="font-semibold">
                                {item.label}
                              </span>
                            </Button>
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Branding Section */}
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center p-1 border shadow-sm relative border-primary/20">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-bold text-foreground leading-tight truncate">
                    Admin Portal
                  </h1>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">
                    System Control
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.active ? "secondary" : "ghost"}
                    size="sm"
                    className={`gap-2 font-medium h-9 px-4 ${
                      item.active
                        ? item.desktopActive
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
              <div className="w-px h-6 bg-border mx-2" />
              <UserNav />
            </div>

            {/* Mobile UserNav */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <UserNav />
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </AdminRoute>
  );
}
