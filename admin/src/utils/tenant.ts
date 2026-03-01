import { prisma } from "@/lib/prisma";

/** Resolve tenant NGO id dynamically (from token, subdomain, etc.) */
export async function resolveNgoId(): Promise<string> {
  if (process.env.NGO_ID) return process.env.NGO_ID;
  const ngo = await prisma.nGO.findFirst({ select: { id: true } });
  if (!ngo) throw new Error("No NGO found. Seed NGO first or set NGO_ID in .env");
  return ngo.id;
}
