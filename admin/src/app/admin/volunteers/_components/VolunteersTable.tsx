"use client";

import React from "react";

type VolStatus = "Active" | "Inactive" | "New";

export type VolunteerRow = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalHours: number;
  skills: string[];
  status: VolStatus;
};

type Props = {
  volunteers: VolunteerRow[];
  vLoading: boolean;
  query: string;
  setQuery: (q: string) => void;
  statusFilter: VolStatus | "";
  setStatusFilter: (s: VolStatus | "") => void;
  openAdd: () => void;
  openEdit: (v: VolunteerRow) => void;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
};

const VolunteersTable: React.FC<Props> = ({
  volunteers,
  vLoading,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  openAdd,
  openEdit,
  page,
  setPage,
  totalPages,
}) => {
  return (
    <div className="space-y-6">

      {/* SEARCH + FILTER BAR */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search volunteers..."
          className="border p-2 rounded-lg w-full md:w-80 shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="border p-2 rounded-lg shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="New">New</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + Add Volunteer
        </button>
      </div>

      {/* LOADING */}
      {vLoading && <p className="text-gray-500">Loading...</p>}

      {/* NO DATA */}
      {!vLoading && volunteers.length === 0 && (
        <p className="text-gray-500">No volunteers found.</p>
      )}

      {/* GRID CARDS */}
      {!vLoading && volunteers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteers.map((v) => (
            <div
              key={v.id}
              className="border rounded-xl p-5 bg-white shadow hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={v.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  className="w-14 h-14 rounded-full border"
                />
                <div>
                  <p className="font-semibold">{v.name}</p>
                  <p className="text-sm text-gray-500">{v.email}</p>
                </div>
              </div>

              <div className="mt-3">
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    v.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : v.status === "New"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                  ⏱ {v.totalHours} hrs
                </span>
                {v.skills.slice(0, 3).map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => openEdit(v)}
                  className="px-4 py-1 bg-slate-700 text-white rounded-lg"
                >
                  Edit
                </button>
                <button className="px-4 py-1 bg-blue-600 text-white rounded-lg">
                  Invite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="px-3 py-1 border rounded-lg bg-white"
            disabled={page === 1}
          >
            Prev
          </button>

          <span className="text-gray-700 text-sm">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="px-3 py-1 border rounded-lg bg-white"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default VolunteersTable;
