import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VolunteerStatus } from "@prisma/client";
import { resolveNgoId } from "@/lib/tenant";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Auto-update volunteers:
 * NEW → ACTIVE after 30 days
 */
async function autoUpdateStatuses(ngoId: string) {
  const now = new Date();
  const threshold = new Date(now.getTime() - ONE_MONTH_MS);

  await prisma.volunteer.updateMany({
    where: {
      ngoId,
      status: VolunteerStatus.NEW,
      createdAt: { lte: threshold },
    },
    data: {
      status: VolunteerStatus.ACTIVE,
    },
  });
}

/**
 * GET /api/volunteers
 */
export async function GET() {
  try {
    const ngoId = await resolveNgoId(); // ✅ Tenant resolved internally

    await autoUpdateStatuses(ngoId);

    const volunteers = await prisma.volunteer.findMany({
      where: { ngoId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, volunteers });
  } catch (err) {
    console.error("GET /api/volunteers error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load volunteers" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/volunteers
 */
export async function POST(req: NextRequest) {
  try {
    const ngoId = await resolveNgoId(); // ✅ Inject tenant automatically
    const body = await req.json();

    const {
      name,
      gender,
      dob,
      phone,
      email,
      address,
      avatar,
      volunteerType,
      skills,
      areaOfInterest,
      availability,
      emergencyName,
      emergencyPhone,
      notes,
    } = body || {};

    /* ---------- VALIDATIONS ---------- */

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    /* ---------- CREATE VOLUNTEER ---------- */

    const volunteer = await prisma.volunteer.create({
      data: {
        ngoId, // ✅ white-label injection

        name: name.trim(),
        gender: gender || null,
        dob: dob ? new Date(dob) : null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        avatar: avatar || null,

        volunteerType: volunteerType || null,
        skills: Array.isArray(skills) ? skills : [],
        areaOfInterest: areaOfInterest || null,
        availability: availability || null,

        emergencyName: emergencyName || null,
        emergencyPhone: emergencyPhone || null,

        status: VolunteerStatus.NEW,
        totalHours: 0,
        lastActivity: null,

        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, volunteer });
  } catch (err) {
    console.error("POST /api/volunteers error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create volunteer" },
      { status: 500 }
    );
  }
}
