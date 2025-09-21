// src/app/admin/donors/page.tsx
"use client";

import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

/* ----------------------------- Types ----------------------------- */
type DonorRow = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  total: number;
  lastDate: string;
  donations: number;
  status: "Active" | "Inactive" | "New";
};

/* --------------------------- Utilities --------------------------- */
function cn(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}
function usd(n: number) {
  try {
    return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

/* ------------------------------ Page ------------------------------ */
export default function DonorsPage() {
  /* ----------------------------- Data ----------------------------- */
  const donors = useMemo<DonorRow[]>(
    () => [
      {
        id: "1",
        name: "Robert Johnson",
        email: "robert@example.com",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        total: 2500,
        lastDate: "Jan 14, 2023",
        donations: 12,
        status: "Active",
      },
      {
        id: "2",
        name: "Emily Chen",
        email: "emily@example.com",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        total: 1250,
        lastDate: "Jan 13, 2023",
        donations: 8,
        status: "Active",
      },
      {
        id: "3",
        name: "Michael Brown",
        email: "michael@example.com",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        total: 5800,
        lastDate: "Jan 12, 2023",
        donations: 15,
        status: "Active",
      },
      {
        id: "4",
        name: "Sarah Williams",
        email: "sarah@example.com",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        total: 450,
        lastDate: "Jan 11, 2023",
        donations: 3,
        status: "New",
      },
      {
        id: "5",
        name: "David Miller",
        email: "david@example.com",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        total: 3200,
        lastDate: "Dec 15, 2022",
        donations: 9,
        status: "Inactive",
      },
    ],
    []
  );

  const stats = useMemo(
    () => ({
      totalDonors: 264,
      active: 198,
      newThisMonth: 42,
      recurring: 86,
    }),
    []
  );

  /* ---------------------------- Search ---------------------------- */
  const [q, setQ] = useState("");
  const filtered = donors.filter((d) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return d.name.toLowerCase().includes(s) || d.email.toLowerCase().includes(s);
  });

  /* ----------------------------- Modal ---------------------------- */
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "",
    status: "",
  });
  const resetForm = () =>
    setForm({ name: "", email: "", phone: "", address: "", type: "", status: "" });

  /* ---------------------------- Charts ---------------------------- */
  const growthRef = useRef<HTMLCanvasElement | null>(null);
  const typeRef = useRef<HTMLCanvasElement | null>(null);
  const topRef = useRef<HTMLCanvasElement | null>(null);
  const statusRef = useRef<HTMLCanvasElement | null>(null);
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
          const el = ref.current;
          if (!el) return;
          try {
            const existing = Chart.getChart?.(el);
            existing?.destroy?.();
          } catch {}
          chartsRef.current[key]?.destroy?.();
          chartsRef.current[key] = new Chart(el, cfg);
        };

        // Donor Growth (line)
        make(
          growthRef,
          {
            type: "line",
            data: {
              labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
              datasets: [
                {
                  label: "New Donors",
                  data: [18,25,20,30,28,35,42,38,45,0,0,0],
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
              plugins: { legend: { display: true, position: "bottom" } },
              scales: {
                y: { beginAtZero: true, grid: { drawBorder: false } },
                x: { grid: { display: false } },
              },
            },
          },
          "growth"
        );

        // Donor Types (doughnut)
        make(
          typeRef,
          {
            type: "doughnut",
            data: {
              labels: ["Individual", "Corporate", "Foundation"],
              datasets: [
                {
                  data: [75, 15, 10],
                  backgroundColor: ["#3498db", "#2ecc71", "#9b59b6"],
                  borderWidth: 1,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
          },
          "types"
        );

        // Top Donors (bar)
        make(
          topRef,
          {
            type: "bar",
            data: {
              labels: ["Robert Johnson", "Michael Brown", "Emily Chen", "Sarah Williams", "David Miller"],
              datasets: [
                {
                  label: "Total Donated ($)",
                  data: [5800, 5200, 4250, 3800, 3200],
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
          "top"
        );

        // Donor Status (pie)
        make(
          statusRef,
          {
            type: "pie",
            data: {
              labels: ["Active", "Inactive", "New"],
              datasets: [
                {
                  data: [198, 42, 24],
                  backgroundColor: ["#2ecc71", "#f39c12", "#3498db"],
                  borderWidth: 1,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
          },
          "status"
        );
      } catch (e) {
        console.error("Chart.js load error:", e);
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
  }, []);

  /* ---------------------------- Render ---------------------------- */
  return (
    <div className="p-5 md:p-6">
      {/* Title + date row (match original layout spacing) */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Donors Management</h2>
        <p className="text-slate-500">Monday, 15 January 2023</p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard color="bg-sky-600" icon="fa-users" value={stats.totalDonors} label="Total Donors" />
        <StatCard color="bg-emerald-600" icon="fa-check-circle" value={stats.active} label="Active Donors" />
        <StatCard color="bg-red-500" icon="fa-gift" value={42} label="New This Month" />
        <StatCard color="bg-amber-500" icon="fa-calendar" value={stats.recurring} label="Recurring Donors" />
      </div>

      {/* Directory header: search + add button */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">Donor Directory</h3>
        <div className="flex items-center gap-3">
          <div className="relative hidden items-center rounded-full bg-slate-100 px-4 py-2 sm:flex">
            <i className="fa-solid fa-search text-slate-500" />
            <input
              className="ml-2 w-64 bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search donors..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-white shadow hover:bg-sky-700"
          >
            <i className="fa-solid fa-plus" /> Add Donor
          </button>
        </div>
      </div>

      {/* Donors table */}
      <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {["Donor", "Total Donated", "Last Donation", "Donations", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center">
                    <img src={d.avatar} alt={d.name} className="mr-3 h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="font-medium text-slate-800">{d.name}</div>
                      <div className="text-xs text-slate-500">{d.email}</div>
                    </div>
                  </div>
                </td>
                <td className="border-b border-slate-200 px-4 py-3 font-semibold text-emerald-600">
                  {usd(d.total)}
                </td>
                <td className="border-b border-slate-200 px-4 py-3 text-slate-600">{d.lastDate}</td>
                <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{d.donations}</td>
                <td className="border-b border-slate-200 px-4 py-3">
                  <StatusPill status={d.status} />
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Viewing donor details: ${d.name}`)}
                      className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1.5 text-sky-600"
                    >
                      <i className="fa-solid fa-eye" /> View
                    </button>
                    <button
                      onClick={() => alert(`Editing donor: ${d.name}`)}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-600"
                    >
                      <i className="fa-solid fa-edit" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${d.name}?`)) {
                          alert(`${d.name} has been deleted.`);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-1.5 text-red-600"
                    >
                      <i className="fa-solid fa-trash" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No donors match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <section className="mt-6">
        <h3 className="mb-4 text-xl font-semibold text-slate-800">Donor Analytics</h3>

        <div className="grid gap-5 md:grid-cols-2">
          <ChartCard title="Donor Growth">
            <canvas ref={growthRef} className="h-[250px] w-full" />
          </ChartCard>
          <ChartCard title="Donor Types">
            <canvas ref={typeRef} className="h-[250px] w-full" />
          </ChartCard>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <ChartCard title="Top Donors">
            <canvas ref={topRef} className="h-[250px] w-full" />
          </ChartCard>
          <ChartCard title="Donor Status Distribution">
            <canvas ref={statusRef} className="h-[250px] w-full" />
          </ChartCard>
        </div>
      </section>

      {/* Add Donor Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              resetForm();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-slate-800">Add New Donor</h3>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="text-2xl leading-none text-slate-500 hover:text-slate-700"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Donor added successfully!");
                setOpen(false);
                resetForm();
              }}
              className="space-y-4"
            >
              <Field
                label="Full Name"
                required
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <Field
                label="Email Address"
                type="email"
                required
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              />
              <Field
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
              <Field
                label="Address"
                value={form.address}
                onChange={(v) => setForm((f) => ({ ...f, address: v }))}
              />
              <Select
                label="Donor Type"
                required
                value={form.type}
                onChange={(v) => setForm((f) => ({ ...f, type: v }))}
                options={[
                  ["", "Select donor type"],
                  ["individual", "Individual"],
                  ["corporate", "Corporate"],
                  ["foundation", "Foundation"],
                ]}
              />
              <Select
                label="Status"
                required
                value={form.status}
                onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                options={[
                  ["", "Select status"],
                  ["active", "Active"],
                  ["inactive", "Inactive"],
                  ["new", "New"],
                ]}
              />

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="rounded-md bg-slate-600 px-3 py-2 text-white hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700">
                  Add Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

function StatusPill({ status }: { status: DonorRow["status"] }) {
  const map: Record<DonorRow["status"], string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Inactive: "bg-amber-100 text-amber-700",
    New: "bg-sky-100 text-sky-700",
  };
  return (
    <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", map[status])}>
      {status}
    </span>
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none ring-sky-200 focus:ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, t]) => (
          <option key={v + t} value={v}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
