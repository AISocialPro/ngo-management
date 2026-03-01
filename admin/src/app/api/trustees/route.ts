import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { resolveNgoId } from "@/lib/tenant";

const prisma = new PrismaClient();

/**
 * GET /api/trustees
 */
export async function GET(req: NextRequest) {
  try {
    // Prioritize query param for admin panel flexibility, fallback to resolved context
    const url = new URL(req.url);
    const queryNgoId = url.searchParams.get("ngoId");
    const ngoId = (queryNgoId && queryNgoId !== "undefined" && queryNgoId !== "null") ? queryNgoId : await resolveNgoId();

    if (!ngoId) {
      console.warn("GET /api/trustees called without ngoId (tenant missing).");
      return NextResponse.json([], { status: 200 });
    }

    const trustees = await prisma.trustee.findMany({
      where: { ngoId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(trustees, { status: 200 });
  } catch (error) {
    console.error("GET /api/trustees Error:", error);
    return NextResponse.json({ error: "Failed to fetch trustees" }, { status: 500 });
  }
}

/**
 * POST /api/trustees
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ngoId = await resolveNgoId();
    if (!ngoId) {
      return NextResponse.json(
        { success: false, error: "NGO ID is required. This is a multi-tenant system." },
        { status: 400 }
      );
    }

    const newTrustee = await prisma.trustee.create({
      data: {
        ngo: { connect: { id: ngoId } },

        name: body.name,
        role: body.role,
        email: body.email,
        contact: body.contact,

        avatar: body.avatar || null,
        address: body.address || null,

        tenureFrom: body.tenureFrom ? new Date(body.tenureFrom) : null,
        tenureTo: body.tenureTo ? new Date(body.tenureTo) : null,

        committees: Array.isArray(body.committees) ? body.committees : [],
        status: body.status || "ACTIVE",
        notes: body.notes || null,
      },
    });

    return NextResponse.json(newTrustee, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/trustees Error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "NGO record not found to connect." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: false, error: "Failed to create trustee" }, { status: 500 });
  }
}
