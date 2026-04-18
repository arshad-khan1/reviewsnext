import type { Metadata } from "next";
import AdminLoginClient from "./admin-login-client";

export const metadata: Metadata = {
  title: "Admin Login | ReviewFunnel",
  description: "Secure gateway for ReviewFunnel administrators.",
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
