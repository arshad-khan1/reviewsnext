import type { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Login | ReviewFunnel Business Portal",
  description: "Access your ReviewFunnel dashboard. Manage your business reputation, respond to reviews, and track your growth.",
};

export default function LoginPage() {
  return <LoginClient />;
}
