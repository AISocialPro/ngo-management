// src/app/admin/beneficiaries/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

/* ----------------------------- Types ----------------------------- */
type Beneficiary = {
  id: string;
  name: string;
  contact: string;
  avatar: string;
  assistance: string; // display string e.g. "Food, Education"
  lastAssistance: string; // "Jan 14, 2023"
  household: string; // e.g. "4 members"
  status: "Active" | "Inactive" | "New";
};

type ProgramCard = {
  id: string;
  type: string; // badge
  status: "Ongoing" | "Upcoming" | "Completed";
  title: string;
  place: string;
  time: string;
  participants: string[]; // avatar urls
  extraText: string; // e.g. "+45 beneficiaries"
  cta: string; // button label
};

/* --------------------------- Utilities --------------------------- */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------ Page ----------------------------- */
export default function BeneficiariesPage() {
  /* ------------------------------ Data ------------------------------ */
  const beneficiaries = useMemo<Beneficiary[]>(
    () => [
      {
        id: "1",
        name: "Maria Rodriguez",
        contact: "+1 (555) 123-4567",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg",
        assistance: "Food, Education",
        lastAssistance: "Jan 14, 2023",
        household: "4 members",
        status: "Active",
      },
      {
        id: "2",
        name: "James Wilson",
        contact: "+1 (555) 987-6543",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        assistance: "Medical, Housing",
        lastAssistance: "Jan 13, 2023",
        household: "2 members",
        status: "Active",
      },
      {
        id: "3",
        name: "Sophia Chen",
        contact: "+1 (555) 456-7890",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        assistance: "Education",
        lastAssistance: "Jan 12, 2023",
        household: "5 members",
        status: "Active",
      },
      {
        id: "4",
        name: "Robert Kim",
        contact: "+1 (555) 234-5678",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        assistance: "Food",
        lastAssistance: "Jan 11, 2023",
        household: "3 members",
        status: "New",
      },
      {
        id: "5",
        name: "Linda Patel",
        contact: "+1 (555) 876-5432",
        avatar: "https://randomuser.me/api/portraits/women/55.jpg",
        assistance: "Medical",
        lastAssistance: "Dec 15, 2022",
        household: "2 members",
        status: "Inactive",
      },
    ],
    []
  );

  const programs = useMemo<ProgramCard[]>(
    () => [
      {
        id: "p1",
        type: "Food Aid",
        status: "Ongoing",
        title: "Weekly Food Distribution",
        place: "Community Center, Downtown",
        time: "Every Saturday, 10:00 AM - 2:00 PM",
        participants: [
          "https://randomuser.me/api/portraits/women/32.jpg",
          "https://randomuser.me/api/portraits/men/45.jpg",
          "https://randomuser.me/api/portraits/women/68.jpg",
          "https://randomuser.me/api/portraits/men/22.jpg",
        ],
        extraText: "+45 beneficiaries",
        cta: "Enroll Beneficiary",
      },
      {
        id: "p2",
        type: "Education",
        status: "Ongoing",
        title: "After-School Tutoring",
        place: "Westside Elementary School",
        time: "Mon-Fri, 3:00 PM - 5:00 PM",
        participants: [
          "https://randomuser.me/api/portraits/women/68.jpg",
          "https://randomuser.me/api/portraits/men/22.jpg",
          "https://randomuser.me/api/portraits/women/55.jpg",
        ],
        extraText: "+22 beneficiaries",
        cta: "Enroll Beneficiary",
      },
      {
        id: "p3",
        type: "Medical",
        status: "Upcoming",
        title: "Health Check-up Camp",
        place: "Central Health Clinic",
        time: "Jan 25, 2023, 9:00 AM - 4:00 PM",
        participants: [
          "https://randomuser.me/api/portraits/men/45.jpg",
          "https://randomuser.me/api/portraits/women/55.jpg",
        ],
        extraText: "+15 registered",
        cta: "Register Beneficiary",
      },
    ],
    []
  );

  /* ------------------------------ Search ------------------------------ */
  const [query, setQuery] = useState("");
  const filtered = beneficiaries.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.contact.toLowerCase().includes(q) ||
      b.assistance.toLowerCase().includes(q)
    );
  });

  /* ------------------------------- Modal ------------------------------- */
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    address: "",
    household: "",
    assistance: [] as string[],
    status: "",
    notes: "",
  });
  function resetForm() {
    setForm({
      name: "",
      contact: "",
      address: "",
      household: "",
      assistance: [],
      status: "",
      notes: "",
    });
  }

  /* --------------- Mobile sidebar toggle helper (optional) --------------- */
  useEffect(() => {
    const btnId = "beneficiaries-sidebar-toggle";
    if (document.getElementById(btnId)) return;

    const btn = document.createElement("button");
    btn.id = btnId;
    btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    Object.assign(btn.style, {
      position: "fixed",
      top: "15px",
      left: "15px",
      zIndex: "2000",
      background: "#3498db",
      color: "white",
      border: "none",
      borderRadius: "5px",
      padding: "8px 12px",
      cursor: "pointer",
      display: "none",
    });
    document.body.appendChild(btn);

    const toggle = () => {
      document.querySelector(".sidebar")?.classList.toggle("collapsed");
      document.querySelector(".main-content")?.classList.toggle("sidebar-collapsed");
    };
    btn.addEventListener("click", toggle);

    const style = document.createElement("style");
    style.textContent = `
      .sidebar.collapsed{width:70px;overflow:hidden}
      .sidebar.collapsed .sidebar-header h2,.sidebar.collapsed .menu-item span{display:none}
      .sidebar.collapsed .menu-item{justify-content:center;padding:15px}
      .sidebar.collapsed .menu-item i{margin-right:0}
      .main-content.sidebar-collapsed{margin-left:70px}
      @media (max-width: 768px){
        .sidebar.collapsed{transform:translateX(-100%)}
        .main-content.sidebar-collapsed{margin-left:0}
        #${btnId}{display:block !important}
      }
    `;
    document.head.appendChild(style);

    const check = () => {
      const sidebar = document.querySelector(".sidebar");
      const main = document.querySelector(".main-content");
      if (window.innerWidth <= 768) {
        sidebar?.classList.add("collapsed");
        main?.classList.add("sidebar-collapsed");
        btn.style.display = "block";
      } else {
        sidebar?.classList.remove("collapsed");
        main?.classList.remove("sidebar-collapsed");
        btn.style.display = "none";
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("resize", check);
      btn.remove();
      style.remove();
    };
  }, []);

  /* ------------------------------- Render ------------------------------- */
  return (
    <div className="p-5 md:p-6">
      {/* Title + date */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Beneficiaries Management</h2>
        <p className="text-slate-500">Monday, 15 January 2023</p>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard color="bg-sky-600" icon="fa-users" value="245" label="Total Beneficiaries" />
        <StatCard color="bg-emerald-600" icon="fa-home" value="120" label="Households Served" />
        <StatCard color="bg-red-500" icon="fa-utensils" value="85" label="Food Assistance" />
        <StatCard color="bg-amber-500" icon="fa-graduation-cap" value="64" label="Education Support" />
      </div>

      {/* Header with search + add */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">Beneficiary Directory</h3>

        <div className="flex items-center gap-3">
          <div className="relative hidden items-center rounded-full bg-slate-100 px-4 py-2 sm:flex">
            <i className="fa-solid fa-search text-slate-500" />
            <input
              className="ml-2 w-64 bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search beneficiaries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-white shadow hover:bg-sky-700"
          >
            <i className="fa-solid fa-plus" /> Add Beneficiary
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {["Beneficiary", "Assistance Type", "Last Assistance", "Household Size", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center">
                    <img
                      src={b.avatar}
                      alt={b.name}
                      className="mr-3 h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-slate-800">{b.name}</div>
                      <div className="text-xs text-slate-500">{b.contact}</div>
                    </div>
                  </div>
                </td>
                <td className="border-b border-slate-200 px-4 py-3 text-sky-700 font-medium">{b.assistance}</td>
                <td className="border-b border-slate-200 px-4 py-3 text-slate-600">{b.lastAssistance}</td>
                <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{b.household}</td>
                <td className="border-b border-slate-200 px-4 py-3">
                  <StatusPill status={b.status} />
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Viewing beneficiary details: ${b.name}`)}
                      className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1.5 text-sky-600"
                    >
                      <i className="fa-solid fa-eye" /> View
                    </button>
                    <button
                      onClick={() => alert(`Editing beneficiary: ${b.name}`)}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-600"
                    >
                      <i className="fa-solid fa-edit" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${b.name} from beneficiaries?`)) {
                          alert(`${b.name} has been removed.`);
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
                  No beneficiaries match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Programs */}
      <section className="mt-6">
        <h3 className="mb-4 text-xl font-semibold text-slate-800">Assistance Programs</h3>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <div
              key={p.id}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition will-change-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-[80px] rounded-md bg-sky-600 px-3 py-2 text-center text-white">{p.type}</div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    p.status === "Ongoing"
                      ? "bg-emerald-100 text-emerald-700"
                      : p.status === "Upcoming"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {p.status}
                </span>
              </div>

              <h4 className="text-lg font-semibold text-slate-800">{p.title}</h4>

              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>
                  <i className="fa-solid fa-map-marker-alt mr-2 text-sky-600" />
                  {p.place}
                </p>
                <p>
                  <i className="fa-solid fa-clock mr-2 text-sky-600" />
                  {p.time}
                </p>
              </div>

              <div className="mt-3 flex items-center">
                <div className="mr-2 flex">
                  {p.participants.map((url, idx) => (
                    <img
                      key={url + idx}
                      src={url}
                      alt="Beneficiary"
                      className={cn(
                        "h-8 w-8 rounded-full border-2 border-white object-cover",
                        idx === 0 ? "" : "-ml-2"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">{p.extraText}</span>
              </div>

              <div className="mt-4">
                <EnrollButton label={p.cta} programTitle={p.title} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
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
              <h3 className="text-lg font-semibold text-slate-800">Add New Beneficiary</h3>
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
                alert("Beneficiary added successfully!");
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
                label="Contact Information"
                required
                value={form.contact}
                onChange={(v) => setForm((f) => ({ ...f, contact: v }))}
              />
              <Field
                label="Address"
                value={form.address}
                onChange={(v) => setForm((f) => ({ ...f, address: v }))}
              />
              <Field
                label="Household Size"
                type="number"
                value={form.household}
                onChange={(v) => setForm((f) => ({ ...f, household: v }))}
              />

              <MultiSelect
                label="Assistance Type"
                help="Hold Ctrl/Cmd to select multiple types"
                value={form.assistance}
                onChange={(arr) => setForm((f) => ({ ...f, assistance: arr }))}
                options={[
                  ["food", "Food Assistance"],
                  ["education", "Education Support"],
                  ["medical", "Medical Assistance"],
                  ["housing", "Housing Support"],
                  ["employment", "Employment Aid"],
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

              <TextArea
                label="Additional Notes"
                value={form.notes}
                onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
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
                  Add Beneficiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------- Small UI Pieces -------------------------- */

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

function StatusPill({ status }: { status: Beneficiary["status"] }) {
  const map: Record<Beneficiary["status"], string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Inactive: "bg-amber-100 text-amber-700",
    New: "bg-sky-100 text-sky-700",
  };
  return <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", map[status])}>{status}</span>;
}

function EnrollButton({ label, programTitle }: { label: string; programTitle: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      disabled={done}
      onClick={() => {
        alert(`${label}: ${programTitle}`);
        setDone(true);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-white",
        done ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"
      )}
    >
      <i className="fa-solid fa-user-plus" />
      {done ? "Done" : label}
    </button>
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

function MultiSelect({
  label,
  value,
  onChange,
  options,
  help,
}: {
  label: string;
  value: string[];
  onChange: (arr: string[]) => void;
  options: [string, string][];
  help?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        multiple
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none ring-sky-200 focus:ring"
        value={value}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
          onChange(selected);
        }}
      >
        {options.map(([v, t]) => (
          <option key={v + t} value={v}>
            {t}
          </option>
        ))}
      </select>
      {help ? <small className="text-slate-500">{help}</small> : null}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        rows={3}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Any special requirements or notes"
      />
    </div>
  );
}
