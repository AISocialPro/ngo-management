// src/app/api/donations/[id]/receipt/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { renderReceiptPDF } from "@/lib/receipt";
import type { ReceiptSettings } from "@/lib/types";

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: { Donor: true, NGO: true, Campaign: true }
    });
    if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const settings = (donation.NGO.receiptSettings as any as ReceiptSettings) || {};
    const base = process.env.APP_BASE_URL || "https://example.com";
    const verifyUrl = `${base}/r/${encodeURIComponent(donation.receiptNumber!)}`;

    const pdf = await renderReceiptPDF({
      receiptNumber: donation.receiptNumber!,
      verifyUrl,
      donorName: donation.Donor.name,
      donorEmail: donation.Donor.email,
      donorAddress: donation.Donor.address,
      amount: Number(donation.amount),
      currency: donation.currency,
      donatedAt: donation.donatedAt,
      campaignTitle: donation.Campaign?.title || null,
      note: donation.note || undefined,
      payment: {
        mode: donation.paymentMode || undefined,
        utr: donation.utr || undefined,
        bankName: donation.bankName || undefined,
        cardLast4: donation.cardLast4 || undefined,
        chequeNo: donation.chequeNo || undefined,
      },
      ngo: { name: donation.NGO.name, settings },
    });

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Receipt-${donation.receiptNumber}.pdf"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
