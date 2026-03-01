import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveNgoId } from "@/lib/tenant";

export async function GET() {
  try {
    const ngoId = await resolveNgoId();

    const total = await prisma.beneficiary.count({
      where: { ngoId },
    });

    return NextResponse.json({
      total,
    });
  } catch (error) {
    console.error("[GET /api/beneficiaries/summary]", error);
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 }
    );
  }
}
