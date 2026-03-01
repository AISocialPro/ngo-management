import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/lib/_utils/ngo";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* 🟢 PUT — Update Donation                                                   */
/* -------------------------------------------------------------------------- */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 FIXED: params must be awaited in Next.js 15+
) {
  try {
    const { id } = await context.params; // 👈 await params
    const ngoId = await resolveNgoId();
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Donation ID is required." }, { status: 400 });
    }

    const updated = await prisma.donation.updateMany({
      where: { id, ngoId },
      data: {
        amount: Number(body.amount),
        paymentMode: body.paymentMode,
        status: body.status,
        campaignId: body.campaignId || null,
        note: body.note || null,
        donatedAt: body.donatedAt ? new Date(body.donatedAt) : undefined,
      },
    });

    if (!updated.count) {
      return NextResponse.json({ error: "Donation not found." }, { status: 404 });
    }

    console.log(`✅ Donation ${id} updated successfully.`);
    return NextResponse.json({ success: true, message: "Donation updated successfully." });
  } catch (err: any) {
    console.error("❌ Update error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update donation." },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 🗑️ DELETE — Delete Donation + Remove Receipt File                          */
/* -------------------------------------------------------------------------- */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> } // 👈 FIXED: must await this
) {
  try {
    const { id } = await context.params;
    const ngoId = await resolveNgoId();

    if (!id) {
      return NextResponse.json({ error: "Donation ID is required." }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.donation.findFirst({
      where: { id, ngoId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Donation not found." }, { status: 404 });
    }

    // Delete record
    await prisma.donation.delete({ where: { id } });

    // Delete receipt file if present
    const receiptsDir = path.resolve("C:/NgoManagement/admin/storage/receipts");
    const receiptPath = path.join(receiptsDir, `${id}.pdf`);

    if (fs.existsSync(receiptPath)) {
      fs.unlinkSync(receiptPath);
      console.log(`🗑️ Deleted receipt file: ${receiptPath}`);
    } else {
      console.warn(`⚠️ No receipt file found for donation ${id}`);
    }

    console.log(`✅ Donation ${id} deleted successfully.`);
    return NextResponse.json({ success: true, message: "Donation deleted successfully." });
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete donation." },
      { status: 500 }
    );
  }
}
