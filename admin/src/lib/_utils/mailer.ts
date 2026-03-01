import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendReminderEmail(email: string, name: string) {
  if (!email) return;
  const subject = "We miss you at your NGO!";
  const html = `
    <p>Dear ${name},</p>
    <p>We haven’t seen you active lately. Your contribution truly makes a difference!</p>
    <p>Come join our upcoming event — your presence matters 💖</p>
  `;
  await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject, html });
}
