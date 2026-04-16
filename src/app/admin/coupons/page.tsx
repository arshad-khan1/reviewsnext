import type { Metadata } from "next";
import CouponsClient from "./coupons-client";

export const metadata: Metadata = {
  title: "Coupon Management | Admin Portal",
  description: "Create and manage promotional coupons and discounts.",
};

export default function CouponsPage() {
  return <CouponsClient />;
}
