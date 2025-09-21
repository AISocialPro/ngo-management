// src/app/admin/campaigns/page.tsx
"use client";

import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

/* ---------- Safe image with fallback so the photo always shows ---------- */
function CardImage({ src, alt }: { src: string; alt: string }) {
  const [current, setCurrent] = useState(src);
  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      referrerPolicy="no-referrer"
      onError={() =>
        setCurrent(
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60"
        )
      }
      className="block h-full w-full object-cover"
    />
  );
}

type Campaign = {
  title: string;
  img: string;
  status: "active" | "completed" | "planning";
  description: string;
  location: string;
  dates: string;
  lead: string;
  progressPct: number;
  raised: string;
  goal: string;
  stats: { label: string; value: string }[];
  progressColor: string;
};

export default function CampaignsPage() {
  /* ------------------------------ Data ------------------------------ */
  const campaigns = useMemo<Campaign[]>(
    () => [
      {
        title: "Education for All",
        img: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=60",
        status: "active",
        description:
          "Providing quality education to underprivileged children in rural areas through school infrastructure and teacher training.",
        location: "Rural Areas, 5 States",
        dates: "Jan 2023 - Dec 2023",
        lead: "Project Lead: Michael Johnson",
        progressPct: 75,
        raised: "$37,500 raised",
        goal: "Goal: $50,000",
        stats: [
          { label: "Beneficiaries", value: "1,250" },
          { label: "Volunteers", value: "18" },
          { label: "Donors", value: "64" },
        ],
        progressColor: "bg-emerald-500",
      },
      {
        title: "Clean Water Initiative",
        img: "https://images.unsplash.com/photo-1551524164-87a9e3dd0992?auto=format&fit=crop&w=1200&q=60",
        status: "active",
        description:
          "Installing water purification systems in communities with limited access to clean drinking water.",
        location: "Sub-Saharan Africa",
        dates: "Mar 2023 - Feb 2024",
        lead: "Project Lead: Emily Rodriguez",
        progressPct: 45,
        raised: "$45,000 raised",
        goal: "Goal: $100,000",
        stats: [
          { label: "Beneficiaries", value: "3,500" },
          { label: "Volunteers", value: "22" },
          { label: "Donors", value: "87" },
        ],
        progressColor: "bg-sky-500",
      },
      {
        title: "Health & Nutrition",
        img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=60",
        status: "completed",
        description:
          "Providing nutrition supplements and healthcare services to malnourished children in refugee camps.",
        location: "Refugee Camps, Middle East",
        dates: "Jun 2022 - May 2023",
        lead: "Project Lead: David Wilson",
        progressPct: 100,
        raised: "$75,000 raised",
        goal: "Goal: $75,000",
        stats: [
          { label: "Beneficiaries", value: "2,800" },
          { label: "Volunteers", value: "15" },
          { label: "Donors", value: "112" },
        ],
        progressColor: "bg-emerald-500",
      },
    ],
    []
  );

  /* ------------------------------ Charts ------------------------------ */
  const fundingRef = useRef<HTMLCanvasElement | null>(null);
  const categoryRef = useRef<HTMLCanvasElement | null>(null);
  const trendRef = useRef<HTMLCanvasElement | null>(null);
  const regionRef = useRef<HTMLCanvasElement | null>(null);
  const chartsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    let disposed = false;

    const loadChart = async () => {
      try {
        // Dynamic import; nothing runs on the server
        const mod: any = await import("chart.js/auto");
        const Chart: any = mod?.default ?? mod?.Chart;
        if (!Chart) return;

        const make = (
          canvasRef: MutableRefObject<HTMLCanvasElement | null>,
          cfg: any,
          key: string
        ) => {
          if (disposed) return;
          const canvas = canvasRef.current;
          if (!canvas) return;

          // Destroy if already present (HMR / re-renders)
          try {
            const existing = Chart?.getChart ? Chart.getChart(canvas) : null;
            existing?.destroy?.();
          } catch {
            /* ignore */
          }
          chartsRef.current[key]?.destroy?.();

          chartsRef.current[key] = new Chart(canvas, cfg);
        };

        // Funding doughnut
        make(
          fundingRef,
          {
            type: "doughnut",
            data: {
              labels: ["Fully Funded", "Partially Funded", "Not Funded"],
              datasets: [
                {
                  data: [5, 7, 6],
                  backgroundColor: ["#2ecc71", "#3498db", "#e74c3c"],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
            },
          },
          "funding"
        );

        // Category pie
        make(
          categoryRef,
          {
            type: "pie",
            data: {
              labels: ["Education", "Health", "Environment", "Water", "Emergency"],
              datasets: [
                {
                  data: [6, 4, 3, 3, 2],
                  backgroundColor: ["#3498db", "#e74c3c", "#2ecc71", "#9b59b6", "#f39c12"],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
            },
          },
          "category"
        );

        // Trend line
        make(
          trendRef,
          {
            type: "line",
            data: {
              labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
              datasets: [
                {
                  label: "Donations ($)",
                  data: [12500,13800,9800,15700,11200,16800,14200,18900,15600,0,0,0],
                  borderColor: "#3498db",
                  backgroundColor: "rgba(52,152,219,0.1)",
                  borderWidth: 2,
                  fill: true,
                  tension: 0.3,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { drawBorder: false } },
                x: { grid: { display: false } },
              },
            },
          },
          "trend"
        );

        // Region bar
        make(
          regionRef,
          {
            type: "bar",
            data: {
              labels: ["Africa", "Asia", "South America", "Middle East", "Europe"],
              datasets: [
                {
                  label: "People Impacted (Thousands)",
                  data: [3.8, 2.5, 1.2, 0.9, 0.4],
                  backgroundColor: "#2ecc71",
                  borderRadius: 5,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { drawBorder: false } },
                x: { grid: { display: false } },
              },
            },
          },
          "region"
        );
      } catch (err) {
        // If Chart.js fails to load for any reason, do nothing (no crash)
        console.error("Chart.js failed to load on client:", err);
      }
    };

    loadChart();

    return () => {
      disposed = true;
      // Destroy any created charts
      Object.values(chartsRef.current).forEach((c) => {
        try {
          c?.destroy?.();
        } catch {}
      });
      chartsRef.current = {};
    };
  }, []);

  /* ------------------------------ Render ------------------------------ */
  return (
    <div className="space-y-6">
      {/* Header (Topbar/Sidebar come from your layout) */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">
          Campaigns &amp; Projects Management
        </h2>
        <p className="text-slate-500">Monday, 15 January 2023</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard color="bg-sky-500" icon="fa-project-diagram" value="18" label="Total Campaigns" />
        <StatCard color="bg-emerald-500" icon="fa-check-circle" value="12" label="Active Campaigns" />
        <StatCard color="bg-red-500" icon="fa-hand-holding-usd" value="$86.5K" label="Total Funds Raised" />
        <StatCard color="bg-amber-500" icon="fa-hand-holding-heart" value="7,842" label="People Impacted" />
      </div>

      {/* Title + button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">All Campaigns &amp; Projects</h3>
        <button className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-white shadow hover:bg-sky-700">
          <i className="fa-solid fa-plus" /> New Campaign
        </button>
      </div>

      {/* Campaign cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => (
          <div
            key={c.title}
            className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <CardImage src={c.img} alt={c.title} />
              <span
                className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium
                  ${
                    c.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : c.status === "completed"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
              >
                {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
              </span>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-800">{c.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{c.description}</p>

              <div className="mt-3 space-y-2 text-sm">
                <Detail icon="fa-map-marker-alt" text={c.location} />
                <Detail icon="fa-calendar" text={c.dates} />
                <Detail icon="fa-user" text={c.lead} />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Funding Progress</span>
                  <span>{c.progressPct}%</span>
                </div>
                <div className="mt-1 h-2 rounded bg-slate-200">
                  <div
                    className={`h-2 rounded ${c.progressColor}`}
                    style={{ width: `${c.progressPct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{c.raised}</span>
                  <span>{c.goal}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4 text-center">
                {c.stats.map((s) => (
                  <div key={s.label} className="flex-1">
                    <div className="font-bold text-sky-600">{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => alert(`View details for: ${c.title}`)}
                  className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-2 text-sky-600"
                >
                  <i className="fa-solid fa-eye" /> View
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Edit campaign: ${c.title}`)}
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-600"
                  >
                    <i className="fa-solid fa-edit" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${c.title}"?`)) {
                        alert(`Campaign "${c.title}" has been deleted.`);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-red-600"
                  >
                    <i className="fa-solid fa-trash" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <section className="mt-6">
        <h3 className="mb-4 text-xl font-semibold text-slate-800">
          Campaign Analytics
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          <ChartCard title="Campaign Funding Status">
            <canvas ref={fundingRef} className="h-[250px] w-full" />
          </ChartCard>
          <ChartCard title="Campaigns by Category">
            <canvas ref={categoryRef} className="h-[250px] w-full" />
          </ChartCard>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <ChartCard title="Monthly Donations Trend">
            <canvas ref={trendRef} className="h-[250px] w-full" />
          </ChartCard>
          <ChartCard title="Campaign Impact by Region">
            <canvas ref={regionRef} className="h-[250px] w-full" />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------- Small UI helpers ---------------------------- */

function StatCard({
  color,
  icon,
  value,
  label,
}: {
  color: string;
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className={`mr-4 grid h-14 w-14 place-items-center rounded-xl text-white ${color}`}>
        <i className={`fa-solid ${icon} text-xl`} />
      </div>
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function Detail({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center text-slate-600">
      <i className={`fa-solid ${icon} mr-2 w-4 text-sky-600`} />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h4 className="mb-3 text-slate-800">{title}</h4>
      <div className="relative h-[250px] w-full">{children}</div>
    </div>
  );
}
