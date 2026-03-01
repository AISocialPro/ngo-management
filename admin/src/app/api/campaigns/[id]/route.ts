// src/app/api/campaigns/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/lib/_utils/ngo";
import { CampaignStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------- Helpers -------------------- */
function toInt(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function validatePayload(body: any) {
  const errors: string[] = [];
  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    errors.push("Title is required.");
  }
  return errors;
}

/* -------------------- GET -------------------- */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const ngoId = await resolveNgoId();
    const id = params.id;

    const campaign = await prisma.campaign.findFirst({
      where: { id, ngoId, isArchived: false },
      include: { donations: true },
    });

    if (!campaign)
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });

    const raised = campaign.donations.reduce(
      (sum, d) => sum + Number(d.amount ?? 0),
      0
    );

    return NextResponse.json({ ...campaign, raised });
  } catch (err) {
    console.error("GET /api/campaigns/[id] error:", err);
    return NextResponse.json({ message: "Failed to load campaign" }, { status: 500 });
  }
}

/* -------------------- PUT -------------------- */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const ngoId = await resolveNgoId();
    const id = params.id;
    const body = await req.json();

    const errors = validatePayload(body);
    if (errors.length > 0)
      return NextResponse.json({ message: errors.join(" ") }, { status: 400 });

    const existing = await prisma.campaign.findFirst({ where: { id, ngoId } });
    if (!existing)
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });

    // ✅ Convert status string → enum
    let status: CampaignStatus;
    switch ((body.status ?? "").toUpperCase()) {
      case "ACTIVE":
        status = CampaignStatus.ACTIVE;
        break;
      case "COMPLETED":
        status = CampaignStatus.COMPLETED;
        break;
      case "CANCELLED":
        status = CampaignStatus.CANCELLED;
        break;
      default:
        status = CampaignStatus.DRAFT;
    }

    const data = {
      title: String(body.title).trim(),
      summary: body.summary ? String(body.summary).trim() : null,
      status,
      location: body.location ? String(body.location).trim() : null,
      startDate:
        body.startDate === ""
          ? null
          : body.startDate
          ? new Date(body.startDate)
          : existing.startDate,
      endDate:
        body.endDate === ""
          ? null
          : body.endDate
          ? new Date(body.endDate)
          : existing.endDate,
      lead: body.lead ? String(body.lead).trim() : null,
      goal: body.goal !== undefined ? toInt(body.goal, existing.goal) : existing.goal,
      image: body.image ? String(body.image) : existing.image,
      category: body.category ? String(body.category).trim() : existing.category,
      updatedby: process.env.ADMIN_ID || existing.updatedby, // ✅ lowercase
    };

    const updated = await prisma.campaign.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/campaigns/[id] error:", err);
    return NextResponse.json({ message: "Failed to update campaign" }, { status: 500 });
  }
}

/* -------------------- DELETE -------------------- */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const ngoId = await resolveNgoId();
    const id = params.id;

    const existing = await prisma.campaign.findFirst({
      where: { id, ngoId },
      select: { id: true, isArchived: true },
    });

    if (!existing)
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });

    if (existing.isArchived) return NextResponse.json({ success: true });

    await prisma.campaign.update({
      where: { id: existing.id },
      data: { isArchived: true, updatedby: process.env.ADMIN_ID || null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/campaigns/[id] error:", err);
    return NextResponse.json({ message: "Failed to delete campaign" }, { status: 500 });
  }
}
