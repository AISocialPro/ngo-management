import { NextResponse } from "next/server";
import { DonationService } from "@/services/DonationService";

export async function GET() {
  const data = await DonationService.analytics();
  return NextResponse.json(data);
}
