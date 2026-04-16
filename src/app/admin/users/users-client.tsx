"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  User,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Building,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 20;

export default function UsersClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [isAdminFilter, setIsAdminFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: searchQuery,
        sortBy,
        sortOrder,
      });

      if (isAdminFilter !== "all") {
        queryParams.set("isAdmin", isAdminFilter);
      }

      const res = await apiClient.get(
        `/api/admin/users?${queryParams.toString()}`,
      );
      const data = await res.json();

      if (res.ok && data) {
        setUsers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalCount(data.pagination?.total || 0);
      } else {
        toast.error(data?.message || "Failed to load users");
      }
    } catch {
      toast.error("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, isAdminFilter, sortBy, sortOrder]);

  const resetFilters = () => {
    setIsAdminFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground text-sm">
            View and manage all registered platform users ({totalCount} total)
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full rounded-lg h-10 border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Role:
            </span>
            <Select
              value={isAdminFilter}
              onValueChange={(val) => {
                setIsAdminFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] font-medium h-10 text-xs">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="true">Admins</SelectItem>
                <SelectItem value="false">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Sort by:
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] font-medium h-10 text-xs">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Joined Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="businessCount">Businesses</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[250px]">User Info</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <User className="w-10 h-10 mb-2 opacity-20" />
                    <p>No users found matching your criteria</p>
                    <Button
                      variant="link"
                      onClick={resetFilters}
                      className="mt-2"
                    >
                      Clear all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {user.name || "Unnamed User"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                        ID: {user.id.slice(-8)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1.5 opacity-70" />
                        {user.email || "No email"}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Phone className="w-3 h-3 mr-1.5 opacity-70" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge
                        variant="default"
                        className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-200 gap-1 px-2 py-0.5"
                      >
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground px-2 py-0.5 font-normal"
                      >
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Building className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium">{user.businessCount}</span>
                      <span className="text-muted-foreground">businesses</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant="outline"
                        className={`w-fit text-[10px] px-1.5 py-0 ${
                          user.subscription.plan === "PRO"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : user.subscription.plan === "GROWTH"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "text-muted-foreground"
                        }`}
                      >
                        {user.subscription.planName || user.subscription.plan}
                      </Badge>
                      <div className="flex items-center text-[10px] text-muted-foreground">
                        <CreditCard className="w-2.5 h-2.5 mr-1 opacity-70" />
                        {user.credits.total - user.credits.used} /{" "}
                        {user.credits.total} credits
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 group-hover:bg-primary/10 group-hover:text-primary"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </main>
  );
}
