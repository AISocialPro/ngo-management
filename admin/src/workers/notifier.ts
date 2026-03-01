import { prisma } from "@/lib/prisma";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export async function sendDonationAlert(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { donor: true, ngo: true },
  });
  if (!donation) return;

  await client.messages.create({
    from: process.env.TWILIO_FROM,
    to: donation.donor.phone || "",
    body: `🙏 Thank you, ${donation.donor.name}! Your donation of ₹${donation.amount} has been received by ${donation.ngo.name}.`,
  });
}
