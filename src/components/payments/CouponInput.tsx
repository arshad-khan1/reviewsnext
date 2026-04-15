"use client";

import { useState, useRef } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface CouponResult {
  couponId: string;
  code: string;
  description: string | null;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  discountPaise: number;
  originalPrice: number;
  finalPrice: number;
}

interface CouponInputProps {
  planId: string;
  businessId: string;
  originalPaise: number;
  onApply: (result: CouponResult | null) => void;
  disabled?: boolean;
  className?: string;
}

type State = "idle" | "loading" | "success" | "error";

/**
 * Self-contained coupon code input used inside the checkout dialog.
 * Calls POST /api/payments/coupon/validate on submit.
 * Passes the full CouponResult up via onApply when valid, or null on removal.
 */
export function CouponInput({
  planId,
  businessId,
  originalPaise,
  onApply,
  disabled = false,
  className,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>("idle");
  const [appliedResult, setAppliedResult] = useState<CouponResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleApply = async () => {
    if (!code.trim() || state === "loading" || disabled) return;

    setState("loading");

    try {
      const res = await apiClient.post("/api/payments/coupon/validate", {
        code: code.trim(),
        planId,
        businessId,
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        toast.error(data.message || "Failed to validate coupon.");
        onApply(null);
        return;
      }

      if (!data.valid) {
        setState("error");
        toast.error(data.message || "Invalid coupon code.");
        onApply(null);
        return;
      }

      const result: CouponResult = {
        couponId: data.couponId,
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountPaise: data.discountPaise,
        originalPrice: data.originalPrice,
        finalPrice: data.finalPrice,
      };

      setState("success");
      setAppliedResult(result);
      onApply(result);
    } catch {
      setState("error");
      toast.error("Connection error. Please try again.");
      onApply(null);
    }
  };

  const handleRemove = () => {
    setCode("");
    setState("idle");
    setAppliedResult(null);
    onApply(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleApply();
  };

  // ─── Success state ──────────────────────────────────────────────────────────
  if (state === "success" && appliedResult) {
    const savingsINR = (appliedResult.discountPaise / 100).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0,
      },
    );
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3",
          className,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 leading-none">
              Coupon Applied
            </p>
            <p className="text-sm font-black text-emerald-900 tracking-wider truncate">
              {appliedResult.code}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold leading-tight">
              {appliedResult.discountType === "PERCENT"
                ? `${appliedResult.discountValue}% off`
                : `₹${savingsINR} off`}{" "}
              · You save ₹{savingsINR}
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600 flex items-center justify-center transition-colors shrink-0"
          aria-label="Remove coupon"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ─── Input state (idle / loading / error) ───────────────────────────────────
  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex items-center pl-4 rounded-md border bg-white transition-colors overflow-hidden",
          state === "error"
            ? "border-red-300"
            : "border-slate-200 focus-within:border-slate-400",
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (state === "error") setState("idle");
          }}
          onKeyDown={handleKeyDown}
          placeholder="COUPON CODE"
          disabled={disabled || state === "loading"}
          maxLength={32}
          className="flex-1 text-sm font-black tracking-widest text-slate-900 placeholder:text-slate-300 placeholder:font-bold placeholder:tracking-widest bg-transparent outline-none disabled:opacity-50 min-w-0"
          aria-label="Coupon code"
          id="coupon-code-input"
        />
        <button
          onClick={handleApply}
          disabled={!code.trim() || state === "loading" || disabled}
          className={cn(
            "h-full shrink-0 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
            "bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed",
            "flex items-center gap-1.5",
          )}
          aria-label="Apply coupon"
        >
          {state === "loading" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Apply"
          )}
        </button>
      </div>
    </div>
  );
}
