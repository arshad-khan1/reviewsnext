import type { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "Contact Us | ReviewFunnel",
  description:
    "Get in touch with the ReviewFunnel team for support, sales inquiries, or partnership opportunities. We're here to help your business grow.",
};

export default function ContactPage() {
  return <ContactClient />;
}
