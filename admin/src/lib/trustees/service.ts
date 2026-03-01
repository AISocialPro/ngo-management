import { prisma } from "@/lib/prisma";
import { getCurrentNgoId } from "@/lib/tenant";
import { TrusteeStatus } from "@prisma/client";

export async function listTrustees() {
  const ngoId = await getCurrentNgoId();
  return prisma.trustee.findMany({
    where: { ngoId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTrustee(data: {
  name: string;
  role: string;
  email: string;
  contact: string;
  avatar?: string | null;
  tenure?: string | null;
  committees?: string[];
  status: TrusteeStatus;
  notes?: string | null;
}) {
  const ngoId = await getCurrentNgoId();
  return prisma.trustee.create({
    data: {
      ngoId,
      ...data,
      committees: data.committees ?? [],
    }
  });
}

export async function updateTrustee(id: string, data: Partial<{
  name: string;
  role: string;
  email: string;
  contact: string;
  avatar: string | null;
  tenure: string | null;
  committees: string[];
  status: TrusteeStatus;
  notes: string | null;
}>) {
  const ngoId = await getCurrentNgoId();
  return prisma.trustee.update({
    where: { id },
    data,
  });
}

export async function deleteTrustee(id: string) {
  const ngoId = await getCurrentNgoId();
  return prisma.trustee.delete({
    where: { id },
  });
}
