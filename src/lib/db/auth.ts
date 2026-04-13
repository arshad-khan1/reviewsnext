import { prisma } from "../prisma";

/**
 * Creates a new refresh token for a user
 */
export async function createRefreshToken(data: {
  userId: string;
  tokenHash: string;
  deviceLabel?: string;
  ipAddress?: string;
  expiresAt: Date;
}) {
  return await prisma.refreshToken.create({
    data,
  });
}

/**
 * Finds a refresh token by its hash
 */
export async function findRefreshToken(tokenHash: string) {
  return await prisma.refreshToken.findFirst({
    where: { tokenHash, isDeleted: false },
    include: {
      user: {
        include: {
          businesses: {
            where: { isDeleted: false },
            select: { id: true, slug: true, name: true },
          },
          activeSubscription: true,
        },
      },
    },
  });
}

/**
 * Revokes a specific refresh token
 */
export async function revokeRefreshToken(tokenHash: string) {
  return await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revokes all refresh tokens for a user (emergency logout)
 */
export async function revokeAllUserTokens(userId: string) {
  return await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Lists active sessions for a user
 */
export async function listActiveSessions(userId: string) {
  return await prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
      isDeleted: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}
