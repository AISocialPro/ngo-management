import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveNgoId } from "@/lib/tenant";

/**
 * GET single beneficiary (tenant protected)
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const ngoId = await resolveNgoId(); // ✅ tenant isolation
    const { id } = await ctx.params;

    const beneficiary = await prisma.beneficiary.findFirst({
      where: { id, ngoId },
    });

    if (!beneficiary) {
      return NextResponse.json(
        { success: false, error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, beneficiary });
  } catch (error) {
    console.error("[GET /api/beneficiaries/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load beneficiary" },
      { status: 500 }
    );
  }
}

/**
 * PATCH update beneficiary (tenant protected)
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const ngoId = await resolveNgoId(); // ✅ tenant isolation
    const { id } = await ctx.params;
    const body = await req.json();

    const updated = await prisma.beneficiary.updateMany({
      where: { id, ngoId },
      data: {
        name: body.name ?? undefined,
        contact: body.contact ?? undefined,
        email: body.email ?? undefined,
        address: body.address ?? undefined,
        dob: body.dob ? new Date(body.dob) : undefined,
        gender: body.gender ?? undefined,
        occupation: body.occupation ?? undefined,
        income: body.income ?? undefined,
        avatar: body.avatar ?? undefined,
        household: body.household ?? undefined,
        assistance: body.assistance ?? undefined,
        lastAssistance: body.lastAssistance
          ? new Date(body.lastAssistance)
          : undefined,
        status: body.status ?? undefined,
        notes: body.notes ?? undefined,
      },
    });

    if (!updated.count) {
      return NextResponse.json(
        { success: false, error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PATCH /api/beneficiaries/[id]]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update beneficiary" },
      { status: 500 }
    );
  }
}

/**
 * DELETE beneficiary (tenant protected)
 */
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const ngoId = await resolveNgoId(); // ✅ tenant isolation
    const { id } = await ctx.params;

    await prisma.beneficiary.deleteMany({
      where: { id, ngoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/beneficiaries/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete beneficiary" },
      { status: 500 }
    );
  }
}
