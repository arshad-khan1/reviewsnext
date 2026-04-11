import { prisma } from "../prisma";

/**
 * Finds a user by their phone number
 */
export async function findUserByPhone(phone: string) {
  return await prisma.user.findFirst({
    where: { phone, isDeleted: false },
    include: {
      businesses: {
        where: { isDeleted: false },
        select: { id: true, slug: true, name: true },
      },
    },
  });
}

/**
 * Finds a user by their email address
 */
export async function findUserByEmail(email: string) {
  return await prisma.user.findFirst({
    where: { email, isDeleted: false },
    include: {
      businesses: {
        where: { isDeleted: false },
        select: { id: true, slug: true, name: true },
      },
    },
  });
}

/**
 * Finds a user by ID
 */
export async function findUserById(id: string) {
  return await prisma.user.findFirst({
    where: { id, isDeleted: false },
    include: {
      businesses: {
        where: { isDeleted: false },
        select: { id: true, slug: true, name: true },
      },
    },
  });
}

/**
 * Creates or retrieves a user by phone (signup/login are same flow)
 */
export async function upsertUser(phone: string) {
  return await prisma.user.upsert({
    where: { phone },
    update: { isDeleted: false }, // Reactivate if they were soft deleted
    create: {
      phone,
      isVerified: true, // Mark as verified since they passed OTP
    },
    include: {
      businesses: {
        where: { isDeleted: false },
        select: { id: true, slug: true, name: true },
      },
    },
  });
}

/**
 * Updates user profile details
 */
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  }
) {
  return await prisma.user.update({
    where: { id: userId },
    data,
    include: {
      businesses: {
        where: { isDeleted: false },
        select: { id: true, slug: true, name: true },
      },
    },
  });
}

/**
 * Checks if an email is already taken by another user
 */
export async function isEmailTaken(email: string, excludeUserId?: string) {
  const user = await prisma.user.findFirst({
    where: { email, isDeleted: false },
  });

  if (!user) return false;
  if (excludeUserId && user.id === excludeUserId) return false;
  return true;
}
