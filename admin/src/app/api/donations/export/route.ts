import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/lib/_utils/ngo";

export async function GET() {
  try {
    const ngoId = await resolveNgoId();
    const donations = await prisma.donation.findMany({
      where: { ngoId },
      include: {
        donor: true,
        campaign: true,
      },
    });

    const header = [
      "Donor Name",
      "Email",
      "Campaign",
      "Amount",
      "Date",
      "Payment",
      "Status",
    ];
    const rows = donations.map((d) => [
      d.donor?.name || "",
      d.donor?.email || "",
      d.campaign?.title || "",
      d.amount,
      d.donatedAt.toISOString().split("T")[0],
      d.paymentMode,
      d.status,
    ]);

    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="donations.csv"',
      },
    });
  } catch (err) {
    console.error("Error exporting donations:", err);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
