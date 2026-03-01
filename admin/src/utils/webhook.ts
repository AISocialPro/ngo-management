import { prisma } from "@/lib/prisma";

export async function handleWebhook(event: any) {
  if (event.type === "payment.success") {
    const { donorId, amount, ngoId } = event.data;
    await prisma.donation.create({
      data: { donorId, ngoId, amount, status: "CONFIRMED" },
    });
  }

  if (event.type === "crm.sync") {
    const donor = event.data;
    await prisma.donor.upsert({
      where: { email: donor.email },
      update: { total: donor.total },
      create: { ngoId: donor.ngoId, name: donor.name, email: donor.email },
    });
  }
}
