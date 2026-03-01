import prisma from "@/lib/prisma";
import { fail, success, safeJson } from "@/lib/utils/api";

/* ------------------------------- GET Donor ------------------------------- */
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const donor = await prisma.donor.findUnique({
      where: { id },
      include: { donationRecords: true },
    });
    if (!donor) return fail("Donor not found", 404);
    return success(donor);
  } catch (e: any) {
    return fail(e.message);
  }
}

/* ------------------------------ PATCH Donor ------------------------------ */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const data = await safeJson<any>(req);

    const existing = await prisma.donor.findUnique({ where: { id } });
    if (!existing) return fail("Donor not found", 404);

    // 🔁 Recalculate totals directly from donations
    const aggregates = await prisma.donation.aggregate({
      where: { donorId: id },
      _sum: { amount: true },
      _count: { amount: true },
    });

    // 🧠 Update donor info (status, name, etc.) while keeping live totals
    const donor = await prisma.donor.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        email: data.email ?? existing.email,
        phone: data.phone ?? existing.phone,
        type: data.type ?? existing.type,
        status: data.status ?? existing.status,
        notes: data.notes ?? existing.notes,
        total: aggregates._sum.amount || 0,
        donations: aggregates._count.amount || 0,
        lastDonatedAt: existing.lastDonatedAt,
      },
      include: { donationRecords: true },
    });

    // ✅ Return donor with live totals
    return success(donor);
  } catch (e: any) {
    console.error("❌ Donor update error:", e);
    return fail(e.message);
  }
}

/* ----------------------------- DELETE Donor ------------------------------ */
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await prisma.donation.deleteMany({ where: { donorId: id } });
    await prisma.donor.delete({ where: { id } });
    return success({ ok: true });
  } catch (e: any) {
    return fail(e.message);
  }
}
