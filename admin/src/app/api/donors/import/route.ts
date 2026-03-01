// src/app/api/donors/import/route.ts
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { NextResponse } from "next/server";
import Papa from "papaparse";

export async function POST(req: Request) {
  const ngoId = await getTenantId();
  const text = await req.text();
  const { data } = Papa.parse(text, { header: true });
  await prisma.$transaction(
    data.map((d: any) =>
      prisma.donor.upsert({
        where: { email: d.email },
        update: d,
        create: { ...d, ngoId },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
