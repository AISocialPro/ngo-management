import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BeneficiaryStatus } from "@prisma/client";

/* ======================================================
   GET /api/beneficiaries
   Fetch all beneficiaries for current NGO (white-label)
====================================================== */
export async function GET() {
  try {
    /* ---------------- Resolve NGO ---------------- */

    // Dev fallback until auth middleware is ready
    const anyNgo = await prisma.nGO.findFirst({
      select: { id: true },
    });

    if (!anyNgo) {
      return NextResponse.json({
        success: true,
        beneficiaries: [],
        warning: "No NGO found yet",
      });
    }

    const ngoId = anyNgo.id;

    /* ---------------- Fetch Beneficiaries ---------------- */

    const beneficiaries = await prisma.beneficiary.findMany({
      where: { ngoId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      beneficiaries,
    });
  } catch (error) {
    console.error("[GET /api/beneficiaries]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch beneficiaries",
      },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST /api/beneficiaries
   Create beneficiary (white-label safe)
====================================================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    /* ---------------- Resolve NGO ---------------- */

    let ngoId = body.ngoId;

    if (!ngoId) {
      const anyNgo = await prisma.nGO.findFirst({
        select: { id: true },
      });
      ngoId = anyNgo?.id;
    }

    if (!ngoId) {
      return NextResponse.json(
        { success: false, error: "NGO ID is required." },
        { status: 400 }
      );
    }

    /* ---------------- Sanitize Inputs ---------------- */

    const safeAssistance = Array.isArray(body.assistance)
      ? body.assistance.filter(Boolean)
      : [];

    const safeDob = body.dob ? new Date(body.dob) : null;

    const safeLastAssistance = body.lastAssistance
      ? new Date(body.lastAssistance)
      : null;

    const safeStatus: BeneficiaryStatus =
      body.status === "ACTIVE"
        ? BeneficiaryStatus.ACTIVE
        : body.status === "INACTIVE"
        ? BeneficiaryStatus.INACTIVE
        : BeneficiaryStatus.NEW;

    /* ---------------- Create Beneficiary ---------------- */

    const beneficiary = await prisma.beneficiary.create({
      data: {
        // 🔐 Tenant Injection (white-label)
        ngoId,

        // BASIC INFO
        name: String(body.name || "").trim(),
        contact: body.contact || null,
        email: body.email || null,
        address: body.address || null,
        dob: safeDob,
        gender: body.gender || null,
        occupation: body.occupation || null,
        income: body.income || null,
        avatar: body.avatar || null,

        // ARRAY FIELD
        assistance: safeAssistance,

        // DATES
        lastAssistance: safeLastAssistance,

        // EXTRA
        household: body.household || null,
        status: safeStatus,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      beneficiary,
    });
  } catch (error: any) {
    console.error("[POST /api/beneficiaries]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create beneficiary",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
