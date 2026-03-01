// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveNgoId } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    const ngoId = await resolveNgoId();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "YTD";
    const customFrom = searchParams.get("from");
    const customTo = searchParams.get("to");

    let startDate = new Date();
    let endDate = new Date();
    const now = new Date();

    // 1. Determine Date Range
    if (range === "Custom" && customFrom && customTo) {
      startDate = new Date(customFrom);
      endDate = new Date(customTo);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = now;
      if (range === "MTD") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (range === "QTD") {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
      } else {
        // YTD is default
        startDate = new Date(now.getFullYear(), 0, 1);
      }
    }

    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // 2. Fetch Data in Parallel
    // We use (prisma as any) to avoid TypeScript errors if your schema doesn't strictly match these model names yet.
    const [donations, donors, volunteerStats] = await Promise.all([
      // Fetch Donations
      (prisma as any).donation?.findMany({
        where: { ...dateFilter, ngoId },
        select: { 
          amount: true, 
          createdAt: true, 
          status: true, 
          donorId: true,
          campaign: { select: { title: true } } 
        },
        orderBy: { createdAt: 'asc' },
      }) || [],

      // Fetch Donors (for growth and segmentation)
      (prisma as any).donor?.findMany({
        where: { ...dateFilter, ngoId },
        select: { createdAt: true, type: true },
        orderBy: { createdAt: 'asc' },
      }) || [],

      // Fetch Volunteer Hours (Aggregation)
      // If VolunteerLog doesn't exist, this defaults to 0 hours.
      (prisma as any).volunteerLog?.aggregate({
        _sum: { hours: true },
        where: { ...dateFilter, ngoId },
      }).catch(() => ({ _sum: { hours: 0 } })) || { _sum: { hours: 0 } },
    ]);

    // 3. Process KPIs
    const totalDonations = donations.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
    const avgDonation = donations.length > 0 ? totalDonations / donations.length : 0;
    
    // Active Donors: Count of unique donorIds in the donations list
    const uniqueDonors = new Set(donations.map((d: any) => d.donorId).filter(Boolean));
    const activeDonors = uniqueDonors.size;

    const volunteerHours = volunteerStats._sum.hours || 0;

    const kpis = {
      totalDonations,
      avgDonation,
      activeDonors,
      volunteerHours,
    };

    // 4. Process Charts
    
    // Chart: Donations Trend (Daily)
    const trendMap = new Map<string, number>();
    donations.forEach((d: any) => {
      const date = new Date(d.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
      trendMap.set(date, (trendMap.get(date) || 0) + (Number(d.amount) || 0));
    });
    const donationsTrend = {
      labels: Array.from(trendMap.keys()),
      data: Array.from(trendMap.values()),
    };

    // Chart: Donor Growth (Daily)
    const growthMap = new Map<string, number>();
    donors.forEach((d: any) => {
      const date = new Date(d.createdAt).toISOString().split('T')[0];
      growthMap.set(date, (growthMap.get(date) || 0) + 1);
    });
    const donorGrowth = {
      labels: Array.from(growthMap.keys()),
      data: Array.from(growthMap.values()),
    };

    // Chart: Campaign Performance (Top 5)
    const campaignMap = new Map<string, number>();
    donations.forEach((d: any) => {
      const title = d.campaign?.title || "Unassigned";
      campaignMap.set(title, (campaignMap.get(title) || 0) + (Number(d.amount) || 0));
    });
    const sortedCampaigns = Array.from(campaignMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const campaignPerf = {
      labels: sortedCampaigns.map(e => e[0]),
      data: sortedCampaigns.map(e => e[1]),
    };

    // Chart: Donor Segmentation
    const segMap = new Map<string, number>();
    donors.forEach((d: any) => {
      const type = d.type || "Individual";
      segMap.set(type, (segMap.get(type) || 0) + 1);
    });
    const donorSeg = {
      labels: Array.from(segMap.keys()),
      data: Array.from(segMap.values()),
    };

    // Chart: Status Breakdown
    const statusMap = new Map<string, number>();
    donations.forEach((d: any) => {
      const status = d.status || "Completed";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const statusBreak = {
      labels: Array.from(statusMap.keys()),
      data: Array.from(statusMap.values()),
    };

    // 5. Summary Table
    const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
    const summary = [
      { metric: "Total Donations", value: fmt(totalDonations) },
      { metric: "Average Donation", value: fmt(avgDonation) },
      { metric: "Active Donors", value: activeDonors },
      { metric: "Volunteer Hours", value: volunteerHours },
      { metric: "Top Campaign", value: sortedCampaigns[0]?.[0] || "N/A" },
    ];

    return NextResponse.json({
      kpis,
      summary,
      charts: {
        donationsTrend,
        donorGrowth,
        campaignPerf,
        donorSeg,
        statusBreak
      }
    });

  } catch (error) {
    console.error("[GET /api/reports]", error);
    // Return a valid empty structure on error to prevent frontend crash
    return NextResponse.json({
      kpis: { totalDonations: 0, avgDonation: 0, activeDonors: 0, volunteerHours: 0 },
      summary: [],
      charts: {}
    }, { status: 500 });
  }
}
