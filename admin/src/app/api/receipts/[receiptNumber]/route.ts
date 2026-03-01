// src/app/r/[receiptNumber]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { receiptNumber: string } }) {
  const d = await prisma.donation.findFirst({
    where: { receiptNumber: decodeURIComponent(params.receiptNumber) },
    select: {
      id: true, amount: true, currency: true, donatedAt: true,
      Donor: { select: { name: true } },
      NGO: { select: { name: true } }
    }
  });
  if (!d) return NextResponse.json({ valid: false });
  return NextResponse.json({
    valid: true,
    donationId: d.id,
    ngo: d.NGO.name,
    donor: d.Donor.name,
    amount: Number(d.amount),
    currency: d.currency,
    donatedAt: d.donatedAt,
    receiptDownload: `/api/donations/${d.id}/receipt`,
  });
}
