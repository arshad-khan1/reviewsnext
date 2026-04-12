import { PrismaClient, PlanCategory, PlanType, BillingInterval } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding plans...");

  const plansData = [
    // ── Subscriptions (Yearly Only) ──────────────────────────
    {
      name: "Starter Plan (Yearly)",
      description: "Perfect for small businesses starting their review journey.",
      type: PlanCategory.SUBSCRIPTION,
      price: 118800, // ₹1,188/yr (₹99/mo)
      currency: "INR",
      billingInterval: BillingInterval.YEARLY,
      credits: 100,
      planTier: PlanType.STARTER,
      externalId: "plan_RS_starter_yearly",
    },
    {
      name: "Growth Plan (Yearly)",
      description: "Scale your business with advanced tools and more credits.",
      type: PlanCategory.SUBSCRIPTION,
      price: 598800, // ₹5,988/yr (₹499/mo)
      currency: "INR",
      billingInterval: BillingInterval.YEARLY,
      credits: 800,
      planTier: PlanType.GROWTH,
      externalId: "plan_RS_growth_yearly",
    },
    {
      name: "Pro Plan (Yearly)",
      description: "Ultimate control for established businesses with multi-location support.",
      type: PlanCategory.SUBSCRIPTION,
      price: 1198800, // ₹11,988/yr (₹999/mo)
      currency: "INR",
      billingInterval: BillingInterval.YEARLY,
      credits: 10000,
      planTier: PlanType.PRO,
      externalId: "plan_RS_pro_yearly",
    },

    // ── Top-up Packages ──────────────────────────────────────
    {
      name: "Small Booster",
      description: "Add 200 AI credits to your account.",
      type: PlanCategory.TOPUP,
      price: 19900, // ₹199
      currency: "INR",
      billingInterval: null,
      credits: 200,
      planTier: null,
      externalId: "topup_booster_200",
      metadata: { packageId: "BOOSTER" },
    },
    {
      name: "Growth Booster",
      description: "Add 450 AI credits to your account.",
      type: PlanCategory.TOPUP,
      price: 44900, // ₹449
      currency: "INR",
      billingInterval: null,
      credits: 450,
      planTier: null,
      externalId: "topup_accelerator_450",
      metadata: { packageId: "ACCELERATOR" },
    },
    {
      name: "Power Bundle",
      description: "Add 1000 AI credits to your account.",
      type: PlanCategory.TOPUP,
      price: 89900, // ₹899
      currency: "INR",
      billingInterval: null,
      credits: 1000,
      planTier: null,
      externalId: "topup_mega_1000",
      metadata: { packageId: "MEGA" },
    },
  ];

  for (const plan of plansData) {
    await prisma.plan.upsert({
      where: { externalId: plan.externalId },
      update: plan,
      create: plan,
    });
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
