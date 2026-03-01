import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/lib/_utils/ngo";
import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // ✅ ensures POST always runs server-side

/* -------------------------------------------------------------------------- */
/* 📄 Generate Branded PDF Receipt                                            */
/* -------------------------------------------------------------------------- */
async function generateBrandedReceiptPDF(donation: any, ngo: any) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const { height, width } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const primary = rgb(0.1, 0.4, 0.7);
  const gray = rgb(0.35, 0.35, 0.35);

  const margin = 50;
  let y = height - margin;

  page.drawText(ngo?.name || "Organization Name", {
    x: margin,
    y: y - 10,
    size: 18,
    font: bold,
    color: primary,
  });
  if (ngo?.emailFrom) {
    page.drawText(ngo.emailFrom, {
      x: margin,
      y: y - 30,
      size: 10,
      font,
      color: gray,
    });
  }
  y -= 60;

  // Title Bar
  page.drawRectangle({
    x: margin,
    y: y - 25,
    width: width - 2 * margin,
    height: 25,
    color: primary,
  });
  page.drawText("Donation Receipt", {
    x: margin + 10,
    y: y - 17,
    size: 13,
    font: bold,
    color: rgb(1, 1, 1),
  });
  y -= 45;

  // Org Info
  page.drawText("Organization Information", { x: margin, y, size: 12, font: bold, color: primary });
  y -= 18;
  const orgInfo = [
    `Receipt No: ${donation.receiptNumber}`,
    `Date: ${new Date(donation.donatedAt).toLocaleString("en-IN")}`,
    `Email: ${ngo?.emailFrom || "—"}`,
  ];
  for (const info of orgInfo) {
    page.drawText(info, { x: margin, y, size: 11, font, color: gray });
    y -= 14;
  }
  y -= 20;

  // Donor Info
  page.drawText("Donor Details", { x: margin, y, size: 12, font: bold, color: primary });
  y -= 18;
  const donorInfo = [
    `Name: ${donation.donor?.name || "Anonymous"}`,
    `Email: ${donation.donor?.email || "—"}`,
    `Payment Mode: ${donation.paymentMode || "—"}`,
    `UTR / Ref No: ${donation.utr || "—"}`,
  ];
  for (const info of donorInfo) {
    page.drawText(info, { x: margin, y, size: 11, font, color: gray });
    y -= 14;
  }
  y -= 20;

  // Donation Summary
  page.drawText("Donation Summary", { x: margin, y, size: 12, font: bold, color: primary });
  y -= 25;
  const headers = ["Description", "Quantity", "Unit", "Amount (Rs.)"];
  page.drawRectangle({ x: margin, y: y - 5, width: width - 2 * margin, height: 18, color: primary });
  for (let i = 0; i < headers.length; i++) {
    page.drawText(headers[i], {
      x: margin + 10 + i * 120,
      y: y - 2,
      size: 11,
      font: bold,
      color: rgb(1, 1, 1),
    });
  }
  y -= 25;
  const row = [
    donation.campaign?.title || "General Donation",
    "1",
    "—",
    `Rs. ${donation.amount.toLocaleString("en-IN")}`,
  ];
  for (let i = 0; i < row.length; i++) {
    page.drawText(row[i], {
      x: margin + 10 + i * 120,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });
  }

  y -= 40;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 25;
  page.drawText("Thank you for your valuable contribution.", {
    x: margin,
    y,
    size: 11,
    font,
    color: gray,
  });
  y -= 20;
  page.drawText("Authorized Signature", { x: width - 200, y, size: 11, font, color: gray });

  return await pdf.save();
}

