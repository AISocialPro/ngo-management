"use client";
import LiveDate from "@/components/LiveDate";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
function formatRupees(n: number) {
  try {
    return n.toLocaleString("en-IN", { style: "currency", currency: "INR" });
  } catch {
    return `₹${n.toFixed(2)}`;
  }
}
function safeChartData(chart: any) {
  return {
    labels: Array.isArray(chart?.labels) ? chart.labels : [],
    data: Array.isArray(chart?.data) ? chart.data : [],
  };
}

type Range = "MTD" | "QTD" | "YTD" | "Custom";

export default function ReportsPage() {
  const [range, setRange] = useState<Range>("YTD");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [kpis, setKpis] = useState({
    totalDonations: 0,
    avgDonation: 0,
    activeDonors: 0,
    volunteerHours: 0,
  });

  const [summaryRows, setSummaryRows] = useState<{ metric: string; value: any }[]>([]);
  const [chartsData, setChartsData] = useState({
    donationsTrend: { labels: [] as string[], data: [] as number[] },
    donorGrowth: { labels: [] as string[], data: [] as number[] },
    campaignPerf: { labels: [] as string[], data: [] as number[] },
    donorSeg: { labels: [] as string[], data: [] as number[] },
    statusBreak: { labels: [] as string[], data: [] as number[] },
  });

  async function loadReports() {
    try {
      setErr(null);
      setLoading(true);

      const qs = new URLSearchParams();
      qs.set("range", range);
      if (range === "Custom") {
        if (customFrom) qs.set("from", customFrom);
        if (customTo) qs.set("to", customTo);
      }

      const res = await fetch(`/api/reports?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || `Failed (status ${res.status})`);
      }

      setKpis(json?.data?.kpis || { totalDonations: 0, avgDonation: 0, activeDonors: 0, volunteerHours: 0 });
      setSummaryRows(Array.isArray(json?.data?.summaryRows) ? json.data.summaryRows : []);
      
      const rawCharts = json?.data?.charts || {};
      setChartsData({
        donationsTrend: safeChartData(rawCharts.donationsTrend),
        donorGrowth: safeChartData(rawCharts.donorGrowth),
        campaignPerf: safeChartData(rawCharts.campaignPerf),
        donorSeg: safeChartData(rawCharts.donorSeg),
        statusBreak: safeChartData(rawCharts.statusBreak),
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to load reports");
      setKpis({ totalDonations: 0, avgDonation: 0, activeDonors: 0, volunteerHours: 0 });
      setSummaryRows([]);
      setChartsData({
        donationsTrend: { labels: [], data: [] },
        donorGrowth: { labels: [], data: [] },
        campaignPerf: { labels: [], data: [] },
        donorSeg: { labels: [], data: [] },
        statusBreak: { labels: [], data: [] },
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    const t = setInterval(loadReports, 30000); // ✅ real-time refresh
    return () => clearInterval(t);
  }, [range, customFrom, customTo]);

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

        const make = (ref: MutableRefObject<HTMLCanvasElement | null>, cfg: any, key: string) => {
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

        make(
          donationsTrendRef,
          {
            type: "line",
            data: {
              labels: chartsData.donationsTrend.labels,
              datasets: [
                {
                  label: "Donations",
                  data: chartsData.donationsTrend.data,
                  borderColor: "#3498db",
                  backgroundColor: "rgba(52,152,219,0.1)",
                  borderWidth: 2,
                  fill: true,
                  tension: 0.3,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
          },
          "donationsTrend"
        );

        make(
          donorGrowthRef,
          {
            type: "line",
            data: {
              labels: chartsData.donorGrowth.labels,
              datasets: [
                {
                  label: "New Donors",
                  data: chartsData.donorGrowth.data,
                  borderColor: "#2ecc71",
                  backgroundColor: "rgba(46,204,113,0.12)",
                  borderWidth: 2,
                  fill: true,
                  tension: 0.3,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
          },
          "donorGrowth"
        );

        make(
          campaignPerfRef,
          {
            type: "bar",
            data: {
              labels: chartsData.campaignPerf.labels,
              datasets: [
                {
                  label: "Total Raised",
                  data: chartsData.campaignPerf.data,
                  backgroundColor: "#2ecc71",
                  borderRadius: 6,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
          },
          "campaignPerf"
        );

        make(
          donorSegRef,
          {
            type: "pie",
            data: {
              labels: chartsData.donorSeg.labels,
              datasets: [{ data: chartsData.donorSeg.data, backgroundColor: ["#3498db","#9b59b6","#f39c12"], borderWidth: 1 }],
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
          },
          "donorSeg"
        );

        make(
          statusBreakRef,
          {
            type: "doughnut",
            data: {
              labels: chartsData.statusBreak.labels,
              datasets: [{ data: chartsData.statusBreak.data, backgroundColor: ["#2ecc71","#f39c12","#e74c3c","#64748b"], borderWidth: 1 }],
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
        try { c?.destroy?.(); } catch {}
      });
      chartsRef.current = {};
    };
  }, [chartsData]);

  function exportCSV() {
    const safeRows = Array.isArray(summaryRows) ? summaryRows : [];
    const rows = [["Metric", "Value"], ...safeRows.map((r) => [r.metric, String(r.value)])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports-summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-5 md:p-6">
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

          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-white hover:bg-slate-800">
            <i className="fa-solid fa-file-export" /> Export CSV
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700">
            <i className="fa-solid fa-print" /> Print
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation" />
            <span>{err}</span>
            <button onClick={loadReports} className="ml-auto text-sm underline underline-offset-4">Retry</button>
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard color="bg-sky-600" icon="fa-sack-dollar" value={formatRupees(kpis.totalDonations)} label="Total Donations" />
        <StatCard color="bg-emerald-600" icon="fa-hand-holding-dollar" value={formatRupees(kpis.avgDonation)} label="Avg. Donation" />
        <StatCard color="bg-amber-500" icon="fa-users" value={kpis.activeDonors} label="Active Donors" />
        <StatCard color="bg-purple-600" icon="fa-clock" value={kpis.volunteerHours} label="Volunteer Hours (Range)" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ChartCard title="Donations Trend">
          <canvas ref={donationsTrendRef} className="h-[260px] w-full" />
        </ChartCard>
        <ChartCard title="Donor Growth">
          <canvas ref={donorGrowthRef} className="h-[260px] w-full" />
        </ChartCard>
      </div>

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
              {loading ? (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
              ) : (Array.isArray(summaryRows) ? summaryRows : []).length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-500">No data in this range.</td></tr>
              ) : (
                (Array.isArray(summaryRows) ? summaryRows : []).map((r) => (
                  <tr key={r.metric} className="hover:bg-slate-50">
                    <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{r.metric}</td>
                    <td className="border-b border-slate-200 px-4 py-3 font-medium text-slate-800">
                      {typeof r.value === "number" ? r.metric.toLowerCase().includes("donation") ? formatRupees(r.value) : r.value : String(r.value)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 flex items-center justify-end text-sm text-slate-500">
        <LiveDate className="text-gray-600" />
      </div>
    </div>
  );
}

/* ------------------------- UI Components ------------------------- */
function StatCard({ color, icon, value, label }: { color: string; icon: string; value: string | number; label: string }) {
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
  range: Range;
  onRangeChange: (r: Range) => void;
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
          className={cn("rounded-md px-3 py-2 text-sm", range === r ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
        >
          {r}
        </button>
      ))}
      {range === "Custom" && (
        <div className="ml-2 flex items-center gap-2">
          <input type="date" value={customFrom} onChange={(e) => onCustomFrom(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none" />
          <span className="text-slate-500">to</span>
          <input type="date" value={customTo} onChange={(e) => onCustomTo(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none" />
        </div>
      )}
    </div>
  );
}
