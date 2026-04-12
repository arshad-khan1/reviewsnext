import { prisma } from "../prisma";
import { PlanType } from "@prisma/client";

const DEFAULT_BRANDING = {
  primaryColor: "#4F46E5",
  backgroundColor: "#FFFFFF",
  bannerUrl: null,
  headline: "How was your experience?",
  subheadline: "Your feedback helps businesses improve.",
  thankYouMessage: "Thank you! Your feedback has been submitted.",
  buttonStyle: "rounded",
  fontFamily: "Inter"
};

/**
 * Returns current branding config for a business.
 */
export async function getBranding(businessSlug: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
    include: { 
      owner: {
        include: { activeSubscription: true }
      }
    },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const plan = business.owner.activeSubscription?.plan || PlanType.STARTER;
  const config = business.brandingConfig as any;

  return {
    plan,
    brandingConfig: config || (plan === PlanType.STARTER ? null : DEFAULT_BRANDING),
    showWatermark: !config || plan === PlanType.STARTER,
  };
}

/**
 * Updates business-level branding.
 */
export async function updateBranding(businessSlug: string, config: any) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: { brandingConfig: config },
  });

  return {
    brandingConfig: updated.brandingConfig,
    showWatermark: false,
  };
}

/**
 * Resets business branding to defaults (removes config).
 */
export async function resetBranding(businessSlug: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  await prisma.business.update({
    where: { id: business.id },
    data: { brandingConfig: null },
  });

  return { showWatermark: true };
}

/**
 * Returns QR-specific branding override and effective config.
 */
export async function getQrBranding(businessSlug: string, qrId: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const qr = await prisma.qRCode.findFirst({
    where: { id: qrId, businessId: business.id, isDeleted: false },
  });

  if (!qr) throw new Error("QR_NOT_FOUND");

  const bizConfig = (business.brandingConfig as any) || DEFAULT_BRANDING;
  const qrOverride = (qr.brandingOverride as any) || {};

  const effectiveConfig = {
    ...bizConfig,
    ...qrOverride,
  };

  return {
    qrCodeId: qr.id,
    qrCodeName: qr.name,
    brandingOverride: qr.brandingOverride,
    effectiveConfig,
  };
}

/**
 * Updates QR-level branding override.
 */
export async function updateQrBranding(businessSlug: string, qrId: string, config: any) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const qr = await prisma.qRCode.findFirst({
    where: { id: qrId, businessId: business.id, isDeleted: false },
  });

  if (!qr) throw new Error("QR_NOT_FOUND");

  const updatedQr = await prisma.qRCode.update({
    where: { id: qrId },
    data: { brandingOverride: config },
  });

  const bizConfig = (business.brandingConfig as any) || DEFAULT_BRANDING;
  const effectiveConfig = {
    ...bizConfig,
    ...(updatedQr.brandingOverride as any),
  };

  return {
    brandingOverride: updatedQr.brandingOverride,
    effectiveConfig,
  };
}

/**
 * Resets QR branding override.
 */
export async function resetQrBranding(businessSlug: string, qrId: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const qr = await prisma.qRCode.findFirst({
    where: { id: qrId, businessId: business.id, isDeleted: false },
  });

  if (!qr) throw new Error("QR_NOT_FOUND");

  await prisma.qRCode.update({
    where: { id: qrId },
    data: { brandingOverride: null },
  });

  return { message: "QR code branding override removed. Business branding will apply." };
}

/**
 * Internal utility for merging configs (used in public scan response).
 */
export function mergeBranding(bizConfig: any, qrOverride: any): { effective: any; showWatermark: boolean } {
  if (!bizConfig && !qrOverride) {
    return { effective: DEFAULT_BRANDING, showWatermark: true };
  }

  const effective = {
    ...DEFAULT_BRANDING,
    ...(bizConfig || {}),
    ...(qrOverride || {}),
  };

  return {
    effective,
    showWatermark: !bizConfig,
  };
}
