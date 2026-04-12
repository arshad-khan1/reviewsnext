import "dotenv/config";
import { PrismaClient, PlanCategory, PlanType, BillingInterval, ReviewType, CommentStyle, SubscriptionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verify connection string
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is not defined in environment variables.");
  process.exit(1);
} else {
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^@]+)@/, ":****@");
  console.log(`📡 Connecting to database: ${maskedUrl}`);
}

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Random helpers for realistic data
 */
const randomRating = () => Math.floor(Math.random() * 5) + 1;
const pickOne = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const DEVICES = ["iPhone 15 Pro", "Samsung S24 Ultra", "Pixel 8 Pro", "iPhone 13", "iPad Air"];
const BROWSERS = ["Safari 18", "Chrome 128", "Edge 130", "Firefox 132"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata"];

async function main() {
  console.log("🌱 Starting Comprehensive Multi-Tier Seed...");

  // 1. Seed Plans
  console.log("  - Seeding subscription and top-up plans...");
  const plansData = [
    {
      name: "Starter Plan (Yearly)",
      description: "Perfect for small businesses starting their review journey.",
      type: PlanCategory.SUBSCRIPTION,
      price: 118800,
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
      price: 598800,
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
      price: 1198800,
      currency: "INR",
      billingInterval: BillingInterval.YEARLY,
      credits: 10000,
      planTier: PlanType.PRO,
      externalId: "plan_RS_pro_yearly",
    },
    {
      name: "Small Booster",
      type: PlanCategory.TOPUP,
      price: 19900,
      credits: 200,
      externalId: "topup_booster_200",
    },
    {
      name: "Growth Booster",
      type: PlanCategory.TOPUP,
      price: 44900,
      credits: 450,
      externalId: "topup_accelerator_450",
    },
    {
      name: "Power Bundle",
      type: PlanCategory.TOPUP,
      price: 89900,
      credits: 1000,
      externalId: "topup_mega_1000",
    },
  ];

  for (const plan of plansData) {
    await prisma.plan.upsert({
      where: { externalId: plan.externalId },
      update: plan,
      create: plan as any,
    });
  }

  // Define plans for quick access
  const starterPlan = (await prisma.plan.findUnique({ where: { externalId: "plan_RS_starter_yearly" } }))!;
  const growthPlan = (await prisma.plan.findUnique({ where: { externalId: "plan_RS_growth_yearly" } }))!;
  const proPlan = (await prisma.plan.findUnique({ where: { externalId: "plan_RS_pro_yearly" } }))!;

  // ── USER 1: STARTER TIER ──────────────────────────────────────
  console.log("  - Setting up Starter tier: +911111111111...");
  const starterUser = await setupUser("+911111111111", "Arjun Bakery Owner", starterPlan);
  const bakery = await setupBusiness(starterUser.id, "The Corner Bakery", "corner-bakery", "Restaurants", "Pune");
  const bakeryQR = await setupQRCode(bakery.id, "Main Counter", "main-counter", true);
  await generateRealisticActivity(bakeryQR.id, 12, 4);

  // ── USER 2: GROWTH TIER ───────────────────────────────────────
  console.log("  - Setting up Growth tier: +912222222222...");
  const growthUser = await setupUser("+912222222222", "Sneha Gym Owner", growthPlan);
  const gym = await setupBusiness(growthUser.id, "Urban Fitness Gym", "urban-fitness", "Health & Wellness", "Delhi", {
    primaryColor: "#4F46E5",
    headline: "How was your workout?",
    subheadline: "We value your fitness journey",
  });
  const receptionQR = await setupQRCode(gym.id, "Reception Desk", "reception", true);
  const lockerRoomQR = await setupQRCode(gym.id, "Locker Room Exit", "locker-room");
  await generateRealisticActivity(receptionQR.id, 45, 18);
  await generateRealisticActivity(lockerRoomQR.id, 20, 5);

  // ── USER 3: PRO TIER (Multi-Business, Multi-Location) ─────────
  console.log("  - Setting up Pro tier: +913333333333...");
  const proUser = await setupUser("+913333333333", "Vikram Hospitality Group", proPlan);
  
  // Business 1: Spice Route (Restaurant Chain)
  const spiceRoute = await setupBusiness(proUser.id, "Spice Route Dining", "spice-route", "Restaurants", "Mumbai");
  const locBandra = await setupLocation(spiceRoute.id, "Bandra Branch", "bandra", "Linking Road, Bandra West");
  const locColaba = await setupLocation(spiceRoute.id, "Colaba Outlet", "colaba", "Gateway Road, Colaba");
  
  const qrBandraTable1 = await setupQRCode(spiceRoute.id, "Table 1 (Bandra)", "bandra-t1", false, locBandra.id);
  const qrBandraCounter = await setupQRCode(spiceRoute.id, "Bandra Takeaway", "bandra-takeaway", false, locBandra.id);
  const qrColabaMain = await setupQRCode(spiceRoute.id, "Colaba Main", "colaba-main", true, locColaba.id);
  
  await generateRealisticActivity(qrBandraTable1.id, 120, 45);
  await generateRealisticActivity(qrBandraCounter.id, 80, 20);
  await generateRealisticActivity(qrColabaMain.id, 150, 65);

  // Business 2: Luxe Spa
  const luxeSpa = await setupBusiness(proUser.id, "Luxe Spa & Wellness", "luxe-spa", "Beauty & Spa", "Bangalore");
  const locBangalore = await setupLocation(luxeSpa.id, "Koramangala Hub", "koramangala", "100ft Road, Koramangala");
  const qrLuxeMain = await setupQRCode(luxeSpa.id, "Main Spa Reception", "spa-main", true, locBangalore.id);
  await generateRealisticActivity(qrLuxeMain.id, 60, 25);

  // Override threshold for testing: Reception Desk at Urban Fitness
  await prisma.qRCode.update({
    where: { id: receptionQR.id },
    data: { 
      acceptedStarsThreshold: 5,
      useDefaultConfig: false // Explicitly disable inheritance for this override
    }
  });

  console.log("✅ Comprehensive Seeding Complete.");
}

async function setupUser(phone: string, name: string, plan: any) {
  const user = await prisma.user.upsert({
    where: { phone },
    update: { name },
    create: { phone, name, isVerified: true },
  });

  await prisma.userSubscription.upsert({
    where: { userId: user.id },
    update: {
      plan: plan.planTier,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      monthlyAiCredits: plan.credits,
    },
    create: {
      userId: user.id,
      plan: plan.planTier,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      monthlyAiCredits: plan.credits,
    },
  });

  await prisma.aiCredits.upsert({
    where: { userId: user.id },
    update: { monthlyAllocation: plan.credits },
    create: {
      userId: user.id,
      monthlyAllocation: plan.credits,
    },
  });

  return user;
}

async function setupBusiness(ownerId: string, name: string, slug: string, industry: string, city: string, brandingConfig?: any) {
  return await prisma.business.upsert({
    where: { slug },
    update: { name, industry, city, brandingConfig },
    create: {
      name,
      slug,
      industry,
      city,
      ownerId,
      brandingConfig,
      defaultGoogleMapsLink: `https://maps.google.com/?q=${encodeURIComponent(name)}+${city}`,
      defaultAiPrompt: "Be professional and emphasize our commitment to quality.",
    },
  });
}

async function setupLocation(businessId: string, name: string, slug: string, address: string) {
  return await prisma.location.upsert({
    where: { businessId_slug: { businessId, slug } },
    update: { name, address },
    create: { businessId, name, slug, address },
  });
}

async function setupQRCode(
  businessId: string, 
  name: string, 
  sourceTag: string, 
  isDefault: boolean = false, 
  locationId?: string, 
  acceptedStarsThreshold?: number,
  useDefaultConfig: boolean = true
) {
  return await prisma.qRCode.upsert({
    where: { businessId_sourceTag: { businessId, sourceTag } },
    update: { name, isDefault, locationId, acceptedStarsThreshold, useDefaultConfig },
    create: { businessId, name, sourceTag, isDefault, locationId, acceptedStarsThreshold, useDefaultConfig },
  });
}

/**
 * Generates N scans and R reviews spread over the last 30 days
 */
async function generateRealisticActivity(qrCodeId: string, scanCount: number, reviewCount: number) {
  const scans = [];
  const now = new Date();
  
  // 1. Generate Scans
  for (let i = 0; i < scanCount; i++) {
    const scannedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    scans.push({
      qrCodeId,
      scannedAt,
      device: pickOne(DEVICES),
      browser: pickOne(BROWSERS),
      os: pickOne(["iOS", "Android", "macOS", "Windows"]),
      city: pickOne(CITIES),
      country: "India",
      resultedInReview: false, // Default
    });
  }

  // Create scans in chunks
  await prisma.scan.createMany({ data: scans });
  
  // Fetch some of the creates scans to link reviews
  const createdScans = await prisma.scan.findMany({
    where: { qrCodeId },
    take: reviewCount,
    orderBy: { scannedAt: "desc" }
  });

  // 2. Generate Reviews
  for (let i = 0; i < createdScans.length; i++) {
    const scan = createdScans[i];
    const rating = randomRating();
    const type = rating >= 4 ? ReviewType.POSITIVE : ReviewType.NEGATIVE;

    await prisma.review.create({
      data: {
        qrCodeId,
        scanId: scan.id,
        rating,
        type,
        submittedAt: scan.scannedAt,
        reviewText: type === ReviewType.POSITIVE ? "Amazing experience! Highly recommended." : null,
        submittedToGoogle: type === ReviewType.POSITIVE && Math.random() > 0.4,
        whatWentWrong: type === ReviewType.NEGATIVE ? "The service was a bit slow today." : null,
        howToImprove: type === ReviewType.NEGATIVE ? "Better staffing during peak hours." : null,
      }
    });

    // Mark scan as resulted in review
    await prisma.scan.update({
      where: { id: scan.id },
      data: { resultedInReview: true }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
