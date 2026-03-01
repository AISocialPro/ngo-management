// src/app/admin/branches/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import LiveDate from "@/components/LiveDate";

/* ---------------------------- Types ---------------------------- */
type Branch = {
  id: string;
  name: string;
  status: "active" | "inactive"; // normalized to lowercase for UI
  manager: string;
  phone: string;
  email: string;
  address: string;
  staff: number;
  beneficiaries: number;
  funding: string; // e.g., "Rs 12.5K"
  notes?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

/* ----------------------------- Page ----------------------------- */
const PAGE_SIZE = 6;

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  /* --------------------------- Confirm UI --------------------------- */
  const [confirmBox, setConfirmBox] = useState<{
    open: boolean;
    title: string;
    description?: string;
    danger?: boolean;
    resolve?: (ok: boolean) => void;
  }>({ open: false, title: "" });

  const confirm = (opts: { title: string; description?: string; danger?: boolean }) =>
    new Promise<boolean>((resolve) => setConfirmBox({ ...opts, open: true, resolve }));

  /* ---------------------------- Modal state --------------------------- */
  type ModalState =
    | { open: false }
    | { open: true; mode: "add"; data?: Partial<Branch> }
    | { open: true; mode: "edit"; data: Branch }
    | { open: true; mode: "view"; data: Branch };

  const [modal, setModal] = useState<ModalState>({ open: false });

  const closeModal = () => setModal({ open: false });

  /* ----------------------------- Data Load ---------------------------- */
  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch("/api/branches", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load (status ${res.status})`);
      const data = (await res.json()) as any[];

      const normalized: Branch[] = data.map((b) => ({
        ...b,
        status: String(b.status ?? "active").toLowerCase() as "active" | "inactive",
        beneficiaries: Number(b.beneficiaries ?? 0),
        staff: Number(b.staff ?? 0),
      }));

      setBranches(normalized);
    } catch (e: any) {
      setErr(e?.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ------------------------------ CRUD ------------------------------ */
  async function upsert(payload: Partial<Branch>, mode: "add" | "edit") {
    try {
      setErr(null);

      if (mode === "add") {
        const res = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        const created = (await res.json()) as any;
        const normalized: Branch = {
          ...created,
          status: String(created.status ?? "active").toLowerCase() as "active" | "inactive",
          beneficiaries: Number(created.beneficiaries ?? 0),
          staff: Number(created.staff ?? 0),
        };
        setBranches((prev) => [normalized, ...prev]);
        // Clear filters so the new branch is visible immediately
        setSearch("");
        setStatusFilter("all");
        setPage(1);
      } else {
        if (!payload.id) throw new Error("Missing branch id for edit");
        const res = await fetch(`/api/branches/${payload.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        const updated = (await res.json()) as any;
        const normalized: Branch = {
          ...updated,
          status: String(updated.status ?? "active").toLowerCase() as "active" | "inactive",
          beneficiaries: Number(updated.beneficiaries ?? 0),
          staff: Number(updated.staff ?? 0),
        };
        setBranches((arr) => arr.map((x) => (x.id === normalized.id ? normalized : x)));
      }
      closeModal();
    } catch (e: any) {
      setErr(e?.message || "Operation failed");
    }
  }

  async function remove(id: string, name: string) {
    const ok = await confirm({
      title: "Delete branch?",
      description: `This will permanently delete “${name}”. You can’t undo this action.`,
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/branches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setBranches((b) => b.filter((x) => x.id !== id));
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    }
  }

  /* ------------------------------ Totals ----------------------------- */
  const totals = useMemo(() => {
    const staff = branches.reduce((a, b) => a + (b.staff || 0), 0);
    const bene = branches.reduce((a, b) => a + (b.beneficiaries || 0), 0);
    const active = branches.filter((b) => b.status === "active").length;
    return { staff, bene, active };
  }, [branches]);

  /* ---------------------- Filters & Pagination ----------------------- */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = branches;

    if (statusFilter !== "all") {
      list = list.filter((b) => b.status === statusFilter);
    }

    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter((b) =>
        [b.name, b.manager, b.address, b.email, b.phone].some((v) =>
          (v || "").toLowerCase().includes(q)
        )
      );
    }

    return list;
  }, [branches, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = filtered.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  /* ----------------------------- CSV Export ----------------------------- */
  const exportCsv = () => {
    if (!filtered.length) return;

    const header = [
      "Name",
      "Status",
      "Manager",
      "Phone",
      "Email",
      "Address",
      "Staff",
      "Beneficiaries",
      "Funding",
      "Created At",
      "Updated At",
    ];

    const rows = filtered.map((b) => [
      b.name,
      b.status,
      b.manager,
      b.phone,
      b.email,
      b.address,
      String(b.staff),
      String(b.beneficiaries),
      b.funding,
      b.createdAt ? new Date(b.createdAt as any).toLocaleString() : "",
      b.updatedAt ? new Date(b.updatedAt as any).toLocaleString() : "",
    ]);

    const csvContent =
      [header, ...rows]
        .map((r) =>
          r
            .map((cell) => {
              const value = (cell ?? "").toString();
              // escape quotes
              const escaped = value.replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "branches.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden p-5">
      <style>{`.clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}`}</style>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-[#343a40]">Branch Management</h2>
        <LiveDate className="text-gray-600" />
      </div>

      {/* Error banner */}
      {err && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation" />
            <span>{err}</span>
            <button onClick={() => load()} className="ml-auto text-sm underline underline-offset-4">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Stat color="bg-[#3498db]" icon="fa-code-branch" value={branches.length} label="Total Branches" />
        <Stat color="bg-emerald-600" icon="fa-circle-check" value={totals.active} label="Active Branches" />
        <Stat color="bg-rose-500" icon="fa-users" value={totals.staff} label="Branch Staff" />
        <Stat color="bg-amber-500" icon="fa-hand-holding-heart" value={totals.bene} label="Beneficiaries Served" />
      </div>

      {/* Filters + Actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">All Branches</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | "active" | "inactive");
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 placeholder:text-slate-400 focus:ring sm:w-56"
            placeholder="Search by name, manager, city..."
            autoComplete="off"
          />

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            <i className="fa-solid fa-file-csv" /> Export CSV
          </button>

          <button
            onClick={() => setModal({ open: true, mode: "add", data: {} })}
            className="flex items-center gap-2 rounded-lg bg-[#3498db] px-4 py-2 text-white shadow hover:bg-[#2f89c7]"
          >
            <i className="fa-solid fa-plus" /> Add New Branch
          </button>
        </div>
      </div>

      {/* Branch grid */}
      {loading ? (
        <SkeletonGrid />
      ) : current.length === 0 ? (
        <EmptyState onAdd={() => setModal({ open: true, mode: "add", data: {} })} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {current.map((b) => (
            <div
              key={b.id}
              className="rounded-xl bg-white p-5 shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900">{b.name}</h4>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    b.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {b.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <Line icon="fa-user-tie" text={`Manager: ${b.manager}`} />
                <Line icon="fa-phone" text={b.phone} />
                <Line icon="fa-envelope" text={b.email} />
                <Line icon="fa-map-marker-alt" text={b.address} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3 text-center">
                <MiniStat label="Staff" value={b.staff} />
                <MiniStat label="Beneficiaries" value={b.beneficiaries} />
                <MiniStat label="Funding (₹)" value={b.funding.replace("$", "₹")} />

              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1.5 text-sky-600"
                    onClick={() => setModal({ open: true, mode: "view", data: b })}
                  >
                    <i className="fa-solid fa-eye" /> View
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-600"
                    onClick={() => setModal({ open: true, mode: "edit", data: b })}
                  >
                    <i className="fa-solid fa-pen" /> Edit
                  </button>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-3 py-1.5 text-rose-600"
                  onClick={() => remove(b.id, b.name)}
                >
                  <i className="fa-solid fa-trash" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && current.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}

      {/* Modals */}
      {modal.open && modal.mode !== "view" && (
        <BranchFormModal
          mode={modal.mode}
          data={modal.mode === "edit" ? modal.data : undefined}
          onClose={closeModal}
          onSubmit={(payload) => upsert(payload, modal.mode === "edit" ? "edit" : "add")}
        />
      )}
      {modal.open && modal.mode === "view" && <BranchViewModal data={modal.data} onClose={closeModal} />}

      {/* Confirm dialog */}
      {confirmBox.open && (
        <ConfirmDialog
          title={confirmBox.title}
          description={confirmBox.description}
          danger={confirmBox.danger}
          onCancel={() => {
            confirmBox.resolve?.(false);
            setConfirmBox((s) => ({ ...s, open: false }));
          }}
          onConfirm={() => {
            confirmBox.resolve?.(true);
            setConfirmBox((s) => ({ ...s, open: false }));
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------- Atoms -------------------------------- */
function Stat({
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

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-lg font-semibold text-[#3498db]">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function Line({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center">
      <i className={`fa-solid ${icon} mr-2 text-[#3498db]`} /> {text}
    </div>
  );
}

/* ------------------------------ Pagination ----------------------------- */
function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const to = (p: number) => onPage(Math.min(totalPages, Math.max(1, p)));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      <button
        className="rounded-md px-2 py-1 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40"
        onClick={() => to(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <i className="fa-solid fa-chevron-left" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`rounded-md px-2 py-1 text-sm ring-1 ring-slate-200 ${
            p === page ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50"
          }`}
          onClick={() => to(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <button
        className="rounded-md px-2 py-1 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40"
        onClick={() => to(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <i className="fa-solid fa-chevron-right" />
      </button>
    </div>
  );
}

/* ----------------------------- VIEW MODAL ----------------------------- */
function BranchViewModal({ data, onClose }: { data: Branch; onClose: () => void }) {
  const created =
    data.createdAt != null ? new Date(data.createdAt as any).toLocaleString() : "—";
  const updated =
    data.updatedAt != null ? new Date(data.updatedAt as any).toLocaleString() : "—";

  return (
    <div
      className="fixed inset-0 z-[2000] grid place-items-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-white px-5 py-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{data.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ${
                  data.status === "active"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-rose-50 text-rose-700 ring-rose-200"
                }`}
              >
                Status: {data.status === "active" ? "Active" : "Inactive"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-sky-700 ring-1 ring-sky-200">
                <i className="fa-solid fa-user-tie" /> {data.manager}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-2xl leading-none text-slate-500 hover:text-slate-700"
          >
            &times;
          </button>
        </div>

        <div className="grid max-h-[80vh] grid-cols-1 overflow-y-auto md:grid-cols-2">
          <div className="p-5">
            <h4 className="text-sm font-semibold text-slate-700">Contact</h4>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <Line icon="fa-phone" text={data.phone} />
              <Line icon="fa-envelope" text={data.email} />
              <Line icon="fa-map-marker-alt" text={data.address} />
            </div>

            <h4 className="mt-5 text-sm font-semibold text-slate-700">Notes</h4>
            <p className="mt-1 whitespace-pre-line text-slate-700">{data.notes || "—"}</p>
          </div>

          <div className="border-t p-5 md:border-l md:border-t-0">
            <div className="grid gap-3 sm:grid-cols-3">
              <Tile label="Staff" value={String(data.staff)} icon="fa-users" />
              <Tile label="Beneficiaries" value={String(data.beneficiaries)} icon="fa-hand-holding-heart" />
              <Tile label="Funding" value={data.funding.replace("$", "₹")} icon="fa-sack-dollar" />

            </div>
            <div className="mt-4 space-y-1 text-xs text-slate-500">
              <div>Created: {created}</div>
              <div>Last Updated: {updated}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-white px-5 py-3">
          <button onClick={onClose} className="rounded-md bg-slate-600 px-3 py-2 text-white hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-sky-600 ring-1 ring-slate-200">
        <i className={`fa-solid ${icon}`} />
      </span>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-base font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}

/* ------------------------------ FORM MODAL ----------------------------- */
function BranchFormModal({
  mode,
  data,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  data?: Branch;
  onClose: () => void;
  onSubmit: (payload: Partial<Branch>) => void;
}) {
  const [form, setForm] = useState<Partial<Branch>>(
    mode === "edit"
      ? { ...data }
      : {
          name: "",
          status: "active",
          manager: "",
          phone: "",
          email: "",
          address: "",
          staff: 0,
          beneficiaries: 0,
          funding: "₹0",
          notes: "",
        }
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const submit = () => {
    if (!form.name || !form.manager || !form.email || !form.phone || !form.address) return;
    if (mode === "edit" && data) form.id = data.id;
    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 z-[2000] grid place-items-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-800">{mode === "edit" ? "Edit Branch" : "Add New Branch"}</h3>
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none text-slate-500 hover:text-slate-700">
            &times;
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto px-5 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Branch Name" required value={form.name ?? ""} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Select
              label="Status"
              value={(form.status as Branch["status"]) ?? "active"}
              onChange={(v) => setForm((f) => ({ ...f, status: v as Branch["status"] }))}
              options={[
                ["active", "Active"],
                ["inactive", "Inactive"],
              ]}
            />
            <TextField label="Branch Manager" value={form.manager ?? ""} onChange={(v) => setForm((f) => ({ ...f, manager: v }))} />
            <TextField label="Phone" value={form.phone ?? ""} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <TextField label="Email" value={form.email ?? ""} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
            <TextField
  label="Funding (e.g., ₹5.5K)"
  value={form.funding ?? ""}
  onChange={(v) => setForm((f) => ({ ...f, funding: v }))}
/>


            <NumberField label="Staff" value={Number(form.staff ?? 0)} onChange={(v) => setForm((f) => ({ ...f, staff: v }))} />
            <NumberField
              label="Beneficiaries"
              value={Number(form.beneficiaries ?? 0)}
              onChange={(v) => setForm((f) => ({ ...f, beneficiaries: v }))}
            />

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
                value={form.address ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Street, City, State ZIP"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                rows={4}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
                value={form.notes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any internal notes for this branch…"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t bg-white px-5 py-3">
          <button onClick={onClose} className="rounded-md bg-slate-600 px-3 py-2 text-white hover:bg-slate-700">
            Cancel
          </button>
          <button onClick={submit} className="rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700">
            {mode === "edit" ? "Save Changes" : "Save Branch"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Inputs & Dialogs ------------------------- */
function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="number"
        min={0}
        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[2100] grid place-items-center bg-black/50 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md bg-slate-600 px-3 py-2 text-white hover:bg-slate-700">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-3 py-2 text-white ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {danger ? "Delete" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Helpers ----------------------------- */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-6 w-16 rounded-full bg-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3">
            <div className="h-10 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl bg-white p-10 text-center ring-1 ring-slate-200">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
        <i className="fa-solid fa-code-branch" />
      </div>
      <h4 className="text-lg font-semibold text-slate-900">No branches yet</h4>
      <p className="mt-1 text-sm text-slate-600">Create your first branch to get started.</p>
      <button
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
      >
        <i className="fa-solid fa-plus" /> Add Branch
      </button>
    </div>
  );
}
