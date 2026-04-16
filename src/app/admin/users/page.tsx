import type { Metadata } from "next";
import UsersClient from "./users-client";

export const metadata: Metadata = {
  title: "User Management | Admin Portal",
  description: "Manage platform users, subscriptions, and security settings.",
};

export default function UsersPage() {
  return <UsersClient />;
}
