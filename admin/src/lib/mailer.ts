import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function sendReceiptEmail(donation: any) {
  const ngo = await prisma.nGO.findUnique({
    where: { id: donation.ngoId },
    select: { name: true, emailFrom: true, smtpHost: true, smtpPort: true, smtpUser: true, smtpPass: true },
  });

  const transporter = nodemailer.createTransport({
    host: ngo.smtpHost,
    port: ngo.smtpPort,
    secure: false,
    auth: { user: ngo.smtpUser, pass: ngo.smtpPass },
  });

  const pdfBytes = await generateReceiptPDF(donation, ngo.name);

  await transporter.sendMail({
    from: `${ngo.name} <${ngo.emailFrom}>`,
    to: donation.donor.email,
    subject: `Donation Receipt – ${ngo.name}`,
    text: `Thank you for donating ₹${donation.amount}!`,
    attachments: [{ filename: "Receipt.pdf", content: pdfBytes }],
  });
}

async function generateReceiptPDF(donation: any, ngoName: string) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const text = [
    `${ngoName} - Donation Receipt`,
    `Donor: ${donation.donor.name}`,
    `Amount: ₹${donation.amount}`,
    `Campaign: ${donation.campaign?.title || "N/A"}`,
    `Date: ${new Date(donation.donatedAt).toLocaleDateString("en-IN")}`,
  ];

  let y = height - 100;
  for (const line of text) {
    page.drawText(line, { x: 70, y, size: 12, font, color: rgb(0, 0, 0) });
    y -= 20;
  }

  return await pdf.save();
}
