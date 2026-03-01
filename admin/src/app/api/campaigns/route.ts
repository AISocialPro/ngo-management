import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/lib/_utils/ngo";
import { Prisma, CampaignStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------- Utility functions ------------------------- */
function toInt(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function validatePayload(body: any) {
  const errors: string[] = [];

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    errors.push("Title is required.");
  }
  if (body.status && typeof body.status !== "string") {
    errors.push("Status must be a string.");
  }

  return errors;
}

function slugify(raw: string): string {
  const base = raw
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "campaign";
}

/* ------------------------- GET /api/campaigns ------------------------- */
export async function GET(req: Request) {
  try {
    const ngoId = await resolveNgoId();
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status"); // DRAFT / ACTIVE / COMPLETED / CANCELLED
    const search = url.searchParams.get("search") || "";
    const includeArchived = url.searchParams.get("includeArchived") === "true";

    const where: any = {
      ngoId,
      ...(includeArchived ? {} : { isArchived: false }),
    };

    if (statusParam) {
      where.status = statusParam.toUpperCase();
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { lead: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" }, // ✅ Correct casing
    });

    // 🔹 Compute total raised from Donation.amount
    const campaignIds = campaigns.map((c) => c.id);
    let raisedByCampaign = new Map<string, number>();

    if (campaignIds.length > 0) {
      const grouped = await prisma.donation.groupBy({
        by: ["campaignId"],
        where: {
          ngoId,
          campaignId: { in: campaignIds },
        },
        _sum: { amount: true },
      });

      raisedByCampaign = new Map(
        grouped
          .filter((g) => g.campaignId !== null)
          .map((g) => [
            g.campaignId as string,
            Number(g._sum.amount ?? 0),
          ])
      );
    }

    const result = campaigns.map((c) => ({
      ...c,
      raised: raisedByCampaign.get(c.id) ?? 0,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/campaigns error:", err);
    return NextResponse.json(
      { message: "Failed to load campaigns" },
      { status: 500 }
    );
  }
}

/* ------------------------- POST /api/campaigns ------------------------- */
export async function POST(req: Request) {
  try {
    const ngoId = await resolveNgoId();
    const body = await req.json();

    // ✅ Validate basic fields
    const errors = validatePayload(body);
    if (errors.length > 0) {
      return NextResponse.json({ message: errors.join(" ") }, { status: 400 });
    }

    const title: string = String(body.title).trim();
    const baseSlug = slugify(body.slug || title);

    // ✅ Enum-safe conversion
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

    const data: Prisma.CampaignCreateInput = {
      ngoId,
      title,
      summary: body.summary ? String(body.summary).trim() : null,
      status,
      location: body.location ? String(body.location).trim() : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      lead: body.lead ? String(body.lead).trim() : null,
      goal: toInt(body.goal, 0),
      image: body.image ? String(body.image) : null,
      category: body.category ? String(body.category).trim() : null,
      slug: baseSlug,
      isArchived: false,
      createdby: process.env.ADMIN_ID || null, // ✅ lowercase fixed
      updatedby: process.env.ADMIN_ID || null, // ✅ lowercase fixed
    };

    const created = await prisma.campaign.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/campaigns error:", err);

    const msg =
      err?.code === "P2002"
        ? "A campaign with a similar slug already exists."
        : err?.message || "Failed to create campaign";

    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
