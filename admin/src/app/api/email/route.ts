import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/email
 * Body: {
 *   ids: string[],          // donation IDs
 *   subject: string,        // email subject
 *   message: string,        // email body
 *   attach?: boolean        // attach receipt PDFs or not
 * }
 */
export async function POST(req: Request) {
  try {
    const { ids, subject, message, attach } = await req.json();

    // ------------------ Validate ------------------
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No recipient IDs provided" },
        { status: 400 }
      );
    }

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    // ------------------ Fetch Donation + Donor Info ------------------
    const donations = await prisma.donation.findMany({
      where: { id: { in: ids } },
      include: { donor: true },
    });

    const recipients = donations
      .map((d) => ({
        name: d.donor?.name || "Donor",
        email: d.donor?.email,
        receiptNo: d.receiptNo,
        id: d.id,
      }))
      .filter((r) => !!r.email);

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No valid donor emails found" },
        { status: 400 }
      );
    }

    // ------------------ Get NGO / White-Label SMTP Config ------------------
    let ngo: any = null;

    try {
      ngo = await prisma.nGO.findFirst({
        select: {
          name: true,
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          smtpPass: true,
          emailFrom: true,
        },
      });
    } catch (err) {
      console.warn("⚠️ Could not fetch NGO record from Prisma:", err);
    }

    // ✅ fallback to .env if NGO record missing or incomplete
    const smtpHost = ngo?.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(ngo?.smtpPort || process.env.SMTP_PORT || 587);
    const smtpUser = ngo?.smtpUser || process.env.SMTP_USER;
    const smtpPass = ngo?.smtpPass || process.env.SMTP_PASS;
    const emailFrom =
      ngo?.emailFrom ||
      process.env.EMAIL_FROM_DEFAULT ||
      `WhiteLabel <${smtpUser}>`;
    const ngoName =
      ngo?.name || process.env.EMAIL_BRAND_NAME || "Our Organization";

    // ------------------ Create Transporter ------------------
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // SSL for port 465
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      await transporter.verify();
      console.log("✅ SMTP connection verified.");
    } catch (verifyErr) {
      console.error("❌ SMTP verify failed:", verifyErr);
      return NextResponse.json(
        { error: "SMTP connection failed. Check credentials." },
        { status: 500 }
      );
    }

   // ------------------ Prepare Attachments ------------------
const attachments: any[] = [];

if (attach) {
  const baseDirs = [
    path.join(process.cwd(), "storage", "receipts"), // ✅ actual correct path
    path.join(process.cwd(), "admin", "storage", "receipts"),
    path.join(process.cwd(), "public", "receipts"),
    path.join(process.cwd(), "admin", "public", "uploads", "receipts"),
  ];

  for (const d of donations) {
    let foundPath: string | null = null;

    for (const base of baseDirs) {
      const testPath = path.join(base, `${d.id}.pdf`);
      if (fs.existsSync(testPath)) {
        foundPath = testPath;
        break;
      }
    }

    if (foundPath) {
      attachments.push({
        filename: `Receipt_${d.donor?.name?.replace(/\s+/g, "_") || "Donor"}_${
          d.receiptNo || d.id
        }.pdf`,
        path: foundPath,
      });
      console.log(`📎 Attached: ${foundPath}`);
    } else {
      console.warn(`⚠️ No PDF found for donation ${d.id} in ${baseDirs.join(", ")}`);
    }
  }
}


    // ------------------ Build HTML Email ------------------
    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:24px;">
        <h2 style="color:#0b5ed7;margin-top:0;">${ngoName}</h2>
        <p style="font-size:15px;color:#444;white-space:pre-line;">${message}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="font-size:13px;color:#777;">This email was sent via our white-label secure mail server.</p>
      </div>
    `;

    // ------------------ Send Emails ------------------
    const sendResults: string[] = [];

    for (const r of recipients) {
      try {
        await transporter.sendMail({
          from: `${ngoName} <${emailFrom}>`,
          to: r.email!,
          subject,
          html: htmlBody,
          attachments,
        });
        sendResults.push(r.email!);
      } catch (mailErr: any) {
        console.error(`❌ Failed to send to ${r.email}:`, mailErr.message);
      }
    }

    // ------------------ Response ------------------
    return NextResponse.json({
      success: true,
      sent: sendResults.length,
      message: `Sent ${sendResults.length} email(s) successfully.`,
    });
  } catch (err: any) {
    console.error("❌ Email Send Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send emails." },
      { status: 500 }
    );
  }
}
