// src/lib/receipt.ts
import type { ReceiptSettings } from "./types";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import Handlebars from "handlebars";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export type ReceiptPayload = {
  receiptNumber: string;
  verifyUrl: string;          // e.g. https://app.example.com/r/XYZ
  donorName: string;
  donorEmail?: string | null;
  donorAddress?: string | null;
  amount: number;
  currency: string;
  donatedAt: Date;
  campaignTitle?: string | null;
  note?: string | null;
  payment?: {
    mode?: string | null;
    utr?: string | null;
    bankName?: string | null;
    cardLast4?: string | null;
    chequeNo?: string | null;
  };
  tribute?: { inMemoryOf?: string | null; inHonourOf?: string | null };
  ngo: { name: string; settings: ReceiptSettings };
};

export async function renderReceiptPDF(p: ReceiptPayload): Promise<Buffer> {
  const s = p.ngo.settings || {};
  // If a custom template exists -> HTML->PDF
  if (s.templateHtml) {
    const tpl = Handlebars.compile(s.templateHtml);
    const html = tpl({
      ...p,
      donatedAtStr: p.donatedAt.toLocaleDateString("en-IN"),
      amountStr: p.amount.toLocaleString("en-IN", { style: "currency", currency: p.currency })
    });
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "18mm", right: "14mm", bottom: "18mm", left: "14mm" }});
    await browser.close();
    return Buffer.from(pdf);
  }

  // Default PDF via pdfkit (with QR)
  const QRdataUrl = await QRCode.toDataURL(p.verifyUrl);
  const qrBase64 = QRdataUrl.split(",")[1];
  const qrBuf = Buffer.from(qrBase64, "base64");

  const doc = new PDFDocument({ size: "A4", margin: 54 });
  const chunks: Buffer[] = [];
  doc.on("data", (b) => chunks.push(b));
  const ready = new Promise<Buffer>((r) => doc.on("end", () => r(Buffer.concat(chunks))));

  // Header
  if (s.logoUrl) { try { doc.image(s.logoUrl, 54, 40, { width: 90 }); } catch {} }
  doc.fontSize(16).text(s.orgName || p.ngo.name, { align: "right" }).moveDown(0.2);
  (s.addressLines || []).forEach(l => doc.fontSize(9).text(l, { align: "right" }));
  (s.contactLines || []).forEach(l => doc.fontSize(9).text(l, { align: "right" }));

  // Title
  doc.moveDown().fontSize(18).text("Donation Receipt", { align: "center" });

  // Meta
  doc.moveDown(0.5);
  doc.fontSize(11)
     .text(`Receipt No: ${p.receiptNumber}`)
     .text(`Date: ${p.donatedAt.toLocaleDateString("en-IN")}`)
     .text(`Campaign: ${p.campaignTitle || "—"}`);

  // Donor
  doc.moveDown().fontSize(12).text("Received from:");
  doc.fontSize(11).text(p.donorName);
  if (p.donorEmail) doc.text(p.donorEmail);
  if (p.donorAddress) doc.text(p.donorAddress);

  // Amount
  doc.moveDown(0.8);
  const amtStr = p.amount.toLocaleString("en-IN", { style: "currency", currency: p.currency });
  doc.fontSize(14).text(`Amount: ${amtStr}`, { underline: true });

  // Payment details
  if (p.payment && (p.payment.mode || p.payment.utr || p.payment.bankName || p.payment.cardLast4 || p.payment.chequeNo)) {
    doc.moveDown(0.5).fontSize(11).text("Payment details:");
    if (p.payment.mode) doc.text(`Mode: ${p.payment.mode}`);
    if (p.payment.utr) doc.text(`UTR: ${p.payment.utr}`);
    if (p.payment.bankName) doc.text(`Bank: ${p.payment.bankName}`);
    if (p.payment.cardLast4) doc.text(`Card Last 4: ${p.payment.cardLast4}`);
    if (p.payment.chequeNo) doc.text(`Cheque No.: ${p.payment.chequeNo}`);
  }

  // Tribute
  if (p.tribute?.inMemoryOf || p.tribute?.inHonourOf) {
    doc.moveDown(0.5).fontSize(11)
      .text(p.tribute.inMemoryOf ? `Gift in memory of: ${p.tribute.inMemoryOf}` : `Gift in honour of: ${p.tribute.inHonourOf}`);
  }

  // Note
  if (p.note) { doc.moveDown(0.5).fontSize(11).text(`Note: ${p.note}`); }

  // 80G / PAN / etc.
  doc.moveDown(1);
  if (s.show80GBlock && s.eightyGText) {
    doc.fontSize(10).text(s.eightyGText, { align: "justify" });
    doc.moveDown(0.5);
  }
  const meta = [s.pan && `PAN: ${s.pan}`, s.tan && `TAN: ${s.tan}`, s.gst && `GST: ${s.gst}`].filter(Boolean).join("  •  ");
  if (meta) doc.fontSize(10).text(meta);

  // QR verify
  doc.moveDown(1);
  doc.fontSize(10).text("Scan to verify:", { continued: true }).text(`  ${p.verifyUrl}`);
  try { doc.image(qrBuf, { width: 84, align: "left" }); } catch {}

  // Signature & footer
  doc.moveDown(1.5);
  doc.fontSize(11).text(s.signerName || "", { align: "right" });
  doc.fontSize(10).text(s.signerTitle || "", { align: "right" });
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor("#6b7280").text(s.footerNote || "This is a system-generated receipt.", { align: "center" });

  doc.end();
  return ready;
}
