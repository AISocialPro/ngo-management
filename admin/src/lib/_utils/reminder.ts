import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/_utils/mailer";

export async function remindInactiveVolunteers() {
  const thirtyDays = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const inactive = await prisma.volunteer.findMany({
    where: { lastActivity: { lt: thirtyDays }, status: "ACTIVE" },
    include: { ngo: true },
  });

  for (const v of inactive) {
    if (!v.email) continue;
    await sendMail({
      to: v.email,
      subject: `We miss you at ${v.ngo.name}!`,
      html: `
        <p>Dear ${v.name},</p>
        <p>It's been a while since your last activity. We'd love to see you back volunteering again!</p>
        <p>Log in to check upcoming events and make a difference 💖</p>
      `,
    });
  }

  return inactive.length;
}
