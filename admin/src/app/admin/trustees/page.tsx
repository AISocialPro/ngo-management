"use client";

import LiveDate from "@/components/LiveDate";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

/* ------------------------------------------------------ */
/*                        TYPES                           */
/* ------------------------------------------------------ */
type StatusUI = "New" | "Active" | "Inactive";
type FilterStatus = "All" | StatusUI;

type Trustee = {
  id: string;
  ngoId?: string;
  branchId?: string | null;
  name: string;
  role?: string | null; // e.g. Chairman, Treasurer, Trustee
  contact?: string | null;
  email?: string | null;
  address?: string | null;
  avatar?: string | null;
  tenureFrom?: string | null; // ISO date
  tenureTo?: string | null; // ISO date
  committees?: string[] | null; // array, or can be comma string coming from DB
  status?: string | null; // ACTIVE/INACTIVE/NEW or Active/Inactive/New
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Stats = {
  total: number;
  active: number;
  tenureEnding: number;
  committeeMembers: number;
};

/* ------------------------------------------------------ */
/*                     HELPERS                            */
/* ------------------------------------------------------ */

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function normalizeStatus(status?: string | null): StatusUI {
  if (!status) return "New";
  const s = String(status).toUpperCase();
  if (s === "ACTIVE") return "Active";
  if (s === "INACTIVE") return "Inactive";
  if (s === "NEW") return "New";
  if (status === "Active" || status === "Inactive" || status === "New") return status;
  return "New";
}

function formatDate(d?: string | null) {
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
}

function formatTenure(from?: string | null, to?: string | null) {
  if (!from && !to) return "-";
  return `${formatDate(from)} - ${formatDate(to)}`;
}

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

/* ------------------------------------------------------ */
/*                       PAGE                             */
/* ------------------------------------------------------ */

const emptyForm = {
  id: "",
  name: "",
  role: "",
  contact: "",
  email: "",
  address: "",
  avatar: "",
  tenureFrom: "",
  tenureTo: "",
  committees: [] as string[],
  status: "Active" as StatusUI,
  notes: "",
};

export default function TrusteesPage() {
  const searchParams = useSearchParams();

  // NGO ID: URL param -> localStorage -> ""
  const ngoId = useMemo(() => {
    const urlNgo = searchParams.get("ngoId");
    if (urlNgo) return urlNgo;

    if (typeof window !== "undefined") {
      const ls = window.localStorage.getItem("ngoId");
      if (ls) return ls;
    }
    return "";
  }, [searchParams]);

  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    tenureEnding: 0,
    committeeMembers: 0,
  });

  // Modals / Drawer
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [activeTrustee, setActiveTrustee] = useState<Trustee | null>(null);

  const [formData, setFormData] = useState({ ...emptyForm });

  const loadTrustees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/trustees?ngoId=${ngoId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch trustees");
      const json = await res.json().catch(() => ({}));
      const rawList: any[] = Array.isArray(json) ? json : json?.trustees ?? [];

      const list: Trustee[] = rawList.map((t) => {
        let committeesArray: string[] = [];
        if (Array.isArray(t.committees)) {
          committeesArray = t.committees;
        } else if (typeof t.committees === "string" && t.committees) {
          committeesArray = t.committees.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return { ...t, committees: committeesArray };
      });

      setTrustees(list);

      // keep selected ids only if still exist
      setSelected((prev) => prev.filter((id) => list.some((b) => b.id === id)));
    } catch (e: any) {
      console.error(e);
      toast.fire({ icon: "error", title: e?.message || "Failed to load trustees" });
      setTrustees([]);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    // fallback computed
    const total = trustees.length;
    const active = trustees.filter((t) => normalizeStatus(t.status) === "Active").length;

    const now = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(now.getDate() + 5);

    const tenureEnding = trustees.filter((t) => {
      if (!t.tenureTo) return false;
      try {
        const tenureEndDate = new Date(t.tenureTo);
        return tenureEndDate > now && tenureEndDate <= fiveDaysFromNow;
      } catch {
        return false;
      }
    }).length;

    const committeeMembers = trustees.filter((t) => t.committees && t.committees.length > 0).length;

    setStats({ total, active, tenureEnding, committeeMembers });
  };

  const reloadAll = async () => {
    await loadTrustees();
  };

  useEffect(() => {
    reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ngoId]);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trustees]);

  const filtered = useMemo(() => {
    let temp = [...trustees];

    if (search.trim()) {
      const q = search.toLowerCase();
      temp = temp.filter((t) => {
        const committeesText = (t.committees || []).join(", ").toLowerCase();
        return (
          (t.name || "").toLowerCase().includes(q) ||
          (t.role || "").toLowerCase().includes(q) ||
          (t.contact || "").toLowerCase().includes(q) ||
          (t.email || "").toLowerCase().includes(q) ||
          committeesText.includes(q)
        );
      });
    }

    if (filterStatus !== "All") {
      temp = temp.filter((t) => normalizeStatus(t.status) === filterStatus);
    }

    return temp;
  }, [trustees, search, filterStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  // Bulk select helpers
  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () => {
    if (filtered.length === 0) return;
    selected.length === filtered.length ? setSelected([]) : setSelected(filtered.map((t) => t.id));
  };

  // Bulk email
  const bulkEmails = () =>
    trustees
      .filter((t) => selected.includes(t.id))
      .map((t) => (t.email || "").trim())
      .filter(Boolean);

  const bulkEmail = () => {
    const emails = bulkEmails();
    if (emails.length === 0) return toast.fire({ icon: "info", title: "No email IDs in selection" });
    window.location.href = `mailto:${emails.join(";")}`;
  };

  // Delete single
  const deleteTrustee = async (t: Trustee) => {
    const confirm = await Swal.fire({
      title: "Delete this trustee?",
      text: `${t.name} will be removed. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    const res = await fetch(`/api/trustees/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.fire({ icon: "error", title: "Failed to delete" });
      return;
    }

    toast.fire({ icon: "success", title: "Deleted" });
    await reloadAll();
  };

  // Bulk delete
  const bulkDelete = async () => {
    if (selected.length === 0) {
      toast.fire({ icon: "info", title: "No trustees selected" });
      return;
    }

    const confirm = await Swal.fire({
      title: "Delete selected trustees?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    await Promise.all(selected.map((id) => fetch(`/api/trustees/${id}`, { method: "DELETE" })));
    toast.fire({ icon: "success", title: "Deleted selected" });
    setSelected([]);
    await reloadAll();
  };

  /* ------------------------------- Render ------------------------------- */

  return (
    <>
      <div className="p-5 md:p-6">
        {/* Title + date */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Trustees Management</h2>
          <LiveDate className="text-gray-600" />
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard color="bg-sky-600" icon="fa-users" value={stats.total} label="Total Trustees" />
          <StatCard color="bg-emerald-600" icon="fa-user-check" value={stats.active} label="Active Trustees" />
          <StatCard
            color="bg-amber-500"
            icon="fa-user-clock"
            value={stats.tenureEnding}
            label="Tenure Ending Soon"
          />
          <StatCard
            color="bg-indigo-500"
            icon="fa-sitemap"
            value={stats.committeeMembers}
            label="In Committees"
          />
        </div>

        {/* HEADER BAR */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* LEFT */}
          <h3 className="text-xl font-semibold text-slate-800">Board Directory</h3>

          {/* RIGHT */}
          <div className="flex flex-wrap items-center gap-3 justify-end w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search trustees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Bulk Email */}
            <button
              onClick={bulkEmail}
              className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
            >
              <i className="fa-solid fa-envelope-open-text" />
              Bulk Email
            </button>

            {/* Bulk Delete */}
            <button
              onClick={bulkDelete}
              disabled={selected.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="fa-solid fa-trash-can" />
              Bulk Delete
            </button>

            {/* ADD – right aligned */}
            <button
              onClick={() => {
                setFormData({ ...emptyForm });
                setShowAdd(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-110"
            >
              <i className="fa-solid fa-user-plus" />
              Add Trustee
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="px-4 py-10 text-center text-slate-500">Loading trustees...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={selected.length === filtered.length && filtered.length > 0}
                        onChange={toggleAll}
                      />
                    </th>
                    {["Trustee", "Role", "Committees", "Tenure", "Status", "Actions"].map((h) => (
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
                  {paginated.map((t) => {
                    const committeesText = (t.committees || []).join(", ") || "-";
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="border-b border-slate-200 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(t.id)}
                            onChange={() => toggleSelect(t.id)}
                          />
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3">
                          <div className="flex items-center">
                            {t.avatar ? (
                              <img src={t.avatar} alt={t.name} className="mr-3 h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <div className="mr-3 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white font-semibold">
                                {t.name?.charAt(0) || "T"}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-800">{t.name}</div>
                              <div className="text-xs text-slate-500">{t.contact || t.email || "-"}</div>
                            </div>
                          </div>
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{t.role || "-"}</td>

                        <td className="border-b border-slate-200 px-4 py-3 text-sky-700 font-medium">
                          {committeesText}
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3 text-slate-600">
                          {formatTenure(t.tenureFrom, t.tenureTo)}
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3">
                          <StatusPill status={normalizeStatus(t.status)} />
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActiveTrustee(t);
                                setShowView(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1.5 text-sky-600"
                            >
                              <i className="fa-solid fa-eye" /> View
                            </button>

                            <button
                              onClick={() => {
                                setActiveTrustee(t);
                                setFormData({
                                  id: t.id,
                                  name: t.name || "",
                                  role: t.role || "",
                                  contact: t.contact || "",
                                  email: t.email || "",
                                  address: t.address || "",
                                  avatar: t.avatar || "",
                                  tenureFrom: t.tenureFrom ? t.tenureFrom.split("T")[0] : "",
                                  tenureTo: t.tenureTo ? t.tenureTo.split("T")[0] : "",
                                  committees: (t.committees || []) as string[],
                                  status: normalizeStatus(t.status),
                                  notes: t.notes || "",
                                });
                                setShowEdit(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-600"
                            >
                              <i className="fa-solid fa-edit" /> Edit
                            </button>

                            <button
                              onClick={() => deleteTrustee(t)}
                              className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-1.5 text-red-600"
                            >
                              <i className="fa-solid fa-trash" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        No trustees match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-4 mb-8 mt-4">
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS / DRAWER */}
      <AddTrusteeModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        formData={formData}
        setFormData={setFormData}
        onSaved={reloadAll}
        ngoId={ngoId}
      />

      <EditTrusteeModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        formData={formData}
        setFormData={setFormData}
        onSaved={reloadAll}
      />

      <ViewTrusteeDrawer show={showView} onClose={() => setShowView(false)} trustee={activeTrustee} />
    </>
  );
}

/* ------------------------------------------------------ */
/*                      UI PIECES                         */
/* ------------------------------------------------------ */

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

function StatusPill({ status }: { status: StatusUI }) {
  const map: Record<StatusUI, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Inactive: "bg-amber-100 text-amber-700",
    New: "bg-sky-100 text-sky-700",
  };
  return <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", map[status])}>{status}</span>;
}

/* ------------------------------------------------------ */
/*                 FORM CONTROLS                           */
/* ------------------------------------------------------ */

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
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
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
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

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        rows={3}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Write notes..."}
      />
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string][];
  value: string[];
  onChange: (selected: string[]) => void;
}) {
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="md:col-span-2">
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-lg border border-slate-200 p-4 bg-slate-50/50">
        {options.map(([val, text]) => (
          <label key={val} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(val)}
              onChange={() => handleToggle(val)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm text-slate-800">{text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------ */
/*                ADD TRUSTEE MODAL                   */
/* ------------------------------------------------------ */

function AddTrusteeModal({
  show,
  onClose,
  formData,
  setFormData,
  onSaved,
  ngoId,
}: {
  show: boolean;
  onClose: () => void;
  formData: typeof emptyForm;
  setFormData: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  onSaved: () => Promise<void>;
  ngoId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setFormData((p) => ({ ...p, avatar: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return Swal.fire({ icon: "warning", title: "Validation", text: "Full Name is required" });
    }

    // Ensure we have an NGO ID, checking prop first, then localStorage as fallback
    const effectiveNgoId = ngoId || (typeof window !== 'undefined' ? localStorage.getItem("ngoId") : "") || "";

    setIsSubmitting(true);

    const payload = {
      ngoId: effectiveNgoId,
      name: formData.name.trim(),
      role: formData.role?.trim() || null,
      contact: formData.contact?.trim() || null,
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      avatar: formData.avatar || null,
      tenureFrom: formData.tenureFrom ? new Date(formData.tenureFrom).toISOString() : null,
      tenureTo: formData.tenureTo ? new Date(formData.tenureTo).toISOString() : null,
      committees: formData.committees || [],
      status: formData.status.toUpperCase(),
      notes: formData.notes?.trim() || null,
    };

    try {
      const res = await fetch("/api/trustees", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-ngo-id": effectiveNgoId 
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.success === false) {
        const msg =
          json?.error ||
          (String(json?.code || "").includes("P2003")
            ? "Foreign key failed (ngoId). Make sure this ngoId exists in the NGO table."
            : String(json?.error || "").includes("Argument `ngo` is missing")
            ? "Backend Error: Schema mismatch. The 'ngo' relation must be connected explicitly."
            : "Could not create trustee.");
        return Swal.fire({ icon: "error", title: "Failed", text: msg });
      }

      toast.fire({ icon: "success", title: "Trustee added." });
      await onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while saving." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Add New Trustee</h3>
            <p className="text-sm text-slate-500">Fill in the details to register a new person.</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-500 shadow-sm hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Section 1: Personal Info */}
          <div>
            <h4 className="mb-4 flex items-center text-sm font-bold uppercase tracking-wider text-sky-600">
              <i className="fa-solid fa-user mr-2" /> Personal Information
            </h4>
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Full Name"
                required
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
              />
              <Field
                label="Role"
                placeholder="e.g. Chairman, Treasurer"
                value={formData.role}
                onChange={(v) => setFormData((p) => ({ ...p, role: v }))}
              />
              <Field
                label="Contact (Phone)"
                placeholder="+91 98765..."
                value={formData.contact}
                onChange={(v) => setFormData((p) => ({ ...p, contact: v }))}
              />
              <Field
                label="Email"
                placeholder="user@example.com"
                value={formData.email || ""}
                onChange={(v) => setFormData((p) => ({ ...p, email: v }))}
              />
              <div className="md:col-span-2">
                <Field
                  label="Address"
                  placeholder="Full residential address"
                  value={formData.address}
                  onChange={(v) => setFormData((p) => ({ ...p, address: v }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Profile Photo</label>
                <div className="flex items-center gap-3 rounded-md border border-dashed border-slate-300 p-2 bg-slate-50">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                    {formData.avatar ? (
                      <img src={formData.avatar} className="h-full w-full object-cover" alt="Avatar Preview" />
                    ) : (
                      <i className="fa-solid fa-camera absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Role & Committees */}
          <div>
            <h4 className="mb-4 flex items-center text-sm font-bold uppercase tracking-wider text-emerald-600">
              <i className="fa-solid fa-sitemap mr-2" /> Role & Committees
            </h4>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Tenure From"
                  type="date"
                  value={formData.tenureFrom}
                  onChange={(v) => setFormData((p) => ({ ...p, tenureFrom: v }))}
                />
                <Field
                  label="Tenure To"
                  type="date"
                  value={formData.tenureTo}
                  onChange={(v) => setFormData((p) => ({ ...p, tenureTo: v }))}
                />
              </div>
              <Select
                label="Status"
                required
                value={formData.status}
                onChange={(v) => setFormData((p) => ({ ...p, status: v as StatusUI }))}
                options={[
                  ["New", "New"],
                  ["Active", "Active"],
                  ["Inactive", "Inactive"],
                ]}
              />
              <CheckboxGroup
                label="Committees"
                value={formData.committees}
                onChange={(arr) => setFormData((p) => ({ ...p, committees: arr }))}
                options={[
                  ["Finance", "Finance"],
                  ["Audit", "Audit"],
                  ["Governance", "Governance"],
                  ["Fundraising", "Fundraising"],
                  ["Programs", "Programs"],
                ]}
              />
            </div>
          </div>

          {/* Section 3: Notes */}
          <div>
            <TextArea
              label="Additional Notes"
              placeholder="Any special remarks..."
              value={formData.notes}
              onChange={(v) => setFormData((p) => ({ ...p, notes: v }))}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:from-sky-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-wait"
            >
              {isSubmitting ? "Adding..." : "Add Trustee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ */
/*                EDIT TRUSTEE MODAL                  */
/* ------------------------------------------------------ */

function EditTrusteeModal({
  show,
  onClose,
  formData,
  setFormData,
  onSaved,
}: {
  show: boolean;
  onClose: () => void;
  formData: typeof emptyForm;
  setFormData: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  onSaved: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setFormData((p) => ({ ...p, avatar: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData?.id) {
      return Swal.fire({ icon: "error", title: "Error", text: "Trustee ID is missing." });
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      role: formData.role?.trim() || null,
      contact: formData.contact?.trim() || null,
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      avatar: formData.avatar || null,
      tenureFrom: formData.tenureFrom ? new Date(formData.tenureFrom).toISOString() : null,
      tenureTo: formData.tenureTo ? new Date(formData.tenureTo).toISOString() : null,
      committees: formData.committees || [],
      status: formData.status.toUpperCase(),
      notes: formData.notes?.trim() || null,
    };

    try {
      const res = await fetch(`/api/trustees/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.success === false) {
        return Swal.fire({
          icon: "error",
          title: "Failed",
          text: json?.error || "Could not update trustee.",
        });
      }

      toast.fire({ icon: "success", title: "Updated" });
      await onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while saving." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Edit Trustee</h3>
            <p className="text-sm text-slate-500">Update details for {formData.name}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-500 shadow-sm hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Form content is identical to Add modal, just with different submit handler and title */}
          {/* Section 1: Personal Info */}
          <div>
            <h4 className="mb-4 flex items-center text-sm font-bold uppercase tracking-wider text-sky-600">
              <i className="fa-solid fa-user mr-2" /> Personal Information
            </h4>
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Full Name"
                required
                value={formData.name}
                onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
              />
              <Field
                label="Role"
                value={formData.role}
                onChange={(v) => setFormData((p) => ({ ...p, role: v }))}
              />
              <Field
                label="Contact (Phone)"
                value={formData.contact}
                onChange={(v) => setFormData((p) => ({ ...p, contact: v }))}
              />
              <Field
                label="Email"
                value={formData.email || ""}
                onChange={(v) => setFormData((p) => ({ ...p, email: v }))}
              />
              <div className="md:col-span-2">
                <Field
                  label="Address"
                  value={formData.address}
                  onChange={(v) => setFormData((p) => ({ ...p, address: v }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Profile Photo</label>
                <div className="flex items-center gap-3 rounded-md border border-dashed border-slate-300 p-2 bg-slate-50">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                    {formData.avatar ? (
                      <img src={formData.avatar} className="h-full w-full object-cover" alt="Avatar Preview" />
                    ) : (
                      <i className="fa-solid fa-camera absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Role & Committees */}
          <div>
            <h4 className="mb-4 flex items-center text-sm font-bold uppercase tracking-wider text-emerald-600">
              <i className="fa-solid fa-sitemap mr-2" /> Role & Committees
            </h4>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Tenure From"
                  type="date"
                  value={formData.tenureFrom}
                  onChange={(v) => setFormData((p) => ({ ...p, tenureFrom: v }))}
                />
                <Field
                  label="Tenure To"
                  type="date"
                  value={formData.tenureTo}
                  onChange={(v) => setFormData((p) => ({ ...p, tenureTo: v }))}
                />
              </div>
              <Select
                label="Status"
                required
                value={formData.status}
                onChange={(v) => setFormData((p) => ({ ...p, status: v as StatusUI }))}
                options={[
                  ["New", "New"],
                  ["Active", "Active"],
                  ["Inactive", "Inactive"],
                ]}
              />
              <CheckboxGroup
                label="Committees"
                value={formData.committees}
                onChange={(arr) => setFormData((p) => ({ ...p, committees: arr }))}
                options={[
                  ["Finance", "Finance"],
                  ["Audit", "Audit"],
                  ["Governance", "Governance"],
                  ["Fundraising", "Fundraising"],
                  ["Programs", "Programs"],
                ]}
              />
            </div>
          </div>

          {/* Section 3: Notes */}
          <div>
            <TextArea
              label="Additional Notes"
              value={formData.notes}
              onChange={(v) => setFormData((p) => ({ ...p, notes: v }))}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:from-sky-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-wait"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ */
/*               VIEW DRAWER (RIGHT)                      */
/* ------------------------------------------------------ */

function ViewTrusteeDrawer({
  show,
  onClose,
  trustee,
}: {
  show: boolean;
  onClose: () => void;
  trustee: Trustee | null;
}) {
  if (!show || !trustee) return null;

  const committeesText = (trustee.committees || []).join(", ") || "-";

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative h-full w-full max-w-md bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg text-slate-600 hover:bg-rose-500 hover:text-white transition"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>

        <div className="px-6 pb-10 pt-14 overflow-y-auto h-full">
          <div className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-4 shadow-sm">
            {trustee.avatar ? (
              <img
                src={trustee.avatar}
                className="h-14 w-14 rounded-full object-cover border border-white shadow-md"
                alt={trustee.name}
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center text-2xl font-semibold shadow">
                {trustee.name?.charAt(0) || "T"}
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-slate-900">{trustee.name}</h3>
              <p className="text-xs text-slate-500">{trustee.role || "Trustee"}</p>
              <div className="mt-2">
                <StatusPill status={normalizeStatus(trustee.status)} />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <DetailRow label="Full Name" value={trustee.name} />
            <DetailRow label="Role" value={trustee.role || "-"} />
            <DetailRow label="Email" value={trustee.email || "-"} />
            <DetailRow label="Contact" value={trustee.contact || "-"} />
            <DetailRow label="Address" value={trustee.address || "-"} isFullWidth={true} />
            <DetailRow label="Tenure" value={formatTenure(trustee.tenureFrom, trustee.tenureTo)} />
            <DetailRow label="Committees" value={committeesText} />
          </div>

          {trustee.notes ? (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Notes</h3>
              <p className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
                {trustee.notes}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isFullWidth }: { label: string; value: any; isFullWidth?: boolean }) {
  return (
    <div className={cn("flex items-start justify-between text-sm", isFullWidth && "flex-col items-start gap-1")}>
      <span className="text-slate-500">{label}</span>
      <span className={cn("font-semibold text-slate-900", isFullWidth ? "text-left" : "ml-4 max-w-[60%] text-right")}>{value}</span>
    </div>
  );
}
