import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VolunteerStatus } from "@prisma/client";
import { resolveNgoId } from "@/lib/tenant";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

async function autoUpdateStatuses(ngoId: string) {
  const now = new Date();
  const threshold = new Date(now.getTime() - ONE_MONTH_MS);

  await prisma.volunteer.updateMany({
    where: {
      ngoId,
      status: VolunteerStatus.NEW,
      createdAt: { lte: threshold },
    },
    data: { status: VolunteerStatus.ACTIVE },
  });
}

export async function GET() {
  try {
    const ngoId = await resolveNgoId(); // ✅ tenant resolved internally

    await autoUpdateStatuses(ngoId);

    const commonWhere = { ngoId };

    const [total, active, newThisMonth, totalHoursAgg] = await Promise.all([
      prisma.volunteer.count({ where: commonWhere }),

      prisma.volunteer.count({
        where: { ...commonWhere, status: VolunteerStatus.ACTIVE },
      }),

      prisma.volunteer.count({
        where: {
          ...commonWhere,
          status: VolunteerStatus.NEW,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      prisma.volunteer.aggregate({
        where: commonWhere,
        _sum: { totalHours: true },
      }),
    ]);

    return NextResponse.json({
      total,
      active,
      newThisMonth,
      totalHours: totalHoursAgg._sum.totalHours ?? 0,
    });
  } catch (err) {
    console.error("GET /api/volunteers/summary error:", err);
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 }
    );
  }
}
