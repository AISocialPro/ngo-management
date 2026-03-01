import { prisma } from "@/lib/prisma";

export async function assignBadges(volunteerId: string) {
  const v = await prisma.volunteer.findUnique({ where: { id: volunteerId } });
  if (!v) return;

  const badges = [];
  if (v.totalHours >= 10) badges.push({ title: "🌱 Starter", description: "10 hours of service" });
  if (v.totalHours >= 50) badges.push({ title: "🔥 Dedicated Volunteer", description: "50+ hours" });
  if (v.totalHours >= 100) badges.push({ title: "🏅 Century Seva", description: "100+ hours milestone" });
  if (v.totalHours >= 200) badges.push({ title: "💎 Lifetime Seva Award", description: "200+ hours of devotion" });

  await prisma.volunteerBadge.createMany({
    data: badges.map(b => ({ volunteerId, ...b })),
    skipDuplicates: true,
  });

  return badges;
}

export async function logVolunteerActivity(ngoId: string, volunteerId: string, type: string, details: any = {}) {
  await prisma.volunteerActivity.create({
    data: { ngoId, volunteerId, type, details },
  });
}
