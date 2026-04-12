"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "lucide-react";

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
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Active Subscription
                </p>
                <p className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {business?.subscription?.plan || "FREE"} PLAN
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-emerald-100 font-black text-[10px] text-emerald-600 shadow-sm">
                <BadgeCheck className="w-3 h-3" />
                {business?.subscription?.status || "ACTIVE"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white p-10 rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Account Details
            </DialogTitle>
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
    </>
  );
}
