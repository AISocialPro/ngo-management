import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getDatasourceUrl = () => {
  const url = process.env.DATABASE_URL;
  // Auto-fix missing protocol if it looks like a connection string
  if (url && !url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    return `postgresql://${url}`;
  }
  return url;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error"],
    datasources: process.env.DATABASE_URL ? {
      db: {
        url: getDatasourceUrl(),
      },
    } : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
