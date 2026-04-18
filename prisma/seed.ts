import "dotenv/config";
import {
  PrismaClient,
  PlanCategory,
  PlanType,
  BillingInterval,
  ReviewType,
  SubscriptionStatus,
  PaymentStatus,
  PaymentType,
  PaymentIntent,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verify connection string
if (!process.env.DATABASE_URL) {
  console.error(
    "❌ ERROR: DATABASE_URL is not defined in environment variables.",
  );
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

const DEVICES = [
  "iPhone 15 Pro",
  "Samsung S24 Ultra",
  "Pixel 8 Pro",
  "iPhone 13",
  "iPad Air",
];
const BROWSERS = ["Safari 18", "Chrome 128", "Edge 130", "Firefox 132"];
const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
];

async function main() {
  console.log("🌱 Starting Comprehensive Multi-Tier Seed...");

  // 1. Seed Plans
  console.log("  - Seeding subscription and top-up plans...");
  const plansData = [
    // ── Free / Trial Tier ──────────────────────────────────
    {
      name: "Free Trial",
      description:
        "Get started with basic review collection and 100 AI credits.",
      type: PlanCategory.SUBSCRIPTION,
      price: 0,
      currency: "INR",
      billingInterval: BillingInterval.MONTHLY,
      credits: 10,
      planTier: PlanType.FREE,
      externalId: "plan_RS_free_trial",
    },
    // ── Subscriptions (Yearly Only) ──────────────────────────
    {
      name: "Starter Plan (Yearly)",
      description:
        "Perfect for small businesses starting their review journey.",
      type: PlanCategory.SUBSCRIPTION,
      price: 249900, // ₹2,499/yr
      currency: "INR",
      billingInterval: BillingInterval.YEARLY,
      credits: 300,
      planTier: PlanType.STARTER,
      externalId: "plan_RS_starter_yearly",
    },
    {
      name: "Growth Plan (Yearly)",
      description:
        "Scale your business with advanced AI tools and more QR codes.",
      type: PlanCategory.SUBSCRIPTION,
      price: 499900, // ₹4,999/yr
      currency: "INR",
      billingInterval: BillingInterval.YEARLY,
      credits: 1000,
      planTier: PlanType.GROWTH,
      externalId: "plan_RS_growth_yearly",
    },
    {
      name: "Pro Plan (Yearly)",
      description:
        "Ultimate control for established businesses with multi-location support.",
      type: PlanCategory.SUBSCRIPTION,
      price: 999900, // ₹9,999/yr
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
      create: plan as any,
    });
  }

  // Define plans for quick access
  const freePlan = (await prisma.plan.findUnique({
    where: { externalId: "plan_RS_free_trial" },
  }))!;
  const starterPlan = (await prisma.plan.findUnique({
    where: { externalId: "plan_RS_starter_yearly" },
  }))!;
  const growthPlan = (await prisma.plan.findUnique({
    where: { externalId: "plan_RS_growth_yearly" },
  }))!;
  const proPlan = (await prisma.plan.findUnique({
    where: { externalId: "plan_RS_pro_yearly" },
  }))!;

  // ── USER 0: FREE TRIAL TIER ──────────────────────────────────
  console.log("  - Setting up Free Trial tier: +910000000000...");
  const trialUser = await setupUser(
    "+910000000000",
    "New Trial User",
    freePlan,
    SubscriptionStatus.TRIALING,
  );
  const trialCafe = await setupBusiness(
    trialUser.id,
    "Sunnyside Cafe",
    "sunnyside-cafe",
    "Cafe",
    "Mumbai",
  );
  const cafeQR = await setupQRCode(trialCafe.id, "Entrance", "entrance", true);
  await generateRealisticActivity(cafeQR.id, 8, 2);

  // ── USER 1: STARTER TIER ──────────────────────────────────────
  console.log("  - Setting up Starter tier: +911111111111...");
  const starterUser = await setupUser(
    "+911111111111",
    "Arjun Bakery Owner",
    starterPlan,
  );
  const bakery = await setupBusiness(
    starterUser.id,
    "The Corner Bakery",
    "corner-bakery",
    "Restaurants",
    "Pune",
  );
  const bakeryQR = await setupQRCode(
    bakery.id,
    "Main Counter",
    "main-counter",
    true,
  );
  await generateRealisticActivity(bakeryQR.id, 12, 4);

  // ── USER 2: GROWTH TIER ───────────────────────────────────────
  console.log("  - Setting up Growth tier: +912222222222...");
  const growthUser = await setupUser(
    "+912222222222",
    "Sneha Gym Owner",
    growthPlan,
  );
  const gym = await setupBusiness(
    growthUser.id,
    "Urban Fitness Gym",
    "urban-fitness",
    "Health & Wellness",
    "Delhi",
    {
      primaryColor: "#4F46E5",
      headline: "How was your workout?",
      subheadline: "We value your fitness journey",
    },
  );
  const receptionQR = await setupQRCode(
    gym.id,
    "Reception Desk",
    "reception",
    true,
  );
  const lockerRoomQR = await setupQRCode(
    gym.id,
    "Locker Room Exit",
    "locker-room",
  );
  await generateRealisticActivity(receptionQR.id, 45, 18);
  await generateRealisticActivity(lockerRoomQR.id, 20, 5);

  // ── USER 3: PRO TIER (Multi-Business, Multi-Location) ─────────
  console.log("  - Setting up Pro tier: +913333333333...");
  const proUser = await setupUser(
    "+913333333333",
    "Vikram Hospitality Group",
    proPlan,
  );

  // Business 1: Spice Route (Restaurant Chain)
  const spiceRoute = await setupBusiness(
    proUser.id,
    "Spice Route Dining",
    "spice-route",
    "Restaurants",
    "Mumbai",
  );
  const locBandra = await setupLocation(
    spiceRoute.id,
    "Bandra Branch",
    "bandra",
    "Linking Road, Bandra West",
  );
  const locColaba = await setupLocation(
    spiceRoute.id,
    "Colaba Outlet",
    "colaba",
    "Gateway Road, Colaba",
  );

  const qrBandraTable1 = await setupQRCode(
    spiceRoute.id,
    "Table 1 (Bandra)",
    "bandra-t1",
    false,
    locBandra.id,
  );
  const qrBandraCounter = await setupQRCode(
    spiceRoute.id,
    "Bandra Takeaway",
    "bandra-takeaway",
    false,
    locBandra.id,
  );
  const qrColabaMain = await setupQRCode(
    spiceRoute.id,
    "Colaba Main",
    "colaba-main",
    true,
    locColaba.id,
  );

  await generateRealisticActivity(qrBandraTable1.id, 120, 45);
  await generateRealisticActivity(qrBandraCounter.id, 80, 20);
  await generateRealisticActivity(qrColabaMain.id, 150, 65);

  // Business 2: Luxe Spa
  const luxeSpa = await setupBusiness(
    proUser.id,
    "Luxe Spa & Wellness",
    "luxe-spa",
    "Beauty & Spa",
    "Bangalore",
  );
  const locBangalore = await setupLocation(
    luxeSpa.id,
    "Koramangala Hub",
    "koramangala",
    "100ft Road, Koramangala",
  );
  const qrLuxeMain = await setupQRCode(
    luxeSpa.id,
    "Main Spa Reception",
    "spa-main",
    true,
    locBangalore.id,
  );
  await generateRealisticActivity(qrLuxeMain.id, 60, 25);

  // Override threshold for testing: Reception Desk at Urban Fitness
  await prisma.qRCode.update({
    where: { id: receptionQR.id },
    data: {
      acceptedStarsThreshold: 5,
      useDefaultConfig: false, // Explicitly disable inheritance for this override
    },
  });

  // 4. Seed sample Payment History (New!)
  console.log("  - Seeding historical payments and abandoned checkouts...");
  const vikram = await prisma.user.findUnique({ where: { phone: "+913333333333" } });
  if (vikram) {
    const biz = (await prisma.business.findFirst({ where: { ownerId: vikram.id } }))!;
    
    // Successful subscription
    await prisma.payment.create({
      data: {
        businessId: biz.id,
        planId: proPlan.id,
        amountInPaise: proPlan.price,
        currency: "INR",
        status: PaymentStatus.SUCCESS,
        type: PaymentType.SUBSCRIPTION,
        intent: PaymentIntent.SUBSCRIBE,
        packageId: "PRO",
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      }
    });

    // Successful top-up
    const booster = (await prisma.plan.findFirst({ where: { externalId: "topup_booster_200" } }))!;
    await prisma.payment.create({
      data: {
        businessId: biz.id,
        planId: booster.id,
        amountInPaise: booster.price,
        currency: "INR",
        status: PaymentStatus.SUCCESS,
        type: PaymentType.TOPUP,
        intent: PaymentIntent.TOPUP,
        packageId: "BOOSTER",
        creditsAdded: 200,
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      }
    });

    // Abandoned checkout (NEW feature test)
    await prisma.payment.create({
      data: {
        businessId: biz.id,
        planId: growthPlan.id,
        amountInPaise: growthPlan.price,
        currency: "INR",
        status: PaymentStatus.CANCELLED,
        type: PaymentType.SUBSCRIPTION,
        intent: PaymentIntent.UPGRADE,
        packageId: "GROWTH",
      }
    });
  }

  console.log("✅ Comprehensive Seeding Complete.");
}

