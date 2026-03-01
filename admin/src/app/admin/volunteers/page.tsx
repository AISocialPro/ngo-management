"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import LiveDate from "@/components/LiveDate";

/* ------------------------------------------------------ */
/*                        TYPES                           */
/* ------------------------------------------------------ */

type Volunteer = {
  id: string;
  ngoId?: string;
  branchId?: string | null;

  name: string;
  gender?: string | null;
  dob?: string | null;

  phone?: string | null;
  email?: string | null;
  address?: string | null;

  avatar?: string | null;

  volunteerType?: string | null;
  skills: string[];
  areaOfInterest?: string | null;
  availability?: string | null;

  emergencyName?: string | null;
  emergencyPhone?: string | null;

  joiningDate?: string | null;
  status: string;
  totalHours: number;
  lastActivity?: string | null;

  notes?: string | null;
  badges?: string[];
};

type Stats = {
  total: number;
  active: number;
  newThisMonth: number;
  totalHours: number;
};

/* Normalize Prisma Enum → UI Label */
function normalizeStatus(status?: string): "New" | "Active" | "Inactive" {
  if (!status) return "New";
  const s = status.toUpperCase();
  if (s === "ACTIVE") return "Active";
  if (s === "INACTIVE") return "Inactive";
  return "New";
}

/* ------------------------------------------------------ */
/*                 MAIN COMPONENT START                   */
/* ------------------------------------------------------ */

