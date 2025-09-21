// src/app/admin/volunteers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

/* ----------------------------- Types ----------------------------- */
type Volunteer = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalHours: string; // keep display string to match UI (e.g., "120 hrs")
  lastActivity: string; // "Jan 14, 2023"
  skills: string; // comma separated display string
  status: "Active" | "Inactive" | "New";
};

type EventCard = {
  id: string;
  day: string; // "18"
  month: string; // "Jan"
  title: string;
  place: string;
  time: string;
  participants: string[]; // avatar urls
  extraCount: number;
  status: "Upcoming" | "Ongoing" | "Completed";
};

/* --------------------------- Utilities --------------------------- */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------ Page ----------------------------- */
export default function VolunteersPage() {
  /* ------------------------------ Data ------------------------------ */
  const volunteers = useMemo<Volunteer[]>(
    () => [
      {
        id: "1",
        name: "Robert Johnson",
        email: "robert@example.com",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        totalHours: "120 hrs",
        lastActivity: "Jan 14, 2023",
        skills: "Teaching, Mentoring",
        status: "Active",
      },
      {
        id: "2",
        name: "Emily Chen",
        email: "emily@example.com",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        totalHours: "86 hrs",
        lastActivity: "Jan 13, 2023",
        skills: "Medical, Counseling",
        status: "Active",
      },
      {
        id: "3",
        name: "Michael Brown",
        email: "michael@example.com",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        totalHours: "210 hrs",
        lastActivity: "Jan 12, 2023",
        skills: "Construction, Carpentry",
        status: "Active",
      },
      {
        id: "4",
        name: "Sarah Williams",
        email: "sarah@example.com",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        totalHours: "15 hrs",
        lastActivity: "Jan 11, 2023",
        skills: "Fundraising, Events",
        status: "New",
      },
      {
        id: "5",
        name: "David Miller",
        email: "david@example.com",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        totalHours: "95 hrs",
        lastActivity: "Dec 15, 2022",
        skills: "IT Support, Web Development",
        status: "Inactive",
      },
    ],
    []
  );

  const events = useMemo<EventCard[]>(
    () => [
      {
        id: "e1",
        day: "18",
        month: "Jan",
        title: "Community Cleanup Day",
        place: "Central Park, Downtown",
        time: "9:00 AM - 2:00 PM",
        participants: [
          "https://randomuser.me/api/portraits/men/32.jpg",
          "https://randomuser.me/api/portraits/women/28.jpg",
          "https://randomuser.me/api/portraits/men/22.jpg",
          "https://randomuser.me/api/portraits/women/65.jpg",
        ],
        extraCount: 12,
        status: "Upcoming",
      },
      {
        id: "e2",
        day: "22",
        month: "Jan",
        title: "Food Distribution",
        place: "Community Center",
        time: "10:00 AM - 4:00 PM",
        participants: [
          "https://randomuser.me/api/portraits/women/28.jpg",
          "https://randomuser.me/api/portraits/men/45.jpg",
          "https://randomuser.me/api/portraits/women/65.jpg",
        ],
        extraCount: 8,
        status: "Upcoming",
      },
      {
        id: "e3",
        day: "25",
        month: "Jan",
        title: "Children's Education Program",
        place: "Westside Elementary School",
        time: "3:00 PM - 5:00 PM",
        participants: [
          "https://randomuser.me/api/portraits/men/32.jpg",
          "https://randomuser.me/api/portraits/women/28.jpg",
        ],
        extraCount: 5,
        status: "Upcoming",
      },
    ],
    []
  );

  /* ------------------------------ Search ------------------------------ */
  const [query, setQuery] = useState("");
  const filtered = volunteers.filter((v) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      v.name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.skills.toLowerCase().includes(q)
    );
  });

  /* ------------------------------- Modal ------------------------------- */
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    skills: [] as string[],
    status: "",
  });
  function resetForm() {
    setForm({ name: "", email: "", phone: "", address: "", skills: [], status: "" });
  }

  /* --------------- Mobile sidebar toggle (optional helper) --------------- */
  useEffect(() => {
    // If your layout already handles sidebar/topbar, you can ignore this.
    // This mirrors the original "toggle on small screens" logic by adding a button dynamically.
    const btnId = "volunteers-sidebar-toggle";
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
      const sidebar = document.querySelector(".sidebar");
      const main = document.querySelector(".main-content");
      sidebar?.classList.toggle("collapsed");
      main?.classList.toggle("sidebar-collapsed");
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
      {/* Title + date (keeps spacing like original) */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Volunteers Management</h2>
        <p className="text-slate-500">Monday, 15 January 2023</p>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard color="bg-sky-600" icon="fa-users" value="142" label="Total Volunteers" />
        <StatCard color="bg-emerald-600" icon="fa-check-circle" value="98" label="Active Volunteers" />
        <StatCard color="bg-red-500" icon="fa-user-plus" value="24" label="New This Month" />
        <StatCard color="bg-amber-500" icon="fa-clock" value="1,240" label="Monthly Hours" />
      </div>

      {/* Header row: title + search + add */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">Volunteer Directory</h3>

        <div className="flex items-center gap-3">
          <div className="relative hidden items-center rounded-full bg-slate-100 px-4 py-2 sm:flex">
            <i className="fa-solid fa-search text-slate-500" />
            <input
              className="ml-2 w-64 bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search volunteers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-white shadow hover:bg-sky-700"
          >
            <i className="fa-solid fa-plus" /> Add Volunteer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {["Volunteer", "Total Hours", "Last Activity", "Skills", "Status", "Actions"].map((h) => (
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
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center">
                    <img
                      src={v.avatar}
                      alt={v.name}
                      className="mr-3 h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-slate-800">{v.name}</div>
                      <div className="text-xs text-slate-500">{v.email}</div>
                    </div>
                  </div>
                </td>
                <td className="border-b border-slate-200 px-4 py-3 font-semibold text-sky-600">
                  {v.totalHours}
                </td>
                <td className="border-b border-slate-200 px-4 py-3 text-slate-600">{v.lastActivity}</td>
                <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{v.skills}</td>
                <td className="border-b border-slate-200 px-4 py-3">
                  <StatusPill status={v.status} />
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Viewing volunteer details: ${v.name}`)}
                      className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1.5 text-sky-600"
                    >
                      <i className="fa-solid fa-eye" /> View
                    </button>
                    <button
                      onClick={() => alert(`Editing volunteer: ${v.name}`)}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-600"
                    >
                      <i className="fa-solid fa-edit" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${v.name}?`)) {
                          alert(`${v.name} has been deleted.`);
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
                  No volunteers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upcoming Events */}
      <section className="mt-6">
        <h3 className="mb-4 text-xl font-semibold text-slate-800">Upcoming Events</h3>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <div
              key={e.id}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition will-change-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-[60px] rounded-md bg-sky-600 px-3 py-2 text-center text-white">
                  <div className="text-xl font-bold leading-none">{e.day}</div>
                  <div className="text-xs uppercase">{e.month}</div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    e.status === "Upcoming"
                      ? "bg-sky-100 text-sky-700"
                      : e.status === "Ongoing"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {e.status}
                </span>
              </div>

              <h4 className="text-lg font-semibold text-slate-800">{e.title}</h4>

              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>
                  <i className="fa-solid fa-map-marker-alt mr-2 text-sky-600" />
                  {e.place}
                </p>
                <p>
                  <i className="fa-solid fa-clock mr-2 text-sky-600" />
                  {e.time}
                </p>
              </div>

              <div className="mt-3 flex items-center">
                <div className="mr-2 flex">
                  {e.participants.map((p, idx) => (
                    <img
                      key={p + idx}
                      src={p}
                      alt="Participant"
                      className={cn(
                        "h-8 w-8 rounded-full border-2 border-white object-cover",
                        idx === 0 ? "" : "-ml-2"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">+{e.extraCount} volunteers</span>
              </div>

              <div className="mt-4">
                <JoinButton title={e.title} />
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
              <h3 className="text-lg font-semibold text-slate-800">Add New Volunteer</h3>
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
                alert("Volunteer added successfully!");
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

              <MultiSelect
                label="Skills"
                help="Hold Ctrl/Cmd to select multiple skills"
                value={form.skills}
                onChange={(arr) => setForm((f) => ({ ...f, skills: arr }))}
                options={[
                  ["teaching", "Teaching"],
                  ["medical", "Medical"],
                  ["counseling", "Counseling"],
                  ["construction", "Construction"],
                  ["it", "IT Support"],
                  ["fundraising", "Fundraising"],
                  ["events", "Event Management"],
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
                  Add Volunteer
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

function StatusPill({ status }: { status: Volunteer["status"] }) {
  const map: Record<Volunteer["status"], string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Inactive: "bg-amber-100 text-amber-700",
    New: "bg-sky-100 text-sky-700",
  };
  return <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", map[status])}>{status}</span>;
}

function JoinButton({ title }: { title: string }) {
  const [joined, setJoined] = useState(false);
  return (
    <button
      disabled={joined}
      onClick={() => {
        alert(`You've joined the event: ${title}`);
        setJoined(true);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-white",
        joined ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"
      )}
    >
      <i className="fa-solid fa-plus" />
      {joined ? "Joined" : "Join Event"}
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