async function setupUser(
  phone: string,
  name: string,
  plan: any,
  status: SubscriptionStatus = SubscriptionStatus.ACTIVE,
) {
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
      status: status,
      monthlyAiCredits: plan.credits,
    },
    create: {
      userId: user.id,
      plan: plan.planTier,
      planId: plan.id,
      status: status,
      monthlyAiCredits: plan.credits,
    },
  });

  await prisma.aiCredits.upsert({
    where: { userId: user.id },
    update: {
      monthlyAllocation: plan.planTier === "FREE" ? 0 : plan.credits,
      topupAllocation: plan.planTier === "FREE" ? plan.credits : undefined,
    },
    create: {
      userId: user.id,
      monthlyAllocation: plan.planTier === "FREE" ? 0 : plan.credits,
      topupAllocation: plan.planTier === "FREE" ? plan.credits : 0,
    },
  });

  return user;
}

async function setupBusiness(
  ownerId: string,
  name: string,
  slug: string,
  industry: string,
  city: string,
  brandingConfig?: any,
) {
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
      defaultAiPrompt:
        "Be professional and emphasize our commitment to quality.",
    },
  });
}

async function setupLocation(
  businessId: string,
  name: string,
  slug: string,
  address: string,
) {
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
  useDefaultConfig: boolean = true,
) {
  return await prisma.qRCode.upsert({
    where: { businessId_sourceTag: { businessId, sourceTag } },
    update: {
      name,
      isDefault,
      locationId,
      acceptedStarsThreshold,
      useDefaultConfig,
    },
    create: {
      businessId,
      name,
      sourceTag,
      isDefault,
      locationId,
      acceptedStarsThreshold,
      useDefaultConfig,
    },
  });
}

