import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/utils/tenant";

export async function GET() {
  const ngoId = await resolveNgoId();
  const donations = await prisma.donation.findMany({
    where: { ngoId },
    include: { donor: true, campaign: true },
  });

  const header = "Donor,Email,Campaign,Amount,Status,Date\n";
  const csv = header + donations
    .map((d) => `"${d.donor.name}","${d.donor.email}","${d.campaign?.title || ""}","${d.amount}","${d.status}","${d.donatedAt.toISOString()}"`)
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=donations.csv",
    },
  });
}
