import { prisma } from "@/lib/prisma";

/** Returns an NGO id, creating a default one in dev if needed. */
export async function getDefaultNgoId(): Promise<string> {
  const existing = await prisma.nGO.findFirst({ select: { id: true } });
  if (existing) return existing.id;
  const created = await prisma.nGO.create({
    data: { name: "Default NGO" },
    select: { id: true },
  });
  return created.id;
}
