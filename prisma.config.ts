import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env file
dotenv.config();

/**
 * Prisma v7 configuration file.
 *
 * The DATABASE_URL env var must be set in .env:
 *   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/review_funnel_db?schema=public"
 *
 * NOTE: `earlyAccess` and `migrate.adapter` are NOT valid in Prisma v7.7+.
 * The pg adapter is passed to PrismaClient directly in src/lib/prisma.ts.
 *
 * @see https://pris.ly/d/config-datasource
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: 'npx tsx ./prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
