import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { resolveNgoId } from "@/lib/tenant";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const ngoId = await resolveNgoId();
    const { id } = await ctx.params;

    if (!ngoId) {
      return NextResponse.json(
        { success: false, error: "NGO ID missing (tenant context required)." },
        { status: 400 }
      );
    }

    const body = await req.json();

    // prevent tenant change
    const { ngoId: _ignored, id: _ignoredId, ...updateData } = body;

    const updated = await prisma.trustee.update({
      where: { id, ngoId },
      data: {
        name: updateData.name,
        role: updateData.role,
        email: updateData.email,
        contact: updateData.contact,
        avatar: updateData.avatar || null,

        address: updateData.address || null,
        tenureFrom: updateData.tenureFrom ? new Date(updateData.tenureFrom) : null,
        tenureTo: updateData.tenureTo ? new Date(updateData.tenureTo) : null,

        committees: Array.isArray(updateData.committees) ? updateData.committees : [],
        status: updateData.status,
        notes: updateData.notes || null,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to update trustee" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const ngoId = await resolveNgoId();
    const { id } = await ctx.params;

    if (!ngoId) {
      return NextResponse.json(
        { success: false, error: "NGO ID missing (tenant context required)." },
        { status: 400 }
      );
    }

    await prisma.trustee.delete({
      where: { id, ngoId },
    });

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to delete trustee" }, { status: 500 });
  }
}
