import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveNgoId } from "@/lib/tenant";

export const runtime = "nodejs";

/* -------------------------------------------------------------------------- */
/* ✅ POST — Create or Update Donor                                           */
/* -------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const ngoId = await resolveNgoId();
    const data = await req.json();

    if (!data.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // 🧩 Upsert ensures donor is unique by phone or email per NGO
    const donor = await prisma.donor.upsert({
      where: {
        // make sure you have this compound unique key in schema.prisma:
        // @@unique([ngoId, phone])
        ngoId_phone: {
          ngoId,
          phone: data.phone || "",
        },
      },
      update: {
        name: data.name,
        email: data.email || null,
        status: "Active",
      },
      create: {
        ngoId,
        avatar: null,
        name: data.name,
        email: data.email || null,
        phone: data.phone || "",
        status: "Active",
      },
    });

    // 🔁 trigger front-end event listener if needed
    return NextResponse.json(donor);
  } catch (err: any) {
    console.error("❌ Donor creation error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* ✅ GET — List All Active Donors With Aggregated Donation Totals            */
/* -------------------------------------------------------------------------- */
export async function GET(req: Request) {
  try {
    const ngoId = await resolveNgoId();

    // 🧩 Get all *active* donors only
    const donors = await prisma.donor.findMany({
      where: {
        ngoId,
        status: { notIn: ["DELETED", "Inactive"] },
      },
      orderBy: { createdAt: "desc" },
    });

    // 🧩 Aggregate donations per donor
    const aggregates = await prisma.donation.groupBy({
      by: ["donorId"],
      where: { ngoId },
      _sum: { amount: true },
      _count: { amount: true },
    });

    const donationMap = new Map<string, { total: number; count: number }>();
    for (const a of aggregates) {
      donationMap.set(a.donorId, {
        total: Number(a._sum.amount) || 0,
        count: a._count.amount || 0,
      });
    }

    // 🧩 Merge donor + donation totals
    const result = donors.map((d) => {
      const donationInfo = donationMap.get(d.id) || { total: 0, count: 0 };
      return {
        ...d,
        total: donationInfo.total,
        donations: donationInfo.count,
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("❌ Error fetching donors:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
