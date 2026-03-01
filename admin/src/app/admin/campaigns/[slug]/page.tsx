// src/app/campaigns/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%233498db'/><stop offset='100%' stop-color='%232980b9'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Segoe UI, Arial' font-size='22' fill='white' opacity='0.85'>Campaign</text></svg>`
  );

const fmtINR = (n: number) =>
  n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const clampPct = (raised: number, goal: number) =>
  Math.max(0, Math.min(100, goal > 0 ? Math.round((raised / goal) * 100) : 0));

export default async function PublicCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ Fix: await params to avoid sync dynamic route error
  const { slug } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { slug, isArchived: false },
    include: {
      donations: {
        where: { status: "CONFIRMED" }, // ✅ Only confirmed donations count
      },
    },
  });

  if (!campaign) notFound();

  // ✅ Compute raised amount
  const raised = campaign.donations.reduce(
    (sum, d) => sum + Number(d.amount ?? 0),
    0
  );
  const pct = clampPct(raised, campaign.goal);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">{campaign.title}</h1>
        <p className="mt-2 text-slate-600">{campaign.summary || "—"}</p>

        <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm">
          <img
            src={campaign.image || FALLBACK_IMG}
            alt={campaign.title}
            className="h-64 w-full object-cover"
          />

          <div className="p-4">
            <div className="text-sm text-slate-600">
              📍 <span className="font-medium">Location:</span>{" "}
              {campaign.location || "—"}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              📅 <span className="font-medium">Dates:</span>{" "}
              {campaign.startDate
                ? campaign.startDate.toISOString().slice(0, 10)
                : "—"}{" "}
              {campaign.endDate
                ? `→ ${campaign.endDate.toISOString().slice(0, 10)}`
                : ""}
            </div>

            {/* ✅ Funding Progress Bar */}
            <div className="mt-5">
              <div className="mb-2 text-sm font-medium text-slate-700">
                Funding Progress
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-slate-600">
                <span>{fmtINR(raised)} raised</span>
                <span>Goal: {fmtINR(campaign.goal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Optional: show donation list */}
        {campaign.donations.length > 0 && (
          <div className="mt-6 border rounded-lg bg-white shadow-sm">
            <div className="p-4 border-b font-semibold text-slate-800">
              Recent Donations ({campaign.donations.length})
            </div>
            <div className="divide-y">
              {campaign.donations.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  className="p-3 flex justify-between text-sm text-slate-600"
                >
                  <span>
                    {new Date(d.donatedAt).toLocaleDateString("en-IN")}
                  </span>
                  <span>{fmtINR(Number(d.amount))}</span>
                  <span>{d.paymentMode}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
