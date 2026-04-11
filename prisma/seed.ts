/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PlanType,
  SubscriptionStatus,
  BillingInterval,
  PaymentStatus,
  CommentStyle,
  ReviewType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.location.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.aiUsageLog.deleteMany();
  await prisma.aiCredits.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.business.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding new data...");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      phone: "+919999999999",
      name: "System Admin",
      email: "admin@reviewfunnel.com",
      isVerified: true,
      isAdmin: true,
      password: adminPassword,
    },
  });
  console.log(`Created Admin: ${adminUser.phone} / admin123`);

  // 2. Create STARTER Business Owner
  const starterOwner = await prisma.user.create({
    data: {
      phone: "+918888888881",
      name: "Starter Owner",
      email: "starter@example.com",
      isVerified: true,
      isAdmin: false,
    },
  });

  const starterBusiness = await prisma.business.create({
    data: {
      slug: "starter-cafe",
      name: "Starter Cafe",
      industry: "Restaurant",
      city: "Delhi",
      ownerId: starterOwner.id,
      subscription: {
        create: {
          plan: PlanType.STARTER,
          status: SubscriptionStatus.ACTIVE,
          billingInterval: BillingInterval.MONTHLY,
        },
      },
      aiCredits: {
        create: {
          monthlyAllocation: 50,
          monthlyUsed: 10,
        },
      },
      qrCodes: {
        create: [
          {
            name: "Table 1",
            sourceTag: "table-1",
          },
        ],
      },
    },
  });
  console.log(`Created STARTER Owner & Business: ${starterBusiness.name}`);

  // 3. Create GROWTH Business Owner
  const growthOwner = await prisma.user.create({
    data: {
      phone: "+918888888882",
      name: "Growth Owner",
      email: "growth@example.com",
      isVerified: true,
      isAdmin: false,
    },
  });

  const growthBusiness = await prisma.business.create({
    data: {
      slug: "growth-salon",
      name: "Growth Salon",
      industry: "Beauty & Spa",
      city: "Mumbai",
      ownerId: growthOwner.id,
      brandingConfig: {
        primaryColor: "#ec4899", // pink-500
        backgroundColor: "#fdf2f8", // pink-50
        headline: "Rate your salon experience",
        subheadline: "We would love your feedback",
        buttonStyle: "pill",
        fontFamily: "Inter",
      },
      subscription: {
        create: {
          plan: PlanType.GROWTH,
          status: SubscriptionStatus.ACTIVE,
          billingInterval: BillingInterval.YEARLY,
          monthlyAiCredits: 500,
        },
      },
      aiCredits: {
        create: {
          monthlyAllocation: 500,
          monthlyUsed: 40,
        },
      },
      qrCodes: {
        create: [
          {
            name: "Reception",
            sourceTag: "reception",
          },
          {
            name: "Station 1",
            sourceTag: "station-1",
          },
        ],
      },
    },
  });
  console.log(`Created GROWTH Owner & Business: ${growthBusiness.name}`);

  // 4. Create PRO Business Owner (2 Businesses, Locations)
  const proOwner = await prisma.user.create({
    data: {
      phone: "+918888888883",
      name: "Pro Owner",
      email: "pro@example.com",
      isVerified: true,
      isAdmin: false,
    },
  });

  // Pro Business 1 (with Locations)
  const proBusiness1 = await prisma.business.create({
    data: {
      slug: "pro-fitness",
      name: "Pro Fitness Club",
      industry: "Health & Fitness",
      city: "Bangalore",
      ownerId: proOwner.id,
      brandingConfig: {
        primaryColor: "#3b82f6", // blue-500
        backgroundColor: "#ffffff",
        headline: "How was your workout?",
        subheadline: "Help us improve",
        buttonStyle: "rounded",
        fontFamily: "Roboto",
      },
      subscription: {
        create: {
          plan: PlanType.PRO,
          status: SubscriptionStatus.ACTIVE,
          billingInterval: BillingInterval.YEARLY,
          monthlyAiCredits: 2000,
        },
      },
      aiCredits: {
        create: {
          monthlyAllocation: 2000,
          monthlyUsed: 150,
          topupAllocation: 500,
          topupUsed: 0,
        },
      },
      locations: {
        create: [
          {
            name: "Indiranagar Branch",
            city: "Bangalore",
            address: "123 100ft Road",
          },
          {
            name: "Koramangala Branch",
            city: "Bangalore",
            address: "456 80ft Road",
          },
        ],
      },
    },
    include: {
      locations: true,
    },
  });

  // Assign QR codes to Pro Business 1 Locations
  const indiranagarLoc = proBusiness1.locations.find((l) =>
    l.name.includes("Indiranagar"),
  );
  const koramangalaLoc = proBusiness1.locations.find((l) =>
    l.name.includes("Koramangala"),
  );

  const pro1Qr1 = await prisma.qRCode.create({
    data: {
      name: "Weights Area",
      sourceTag: "weights-in",
      businessId: proBusiness1.id,
      locationId: indiranagarLoc?.id,
    },
  });

  const pro1Qr2 = await prisma.qRCode.create({
    data: {
      name: "Cardio Area",
      sourceTag: "cardio-ko",
      businessId: proBusiness1.id,
      locationId: koramangalaLoc?.id,
      brandingOverride: {
        primaryColor: "#10b981", // green for cardio
      },
    },
  });

  // Pro Business 2 (Simple)
  const proBusiness2 = await prisma.business.create({
    data: {
      slug: "pro-cafe",
      name: "Pro Cafe Luxe",
      industry: "Restaurant",
      city: "Pune",
      ownerId: proOwner.id,
      subscription: {
        create: {
          plan: PlanType.PRO,
          status: SubscriptionStatus.ACTIVE,
        },
      },
      aiCredits: {
        create: {
          monthlyAllocation: 2000,
          monthlyUsed: 0,
        },
      },
      qrCodes: {
        create: [{ name: "Main Entrance", sourceTag: "entrance" }],
      },
    },
  });

  console.log(
    `Created PRO Owner & Businesses: ${proBusiness1.name}, ${proBusiness2.name}`,
  );

  // 5. Add some Reviews and Scans
  console.log("Seeding dummy scans and reviews...");

  // Growth Salon - Positive Review
  const qrGrowth = await prisma.qRCode.findFirst({
    where: { businessId: growthBusiness.id },
  });
  if (qrGrowth) {
    const scan1 = await prisma.scan.create({
      data: {
        qrCodeId: qrGrowth.id,
        device: "iPhone 15 Pro",
        browser: "Safari",
        os: "iOS",
        resultedInReview: true,
        scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    });

    await prisma.review.create({
      data: {
        scanId: scan1.id,
        qrCodeId: qrGrowth.id,
        type: ReviewType.POSITIVE,
        rating: 5,
        reviewText:
          "Amazing service! Loved the new haircut, the stylist was very professional.",
        submittedToGoogle: true,
        submittedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
    });
  }

  // Pro Fitness - Negative Review
  if (pro1Qr1) {
    const scan2 = await prisma.scan.create({
      data: {
        qrCodeId: pro1Qr1.id,
        device: "Pixel 8",
        browser: "Chrome",
        os: "Android",
        resultedInReview: true,
        scannedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    });

    await prisma.review.create({
      data: {
        scanId: scan2.id,
        qrCodeId: pro1Qr1.id,
        type: ReviewType.NEGATIVE,
        rating: 2,
        whatWentWrong: "Treadmills were mostly broken or occupied.",
        howToImprove: "Please fix the cardio machines faster.",
        submittedAt: new Date(Date.now() - 47 * 60 * 60 * 1000),
      },
    });

    // Scan without review
    await prisma.scan.create({
      data: {
        qrCodeId: pro1Qr1.id,
        resultedInReview: false,
        scannedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
