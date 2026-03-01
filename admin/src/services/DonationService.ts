import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/utils/tenant";
import { sendReceiptEmail } from "@/lib/mailer";

export class DonationService {
  static async list() {
    const ngoId = await resolveNgoId();
    return prisma.donation.findMany({
      where: { ngoId },
      include: {
        donor: { select: { name: true, email: true, avatar: true } },
        campaign: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(data: any) {
    const ngoId = await resolveNgoId();

    const donation = await prisma.donation.create({
      data: { ngoId, ...data },
      include: { donor: true, campaign: true },
    });

    await prisma.donor.update({
      where: { id: data.donorId },
      data: {
        total: { increment: data.amount },
        donations: { increment: 1 },
        lastDonatedAt: new Date(),
      },
    });

    await sendReceiptEmail(donation);
    return donation;
  }

  static async analytics() {
    const ngoId = await resolveNgoId();

    const [total, completed, pending, failed, topDonors] = await Promise.all([
      prisma.donation.aggregate({ where: { ngoId }, _sum: { amount: true } }),
      prisma.donation.count({ where: { ngoId, status: "CONFIRMED" } }),
      prisma.donation.count({ where: { ngoId, status: "PENDING" } }),
      prisma.donation.count({ where: { ngoId, status: "FAILED" } }),
      prisma.donor.findMany({
        where: { ngoId },
        orderBy: { total: "desc" },
        take: 5,
        select: { name: true, total: true },
      }),
    ]);

    const monthly = await prisma.$queryRaw`
      SELECT TO_CHAR("donatedAt", 'Mon') as month, SUM(amount) as total
      FROM "Donation"
      WHERE "ngoId" = ${ngoId}
      GROUP BY 1 ORDER BY MIN("donatedAt") ASC LIMIT 12;
    `;

    return {
      total: total._sum.amount || 0,
      completed,
      pending,
      failed,
      topDonors,
      monthly,
    };
  }
}
