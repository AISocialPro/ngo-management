// src/lib/_utils/tenant.ts
import prisma from "@/lib/prisma";

export async function resolveNgoId() {
  const ngo = await prisma.nGO.findFirst();
  if (!ngo) throw new Error("No NGO found in database");
  return ngo.id;
}
