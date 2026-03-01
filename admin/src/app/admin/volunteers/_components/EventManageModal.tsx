"use client";

import React, { useState } from "react";

export default function EventManageModal({ mode, data, onClose, onSubmit }: any) {
  const [form, setForm] = useState(
    data || {
      title: "",
      date: "",
      location: "",
      description: "",
    }
  );

  const update = (key: string, val: any) =>
    setForm((p: any) => ({ ...p, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b bg-blue-600 text-white">
          <h2 className="text-lg font-semibold">
            {mode === "add" ? "Add Event" : "Edit Event"}
          </h2>
        </div>

        {/* FORM */}
        <div className="px-6 py-4 space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            className="w-full border p-2 rounded"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />

          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />

          <input
            type="text"
            placeholder="Location"
            className="w-full border p-2 rounded"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => onSubmit(form)}
          >
            {mode === "add" ? "Add Event" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
