import { PrismaClient } from "@prisma/client";
// Triggering reload to clear cached globalThis.prisma
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Global Prisma client singleton for Next.js.
 *
 * In development, Next.js HMR will create new module instances on each reload,
 * which would exhaust the DB connection pool. We cache the client on `globalThis`
 * to reuse the same instance across hot reloads.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
