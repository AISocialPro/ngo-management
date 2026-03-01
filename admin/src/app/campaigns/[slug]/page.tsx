import { prisma } from "@/lib/prisma";
import { resolveNgoId } from "@/lib/_utils/ngo";
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

const formatDate = (d: Date | null | undefined) =>
  d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

type PageProps = {
  params: { slug: string };
};

export default async function PublicCampaignPage({ params }: PageProps) {
  const ngoId = await resolveNgoId();

  const campaign = await prisma.campaign.findFirst({
    where: { ngoId, slug: params.slug, isArchived: false },
    include: {
      donations: {
        where: { status: "CONFIRMED" }, // only confirmed donations
        include: { donor: true },
        orderBy: { donatedAt: "desc" },
        take: 10, // recent 10 supporters for the list
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  const raised = campaign.donations.reduce(
    (sum, d) => sum + Number(d.amount ?? 0),
    0
  );
  const pct = clampPct(raised, campaign.goal);
  const donationsCount = campaign.donations.length;
  const uniqueDonorsCount = new Set(
    campaign.donations.map((d) => d.donorId)
  ).size;

  const start = campaign.startDate ? formatDate(campaign.startDate) : "—";
  const end = campaign.endDate ? formatDate(campaign.endDate) : "";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Title + meta */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {campaign.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              {campaign.category && (
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                  {campaign.category}
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                {campaign.status}
              </span>
            </div>
          </div>

          {/* Key stats pill */}
          <div className="flex flex-col items-end text-right text-sm text-slate-600">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Overall Progress
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {pct}%
            </span>
            <span>
              {fmtINR(raised)} raised of {fmtINR(campaign.goal)}
            </span>
          </div>
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {/* Image */}
          <img
  src={campaign.image || FALLBACK_IMG}
  alt={campaign.title}
  className="h-64 w-full object-cover"
/>


          <div className="grid gap-6 p-6 md:grid-cols-[2fr,1.3fr]">
            {/* Left column: description & meta */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  About this campaign
                </h2>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                  {campaign.summary || "No description has been added yet."}
                </p>
              </div>

              <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </div>
                  <div className="mt-1">{campaign.location || "—"}</div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dates
                  </div>
                  <div className="mt-1">
                    {start}
                    {end ? ` → ${end}` : ""}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project Lead
                  </div>
                  <div className="mt-1">{campaign.lead || "—"}</div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </div>
                  <div className="mt-1">{campaign.status}</div>
                </div>
              </div>
            </div>

            {/* Right column: funding stats & supporters */}
            <div className="space-y-5">
              {/* Funding stats */}
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    Funding Progress
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>{fmtINR(raised)} raised</span>
                  <span>Goal: {fmtINR(campaign.goal)}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Donations
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {donationsCount}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Supporters
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {uniqueDonorsCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent supporters */}
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    Recent supporters
                  </span>
                  <span className="text-xs text-slate-500">
                    {donationsCount === 0
                      ? "No donations yet"
                      : `Showing latest ${campaign.donations.length}`}
                  </span>
                </div>

                {campaign.donations.length === 0 ? (
                  <p className="text-xs text-slate-600">
                    Be the first to support this campaign.
                  </p>
                ) : (
                  <ul className="space-y-2 text-xs text-slate-700">
                    {campaign.donations.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between rounded-lg bg-white px-2 py-1.5 ring-1 ring-slate-200"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {d.donor?.name || "Anonymous"}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {d.donatedAt.toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <span className="font-semibold">
                          {fmtINR(Number(d.amount || 0))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You can later add a Donate CTA section here */}
      </div>
    </div>
  );
}
