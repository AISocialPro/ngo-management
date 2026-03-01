import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { resolveNgoId } from "@/lib/tenant";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const ngoId = await resolveNgoId();
    if (!ngoId) return NextResponse.json({ error: "NGO ID missing" }, { status: 400 });

    const { id } = await ctx.params;
    const body = await req.json();

    const updated = await prisma.passwordEntry.update({
      where: { id, ngoId },
      data: {
        title: body.title,
        username: body.username,
        passwordEnc: body.passwordEnc ?? body.password,
        url: body.url || null,
        notes: body.notes || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        status: String(body.status || "ACTIVE").toUpperCase(),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error("PATCH /api/passwords/[id] error:", e);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const ngoId = await resolveNgoId();
    if (!ngoId) return NextResponse.json({ error: "NGO ID missing" }, { status: 400 });

    const { id } = await ctx.params;

    await prisma.passwordEntry.delete({
      where: { id, ngoId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("DELETE /api/passwords/[id] error:", e);
    return NextResponse.json({ error: "Failed to delete password" }, { status: 500 });
  }
}
