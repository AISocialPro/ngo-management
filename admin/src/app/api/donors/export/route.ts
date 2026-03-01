// src/app/api/donors/export/route.ts
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { Parser } from "json2csv";

export async function GET() {
  const ngoId = await getTenantId();
  const donors = await prisma.donor.findMany({ where: { ngoId } });
  const parser = new Parser();
  const csv = parser.parse(donors);
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv" },
  });
}
