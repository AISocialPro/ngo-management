"use client";

import { useState } from "react";
import "../../globals.css";


type Branch = {
  id: string;
  name: string;
  status: "active" | "inactive";
  manager: string;
  phone: string;
  email: string;
  address: string;
  staff: number;
  beneficiaries: number;
  funding: string;
};

const initialBranches: Branch[] = [
  {
    id: "ny",
    name: "New York City",
    status: "active",
    manager: "Michael Johnson",
    phone: "+1 (212) 555-7890",
    email: "ny.branch@ngoconnect.org",
    address: "123 Broadway, New York, NY 10001",
    staff: 15,
    beneficiaries: 842,
    funding: "$12.5K",
  },
  {
    id: "la",
    name: "Los Angeles",
    status: "active",
    manager: "Emily Rodriguez",
    phone: "+1 (310) 555-1234",
    email: "la.branch@ngoconnect.org",
    address: "456 Sunset Blvd, Los Angeles, CA 90028",
    staff: 12,
    beneficiaries: 756,
    funding: "$9.8K",
  },
  {
    id: "chi",
    name: "Chicago",
    status: "active",
    manager: "David Wilson",
    phone: "+1 (312) 555-5678",
    email: "chicago.branch@ngoconnect.org",
    address: "789 Michigan Ave, Chicago, IL 60611",
    staff: 10,
    beneficiaries: 623,
    funding: "$8.2K",
  },
  {
    id: "hou",
    name: "Houston",
    status: "inactive",
    manager: "Sarah Thompson",
    phone: "+1 (713) 555-9012",
    email: "houston.branch@ngoconnect.org",
    address: "321 Main St, Houston, TX 77002",
    staff: 8,
    beneficiaries: 412,
    funding: "$5.5K",
  },
];

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Branch>>({
    status: "active",
  });

  const resetForm = () => setForm({ status: "active" });

  const addBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.manager || !form.email || !form.phone || !form.address) return;
    const newBranch: Branch = {
      id: crypto.randomUUID(),
      name: form.name,
      status: (form.status as Branch["status"]) || "active",
      manager: form.manager,
      phone: form.phone,
      email: form.email,
      address: form.address,
      staff: Number(form.staff ?? 0),
      beneficiaries: Number(form.beneficiaries ?? 0),
      funding: form.funding || "$0",
    };
    setBranches((b) => [newBranch, ...b]);
    setOpen(false);
    resetForm();
  };

  const remove = (id: string) => {
    if (confirm("Delete this branch?")) setBranches((b) => b.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden p-5">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-[#343a40]">Branch Management</h2>
        <p className="text-gray-600">Monday, 15 January 2023</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { color: "#3498db", icon: "fa-code-branch", value: branches.length, label: "Total Branches" },
          { color: "#2ecc71", icon: "fa-check-circle", value: branches.filter(b => b.status === "active").length, label: "Active Branches" },
          { color: "#e74c3c", icon: "fa-users", value: branches.reduce((a, b) => a + b.staff, 0), label: "Branch Staff" },
          { color: "#f39c12", icon: "fa-hand-holding-heart", value: branches.reduce((a, b) => a + b.beneficiaries, 0), label: "Beneficiaries Served" },
        ].map((c, i) => (
          <div key={i} className="flex items-center rounded-xl bg-white p-5 shadow">
            <div
              className="mr-4 grid h-14 w-14 place-items-center rounded-xl text-xl text-white"
              style={{ backgroundColor: c.color }}
            >
              <i className={`fa-solid ${c.icon}`} />
            </div>
            <div>
              <div className="text-2xl font-semibold">{c.value}</div>
              <div className="text-sm text-gray-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Header + Add */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Branches</h3>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#3498db] px-4 py-2 text-white shadow hover:opacity-95"
        >
          <i className="fa-solid fa-plus" /> Add New Branch
        </button>
      </div>

      {/* Branch grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((b) => (
          <div key={b.id} className="rounded-xl bg-white p-5 shadow transition hover:-translate-y-0.5">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium">{b.name}</h4>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  b.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {b.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center"><i className="fa-solid fa-user-tie mr-2 text-[#3498db]" /> Manager: {b.manager}</div>
              <div className="flex items-center"><i className="fa-solid fa-phone mr-2 text-[#3498db]" /> {b.phone}</div>
              <div className="flex items-center"><i className="fa-solid fa-envelope mr-2 text-[#3498db]" /> {b.email}</div>
              <div className="flex items-center"><i className="fa-solid fa-map-marker-alt mr-2 text-[#3498db]" /> {b.address}</div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3 text-center">
              <div>
                <div className="text-lg font-semibold text-[#3498db]">{b.staff}</div>
                <div className="text-xs text-gray-500">Staff</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-[#3498db]">{b.beneficiaries}</div>
                <div className="text-xs text-gray-500">Beneficiaries</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-[#3498db]">{b.funding}</div>
                <div className="text-xs text-gray-500">Funding</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                className="flex items-center gap-2 rounded-md bg-[#3498db]/10 px-3 py-2 text-sm text-[#3498db]"
                onClick={() => alert("Edit modal would open")}
              >
                <i className="fa-solid fa-pen" /> Edit
              </button>
              <button
                className="flex items-center gap-2 rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-600"
                onClick={() => remove(b.id)}
              >
                <i className="fa-solid fa-trash" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[1050] grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b pb-3">
              <h4 className="text-lg font-semibold">Add New Branch</h4>
              <button onClick={() => { setOpen(false); resetForm(); }} aria-label="Close">
                <i className="fa-solid fa-xmark text-xl text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={addBranch} className="grid gap-3">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Branch Name</label>
                <input
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[#3498db]"
                  value={form.name ?? ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Branch Manager</label>
                <input
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[#3498db]"
                  value={form.manager ?? ""}
                  onChange={(e) => setForm({ ...form, manager: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[#3498db]"
                  value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Phone</label>
                <input
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[#3498db]"
                  value={form.phone ?? ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Address</label>
                <textarea
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[#3498db]"
                  rows={3}
                  value={form.address ?? ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[#3498db]"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Staff</label>
                  <input
                    type="number"
                    min={0}
                    className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[#3498db]"
                    value={form.staff as any ?? ""}
                    onChange={(e) => setForm({ ...form, staff: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Beneficiaries</label>
                  <input
                    type="number"
                    min={0}
                    className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[#3498db]"
                    value={form.beneficiaries as any ?? ""}
                    onChange={(e) => setForm({ ...form, beneficiaries: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Funding (e.g., $5.5K)</label>
                <input
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[#3498db]"
                  value={form.funding ?? ""}
                  onChange={(e) => setForm({ ...form, funding: e.target.value })}
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#3498db] px-4 py-2 text-sm font-medium text-white"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
