"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
import LiveDate from "@/components/LiveDate";

/* ------------------------------------------------------ */
/*                        TYPES                           */
/* ------------------------------------------------------ */
type StatusUI = "New" | "Active" | "Inactive";
type FilterStatus = "All" | StatusUI;

type Beneficiary = {
  id: string;
  ngoId?: string;
  branchId?: string | null;

  name: string;
  contact?: string | null; // phone
  email?: string | null;
  address?: string | null;

  dob?: string | null;
  gender?: string | null;
  occupation?: string | null;
  income?: string | null;

  avatar?: string | null;

  assistance?: string[] | null;
  lastAssistance?: string | null; // ISO
  household?: string | null;

  status?: string | null; // DB enum/string
  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

type Stats = {
  total: number;
  active: number;
  newThisMonth: number;
  food: number;
  education: number;
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
  contact: "",
  email: "",
  address: "",
  avatar: "",
  household: "",
  assistance: [] as string[],
  lastAssistance: "",
  status: "New" as StatusUI,
  notes: "",
  dob: "",
  gender: "",
  occupation: "",
  income: "",
};

export default function BeneficiariesPage() {
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


  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    newThisMonth: 0,
    food: 0,
    education: 0,
  });

  // Modals / Drawer
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [activeBeneficiary, setActiveBeneficiary] = useState<Beneficiary | null>(null);

  const [formData, setFormData] = useState({ ...emptyForm });

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/beneficiaries", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch beneficiaries");
      const json = await res.json().catch(() => ({}));
      const rawList: any[] = Array.isArray(json) ? json : json?.beneficiaries ?? [];

      const list: Beneficiary[] = rawList.map((b) => {
        let assistanceArray: string[] = [];
        if (Array.isArray(b.assistance)) {
          assistanceArray = b.assistance;
        } else if (typeof b.assistance === "string" && b.assistance) {
          assistanceArray = b.assistance.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return { ...b, assistance: assistanceArray };
      });

      setBeneficiaries(list);

      // keep selected ids only if still exist
      setSelected((prev) => prev.filter((id) => list.some((b) => b.id === id)));
    } catch (e: any) {
      console.error(e);
      toast.fire({ icon: "error", title: e?.message || "Failed to load beneficiaries" });
      setBeneficiaries([]);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    // fallback computed
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const total = beneficiaries.length;
    const active = beneficiaries.filter((b) => normalizeStatus(b.status) === "Active").length;

    const newThisMonth = beneficiaries.filter((b) => {
      const d = b.createdAt ? new Date(b.createdAt) : null;
      if (!d || isNaN(d.getTime())) return false;
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const food = beneficiaries.filter((b) =>
      (b.assistance || []).some((a) => a.toLowerCase().includes("food"))
    ).length;
    const education = beneficiaries.filter((b) =>
      (b.assistance || []).some((a) => a.toLowerCase().includes("education"))
    ).length;

    setStats({ total, active, newThisMonth, food, education });
  };

  const reloadAll = async () => {
    await Promise.all([loadBeneficiaries(), loadStats()]);
  };
useEffect(() => {
  reloadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficiaries]);

  const filtered = useMemo(() => {
    let temp = [...beneficiaries];

    if (search.trim()) {
      const q = search.toLowerCase();
      temp = temp.filter((b) => {
        const assistanceText = (b.assistance || []).join(", ").toLowerCase();
        return (
          (b.name || "").toLowerCase().includes(q) ||
          (b.contact || "").toLowerCase().includes(q) ||
          (b.email || "").toLowerCase().includes(q) ||
          assistanceText.includes(q)
        );
      });
    }

    if (filterStatus !== "All") {
      temp = temp.filter((b) => normalizeStatus(b.status) === filterStatus);
    }

    return temp;
  }, [beneficiaries, search, filterStatus]);

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
    selected.length === filtered.length ? setSelected([]) : setSelected(filtered.map((b) => b.id));
  };

  // Bulk email
  const bulkEmails = () =>
    beneficiaries
      .filter((b) => selected.includes(b.id))
      .map((b) => (b.email || "").trim())
      .filter(Boolean);

  const bulkEmail = () => {
    const emails = bulkEmails();
    if (emails.length === 0) return toast.fire({ icon: "info", title: "No email IDs in selection" });
    window.location.href = `mailto:${emails.join(";")}`;
  };

  // Delete single
  const deleteBeneficiary = async (b: Beneficiary) => {
    const confirm = await Swal.fire({
      title: "Delete this beneficiary?",
      text: `${b.name} will be removed. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    const res = await fetch(`/api/beneficiaries/${b.id}`, { method: "DELETE" });
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
      toast.fire({ icon: "info", title: "No beneficiaries selected" });
      return;
    }

    const confirm = await Swal.fire({
      title: "Delete selected beneficiaries?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    await Promise.all(selected.map((id) => fetch(`/api/beneficiaries/${id}`, { method: "DELETE" })));
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
          <h2 className="text-2xl font-bold text-slate-800">Beneficiaries Management</h2>
          <LiveDate className="text-gray-600" />
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard color="bg-sky-600" icon="fa-users" value={stats.total} label="Total Beneficiaries" />
          <StatCard color="bg-emerald-600" icon="fa-home" value={stats.active} label="Active Beneficiaries" />
          <StatCard color="bg-red-500" icon="fa-utensils" value={stats.food} label="Food Assistance" />
          <StatCard
            color="bg-amber-500"
            icon="fa-graduation-cap"
            value={stats.education}
            label="Education Support"
          />
        </div>

        {/* HEADER BAR */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* LEFT */}
          <h3 className="text-xl font-semibold text-slate-800">Beneficiary Directory</h3>

          {/* RIGHT */}
          <div className="flex flex-wrap items-center gap-3 justify-end w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search beneficiaries..."
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
              
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-110",
                
              )}
            >
              <i className="fa-solid fa-user-plus" />
              Add Beneficiary
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="px-4 py-10 text-center text-slate-500">Loading beneficiaries...</div>
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
                  {paginated.map((b) => {
                    const assistanceText = (b.assistance || []).join(", ") || "-";
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="border-b border-slate-200 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(b.id)}
                            onChange={() => toggleSelect(b.id)}
                          />
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3">
                          <div className="flex items-center">
                            {b.avatar ? (
                              <img src={b.avatar} alt={b.name} className="mr-3 h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <div className="mr-3 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white font-semibold">
                                {b.name?.charAt(0) || "B"}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-800">{b.name}</div>
                              <div className="text-xs text-slate-500">{b.contact || b.email || "-"}</div>
                            </div>
                          </div>
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3 text-sky-700 font-medium">
                          {assistanceText}
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3 text-slate-600">
                          {formatDate(b.lastAssistance)}
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{b.household || "-"}</td>

                        <td className="border-b border-slate-200 px-4 py-3">
                          <StatusPill status={normalizeStatus(b.status)} />
                        </td>

                        <td className="border-b border-slate-200 px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActiveBeneficiary(b);
                                setShowView(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1.5 text-sky-600"
                            >
                              <i className="fa-solid fa-eye" /> View
                            </button>

                            <button
                              onClick={() => {
                                setActiveBeneficiary(b);
                                setFormData({
                                  id: b.id,
                                  name: b.name || "",
                                  contact: b.contact || "",
                                  email: b.email || "",
                                  address: b.address || "",
                                  avatar: b.avatar || "",
                                  household: b.household || "",
                                  assistance: (b.assistance || []) as string[],
                                  lastAssistance: b.lastAssistance ? b.lastAssistance.split("T")[0] : "",
                                  status: normalizeStatus(b.status),
                                  notes: b.notes || "",
                                  dob: b.dob ? b.dob.split("T")[0] : "",
                                  gender: b.gender || "",
                                  occupation: b.occupation || "",
                                  income: b.income || "",
                                });
                                setShowEdit(true);
                              }}
                              
                              className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-600"
                            >
                              <i className="fa-solid fa-edit" /> Edit
                            </button>

                            <button
                              onClick={() => deleteBeneficiary(b)}
                              
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
                        No beneficiaries match your search.
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
      <AddBeneficiaryModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        formData={formData}
        setFormData={setFormData}
        onSaved={reloadAll}
        ngoId={ngoId}
      />

      <EditBeneficiaryModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        formData={formData}
        setFormData={setFormData}
        onSaved={reloadAll}
      />

      <ViewBeneficiaryDrawer show={showView} onClose={() => setShowView(false)} beneficiary={activeBeneficiary} />
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
/*                ADD BENEFICIARY MODAL                   */
/* ------------------------------------------------------ */

function AddBeneficiaryModal({
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

    setIsSubmitting(true);

    const payload = {
      ...(ngoId ? { ngoId } : {}),
      name: formData.name.trim(),
      contact: formData.contact?.trim() || null,
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      avatar: formData.avatar || null,
      household: formData.household?.trim() || null,
      assistance: formData.assistance || [],
      lastAssistance: formData.lastAssistance ? new Date(formData.lastAssistance).toISOString() : null,
      status: formData.status.toUpperCase(),
      notes: formData.notes?.trim() || null,
      dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      gender: formData.gender || null,
      occupation: formData.occupation?.trim() || null,
      income: formData.income?.trim() || null,
    };

    try {
      const res = await fetch("/api/beneficiaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            : "Could not create beneficiary.");
        return Swal.fire({ icon: "error", title: "Failed", text: msg });
      }

      toast.fire({ icon: "success", title: "Beneficiary added." });
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
            <h3 className="text-xl font-bold text-slate-800">Add New Beneficiary</h3>
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
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Date of Birth"
                  type="date"
                  value={formData.dob || ""}
                  onChange={(v) => setFormData((p) => ({ ...p, dob: v }))}
                />
                <Select
                  label="Gender"
                  value={formData.gender || ""}
                  onChange={(v) => setFormData((p) => ({ ...p, gender: v }))}
                  options={[
                    ["", "Select..."],
                    ["Male", "Male"],
                    ["Female", "Female"],
                    ["Other", "Other"],
                  ]}
                />
              </div>
              <Field
                label="Occupation"
                placeholder="e.g. Daily Wage Laborer"
                value={formData.occupation || ""}
                onChange={(v) => setFormData((p) => ({ ...p, occupation: v }))}
              />
              <Field
                label="Monthly Income"
                placeholder="e.g. 5000"
                value={formData.income || ""}
                onChange={(v) => setFormData((p) => ({ ...p, income: v }))}
              />
              <Field
                label="Household Size"
                value={formData.household}
                onChange={(v) => setFormData((p) => ({ ...p, household: v }))}
                placeholder='e.g. "4 members"'
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Profile Photo</label>
                <div className="flex items-center gap-3 rounded-md border border-dashed border-slate-300 p-2 bg-slate-50">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                    {formData.avatar ? (
                      <img src={formData.avatar} className="h-full w-full object-cover" />
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

          {/* Section 2: Contact & Assistance */}
          <div>
            <h4 className="mb-4 flex items-center text-sm font-bold uppercase tracking-wider text-emerald-600">
              <i className="fa-solid fa-address-book mr-2" /> Contact & Assistance
            </h4>
            <div className="grid gap-5 md:grid-cols-2">
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

              <CheckboxGroup
                label="Assistance Type"
                value={formData.assistance}
                onChange={(arr) => setFormData((p) => ({ ...p, assistance: arr }))}
                options={[
                  ["Food", "Food Assistance"],
                  ["Education", "Education Support"],
                  ["Medical", "Medical Assistance"],
                  ["Housing", "Housing"],
                  ["Employment", "Employment"],
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Last Assistance"
                  type="date"
                  value={formData.lastAssistance}
                  onChange={(v) => setFormData((p) => ({ ...p, lastAssistance: v }))}
                />
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
              </div>
            </div>
          </div>

          {/* Section 3: Notes */}
          <div>
            <TextArea
              label="Additional Notes"
              placeholder="Any special requirements, history, or remarks..."
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
              {isSubmitting ? "Adding..." : "Add Beneficiary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ */
/*                EDIT BENEFICIARY MODAL                  */
/* ------------------------------------------------------ */

function EditBeneficiaryModal({
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
  if (!show) return null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      Swal.fire({ icon: "error", title: "Error", text: "Beneficiary ID is missing." });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      contact: formData.contact?.trim() || null,
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      avatar: formData.avatar || null,
      household: formData.household?.trim() || null,
      assistance: formData.assistance || [],
      lastAssistance: formData.lastAssistance ? new Date(formData.lastAssistance).toISOString() : null,
      status: formData.status.toUpperCase(),
      notes: formData.notes?.trim() || null,
      dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      gender: formData.gender || null,
      occupation: formData.occupation?.trim() || null,
      income: formData.income?.trim() || null,
    };

    try {
      const res = await fetch(`/api/beneficiaries/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.success === false) {
        return Swal.fire({
          icon: "error",
          title: "Failed",
          text: json?.error || "Could not update beneficiary.",
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
            <h3 className="text-xl font-bold text-slate-800">Edit Beneficiary</h3>
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
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Date of Birth"
                  type="date"
                  value={formData.dob || ""}
                  onChange={(v) => setFormData((p) => ({ ...p, dob: v }))}
                />
                <Select
                  label="Gender"
                  value={formData.gender || ""}
                  onChange={(v) => setFormData((p) => ({ ...p, gender: v }))}
                  options={[
                    ["", "Select..."],
                    ["Male", "Male"],
                    ["Female", "Female"],
                    ["Other", "Other"],
                  ]}
                />
              </div>
              <Field
                label="Occupation"
                value={formData.occupation || ""}
                onChange={(v) => setFormData((p) => ({ ...p, occupation: v }))}
              />
              <Field
                label="Monthly Income"
                value={formData.income || ""}
                onChange={(v) => setFormData((p) => ({ ...p, income: v }))}
              />
              <Field
                label="Household Size"
                value={formData.household}
                onChange={(v) => setFormData((p) => ({ ...p, household: v }))}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Profile Photo</label>
                <div className="flex items-center gap-3 rounded-md border border-dashed border-slate-300 p-2 bg-slate-50">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                    {formData.avatar ? (
                      <img src={formData.avatar} className="h-full w-full object-cover" />
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

          {/* Section 2: Contact & Assistance */}
          <div>
            <h4 className="mb-4 flex items-center text-sm font-bold uppercase tracking-wider text-emerald-600">
              <i className="fa-solid fa-address-book mr-2" /> Contact & Assistance
            </h4>
            <div className="grid gap-5 md:grid-cols-2">
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

              <CheckboxGroup
                label="Assistance Type"
                value={formData.assistance}
                onChange={(arr) => setFormData((p) => ({ ...p, assistance: arr }))}
                options={[
                  ["Food", "Food Assistance"],
                  ["Education", "Education Support"],
                  ["Medical", "Medical Assistance"],
                  ["Housing", "Housing"],
                  ["Employment", "Employment"],
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Last Assistance"
                  type="date"
                  value={formData.lastAssistance}
                  onChange={(v) => setFormData((p) => ({ ...p, lastAssistance: v }))}
                />
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
              </div>
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

function ViewBeneficiaryDrawer({
  show,
  onClose,
  beneficiary,
}: {
  show: boolean;
  onClose: () => void;
  beneficiary: Beneficiary | null;
}) {
  if (!show || !beneficiary) return null;

  const assistanceText = (beneficiary.assistance || []).join(", ") || "-";

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
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
          <div className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-4 shadow-sm">
            {beneficiary.avatar ? (
              <img
                src={beneficiary.avatar}
                className="h-14 w-14 rounded-full object-cover border border-white shadow-md"
                alt={beneficiary.name}
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center text-2xl font-semibold shadow">
                {beneficiary.name?.charAt(0) || "B"}
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-slate-900">{beneficiary.name}</h3>
              <p className="text-xs text-slate-500">{beneficiary.contact || beneficiary.email || "-"}</p>
              <div className="mt-2">
                <StatusPill status={normalizeStatus(beneficiary.status)} />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <DetailRow label="Email" value={beneficiary.email || "-"} />
            <DetailRow label="Contact" value={beneficiary.contact || "-"} />
            <DetailRow label="Address" value={beneficiary.address || "-"} />
            <DetailRow label="Household" value={beneficiary.household || "-"} />
            <DetailRow label="Gender" value={beneficiary.gender || "-"} />
            <DetailRow label="DOB" value={formatDate(beneficiary.dob)} />
            <DetailRow label="Occupation" value={beneficiary.occupation || "-"} />
            <DetailRow label="Income" value={beneficiary.income || "-"} />
            <DetailRow label="Assistance" value={assistanceText} />
            <DetailRow label="Last Assistance" value={formatDate(beneficiary.lastAssistance)} />
          </div>

          {beneficiary.notes ? (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Notes</h3>
              <p className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
                {beneficiary.notes}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="ml-4 max-w-[60%] text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}
