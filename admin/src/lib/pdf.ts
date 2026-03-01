import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateReceiptPDF(donation: any, ngoName: string) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([600, 400]);
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const lines = [
    `${ngoName} Donation Receipt`,
    `Donor: ${donation.donor.name}`,
    `Amount: ₹${donation.amount}`,
    `Campaign: ${donation.campaign?.title || "General Fund"}`,
    `Date: ${new Date(donation.donatedAt).toLocaleDateString("en-IN")}`,
  ];

  let y = height - 60;
  for (const text of lines) {
    page.drawText(text, { x: 50, y, size: 14, font, color: rgb(0, 0, 0) });
    y -= 25;
  }

  return await pdf.save();
}
