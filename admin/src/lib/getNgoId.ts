// src/lib/getNgoId.ts
// BEFORE:
// import { prisma } from "@/lib/prisma";

// AFTER:
import prisma from "@/lib/prisma";


export async function getNgoId(): Promise<string> {
  // TODO: swap to your real tenant/org resolution.
  const ngo = await prisma.nGO.findFirst();
  if (!ngo) {
    const created = await prisma.nGO.create({ data: { name: "Default NGO" } });
    return created.id;
  }
  return ngo.id;
}
