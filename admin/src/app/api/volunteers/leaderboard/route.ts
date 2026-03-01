import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/lib/_utils/tenant";

export async function GET(req: Request) {
  const ngoId = await resolveNgoId(req);
  const top = await prisma.volunteer.findMany({
    where: { ngoId },
    orderBy: { totalHours: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      totalHours: true,
      badges: true,
    },
  });
  return NextResponse.json(top);
}
