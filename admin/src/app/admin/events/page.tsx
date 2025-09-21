"use client";

import { useMemo, useState } from "react";

/* ----------------------------- Types ----------------------------- */
type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
type EventType = "fundraiser" | "volunteer" | "community" | "educational" | "other";

type EventItem = {
  id: string;
  name: string;
  location: string;
  img: string;
  date: string; // e.g., "Jan 20, 2023"
  time: string; // e.g., "6:00 PM - 11:00 PM"
  participants: string; // e.g., "120 registered"
  status: EventStatus;
  type: EventType;
};

/* --------------------------- Helpers ---------------------------- */
function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ----------------------------- Page ------------------------------ */
export default function EventsPage() {
  /* ----------------------------- Data ----------------------------- */
  const events = useMemo<EventItem[]>(
    () => [
      {
        id: "1",
        name: "Annual Fundraiser Gala",
        location: "Grand Hotel Ballroom / Downtown Center",
        img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=100&q=80",
        date: "Jan 20, 2023",
        time: "6:00 PM - 11:00 PM",
        participants: "120 registered",
        status: "Upcoming",
        type: "fundraiser",
      },
      {
        id: "2",
        name: "Community Cleanup Day",
        location: "Riverside Park",
        img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=100&q=80",
        date: "Jan 22, 2023",
        time: "9:00 AM - 12:00 PM",
        participants: "45 volunteers",
        status: "Upcoming",
        type: "volunteer",
      },
      {
        id: "3",
        name: "Educational Workshop",
        location: "Westside Community Center",
        img: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=100&q=80",
        date: "Jan 18, 2023",
        time: "2:00 PM - 4:00 PM",
        participants: "68 registered",
        status: "Ongoing",
        type: "educational",
      },
      {
        id: "4",
        name: "Volunteer Appreciation Night",
        location: "NGO Headquarters / Main Office",
        img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=100&q=80",
        date: "Jan 15, 2023",
        time: "5:30 PM - 8:00 PM",
        participants: "35 attended",
        status: "Completed",
        type: "volunteer",
      },
      {
        id: "5",
        name: "Food Drive Campaign",
        location: "Various Locations / Citywide",
        img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=100&q=80",
        date: "Jan 10, 2023",
        time: "All Day",
        participants: "22 volunteers",
        status: "Completed",
        type: "community",
      },
    ],
    []
  );

  /* ---------------------------- Search ---------------------------- */
  const [query, setQuery] = useState("");
  const filtered = events.filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      e.name.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.status.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q)
    );
  });

  /* ----------------------------- Modal ---------------------------- */
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    start: "",
    end: "",
    location: "",
    type: "",
    expected: "",
    volunteers: "",
    budget: "",
  });

  const resetForm = () =>
    setForm({
      name: "",
      description: "",
      date: "",
      start: "",
      end: "",
      location: "",
      type: "",
      expected: "",
      volunteers: "",
      budget: "",
    });

  /* ---------------------------- Render ---------------------------- */
  return (
    <div className="p-5 md:p-6">
      {/* Title + date */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Events Management</h2>
        <p className="text-slate-500">Monday, 15 January 2023</p>
      </div>

      {/* Stats cards (values mirror your HTML) */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard color="bg-sky-600" icon="fa-calendar-check" value="18" label="Total Events" />
        <StatCard color="bg-emerald-600" icon="fa-users" value="324" label="Participants" />
        <StatCard color="bg-red-500" icon="fa-ticket-alt" value="$2,540" label="Funds Raised" />
        <StatCard color="bg-amber-500" icon="fa-hand-holding-heart" value="45" label="Volunteers" />
      </div>

      {/* Header with search + create event */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">Upcoming Events</h3>

        <div className="flex items-center gap-3">
          <div className="relative hidden items-center rounded-full bg-slate-100 px-4 py-2 sm:flex">
            <i className="fa-solid fa-search text-slate-500" />
            <input
              className="ml-2 w-64 bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-white shadow hover:bg-sky-700"
          >
            <i className="fa-solid fa-plus" /> Create Event
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {["Event", "Date & Time", "Location", "Participants", "Status", "Actions"].map((h) => (
                <th key={h} className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center">
                    <img src={e.img} alt={e.name} className="mr-3 h-10 w-16 rounded-md object-cover" />
                    <div>
                      <div className="font-medium text-slate-800">{e.name}</div>
                      <div className="text-xs text-slate-500">{e.location}</div>
                    </div>
                  </div>
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  <div className="font-semibold text-sky-600">{e.date}</div>
                  <div className="text-slate-600">{e.time}</div>
                </td>
                <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{e.location.split("/")[0]}</td>
                <td className="border-b border-slate-200 px-4 py-3 font-medium text-slate-800">{e.participants}</td>
                <td className="border-b border-slate-200 px-4 py-3">
                  <StatusPill status={e.status} />
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Viewing event:\n${e.name}\n${e.date} • ${e.time}`)}
                      className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1.5 text-sky-600"
                    >
                      <i className="fa-solid fa-eye" /> View
                    </button>
                    <button
                      onClick={() => alert(`Editing event: ${e.name}`)}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-600"
                    >
                      <i className="fa-solid fa-edit" /> Edit
                    </button>
                    <button
                      onClick={() => confirm(`Delete ${e.name}?`) && alert("Deleted (demo)")}
                      className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-3 py-1.5 text-rose-600"
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
                  No events match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Calendar (static month grid to match your UI) */}
      <section className="calendar-section">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-800">Event Calendar</h3>
          <div className="flex gap-2">
            <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">Month</button>
            <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">Week</button>
            <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">Day</button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-slate-800">January 2023</h4>
            <div className="flex gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white">
                <i className="fa-solid fa-chevron-left" />
              </button>
              <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm">Today</button>
              <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white">
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-center font-semibold text-slate-700">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid – mirrors your HTML (static sample) */}
          <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
            {[
              // prev month
              ["25", true],
              ["26", true],
              ["27", true],
              ["28", true],
              ["29", true],
              ["30", true],
              ["31", true],
              // week 2
              ["1"],
              ["2"],
              ["3"],
              ["4"],
              ["5"],
              ["6"],
              ["7"],
              // week 3
              ["8"],
              ["9"],
              ["10", false, "Food Drive", "community"],
              ["11"],
              ["12"],
              ["13"],
              ["14"],
              // week 4
              ["15", false, "Volunteer Night", "volunteer", "today"],
              ["16"],
              ["17"],
              ["18", false, "Workshop", "community"],
              ["19"],
              ["20", false, "Fundraiser Gala", "fundraiser"],
              ["21"],
              // week 5
              ["22", false, "Cleanup Day", "volunteer"],
              ["23"],
              ["24"],
              ["25"],
              ["26"],
              ["27"],
              ["28"],
              // week 6
              ["29"],
              ["30"],
              ["31"],
              ["1", true],
              ["2", true],
              ["3", true],
              ["4", true],
            ].map(([n, other, label, kind, todayFlag], idx) => (
              <div
                key={idx}
                className={cn(
                  "h-20 rounded border border-slate-200 p-1",
                  other ? "text-slate-300" : "text-slate-700",
                  todayFlag === "today" && "ring-2 ring-sky-500"
                )}
              >
                <div
                  className={cn(
                    "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    todayFlag === "today" ? "bg-sky-600 font-semibold text-white" : ""
                  )}
                >
                  {n as string}
                </div>
                {label && (
                  <div
                    className={cn(
                      "truncate rounded px-1 text-[11px]",
                      kind === "fundraiser" && "bg-sky-100 text-sky-700",
                      kind === "volunteer" && "bg-emerald-100 text-emerald-700",
                      kind === "community" && "bg-amber-100 text-amber-700"
                    )}
                    title={label as string}
                  >
                    {label as string}
                  </div>
                )}
              </div>
            ))}
          </div>
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-slate-800">Create New Event</h3>
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
                alert("Event created successfully! (demo)");
                setOpen(false);
                resetForm();
              }}
              className="space-y-4"
            >
              <Field label="Event Name" required value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
              <TextArea
                label="Event Description"
                required
                value={form.description}
                onChange={(v) => setForm((f) => ({ ...f, description: v }))}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(v) => setForm((f) => ({ ...f, date: v }))}
                  min={new Date().toISOString().split("T")[0]}
                />
                <Field
                  label="Start Time"
                  type="time"
                  required
                  value={form.start}
                  onChange={(v) => setForm((f) => ({ ...f, start: v }))}
                />
                <Field
                  label="End Time"
                  type="time"
                  required
                  value={form.end}
                  onChange={(v) => setForm((f) => ({ ...f, end: v }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Location"
                  required
                  value={form.location}
                  onChange={(v) => setForm((f) => ({ ...f, location: v }))}
                />
                <Select
                  label="Event Type"
                  required
                  value={form.type}
                  onChange={(v) => setForm((f) => ({ ...f, type: v }))}
                  options={[
                    ["", "Select event type"],
                    ["fundraiser", "Fundraiser"],
                    ["volunteer", "Volunteer Activity"],
                    ["community", "Community Outreach"],
                    ["educational", "Educational Workshop"],
                    ["other", "Other"],
                  ]}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Expected Participants"
                  type="number"
                  value={form.expected}
                  onChange={(v) => setForm((f) => ({ ...f, expected: v }))}
                />
                <Field
                  label="Volunteers Needed"
                  type="number"
                  value={form.volunteers}
                  onChange={(v) => setForm((f) => ({ ...f, volunteers: v }))}
                />
              </div>

              <Field
                label="Budget (optional)"
                type="number"
                value={form.budget}
                onChange={(v) => setForm((f) => ({ ...f, budget: v }))}
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
                  Create Event
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

function StatusPill({ status }: { status: EventStatus }) {
  const map: Record<EventStatus, string> = {
    Upcoming: "bg-sky-100 text-sky-700",
    Ongoing: "bg-emerald-100 text-emerald-700",
    Completed: "bg-slate-100 text-slate-700",
    Cancelled: "bg-rose-100 text-rose-700",
  };
  return <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", map[status])}>{status}</span>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        min={min}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        rows={3}
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
