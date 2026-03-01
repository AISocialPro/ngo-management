import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VolunteerStatus } from "@prisma/client";
import { resolveNgoId } from "@/lib/tenant";

/* --------------------------------------------------------
   Helper: Convert string → Prisma Enum
-------------------------------------------------------- */
function mapStatus(label?: string | null): VolunteerStatus {
  if (!label) return VolunteerStatus.NEW;
  const upper = label.toUpperCase();
  if (upper === "ACTIVE") return VolunteerStatus.ACTIVE;
  if (upper === "INACTIVE") return VolunteerStatus.INACTIVE;
  return VolunteerStatus.NEW;
}

/* ========================================================
   PATCH — UPDATE VOLUNTEER
======================================================== */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const ngoId = await resolveNgoId(); // ✅ tenant isolation
    const { id } = await ctx.params;

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
      status,
      totalHours,
      lastActivity,
      notes,
    } = body || {};

    const updated = await prisma.volunteer.updateMany({
      where: { id, ngoId }, // ✅ secure tenant filter
      data: {
        name: name ?? undefined,
        gender: gender ?? undefined,
        dob: dob ? new Date(dob) : undefined,
        phone: phone ?? undefined,
        email: email ?? undefined,
        address: address ?? undefined,
        avatar: avatar ?? undefined,

        volunteerType: volunteerType ?? undefined,
        skills: Array.isArray(skills) ? skills : undefined,
        areaOfInterest: areaOfInterest ?? undefined,
        availability: availability ?? undefined,

        emergencyName: emergencyName ?? undefined,
        emergencyPhone: emergencyPhone ?? undefined,

        status: status ? mapStatus(status) : undefined,
        totalHours:
          totalHours === undefined ? undefined : Number(totalHours) || 0,

        lastActivity: lastActivity ? new Date(lastActivity) : undefined,
        notes: notes ?? undefined,
      },
    });

    if (!updated.count) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/volunteers/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update volunteer" },
      { status: 500 }
    );
  }
}

/* ========================================================
   DELETE — REMOVE VOLUNTEER
======================================================== */
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const ngoId = await resolveNgoId(); // ✅ tenant isolation
    const { id } = await ctx.params;

    await prisma.volunteer.deleteMany({
      where: { id, ngoId }, // ✅ secure tenant filter
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/volunteers/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete volunteer" },
      { status: 500 }
    );
  }
}