/**
 * Generates N scans and R reviews spread over the last 30 days
 */
async function generateRealisticActivity(
  qrCodeId: string,
  scanCount: number,
  reviewCount: number,
) {
  const scans = [];
  const now = new Date();

  // 1. Generate Scans
  for (let i = 0; i < scanCount; i++) {
    const scannedAt = new Date(
      now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    );
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
    orderBy: { scannedAt: "desc" },
  });

  // 2. Generate Reviews
  for (let i = 0; i < createdScans.length; i++) {
    const scan = createdScans[i];
    const rating = randomRating();
    const type = rating >= 4 ? ReviewType.POSITIVE : ReviewType.NEGATIVE;

    await prisma.review.upsert({
      where: { scanId: scan.id },
      update: {},
      create: {
        qrCodeId,
        scanId: scan.id,
        rating,
        type,
        submittedAt: scan.scannedAt,
        reviewText:
          type === ReviewType.POSITIVE
            ? "Amazing experience! Highly recommended."
            : null,
        submittedToGoogle: type === ReviewType.POSITIVE && Math.random() > 0.4,
        whatWentWrong:
          type === ReviewType.NEGATIVE
            ? "The service was a bit slow today."
            : null,
        howToImprove:
          type === ReviewType.NEGATIVE
            ? "Better staffing during peak hours."
            : null,
      },
    });

    // Mark scan as resulted in review
    await prisma.scan.update({
      where: { id: scan.id },
      data: { resultedInReview: true },
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
