/**
 * Manually mirrored Prisma enums to avoid importing @prisma/client in client components.
 * This prevents Turbopack/Webpack from trying to bundle the Prisma browser client.
 */

export enum PlanType {
  FREE = "FREE",
  STARTER = "STARTER",
  GROWTH = "GROWTH",
  PRO = "PRO",
}

export enum ReviewType {
  POSITIVE = "POSITIVE",
  NEGATIVE = "NEGATIVE",
}

export enum CommentStyle {
  PROFESSIONAL_POLITE = "PROFESSIONAL_POLITE",
  FRIENDLY_CASUAL = "FRIENDLY_CASUAL",
  CONCISE_DIRECT = "CONCISE_DIRECT",
  ENTHUSIASTIC_WARM = "ENTHUSIASTIC_WARM",
  WITTY_FUN = "WITTY_FUN",
  HINGLISH = "HINGLISH",
}

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
}

export enum BillingInterval {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum BusinessStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
}
