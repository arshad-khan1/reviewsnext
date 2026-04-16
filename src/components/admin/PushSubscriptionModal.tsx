"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Wallet, Banknote, HelpCircle } from "lucide-react";

interface PushSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export function PushSubscriptionModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: PushSubscriptionModalProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [amountPaid, setAmountPaid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const res = await apiClient.get("/api/admin/plans");
      const data = await res.json();
      if (res.ok) {
        // Only show subscription plans, not topups
        const subPlans = data.filter((p: any) => p.type === "SUBSCRIPTION");
        setPlans(subPlans);
      }
    } catch {
      toast.error("Failed to fetch plans");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setAmountPaid((plan.price / 100).toString());
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlanId || !paymentMethod || !amountPaid) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post(
        `/api/admin/users/${userId}/push-subscription`,
        {
          planId: selectedPlanId,
          paymentMethod,
          amountPaid: parseFloat(amountPaid),
        },
      );

      if (res.ok) {
        toast.success("Subscription pushed successfully!");
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to push subscription");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Push Manual Subscription</DialogTitle>
          <DialogDescription>
            Manually assign a subscription plan to this user for offline sales.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="plan">Select Plan</Label>
            <Select onValueChange={handlePlanChange} value={selectedPlanId}>
              <SelectTrigger id="plan">
                <SelectValue
                  placeholder={
                    isLoadingPlans ? "Loading plans..." : "Choose a plan"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} (₹{plan.price / 100})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={paymentMethod === "UPI" ? "default" : "outline"}
                className="flex flex-col h-auto py-2 gap-1 text-xs"
                onClick={() => setPaymentMethod("UPI")}
              >
                <Wallet className="w-4 h-4" />
                UPI
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "CASH" ? "default" : "outline"}
                className="flex flex-col h-auto py-2 gap-1 text-xs"
                onClick={() => setPaymentMethod("CASH")}
              >
                <Banknote className="w-4 h-4" />
                Cash
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "OTHER" ? "default" : "outline"}
                className="flex flex-col h-auto py-2 gap-1 text-xs"
                onClick={() => setPaymentMethod("OTHER")}
              >
                <HelpCircle className="w-4 h-4" />
                Other
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount Received (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm & Push"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
