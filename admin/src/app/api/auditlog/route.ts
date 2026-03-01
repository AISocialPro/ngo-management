// src/app/api/auditlog/route.ts
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET() {
  const ngoId = await getTenantId();
  const logs = await prisma.savedReport.findMany({
    where: { ngoId },
    orderBy: { cachedAt: "desc" },
  });
  return NextResponse.json(logs);
}
