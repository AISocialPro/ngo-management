// src/lib/_utils/ngo.ts
import { prisma } from "@/lib/prisma";

/** Resolve an NGO id to attach to created/queried records. */
export async function resolveNgoId(): Promise<string> {
  // Preferred: set this in .env for white-label deployments
  if (process.env.NGO_ID) return process.env.NGO_ID;

  // Fallback: first NGO (for single-tenant dev/demo)
  const ngo = await prisma.nGO.findFirst({ select: { id: true } });
  if (!ngo) {
    throw new Error(
      "No NGO found. Create one first (table NGO) or set NGO_ID in environment."
    );
  }
  return ngo.id;
}