/* -------------------------------------------------------------------------- */
/* 🟢 GET — Fetch All Donations                                               */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    const ngoId = await resolveNgoId();
    const donations = await prisma.donation.findMany({
      where: { ngoId },
      include: {
        donor: { select: { id: true, name: true, email: true } },
        campaign: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { donatedAt: "desc" },
    });
    return NextResponse.json(donations);
  } catch (err: any) {
    console.error("❌ GET donations error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* 🟢 POST — Create Donation + Save + Email Receipt                           */
/* -------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const ngoId = await resolveNgoId();
    const body = await req.json();

    if (!body.amount || isNaN(body.amount))
      return NextResponse.json({ error: "Donation amount must be numeric." }, { status: 400 });

    const ngo = await prisma.nGO.findUnique({
      where: { id: ngoId },
      select: {
        name: true,
        emailFrom: true,
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPass: true,
      },
    });

    const brandName = ngo?.name || process.env.EMAIL_BRAND_NAME || "Organization";
    const brandFrom = ngo?.emailFrom || process.env.EMAIL_FROM_DEFAULT || "no-reply@org.org";

    // Donor creation
    let donorId = body.donorId;
    if (!donorId) {
      const donor = await prisma.donor.create({
        data: { ngoId, name: body.donorName || "Anonymous", email: body.donorEmail || null },
      });
      donorId = donor.id;
    }

    // ✅ Create donation
    const donation = await prisma.donation.create({
      data: {
        ngoId,
        donorId,
        campaignId: body.campaignId || null,
        amount: Number(body.amount),
        paymentMode: body.paymentMode || "OTHER",
        status: body.status || "CONFIRMED",
        utr: body.utr || null,
        note: body.note || null,
        donatedAt: body.donatedAt ? new Date(body.donatedAt) : new Date(),
        receiptNumber: `RCPT-${Date.now()}`,
      },
      include: { donor: true, campaign: true },
    });

    /* ---------------- Generate & Save PDF ---------------- */
    const pdfBytes = await generateBrandedReceiptPDF(donation, ngo);
    const receiptsDir = path.resolve("C:/NgoManagement/admin/storage/receipts");
    if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });

    const pdfPath = path.join(receiptsDir, `${donation.id}.pdf`);
    fs.writeFileSync(pdfPath, pdfBytes);
    console.log(`📄 Receipt saved at: ${pdfPath}`);

    /* ---------------- Revalidate Campaign ---------------- */
    if (donation.campaign?.slug) {
      try {
        revalidatePath(`/campaigns/${donation.campaign.slug}`);
        console.log(`♻️ Revalidated /campaigns/${donation.campaign.slug}`);
      } catch (err) {
        console.error("⚠️ Revalidation failed:", err);
      }
    }

    /* ---------------- Send Email ---------------- */
    if (donation.donor?.email) {
      try {
        // ✅ Use NGO or fallback SMTP
        const smtpHost = ngo?.smtpHost || process.env.SMTP_HOST;
        const smtpPort = Number(ngo?.smtpPort) || Number(process.env.SMTP_PORT) || 587;
        const smtpUser = ngo?.smtpUser || process.env.SMTP_USER;
        const smtpPass = ngo?.smtpPass || process.env.SMTP_PASS;
        const emailFrom = ngo?.emailFrom || process.env.EMAIL_FROM_DEFAULT || "no-reply@org.org";

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
          tls: { rejectUnauthorized: false },
        });

        await transporter.verify();
        console.log("✅ SMTP verified:", smtpHost);

        const htmlBody = `
          <div style="font-family:Arial,sans-serif;color:#333;">
            <h3>Dear ${donation.donor?.name || "Supporter"},</h3>
            <p>Thank you for your generous donation to <b>${brandName}</b>.</p>
            <p><b>Receipt No:</b> ${donation.receiptNumber}<br>
            <b>Amount:</b> ₹${donation.amount.toLocaleString("en-IN")}<br>
            <b>Payment Mode:</b> ${donation.paymentMode}</p>
            <p>The official receipt is attached below.</p>
            <p>With gratitude,<br><b>${brandName}</b></p>
          </div>
        `;

        const info = await transporter.sendMail({
          from: emailFrom,
          to: donation.donor.email,
          subject: `🙏 Thank You for Your Donation – ${brandName}`,
          html: htmlBody,
          attachments: [{ filename: `Receipt_${donation.receiptNumber}.pdf`, path: pdfPath }],
        });

        console.log("📨 Email sent:", info.response || info.messageId);
      } catch (err) {
        console.error("⚠️ Email sending failed:", err);
      }
    }

    return NextResponse.json(donation);
  } catch (err: any) {
    console.error("❌ Donation creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* 🗑️ DELETE — Bulk or Single Donation Deletion + File Cleanup                */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: Request) {
  try {
    const ngoId = await resolveNgoId();
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No donation IDs provided." }, { status: 400 });
    }

    const receiptsDir = path.resolve("C:/NgoManagement/admin/storage/receipts");
    for (const id of ids) {
      const receiptPath = path.join(receiptsDir, `${id}.pdf`);
      if (fs.existsSync(receiptPath)) {
        fs.unlinkSync(receiptPath);
        console.log(`🗑️ Deleted receipt: ${receiptPath}`);
      }
    }

    await prisma.donation.deleteMany({ where: { id: { in: ids }, ngoId } });
    console.log(`✅ Deleted ${ids.length} donations successfully.`);
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err: any) {
    console.error("❌ DELETE donation error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete donation(s)." }, { status: 500 });
  }
}
