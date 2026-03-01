import { prisma } from "@/lib/prisma";
import { getCurrentNgoId } from "@/lib/tenant";
import { ActivityStatus } from "@prisma/client";

export async function listBoardActivities() {
  const ngoId = await getCurrentNgoId();
  return prisma.boardActivity.findMany({
    where: { ngoId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBoardActivity(data: {
  type: string;
  status: ActivityStatus;
  title: string;
  place: string;
  time: string;
  participants?: string[];
  extraText?: string | null;
  cta?: string | null;
}) {
  const ngoId = await getCurrentNgoId();
  return prisma.boardActivity.create({
    data: {
      ngoId,
      ...data,
      participants: data.participants ?? [],
    },
  });
}
