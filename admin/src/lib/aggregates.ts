// src/lib/aggregates.ts
import { prisma } from "@/lib/prisma";

/** Recompute donor aggregates from canonical Donation rows. */
export async function recomputeDonorAggregates(donorId: string, ngoId: string) {
  const agg = await prisma.donation.aggregate({
    where: { donorId, ngoId, status: "CONFIRMED" },
    _sum: { amount: true },
    _count: true,
  });

  await prisma.donor.update({
    where: { id: donorId },
    data: {
      total: agg._sum.amount ?? 0,
      donations: agg._count,
      lastDonatedAt: await prisma.donation
        .findFirst({
          where: { donorId, ngoId, status: "CONFIRMED" },
          orderBy: { donatedAt: "desc" },
          select: { donatedAt: true },
        })
        .then(r => r?.donatedAt ?? null),
      status: "Active", // optional: mark active when they’ve donated
    },
  });
}
