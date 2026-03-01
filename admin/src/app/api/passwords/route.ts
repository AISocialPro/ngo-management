import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { resolveNgoId } from "@/lib/tenant";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const ngoId = await resolveNgoId();

    if (!ngoId) return NextResponse.json([], { status: 200 });

    const rows = await prisma.passwordEntry.findMany({
      where: { ngoId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(rows, { status: 200 });
  } catch (e) {
    console.error("GET /api/passwords error:", e);
    return NextResponse.json({ error: "Failed to load passwords" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ngoId = await resolveNgoId();
    if (!ngoId) return NextResponse.json({ error: "NGO ID missing" }, { status: 400 });

    const body = await req.json();

    const created = await prisma.passwordEntry.create({
      data: {
        ngoId,
        title: body.title,
        username: body.username,
        passwordEnc: body.passwordEnc ?? body.password, // allow plain for now
        url: body.url || null,
        notes: body.notes || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        status: String(body.status || "ACTIVE").toUpperCase(),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST /api/passwords error:", e);
    return NextResponse.json({ error: "Failed to create password" }, { status: 500 });
  }
}
