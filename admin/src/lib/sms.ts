import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(to: string, message: string) {
  if (!to) throw new Error("Recipient phone number missing");
  const from = process.env.TWILIO_FROM_NUMBER!;
  const res = await client.messages.create({ body: message, from, to });
  return res.sid;
}
