import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { resolveNgoId } from "@/lib/tenant";

const prisma = new PrismaClient();

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}
function startOfQuarter(d: Date) {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1);
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function parseRange(req: NextRequest) {
  const url = new URL(req.url);
  const range = (url.searchParams.get("range") || "YTD") as "MTD" | "QTD" | "YTD" | "Custom";
  const fromStr = url.searchParams.get("from") || "";
  const toStr = url.searchParams.get("to") || "";

  const now = new Date();
  let from = startOfYear(now);
  let to = endOfDay(now);

  if (range === "MTD") from = startOfMonth(now);
  if (range === "QTD") from = startOfQuarter(now);
  if (range === "YTD") from = startOfYear(now);

  if (range === "Custom") {
    const f = fromStr ? new Date(fromStr) : null;
    const t = toStr ? new Date(toStr) : null;
    if (f && !isNaN(f.getTime())) from = f;
    if (t && !isNaN(t.getTime())) to = endOfDay(t);
  }

  return { range, from, to };
}

function emptyReport() {
  return {
    kpis: { totalDonations: 0, avgDonation: 0, activeDonors: 0, volunteerHours: 0 },
    summaryRows: [],
    charts: {
      donationsTrend: { labels: [], data: [] },
      donorGrowth: { labels: [], data: [] },
      campaignPerf: { labels: [], data: [] },
      donorSeg: { labels: [], data: [] },
      statusBreak: { labels: [], data: [] },
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const ngoId = await resolveNgoId();
    if (!ngoId) {
      return NextResponse.json({ success: true, data: emptyReport() }, { status: 200 });
    }

    const { from, to } = parseRange(req);

    // ✅ Donations aggregate (CONFIRMED = completed)
    const donationAgg = await prisma.donation.aggregate({
      where: {
        ngoId,
        donatedAt: { gte: from, lte: to },
        status: "CONFIRMED",
      },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: { id: true },
    });

    const totalDonations = Number(donationAgg._sum.amount || 0);
    const avgDonation = Number(donationAgg._avg.amount || 0);

    // ✅ Active donors: donor.status is String in your schema.
    // We'll treat "Active" (case-insensitive) as active.
    const activeDonors = await prisma.donor.count({
      where: {
        ngoId,
        status: { equals: "Active", mode: "insensitive" },
      },
    });

    // ✅ Volunteer hours from VolunteerActivity.hours in selected date range
    const volAgg = await prisma.volunteerActivity.aggregate({
      where: { ngoId, activityDate: { gte: from, lte: to } },
      _sum: { hours: true },
    });
    const volunteerHours = Number(volAgg._sum.hours || 0);

    // -------------------- Charts --------------------

    // Donations trend by month
    const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const donationsByMonth = Array(12).fill(0);

    const donations = await prisma.donation.findMany({
      where: { ngoId, donatedAt: { gte: from, lte: to }, status: "CONFIRMED" },
      select: { amount: true, donatedAt: true },
    });

    for (const d of donations) {
      const m = new Date(d.donatedAt).getMonth();
      donationsByMonth[m] += Number(d.amount || 0);
    }

    // Donor growth by month (new donors)
    const donorsByMonth = Array(12).fill(0);
    const donors = await prisma.donor.findMany({
      where: { ngoId, createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    });
    for (const d of donors) {
      const m = new Date(d.createdAt).getMonth();
      donorsByMonth[m] += 1;
    }

    // Campaign performance (top 6) based on CONFIRMED donation sums
    const campaignGrouped = await prisma.donation.groupBy({
      by: ["campaignId"],
      where: {
        ngoId,
        donatedAt: { gte: from, lte: to },
        status: "CONFIRMED",
        campaignId: { not: null },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 6,
    });

    const campaignIds = campaignGrouped.map((x) => x.campaignId).filter(Boolean) as string[];
    const campaigns = campaignIds.length
      ? await prisma.campaign.findMany({
          where: { ngoId, id: { in: campaignIds } },
          select: { id: true, title: true },
        })
      : [];

    const campaignMap = new Map(campaigns.map((c) => [c.id, c.title]));
    const campaignLabels = campaignGrouped.map((x) => campaignMap.get(x.campaignId as string) || "Campaign");
    const campaignAmounts = campaignGrouped.map((x) => Number(x._sum.amount || 0));

    // Donor segmentation by Donor.type (string default "individual")
    const seg = await prisma.donor.groupBy({
      by: ["type"],
      where: { ngoId },
      _count: { id: true },
    });
    const segLabels = seg.map((x) => String(x.type || "unknown"));
    const segCounts = seg.map((x) => Number(x._count.id || 0));

    // Donation status breakdown
    const status = await prisma.donation.groupBy({
      by: ["status"],
      where: { ngoId, donatedAt: { gte: from, lte: to } },
      _count: { id: true },
    });
    const statusLabels = status.map((x) => String(x.status));
    const statusCounts = status.map((x) => Number(x._count.id || 0));

    const data = {
      kpis: { totalDonations, avgDonation, activeDonors, volunteerHours },
      summaryRows: [
        { metric: "Total Donations", value: totalDonations },
        { metric: "Average Donation", value: avgDonation },
        { metric: "Active Donors", value: activeDonors },
        { metric: "Volunteer Hours", value: volunteerHours },
      ],
      charts: {
        donationsTrend: { labels: monthLabels, data: donationsByMonth },
        donorGrowth: { labels: monthLabels, data: donorsByMonth },
        campaignPerf: { labels: campaignLabels, data: campaignAmounts },
        donorSeg: { labels: segLabels, data: segCounts },
        statusBreak: { labels: statusLabels, data: statusCounts },
      },
    };

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (e: any) {
    console.error("GET /api/reports error:", e);
    return NextResponse.json({ success: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
