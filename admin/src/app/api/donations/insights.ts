import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/utils/tenant";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * AI Insights Endpoint
 * Fetches donation data from Prisma and summarizes trends using OpenAI
 */
export async function GET() {
  try {
    const ngoId = await resolveNgoId();

    // Fetch donation + donor statistics
    const [summary, donors, campaigns] = await Promise.all([
      prisma.donation.aggregate({
        where: { ngoId },
        _sum: { amount: true },
        _avg: { amount: true },
        _count: { _all: true },
      }),
      prisma.donor.findMany({
        where: { ngoId },
        orderBy: { total: "desc" },
        take: 5,
        select: { name: true, total: true, donations: true },
      }),
      prisma.campaign.findMany({
        where: { ngoId },
        orderBy: { raised: "desc" },
        take: 3,
        select: { title: true, raised: true, goal: true },
      }),
    ]);

    const totalAmount = summary._sum.amount?.toNumber() || 0;
    const avgDonation = summary._avg.amount?.toNumber() || 0;
    const totalDonations = summary._count._all;

    // Prepare prompt for AI
    const systemPrompt = `
You are a financial analyst for a charitable NGO.  
Summarize donation activity, highlight trends, and make recommendations.  
Output a structured JSON summary.
`;

    const userPrompt = `
NGO Donation Data:

Total Donations: ${totalDonations}
Total Amount: ₹${totalAmount}
Average Donation: ₹${avgDonation}

Top Donors:
${donors.map((d, i) => `${i + 1}. ${d.name} – ₹${d.total.toFixed(2)} (${d.donations} donations)`).join("\n")}

Top Campaigns:
${campaigns.map((c, i) => `${i + 1}. ${c.title} – Raised ₹${c.raised}/${c.goal}`).join("\n")}

Generate insights including:
1. Growth or decline trend
2. Donation anomalies
3. Donor loyalty analysis
4. Forecast for next quarter
5. 3 actionable suggestions for NGO team
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const insights = completion.choices[0].message?.content;

    return NextResponse.json({
      summary: {
        totalAmount,
        avgDonation,
        totalDonations,
        topDonors: donors,
        topCampaigns: campaigns,
      },
      aiInsights: JSON.parse(insights ?? "{}"),
    });
  } catch (err: any) {
    console.error("AI Insights error:", err);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
