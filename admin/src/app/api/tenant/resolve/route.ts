import { NextResponse } from "next/server";
import { resolveNgoId } from "@/lib/tenant";

export async function GET() {
  try {
    const ngoId = await resolveNgoId();
    return NextResponse.json({ ngoId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to resolve NGO" },
      { status: 500 }
    );
  }
}