export default function VolunteersDashboardPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filtered, setFiltered] = useState<Volunteer[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewDrawer, setShowViewDrawer] = useState(false);
  const [activeVolunteer, setActiveVolunteer] =
    useState<Volunteer | null>(null);

  const defaultSkills = [
    "Communication",
    "Leadership",
    "Teamwork",
    "Fundraising",
    "Management",
    "Teaching",
    "Training",
    "Event Management",
    "Public Speaking",
    "First Aid",
    "Computer Skills",
    "React",
    "JavaScript",
    "Node.js",
    "Photography",
    "Editing",
    "Design",
  ];

  const [skillSuggestions, setSkillSuggestions] = useState<string[]>(
    defaultSkills
  );

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    avatar: "",
    volunteerType: "",
    skills: [] as string[],
    areaOfInterest: "",
    availability: "",
    emergencyName: "",
    emergencyPhone: "",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "New",
    totalHours: 0,
    lastActivity: "",
    notes: "",
  });

  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    newThisMonth: 0,
    totalHours: 0,
  });

  useEffect(() => {
    reloadAll();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/volunteers/summary", {
        cache: "no-store",
      });
      if (res.ok) {
        setStats(await res.json());
        return;
      }
    } catch {
      // ignore
    }
    setStats({ total: 0, active: 0, newThisMonth: 0, totalHours: 0 });
  };

  const loadVolunteers = async () => {
    try {
      const res = await fetch("/api/volunteers", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch volunteers");

      const json = await res.json();
      const list: Volunteer[] = json?.volunteers ?? [];

      setVolunteers(list);
      setFiltered(list);

      // upgrade skills suggestions from DB
      const extracted = list
        .flatMap((v) => v.skills || [])
        .filter((s, i, arr) => s && arr.indexOf(s) === i);

      if (extracted.length >= 8) setSkillSuggestions(extracted);
    } catch (err) {
      console.error("Volunteer Load Error:", err);
    }
  };

  const reloadAll = async () => {
    await Promise.all([loadVolunteers(), loadStats()]);
  };

  /* Search + Filter */
  useEffect(() => {
    let temp = [...volunteers];

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      temp = temp.filter(
        (v) =>
          v.name.toLowerCase().includes(s) ||
          (v.email || "").toLowerCase().includes(s) ||
          (v.phone || "").includes(s)
      );
    }

    if (filterStatus !== "All") {
      temp = temp.filter(
        (v) => normalizeStatus(v.status) === filterStatus
      );
    }

    setFiltered(temp);
    setCurrentPage(1);
  }, [search, filterStatus, volunteers]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedVolunteers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* Bulk Delete */
  const bulkDelete = async () => {
    if (selected.length === 0) {
      Swal.fire("Error", "No volunteers selected", "error");
      return;
    }

    const confirm = await Swal.fire({
      title: "Delete selected volunteers?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    await Promise.all(
      selected.map((id) => fetch(`/api/volunteers/${id}`, { method: "DELETE" }))
    );

    Swal.fire("Deleted!", "Selected volunteers removed.", "success");
    setSelected([]);
    await reloadAll();
  };

  /* Single Delete */
  const deleteVolunteer = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete this volunteer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    const res = await fetch(`/api/volunteers/${id}`, { method: "DELETE" });

    if (!res.ok) {
      Swal.fire("Error", "Failed to delete volunteer", "error");
      return;
    }

    Swal.fire("Deleted!", "Volunteer removed successfully", "success");
    await reloadAll();
  };

  /* Bulk Email */
  const bulkEmail = () => {
    if (selected.length === 0) {
      Swal.fire("No selection", "Choose volunteers first", "info");
      return;
    }

    const emails = volunteers
      .filter((v) => selected.includes(v.id))
      .map((v) => v.email)
      .filter(Boolean)
      .join(";");

    if (!emails) {
      Swal.fire("No emails", "Selected volunteers have no email IDs", "info");
      return;
    }

    window.location.href = `mailto:${emails}`;
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

  const toggleAll = () =>
    selected.length === filtered.length && filtered.length > 0
      ? setSelected([])
      : setSelected(filtered.map((v) => v.id));

  /* ------------------------------------------------------------ */
  /*                           RENDER UI                          */
  /* ------------------------------------------------------------ */

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50 px-4 py-6 md:px-8 md:py-8">
        {/* TOP HERO STRIP */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-500 text-white px-6 py-6 md:px-10 md:py-7 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Volunteer Command Center
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
                Volunteers Management
              </h1>
              <p className="mt-1 text-sm md:text-base text-sky-100/90 max-w-xl">
                Track, nurture, and celebrate every volunteer across all your
                NGOs and branches in one beautiful dashboard.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <LiveDate className="text-sm md:text-base text-sky-100 font-medium" />
              <div className="flex gap-2 text-[11px] md:text-xs text-sky-100/90">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Live Sync
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 backdrop-blur">
                  <i className="fa-solid fa-shield-heart" />
                  Volunteer-first
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon="fa-users"
            color="from-sky-500 to-sky-600"
            label="Total Volunteers"
            pill="Overall"
            value={stats.total}
          />
          <SummaryCard
            icon="fa-user-check"
            color="from-emerald-500 to-emerald-600"
            label="Active Volunteers"
            pill="Currently engaged"
            value={stats.active}
          />
          <SummaryCard
            icon="fa-user-plus"
            color="from-amber-400 to-orange-500"
            label="New This Month"
            pill="Fresh signups"
            value={stats.newThisMonth}
          />
          <SummaryCard
            icon="fa-clock"
            color="from-indigo-500 to-purple-500"
            label="Total Hours"
            pill="Logged time"
            value={`${stats.totalHours} hrs`}
          />
        </div>

        {/* SECTION HEADER + ACTIONS */}
        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 flex items-center gap-2">
              Volunteers
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                {filtered.length} visible
              </span>
            </h2>
            <p className="text-sm text-slate-500">
              Search by name, email or phone. Filter by status, then take
              bulk actions in one click.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-sky-100 transition"
              onClick={bulkEmail}
            >
              <i className="fa-solid fa-envelope-open-text" />
              Bulk Email
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-100 transition"
              onClick={bulkDelete}
            >
              <i className="fa-solid fa-trash-can" />
              Bulk Delete
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-110 transition"
              onClick={() => {
                setFormData({
                  id: "",
                  name: "",
                  gender: "",
                  dob: "",
                  phone: "",
                  email: "",
                  address: "",
                  avatar: "",
                  volunteerType: "",
                  skills: [],
                  areaOfInterest: "",
                  availability: "",
                  emergencyName: "",
                  emergencyPhone: "",
                  joiningDate: new Date().toISOString().split("T")[0],
                  status: "New",
                  totalHours: 0,
                  lastActivity: "",
                  notes: "",
                });
                setShowAddModal(true);
              }}
            >
              <i className="fa-solid fa-user-plus" />
              Add Volunteer
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mt-4 rounded-2xl bg-white/80 backdrop-blur border border-slate-100 shadow-md px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative w-full md:max-w-sm">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search volunteers by name, email, or phone..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 hidden md:flex">
              
              
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-6">
         

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/90 backdrop-blur shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selected.length === filtered.length &&
                          filtered.length > 0
                        }
                        onChange={toggleAll}
                      />
                    </th>
                    <th className="p-4 text-left">Volunteer</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Phone</th>
                    <th className="p-4 text-left">Skills</th>
                    <th className="p-4 text-left">Hours</th>
                    <th className="p-4 text-left">Last Activity</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedVolunteers.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-slate-100/80 last:border-b-0 hover:bg-slate-50/60 transition"
                    >
                      <td className="p-4 align-middle">
                        <input
                          type="checkbox"
                          checked={selected.includes(v.id)}
                          onChange={() => toggleSelect(v.id)}
                        />
                      </td>

                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          {v.avatar ? (
                            <img
                              src={v.avatar}
                              className="h-9 w-9 rounded-full object-cover border border-sky-100"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
                              {v.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-sm">
                              {v.name}
                            </span>
                            {v.volunteerType && (
                              <span className="text-[11px] text-slate-500">
                                {v.volunteerType}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 align-middle text-slate-700">
                        {v.email || "-"}
                      </td>
                      <td className="p-4 align-middle text-slate-700">
                        {v.phone || "-"}
                      </td>
                      <td className="p-4 align-middle text-slate-600">
                        {v.skills?.length ? v.skills.join(", ") : "-"}
                      </td>
                      <td className="p-4 align-middle font-semibold text-slate-800">
                        {v.totalHours}
                      </td>
                      <td className="p-4 align-middle text-slate-500">
                        {v.lastActivity
                          ? new Date(
                              v.lastActivity
                            ).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td className="p-4 align-middle">
                        <StatusBadge status={normalizeStatus(v.status)} />
                      </td>
                      <td className="p-4 align-middle text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100"
                            onClick={() => {
                              setActiveVolunteer(v);
                              setShowViewDrawer(true);
                            }}
                          >
                            View
                          </button>
                          <button
                            className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                            onClick={() => {
                              setActiveVolunteer(v);
                              setFormData({
                                id: v.id,
                                name: v.name,
                                gender: v.gender || "",
                                dob: v.dob ? v.dob.split("T")[0] : "",
                                phone: v.phone || "",
                                email: v.email || "",
                                address: v.address || "",
                                avatar: v.avatar || "",
                                volunteerType: v.volunteerType || "",
                                skills: v.skills || [],
                                areaOfInterest: v.areaOfInterest || "",
                                availability: v.availability || "",
                                emergencyName: v.emergencyName || "",
                                emergencyPhone: v.emergencyPhone || "",
                                joiningDate: v.joiningDate
                                  ? v.joiningDate.split("T")[0]
                                  : "",
                                status: normalizeStatus(v.status),
                                totalHours: v.totalHours ?? 0,
                                lastActivity: v.lastActivity
                                  ? v.lastActivity.split("T")[0]
                                  : "",
                                notes: v.notes || "",
                              });
                              setShowEditModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100"
                            onClick={() => deleteVolunteer(v.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-6 text-center text-slate-500 text-sm"
                      >
                        No volunteers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PAGINATION */}
        {filtered.length > itemsPerPage && (
          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 px-2">
            <div className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-900">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-900">
                {Math.min(currentPage * itemsPerPage, filtered.length)}
              </span>{" "}
              of <span className="font-medium text-slate-900">{filtered.length}</span>{" "}
              results
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Volunteer Modal */}
      <AddVolunteerModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        setFormData={setFormData}
        skillSuggestions={skillSuggestions}
        onSaved={reloadAll}
      />

      {/* EDIT MODAL */}
      <EditVolunteerModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setActiveVolunteer(null);
        }}
        formData={formData}
        setFormData={setFormData}
        skillSuggestions={skillSuggestions}
        onSaved={reloadAll}
      />

      {/* VIEW DRAWER */}
      <ViewVolunteerDrawer
        show={showViewDrawer}
        onClose={() => setShowViewDrawer(false)}
        volunteer={activeVolunteer}
      />
    </>
  );
}

/* ----------------------------------------------------------- */
/*                SMART TAGS (SKILLS) COMPONENT                */
/* ----------------------------------------------------------- */

function SkillInput({
  label,
  skills,
  setSkills,
  suggestions,
}: {
  label: string;
  skills: string[];
  setSkills: (v: string[]) => void;
  suggestions: string[];
}) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s)
  );

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setInput("");
    setShowDropdown(false);
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <div className="col-span-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <div className="mt-2 flex flex-wrap gap-2">
        {skills.map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
          >
            {s}
            <i
              className="fa-solid fa-xmark cursor-pointer text-[11px]"
              onClick={() => removeSkill(s)}
            ></i>
          </span>
        ))}
      </div>

      <div className="relative mt-2">
        <input
          type="text"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
          value={input}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => {
            setInput(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Type to search skills..."
        />

        {showDropdown && filtered.length > 0 && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {filtered.map((s, i) => (
              <div
                key={i}
                className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                onClick={() => addSkill(s)}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- */
/*                  REUSABLE FORM INPUT COMPONENT              */
/* ----------------------------------------------------------- */

function FormInput({
  label,
  type = "text",
  value,
  required,
  onChange,
}: {
  label: string;
  type?: string;
  value: any;
  required?: boolean;
  onChange: any;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
      />
    </div>
  );
}

/* ----------------------------------------------------------- */
/*                        SUMMARY CARD                         */
/* ----------------------------------------------------------- */

function SummaryCard({
  icon,
  color,
  label,
  value,
  pill,
}: {
  icon: string;
  color: string; // gradient classes
  label: string;
  value: any;
  pill?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 backdrop-blur shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80 from-slate-200 to-transparent" />
      <div className="flex items-center gap-4 px-4 py-4 md:px-5 md:py-5">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white text-xl shadow-lg`}
        >
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {label}
            </span>
            {pill && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {pill}
              </span>
            )}
          </div>
          <div className="mt-1 text-lg md:text-xl font-bold text-slate-900">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- */
/*                        STATUS BADGE                         */
/* ----------------------------------------------------------- */

function StatusBadge({
  status,
  compact,
}: {
  status: "New" | "Active" | "Inactive";
  compact?: boolean;
}) {
  const colors: any = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Inactive: "bg-rose-50 text-rose-700 border-rose-200",
    New: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 ${
        compact ? "py-0.5 text-[10px]" : "py-1 text-xs"
      } font-medium ${colors[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

/* ----------------------------------------------------------- */
/*                   ADD VOLUNTEER MODAL                       */
/* ----------------------------------------------------------- */

function AddVolunteerModal({
  show,
  onClose,
  formData,
  setFormData,
  skillSuggestions,
  onSaved,
}: any) {
  if (!show) return null;

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData({ ...formData, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData({ ...formData, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire("Validation", "Full Name is required", "warning");
      return;
    }

    const payload = {
      name: formData.name,
      gender: formData.gender || null,
      dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
      avatar: formData.avatar || null,
      volunteerType: formData.volunteerType || null,
      skills: formData.skills || [],
      areaOfInterest: formData.areaOfInterest || null,
      availability: formData.availability || null,
      emergencyName: formData.emergencyName || null,
      emergencyPhone: formData.emergencyPhone || null,
      joiningDate: formData.joiningDate
        ? new Date(formData.joiningDate).toISOString()
        : new Date().toISOString(),
      status: formData.status,
      totalHours: Number(formData.totalHours) || 0,
      lastActivity: formData.lastActivity
        ? new Date(formData.lastActivity).toISOString()
        : null,
      notes: formData.notes || null,
    };

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        Swal.fire(
          "Error",
          json?.error || "Failed to add volunteer.",
          "error"
        );
        return;
      }

      Swal.fire("Success", "Volunteer added successfully", "success");
      await onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong while saving.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-3 md:px-6">
      <div
        className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-white">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">
              Add New Volunteer
            </h2>
            <p className="text-xs md:text-[13px] text-sky-100/90">
              Capture key details, availability and skills in one smart form.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-1.5 hover:bg-white/20"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid max-h-[78vh] grid-cols-1 gap-6 overflow-y-auto px-6 py-6 md:grid-cols-2"
        >
          {/* 1. Personal */}
          <div className="col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              1. Personal Details
            </h3>
          </div>

          <FormInput
            label="Full Name"
            required
            value={formData.name}
            onChange={(e: any) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <div>
            <label className="text-sm font-medium text-slate-700">
              Gender
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <FormInput
            label="Date of Birth"
            type="date"
            value={formData.dob}
            onChange={(e: any) =>
              setFormData({ ...formData, dob: e.target.value })
            }
          />

          {/* 2. Contact */}
          <div className="col-span-2 mt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              2. Contact Details
            </h3>
          </div>

          <FormInput
            label="Mobile Number"
            value={formData.phone}
            onChange={(e: any) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <FormInput
            label="Email (optional)"
            type="email"
            value={formData.email}
            onChange={(e: any) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <div className="col-span-2">
            <FormInput
              label="Address"
              value={formData.address}
              onChange={(e: any) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {/* 3. Identification */}
          <div className="col-span-2 mt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              3. Identification
            </h3>
          </div>

          <div
            className="col-span-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("avatarInput")?.click()}
          >
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {!formData.avatar ? (
              <div>
                <i className="fa-solid fa-cloud-arrow-up text-3xl text-sky-400 mb-2"></i>
                <p className="font-medium">
                  Click to upload or drag &amp; drop profile photo
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  JPG or PNG up to 5MB.
                </p>
              </div>
            ) : (
              <img
                src={formData.avatar}
                className="h-36 w-36 rounded-2xl object-cover shadow-md border border-slate-200"
              />
            )}
          </div>

          {/* 4. Role */}
          <div className="col-span-2 mt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              4. Volunteer Role
            </h3>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Volunteer Type
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              value={formData.volunteerType}
              onChange={(e) =>
                setFormData({ ...formData, volunteerType: e.target.value })
              }
            >
              <option value="">Select</option>
              <option value="General">General</option>
              <option value="Event">Event Volunteer</option>
              <option value="Field">Field Volunteer</option>
            </select>
          </div>

          <FormInput
            label="Area of Interest"
            value={formData.areaOfInterest}
            onChange={(e: any) =>
              setFormData({
                ...formData,
                areaOfInterest: e.target.value,
              })
            }
          />

          <SkillInput
            label="Skills (Smart Tags)"
            skills={formData.skills}
            setSkills={(skills: string[]) =>
              setFormData({ ...formData, skills })
            }
            suggestions={skillSuggestions}
          />

          <div>
            <label className="text-sm font-medium text-slate-700">
              Availability
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              value={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: e.target.value })
              }
            >
              <option value="">Select</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Events Only">Events Only</option>
            </select>
          </div>

          {/* 5. Emergency */}
          <div className="col-span-2 mt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              5. Emergency Contact
            </h3>
          </div>

          <FormInput
            label="Emergency Contact Name"
            value={formData.emergencyName}
            onChange={(e: any) =>
              setFormData({ ...formData, emergencyName: e.target.value })
            }
          />

          <FormInput
            label="Emergency Contact Number"
            value={formData.emergencyPhone}
            onChange={(e: any) =>
              setFormData({ ...formData, emergencyPhone: e.target.value })
            }
          />

          {/* NOTES */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
            ></textarea>
          </div>

          {/* BUTTONS */}
          <div className="col-span-2 mt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:brightness-110"
            >
              Add Volunteer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- */
/*                   EDIT VOLUNTEER MODAL                      */
/* ----------------------------------------------------------- */

function EditVolunteerModal({
  show,
  onClose,
  formData,
  setFormData,
  skillSuggestions,
  onSaved,
}: any) {
  if (!show) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData?.id) {
      console.warn("Missing volunteer ID, ignoring save.");
      return;
    }

    const volunteerId = formData.id;

    const payload = {
      name: formData.name,
      gender: formData.gender || null,
      dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
      avatar: formData.avatar || null,
      volunteerType: formData.volunteerType || null,
      skills: formData.skills || [],
      areaOfInterest: formData.areaOfInterest || null,
      availability: formData.availability || null,
      emergencyName: formData.emergencyName || null,
      emergencyPhone: formData.emergencyPhone || null,
      joiningDate: formData.joiningDate
        ? new Date(formData.joiningDate).toISOString()
        : null,
      status: formData.status,
      totalHours: Number(formData.totalHours) || 0,
      lastActivity: formData.lastActivity
        ? new Date(formData.lastActivity).toISOString()
        : null,
      notes: formData.notes || null,
    };

    try {
      const res = await fetch(`/api/volunteers/${volunteerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        Swal.fire(
          "Error",
          json?.error || "Failed to update volunteer.",
          "error"
        );
        return;
      }

      Swal.fire("Success", "Volunteer updated successfully.", "success");
      await onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong while saving.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm px-3 md:px-6 py-8 overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-50 shadow-2xl">
        <div className="flex items-center justify-between rounded-t-3xl bg-white px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Edit Volunteer
            </h2>
            <p className="text-xs text-slate-500">
              Update profile, status, hours and notes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="bg-slate-50 rounded-b-3xl p-6 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Personal */}
            <div className="col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                1. Personal Details
              </h3>
            </div>

            <FormInput
              label="Full Name"
              required
              value={formData.name}
              onChange={(e: any) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <div>
              <label className="text-sm font-medium text-slate-700">
                Gender
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                value={formData.gender}
                onChange={(e: any) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <FormInput
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e: any) =>
                setFormData({ ...formData, dob: e.target.value })
              }
            />

            {/* 2. Contact */}
            <div className="col-span-2 mt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                2. Contact Details
              </h3>
            </div>

            <FormInput
              label="Mobile Number"
              value={formData.phone}
              onChange={(e: any) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />

            <FormInput
              label="Email (optional)"
              type="email"
              value={formData.email}
              onChange={(e: any) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <div className="col-span-2">
              <FormInput
                label="Address"
                value={formData.address}
                onChange={(e: any) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            {/* 3. Identification */}
            <div className="col-span-2 mt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                3. Identification
              </h3>
            </div>

            <div className="col-span-2">
              <FormInput
                label="Profile Photo URL"
                value={formData.avatar}
                onChange={(e: any) =>
                  setFormData({ ...formData, avatar: e.target.value })
                }
              />
            </div>

            {/* 4. Role Info */}
            <div className="col-span-2 mt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                4. Volunteer Role Information
              </h3>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Volunteer Type
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                value={formData.volunteerType}
                onChange={(e: any) =>
                  setFormData({ ...formData, volunteerType: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="General">General</option>
                <option value="Event">Event</option>
                <option value="Field">Field</option>
              </select>
            </div>

            <FormInput
              label="Area of Interest"
              value={formData.areaOfInterest}
              onChange={(e: any) =>
                setFormData({ ...formData, areaOfInterest: e.target.value })
              }
            />

            <SkillInput
              label="Skills (Smart Tags)"
              skills={formData.skills}
              setSkills={(skills: string[]) =>
                setFormData({ ...formData, skills })
              }
              suggestions={skillSuggestions}
            />

            <div>
              <label className="text-sm font-medium text-slate-700">
                Availability
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                value={formData.availability}
                onChange={(e: any) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Only Events">Only Events</option>
              </select>
            </div>

            {/* 5. Emergency */}
            <div className="col-span-2 mt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                5. Emergency Contact
              </h3>
            </div>

            <FormInput
              label="Emergency Contact Name"
              value={formData.emergencyName}
              onChange={(e: any) =>
                setFormData({ ...formData, emergencyName: e.target.value })
              }
            />

            <FormInput
              label="Emergency Contact Number"
              value={formData.emergencyPhone}
              onChange={(e: any) =>
                setFormData({ ...formData, emergencyPhone: e.target.value })
              }
            />

            {/* 6. System */}
            <div className="col-span-2 mt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                6. System Fields
              </h3>
            </div>

            <FormInput
              label="Joining Date"
              type="date"
              value={formData.joiningDate}
              onChange={(e: any) =>
                setFormData({ ...formData, joiningDate: e.target.value })
              }
            />

            <div>
              <label className="text-sm font-medium text-slate-700">
                Volunteer Status
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                value={formData.status}
                onChange={(e: any) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <FormInput
              label="Volunteer Hours"
              type="number"
              value={formData.totalHours}
              onChange={(e: any) =>
                setFormData({
                  ...formData,
                  totalHours: Number(e.target.value),
                })
              }
            />

            <FormInput
              label="Last Activity"
              type="date"
              value={formData.lastActivity}
              onChange={(e: any) =>
                setFormData({ ...formData, lastActivity: e.target.value })
              }
            />

            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                rows={4}
                value={formData.notes}
                onChange={(e: any) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              ></textarea>
            </div>

            {/* BUTTONS */}
            <div className="col-span-2 mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:brightness-110"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- */
/*              VIEW VOLUNTEER DRAWER (RIGHT SIDE)             */
/* ----------------------------------------------------------- */

function ViewVolunteerDrawer({
  show,
  onClose,
  volunteer,
}: {
  show: boolean;
  onClose: () => void;
  volunteer: Volunteer | null;
}) {
  if (!show || !volunteer) return null;

  const formatDate = (d?: string | null) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full max-w-md rounded-l-3xl bg-white shadow-2xl"
        style={{ marginTop: "70px", marginBottom: "10px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg text-slate-600 hover:bg-rose-500 hover:text-white transition"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>

        <div className="px-6 pb-10 pt-14">
          {/* Header */}
          <div className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-4 shadow-sm">
            {volunteer.avatar ? (
              <img
                src={volunteer.avatar}
                className="h-14 w-14 rounded-full object-cover border border-white shadow-md"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center text-2xl font-semibold shadow">
                {volunteer.name.charAt(0)}
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {volunteer.name}
              </h3>
              <p className="text-xs text-slate-500">{volunteer.email}</p>
              <div className="mt-2">
                <StatusBadge status={normalizeStatus(volunteer.status)} />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <DetailRow label="Gender" value={volunteer.gender || "-"} />
            <DetailRow label="Date of Birth" value={formatDate(volunteer.dob)} />
            <DetailRow label="Phone" value={volunteer.phone || "-"} />
            <DetailRow label="Address" value={volunteer.address || "-"} />
            <DetailRow
              label="Volunteer Type"
              value={volunteer.volunteerType || "-"}
            />
            <DetailRow
              label="Availability"
              value={volunteer.availability || "-"}
            />
            <DetailRow
              label="Joining Date"
              value={formatDate(volunteer.joiningDate)}
            />
            <DetailRow label="Total Hours" value={volunteer.totalHours} />
            <DetailRow
              label="Last Activity"
              value={formatDate(volunteer.lastActivity)}
            />
            <DetailRow
              label="Emergency Contact"
              value={
                volunteer.emergencyName
                  ? `${volunteer.emergencyName} (${volunteer.emergencyPhone || "-"})`
                  : "-"
              }
            />
          </div>

          {/* Skills */}
          {volunteer.skills?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills.map((s: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {volunteer.notes && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Notes
              </h3>
              <p className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
                {volunteer.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENT: DETAIL ROW --------------- */

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="ml-4 max-w-[60%] text-right font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}
