import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { formatDate } from "../utils/format";

/**
 * Checks if a user is the owner of a business by slug
 */
export async function isBusinessOwner(userId: string, businessSlug: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
    select: { ownerId: true },
  });

  return business?.ownerId === userId;
}

/**
 * Finds a business by its slug
 */
export async function findBusinessBySlug(slug: string) {
  return await prisma.business.findFirst({
    where: { slug, isDeleted: false },
    include: {
      owner: {
        include: { 
          activeSubscription: true,
          aiCredits: true 
        },
      },
    },
  });
}

function generateBaseSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Creates a unique slug for a business
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = generateBaseSlug(name);
  let slug = baseSlug || "business";
  let count = 1;

  while (true) {
    const existing = await prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
    count++;
    if (count > 10) throw new Error("Could not generate a unique slug");
  }
}

/**
 * Get businesses owned by user (with pagination and search)
 */
export async function getBusinessesByUser(
  userId: string,
  page: number = 1,
  limit: number = 20,
  search?: string,
) {
  const skip = (page - 1) * limit;

  const where: Prisma.BusinessWhereInput = {
    ownerId: userId,
    isDeleted: false,
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          include: { aiCredits: true }
        },
        // _count: { select: { reviews: true, scans: true } } // Wait, relation is not direct from business to reviews/scans. They are on QRCode.
        // Need totalReviews, totalScans according to requirements
        qrCodes: {
          select: {
            _count: {
              select: {
                scans: true,
                reviews: true,
              },
            },
          },
        },
      },
    }),
    prisma.business.count({ where }),
  ]);

  return { 
    businesses: businesses.map(b => ({
      ...b,
      formattedAt: formatDate(b.createdAt),
      // For lastActive, we could use the updatedAt or the latest scan date
      formattedUpdatedAt: formatDate(b.updatedAt),
    })), 
    total 
  };
}

export type CreateBusinessInput = {
  name: string;
  slug?: string;
  industry: string;
  location: string;
  logoUrl?: string;
  description?: string;
  contactEmail?: string;
  acceptedStarsThreshold?: number;
  defaultGoogleMapsLink: string;
  defaultAiPrompt: string;
  defaultCommentStyle?:
    | "PROFESSIONAL_POLITE"
    | "FRIENDLY_CASUAL"
    | "CONCISE_DIRECT"
    | "ENTHUSIASTIC_WARM";
};

/**
 * Creates a new business
 */
export async function createBusiness(
  userId: string,
  data: CreateBusinessInput,
) {
  const slug = data.slug || (await generateUniqueSlug(data.name));

  return await prisma.business.create({
    data: {
      name: data.name,
      slug,
      industry: data.industry,
      city: data.location, // Mapping "location" to "city" field based on schema
      logoUrl: data.logoUrl,
      description: data.description,
      contactEmail: data.contactEmail,
      acceptedStarsThreshold: data.acceptedStarsThreshold,
      defaultGoogleMapsLink: data.defaultGoogleMapsLink,
      defaultAiPrompt: data.defaultAiPrompt,
      ...(data.defaultCommentStyle && {
        defaultCommentStyle: data.defaultCommentStyle,
      }),
      ownerId: userId,
      status: "DRAFT", // New businesses are drafts until configured further
      qrCodes: {
        create: {
          name: data.location,
          sourceTag: "default",
          isDefault: true,
          // We can pre-fill it with the business's default links, though they are also business-level defaults.
          googleMapsLink: data.defaultGoogleMapsLink,
          aiGuidingPrompt: data.defaultAiPrompt,
          commentStyle: data.defaultCommentStyle,
          acceptedStarsThreshold: data.acceptedStarsThreshold,
        },
      },
    },
  });
}

export type UpdateBusinessInput = Partial<CreateBusinessInput>;

/**
 * Updates an existing business
 */
export async function updateBusiness(slug: string, data: UpdateBusinessInput) {
  return await prisma.business.update({
    where: { slug },
    data: {
      name: data.name,
      industry: data.industry,
      city: data.location,
      logoUrl: data.logoUrl,
      description: data.description,
      contactEmail: data.contactEmail,
      acceptedStarsThreshold: data.acceptedStarsThreshold,
      defaultGoogleMapsLink: data.defaultGoogleMapsLink,
      defaultAiPrompt: data.defaultAiPrompt,
      ...(data.defaultCommentStyle && {
        defaultCommentStyle: data.defaultCommentStyle,
      }),
    },
  });
}

/**
 * Deletes a business
 */
export async function deleteBusiness(slug: string) {
  return await prisma.business.update({
    where: { slug },
    data: { isDeleted: true },
  });
}
