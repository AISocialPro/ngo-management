// src/app/admin/reports/page.tsx
"use client";

import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

/* ----------------------------- Helpers ----------------------------- */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
function formatUSD(n: number) {
  try {
    return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

/* ------------------------------ Page ------------------------------- */
export default function ReportsPage() {
  /* --------------------------- Filters/Data --------------------------- */
  const [range, setRange] = useState<"MTD" | "QTD" | "YTD" | "Custom">("YTD");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Example aggregated KPIs (mirror your style)
  const kpis = useMemo(
    () => ({
      totalDonations: 86500,
      avgDonation: 245,
      activeDonors: 198,
      volunteerHours: 1240,
    }),
    []
  );

  // Flat summary rows (for CSV export / quick table)
  const summaryRows = useMemo(
    () => [
      { metric: "Total Donations", value: formatUSD(86500) },
      { metric: "Average Donation", value: formatUSD(245) },
      { metric: "Active Donors", value: "198" },
      { metric: "Recurring Donors", value: "86" },
      { metric: "Volunteer Hours (Month)", value: "1,240" },
      { metric: "Top Campaign", value: "Education for All" },
    ],
    []
  );

  /* ------------------------------ Charts ------------------------------ */
  const donationsTrendRef = useRef<HTMLCanvasElement | null>(null);
  const donorGrowthRef = useRef<HTMLCanvasElement | null>(null);
  const campaignPerfRef = useRef<HTMLCanvasElement | null>(null);
  const donorSegRef = useRef<HTMLCanvasElement | null>(null);
  const statusBreakRef = useRef<HTMLCanvasElement | null>(null);
  const chartsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const mod: any = await import("chart.js/auto");
        const Chart: any = mod?.default ?? mod?.Chart;
        if (!Chart) return;

        const make = (
          ref: MutableRefObject<HTMLCanvasElement | null>,
          cfg: any,
          key: string
        ) => {
          if (disposed) return;
          const canvas = ref.current;
          if (!canvas) return;
          try {
            const existing = Chart.getChart?.(canvas);
            existing?.destroy?.();
          } catch {}
          chartsRef.current[key]?.destroy?.();
          chartsRef.current[key] = new Chart(canvas, cfg);
        };

        // Donations Trend (line)
        make(
          donationsTrendRef,
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
          "donationsTrend"
        );

        // Donor Growth (line)
        make(
          donorGrowthRef,
          {
            type: "line",
            data: {
              labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
              datasets: [
                {
                  label: "New Donors",
                  data: [18,25,20,30,28,35,42,38,45,0,0,0],
                  borderColor: "#2ecc71",
                  backgroundColor: "rgba(46,204,113,0.12)",
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
          "donorGrowth"
        );

        // Campaign Performance (bar)
        make(
          campaignPerfRef,
          {
            type: "bar",
            data: {
              labels: ["Education","Clean Water","Health","Environment","Emergency"],
              datasets: [
                {
                  label: "Total Raised ($)",
                  data: [28500,24500,17500,9500,6500],
                  backgroundColor: "#2ecc71",
                  borderRadius: 6,
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
          "campaignPerf"
        );

        // Donor Segmentation (pie)
        make(
          donorSegRef,
          {
            type: "pie",
            data: {
              labels: ["Individual","Corporate","Foundation/CSR"],
              datasets: [
                {
                  data: [75,15,10],
                  backgroundColor: ["#3498db","#9b59b6","#f39c12"],
                  borderWidth: 1,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
          },
          "donorSeg"
        );

        // Donation Status (doughnut)
        make(
          statusBreakRef,
          {
            type: "doughnut",
            data: {
              labels: ["Completed","Pending","Failed"],
              datasets: [
                {
                  data: [342,18,12],
                  backgroundColor: ["#2ecc71","#f39c12","#e74c3c"],
                  borderWidth: 1,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
          },
          "statusBreak"
        );
      } catch (e) {
        console.error("Chart.js failed to load:", e);
      }
    })();

    return () => {
      disposed = true;
      Object.values(chartsRef.current).forEach((c) => {
        try {
          c?.destroy?.();
        } catch {}
      });
      chartsRef.current = {};
    };
  }, [range, customFrom, customTo]);

  /* ------------------------------ Export ------------------------------ */
  function exportCSV() {
    const rows = [["Metric", "Value"], ...summaryRows.map((r) => [r.metric, r.value])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports-summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ------------------------------ Render ------------------------------ */
  return (
    <div className="p-5 md:p-6">
      {/* Title + quick actions (keeps your top spacing/layout) */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>

        <div className="flex flex-wrap items-center gap-2">
          <RangePicker
            range={range}
            onRangeChange={setRange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFrom={setCustomFrom}
            onCustomTo={setCustomTo}
          />

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-white hover:bg-slate-800"
          >
            <i className="fa-solid fa-file-export" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700"
          >
            <i className="fa-solid fa-print" /> Print
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard color="bg-sky-600" icon="fa-sack-dollar" value={formatUSD(kpis.totalDonations)} label="Total Donations" />
        <StatCard color="bg-emerald-600" icon="fa-hand-holding-dollar" value={formatUSD(kpis.avgDonation)} label="Avg. Donation" />
        <StatCard color="bg-amber-500" icon="fa-users" value={kpis.activeDonors} label="Active Donors" />
        <StatCard color="bg-purple-600" icon="fa-clock" value={kpis.volunteerHours} label="Volunteer Hours (Month)" />
      </div>

      {/* Charts: top row */}
      <div className="grid gap-5 md:grid-cols-2">
        <ChartCard title="Donations Trend">
          <canvas ref={donationsTrendRef} className="h-[260px] w-full" />
        </ChartCard>
        <ChartCard title="Donor Growth">
          <canvas ref={donorGrowthRef} className="h-[260px] w-full" />
        </ChartCard>
      </div>

      {/* Charts: bottom row */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Campaign Performance">
          <canvas ref={campaignPerfRef} className="h-[260px] w-full" />
        </ChartCard>
        <ChartCard title="Donor Segmentation">
          <canvas ref={donorSegRef} className="h-[260px] w-full" />
        </ChartCard>
        <ChartCard title="Donation Status Breakdown">
          <canvas ref={statusBreakRef} className="h-[260px] w-full" />
        </ChartCard>
      </div>

      {/* Summary table (simple, exportable) */}
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-semibold text-slate-800">Summary</h3>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {["Metric", "Value"].map((h) => (
                  <th key={h} className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((r) => (
                <tr key={r.metric} className="hover:bg-slate-50">
                  <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{r.metric}</td>
                  <td className="border-b border-slate-200 px-4 py-3 font-medium text-slate-800">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ------------------------- Small UI Components ------------------------- */
function StatCard({
  color,
  icon,
  value,
  label,
}: {
  color: string;
  icon: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className={cn("mr-4 grid h-14 w-14 place-items-center rounded-xl text-white", color)}>
        <i className={cn("fa-solid", icon, "text-xl")} />
      </div>
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h4 className="mb-3 text-slate-800">{title}</h4>
      <div className="relative h-[260px] w-full">{children}</div>
    </div>
  );
}

function RangePicker({
  range,
  onRangeChange,
  customFrom,
  customTo,
  onCustomFrom,
  onCustomTo,
}: {
  range: "MTD" | "QTD" | "YTD" | "Custom";
  onRangeChange: (r: "MTD" | "QTD" | "YTD" | "Custom") => void;
  customFrom: string;
  customTo: string;
  onCustomFrom: (v: string) => void;
  onCustomTo: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200">
      {(["MTD", "QTD", "YTD", "Custom"] as const).map((r) => (
        <button
          key={r}
          onClick={() => onRangeChange(r)}
          className={cn(
            "rounded-md px-3 py-2 text-sm",
            range === r ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
        >
          {r}
        </button>
      ))}
      {range === "Custom" && (
        <div className="ml-2 flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomFrom(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomTo(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none"
          />
        </div>
      )}
    </div>
  );
}
