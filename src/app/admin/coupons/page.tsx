"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Ticket,
  X,
  MoreVertical,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 15;

export default function AdminCouponsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "",
    maxDiscountPaise: "",
    minOrderPaise: "",
    maxUses: "",
    startsAt: "",
    expiresAt: "",
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: searchQuery,
      });

      if (isActiveFilter !== "all") {
        queryParams.set("isActive", isActiveFilter);
      }

      const res = await apiClient.get(
        `/api/admin/coupons?${queryParams.toString()}`,
      );
      const data = await res.json();

      if (res.ok && data) {
        setCoupons(data.data || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalCount(data.pagination?.total || 0);
      } else {
        toast.error(data?.message || "Failed to load coupons");
      }
    } catch {
      toast.error("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, searchQuery, isActiveFilter]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await apiClient.patch(`/api/admin/coupons/${id}`, {
        isActive: !currentStatus,
      });
      if (res.ok) {
        toast.success(
          `Coupon ${!currentStatus ? "activated" : "deactivated"} successfully`,
        );
        fetchCoupons();
      } else {
        const error = await res.json();
        toast.error(error.message || "Action failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await apiClient.delete(`/api/admin/coupons/${id}`);
      if (res.ok) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } else {
        const error = await res.json();
        toast.error(error.message || "Delete failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        discountValue: parseInt(formData.discountValue),
        maxDiscountPaise: formData.maxDiscountPaise
          ? parseInt(formData.maxDiscountPaise) * 100
          : undefined,
        minOrderPaise: formData.minOrderPaise
          ? parseInt(formData.minOrderPaise) * 100
          : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        startsAt: formData.startsAt
          ? new Date(formData.startsAt).toISOString()
          : undefined,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).toISOString()
          : undefined,
      };

      if (formData.discountType === "FLAT") {
        payload.discountValue = payload.discountValue * 100; // Convert to paise
      }

      const res = await apiClient.post("/api/admin/coupons", payload);
      const data = await res.json();

      if (res.ok) {
        toast.success("Coupon created successfully");
        setIsDialogOpen(false);
        setFormData({
          code: "",
          description: "",
          discountType: "PERCENT",
          discountValue: "",
          maxDiscountPaise: "",
          minOrderPaise: "",
          maxUses: "",
          startsAt: "",
          expiresAt: "",
        });
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to create coupon");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFilters = () => {
    setIsActiveFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
            <CheckCircle2 className="w-2.5 h-2.5" /> ACTIVE
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
            <Clock className="w-2.5 h-2.5" /> SCHEDULED
          </span>
        );
      case "EXPIRED":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-semibold border border-slate-200">
            <Calendar className="w-2.5 h-2.5" /> EXPIRED
          </span>
        );
      case "DEPLETED":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
            <Zap className="w-2.5 h-2.5" /> DEPLETED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold border border-rose-100">
            <AlertCircle className="w-2.5 h-2.5" /> INACTIVE
          </span>
        );
    }
  };

  const hasActiveFilters = isActiveFilter !== "all" || searchQuery !== "";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coupon Codes</h2>
          <p className="text-muted-foreground text-sm">
            Manage discounts, promotional offers and dynamic referrals (
            {totalCount} total)
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by coupon code or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full rounded-lg h-10 border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={isActiveFilter}
              onValueChange={(val) => {
                setIsActiveFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] font-medium h-10 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coupons</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-10 px-3 text-xs text-rose-500 hover:text-rose-600"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Coupon Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Discount
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Usage
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Validity
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <Skeleton className="h-12 w-full" />
                    </td>
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center">
                      <Ticket className="w-10 h-10 mb-2 opacity-20" />
                      <p>No coupons found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/20">
                          <Ticket className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-base tracking-tight text-foreground uppercase">
                            {coupon.code}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {coupon.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">
                            {coupon.discountType === "PERCENT"
                              ? `${coupon.discountValue}% OFF`
                              : `₹${(coupon.discountValue / 100).toLocaleString()} OFF`}
                          </span>
                        </div>
                        {coupon.maxDiscountPaise && (
                          <p className="text-[10px] text-muted-foreground">
                            Max: ₹{coupon.maxDiscountPaise / 100}
                          </p>
                        )}
                        {coupon.minOrderPaise && (
                          <p className="text-[10px] text-amber-600 font-medium">
                            Min ₹{coupon.minOrderPaise / 100} spend
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className={cn(
                                "h-full bg-primary",
                                coupon.status === "DEPLETED" && "bg-amber-500",
                              )}
                              style={{
                                width: `${coupon.maxUses ? (coupon.usedCount / coupon.maxUses) * 100 : 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {coupon.usedCount}
                            {coupon.maxUses ? ` / ${coupon.maxUses}` : " uses"}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {getStatusBadge(coupon.status)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {coupon.startsAt
                              ? new Date(coupon.startsAt).toLocaleDateString()
                              : "Starting today"}
                            {" → "}
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleActive(coupon.id, coupon.isActive)
                            }
                            className="flex items-center gap-2"
                          >
                            <Power className="w-4 h-4" />
                            {coupon.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(coupon.id)}
                            className="flex items-center gap-2 text-rose-600 focus:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Coupon
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
              {totalCount} coupons
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Discount codes will be applied to the subscription checkout.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g. SUMMER50"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(v) =>
                      setFormData({ ...formData, discountType: v })
                    }
                  >
                    <SelectTrigger id="discountType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                      <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    {formData.discountType === "PERCENT"
                      ? "Discount Percentage (%)"
                      : "Flat Discount (₹)"}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    placeholder={
                      formData.discountType === "PERCENT"
                        ? "1-100"
                        : "Amount in ₹"
                    }
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                {formData.discountType === "PERCENT" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="Optional cap"
                      value={formData.maxDiscountPaise}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscountPaise: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrder">Min Order Value (₹)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    placeholder="₹ 0"
                    value={formData.minOrderPaise}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderPaise: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Usage Limit (Total)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUses: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Starts At</Label>
                  <Input
                    id="startsAt"
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startsAt: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description (Internal)</Label>
                <Input
                  id="desc"
                  placeholder="Summery promo for new businesses..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
