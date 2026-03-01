import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// ✅ use the existing helper you already have
import { getNgoId } from "@/lib/getNgoId";


// 🔹 GET: List all donations for a donor
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    // const ngoId = await resolveNgoId();
const ngoId = await getNgoId();

    const rows = await prisma.donation.findMany({
      where: { donorId: params.id, ngoId },
      orderBy: { donatedAt: "desc" },
      select: {
        id: true,
        amount: true,
        donatedAt: true,
        status: true,
        note: true,
        campaign: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("GET /api/donors/[id]/donations failed:", e);
    return NextResponse.json({ error: e?.message ?? "Failed to fetch donations" }, { status: 500 });
  }
}
