"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import LiveDate from "@/components/LiveDate";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Volunteer = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  address?: string;
  skills: string[];
  totalHours: number;
  lastActivity: string;
  status: string;
};

type GroupedVolunteers = {
  label: string;
  items: Volunteer[];
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const autoStatus = (v: Volunteer) => {
  if (v.totalHours >= 50) return "Active";
  if (v.totalHours === 0) return "New";
  return v.status || "Inactive";
};

async function fetchVolunteers(): Promise<Volunteer[]> {
  const res = await fetch("/api/volunteers", { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.volunteers ?? [];
}

/* Grouping: Professional / Recent / All */
function groupVolunteers(list: Volunteer[]): GroupedVolunteers[] {
  const professional: Volunteer[] = [];
  const recent: Volunteer[] = [];
  const all: Volunteer[] = [...list];

  const now = Date.now();
  const THIRTY = 30 * 24 * 60 * 60 * 1000;

  list.forEach((v) => {
    if (v.skills.length >= 3 || v.totalHours >= 50) professional.push(v);

    const last = new Date(v.lastActivity || Date.now()).getTime();
    if (now - last < THIRTY) recent.push(v);
  });

  return [
    { label: "⭐ Professional Volunteers", items: professional },
    { label: "🔥 Recently Active", items: recent },
    { label: "👥 All Volunteers", items: all },
  ];
}

/* -------------------------------------------------------------------------- */
/* MODAL (ADD + EDIT)                                                         */
/* -------------------------------------------------------------------------- */

function VolunteerModal({ mode, data, onClose, onSaved }: any) {
  const [form, setForm] = useState(() => {
    const initial = data || {
      name: "",
      email: "",
      phone: "",
      address: "",
      avatar: "",
      skills: [] as string[],
    };

    return {
      ...initial,
      skillsText: initial.skills.join(", "),
    };
  });

  const update = (k: string, v: any) =>
    setForm((prev: any) => ({ ...prev, [k]: v }));

  const buildPayload = () => ({
    name: form.name,
    email: form.email,
    phone: form.phone || "",
    address: form.address || "",
    avatar: form.avatar || "",
    skills: form.skillsText
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean),
  });

  const handleSave = async () => {
    const payload = buildPayload();
    if (!payload.name.trim())
      return Swal.fire("Validation", "Name is required", "warning");

    if (mode === "add") {
      await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      Swal.fire("Success", "Volunteer added", "success");
    } else {
      await fetch(`/api/volunteers/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      Swal.fire("Updated", "Volunteer updated", "success");
    }

    await onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        <div className="bg-blue-600 px-6 py-4 text-white font-semibold text-lg">
          {mode === "add" ? "Add Volunteer" : "Edit Volunteer"}
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <img
              src={
                form.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="h-24 w-24 rounded-full border shadow object-cover"
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Avatar URL"
              value={form.avatar}
              onChange={(e) => update("avatar", e.target.value)}
            />
          </div>

          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Skills (comma separated)"
            value={form.skillsText}
            onChange={(e) => update("skillsText", e.target.value)}
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>

        <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN PAGE – TABLE VIEW                                                     */
/* -------------------------------------------------------------------------- */

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<any>({ open: false });

  const load = async () => {
    const list = await fetchVolunteers();
    setVolunteers(list);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = volunteers.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.skills.join(" ").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Volunteers</h2>
          <p className="text-gray-500">Manage active and registered volunteers</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            placeholder="Search volunteers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border rounded-lg px-4 py-2 shadow-sm"
          />
          <button
            onClick={() => setModal({ open: true, mode: "add" })}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700"
          >
            + Add Volunteer
          </button>
          <LiveDate className="text-sm text-gray-500" />
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4 text-left">Avatar</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Skills</th>
              <th className="p-4 text-left">Hours</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Last Active</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((v) => {
              const status = autoStatus(v);

              return (
                <tr
                  key={v.id}
                  className="border-t hover:bg-gray-50 transition text-sm"
                >
                  <td className="p-4">
                    <img
                      src={
                        v.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </td>

                  <td className="p-4 font-semibold">{v.name}</td>

                  <td className="p-4 text-gray-700">{v.email}</td>

                  <td className="p-4 text-gray-700">{v.phone || "-"}</td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {v.skills.slice(0, 4).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4">{v.totalHours}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status === "Active"
                          ? "bg-green-100 text-green-700"
                          : status === "New"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  <td className="p-4 text-gray-700">{v.lastActivity}</td>

                  <td className="p-4 space-x-2">
                    <button
                      onClick={() =>
                        setModal({ open: true, mode: "edit", data: v })
                      }
                      className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold"
                    >
                      Edit
                    </button>

                    <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                      View
                    </button>

                    <button className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">
                  No volunteers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modal.open && modal.mode && (
        <VolunteerModal
          mode={modal.mode}
          data={modal.data}
          onClose={() => setModal({ open: false })}
          onSaved={load}
        />
      )}
    </div>
  );
}
