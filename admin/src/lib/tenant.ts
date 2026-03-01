import prisma from "@/lib/prisma";

/**
 * Resolve NGO dynamically — White Label Ready
 * Priority:
 * 1. ENV override (for staging)
 * 2. First NGO in DB (local dev fallback)
 */
export async function resolveNgoId(): Promise<string> {
  if (process.env.NGO_ID) {
    return process.env.NGO_ID;
  }

  const ngo = await prisma.nGO.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!ngo) {
    throw new Error("No NGO found. Seed at least one NGO first.");
  }

  return ngo.id;
}
