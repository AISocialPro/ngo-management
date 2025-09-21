"use client";

import { useMemo, useState } from "react";

/* ----------------------------- Types ----------------------------- */
type DocCategory =
  | "All"
  | "Legal & Regulatory"
  | "Financial Reports"
  | "Policies"
  | "Certifications"
  | "Grant Documents";

type DocItem = {
  id: string;
  title: string;
  size: string;
  updated?: string;
  expires?: string;
  icon: string; // fa-* class
  type: "PDF" | "DOCX" | "XLSX";
  category: Exclude<DocCategory, "All">;
};

/* --------------------------- Helpers ---------------------------- */
function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ----------------------------- Page ------------------------------ */
export default function CompliancePage() {
  /* ----------------------------- Data ----------------------------- */
  const docs = useMemo<DocItem[]>(
    () => [
      { id: "1", title: "Annual Report 2022", size: "2.4 MB", updated: "Jan 10, 2023", icon: "fa-file-pdf", type: "PDF", category: "Financial Reports" },
      { id: "2", title: "501(c)(3) Certification", size: "1.1 MB", expires: "Dec 15, 2024", icon: "fa-file-contract", type: "PDF", category: "Certifications" },
      { id: "3", title: "Q4 Financial Statement", size: "3.2 MB", updated: "Jan 5, 2023", icon: "fa-file-invoice-dollar", type: "XLSX", category: "Financial Reports" },
      { id: "4", title: "Partnership Agreement", size: "0.8 MB", updated: "Dec 22, 2022", icon: "fa-handshake", type: "DOCX", category: "Legal & Regulatory" },
      { id: "5", title: "Data Privacy Policy", size: "1.5 MB", updated: "v2.1", icon: "fa-shield-alt", type: "PDF", category: "Policies" },
      { id: "6", title: "Training Manual", size: "5.7 MB", updated: "Nov 30, 2022", icon: "fa-graduation-cap", type: "PDF", category: "Policies" },
    ],
    []
  );

  /* --------------------------- UI State --------------------------- */
  const categories: DocCategory[] = [
    "All",
    "Legal & Regulatory",
    "Financial Reports",
    "Policies",
    "Certifications",
    "Grant Documents",
  ];

  const [active, setActive] = useState<DocCategory>("All");
  const [query, setQuery] = useState("");

  const filtered = docs.filter((d) => {
    const byCat = active === "All" ? true : d.category === active;
    const q = query.trim().toLowerCase();
    const bySearch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q);
    return byCat && bySearch;
  });

  /* ---------------------- Checklist state ------------------------ */
  const [checklist, setChecklist] = useState<
    { id: string; text: string; due: string; status: "Completed" | "Pending" | "Overdue"; done: boolean }[]
  >([
    { id: "c1", text: "Annual Report Submission", due: "Jan 31, 2023", status: "Completed", done: true },
    { id: "c2", text: "Tax Filing (Form 990)", due: "Feb 15, 2023", status: "Pending", done: false },
    { id: "c3", text: "Financial Audit", due: "Mar 1, 2023", status: "Pending", done: false },
    { id: "c4", text: "Grant Reporting - ABC Foundation", due: "Jan 25, 2023", status: "Overdue", done: false },
    { id: "c5", text: "Board Meeting Minutes", due: "Jan 15, 2023", status: "Completed", done: true },
  ]);

  const toggleItem = (id: string) =>
    setChecklist((list) =>
      list.map((i) =>
        i.id === id ? { ...i, done: !i.done, status: i.done ? "Pending" : "Completed" } : i
      )
    );

  const addItem = () => {
    const text = prompt("Enter checklist task:");
    if (!text) return;
    const due = prompt("Enter due date (e.g. Feb 20, 2023):") || "TBD";
    setChecklist((list) => [
      ...list,
      { id: crypto.randomUUID(), text, due, status: "Pending", done: false },
    ]);
  };

  /* ---------------------------- Render ---------------------------- */
  return (
    <div className="p-5 md:p-6">
      {/* Title + date */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Compliance &amp; Documents</h2>
        <p className="text-slate-500">Monday, 15 January 2023</p>
      </div>

      {/* Search bar box */}
      <div className="relative mb-6">
        <i className="fa-solid fa-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") alert(`Searching documents for: ${query || "(empty)"}`);
          }}
          placeholder="Search for documents, policies, or compliance requirements..."
          className="w-full rounded-full border border-slate-300 px-12 py-3 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
        />
      </div>

      {/* Overview cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard icon="fa-file-alt" title="Total Documents" subtitle="142 Files" />
        <OverviewCard icon="fa-check-circle" title="Completed" subtitle="86% Compliance" />
        <OverviewCard icon="fa-exclamation-triangle" title="Pending" subtitle="14 Items Require Attention" />
        <OverviewCard icon="fa-clock" title="Upcoming Deadlines" subtitle="5 Due This Month" />
      </div>

      {/* Categories */}
      <div className="mb-3">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Document Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full px-4 py-2 text-sm",
                active === c ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Documents grid */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <div key={d.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid place-items-center bg-slate-50 py-6 text-3xl text-sky-600">
              <i className={cn("fa-solid", d.icon)} />
            </div>
            <div className="p-5">
              <h3 className="mb-2 text-slate-800">{d.title}</h3>
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <span>{d.type} • {d.size}</span>
                <span>{d.updated ? `Updated: ${d.updated}` : d.expires ? `Expires: ${d.expires}` : null}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Viewing ${d.title} (${d.type})`)}
                  className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700"
                >
                  <i className="fa-solid fa-eye" /> View
                </button>
                <button
                  onClick={() => alert(`Downloading ${d.title}`)}
                  className="inline-flex items-center gap-2 rounded-md border border-sky-600 px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
                >
                  <i className="fa-solid fa-download" /> Download
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No documents match your filters.
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Compliance Checklist</h3>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700"
          >
            <i className="fa fa-plus" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {checklist.map((i) => (
            <label key={i.id} className={cn("flex items-center rounded-lg border border-slate-200 bg-white p-3", i.done && "opacity-90")}>
              <input
                type="checkbox"
                checked={i.done}
                onChange={() => toggleItem(i.id)}
                className="mr-3 h-5 w-5 accent-sky-600"
              />
              <span className={cn("flex-1", i.done && "line-through text-slate-500")}>{i.text}</span>
              <span className="mr-3 text-xs text-slate-500">Due: {i.due}</span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium",
                  i.status === "Completed" && "bg-emerald-100 text-emerald-700",
                  i.status === "Pending" && "bg-amber-100 text-amber-700",
                  i.status === "Overdue" && "bg-rose-100 text-rose-700"
                )}
              >
                {i.status}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-8">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Recent Compliance Activities</h3>
        <div className="space-y-4">
          {[
            { date: "Jan 14, 2023", text: "Annual Report was submitted to regulatory authorities" },
            { date: "Jan 10, 2023", text: "Board Meeting minutes were documented and approved" },
            { date: "Jan 5, 2023", text: "Financial Review for Q4 2022 was completed" },
            { date: "Dec 28, 2022", text: "Data Privacy Policy was updated to reflect new regulations" },
          ].map((t, i) => (
            <div key={i} className="relative border-l-2 border-sky-600 pl-6">
              <span className="absolute -left-[7px] top-3 h-3.5 w-3.5 rounded-full bg-sky-600" />
              <div className="text-xs text-slate-500">{t.date}</div>
              <div className="mt-1 rounded-lg bg-slate-50 p-3">{t.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload section */}
      <div className="rounded-xl bg-slate-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-800">Need to upload a document?</h3>
        <p className="mt-1 text-slate-600">Ensure all documents are properly labeled and in the correct format</p>
        <button
          onClick={() => alert("Document upload dialog would open here")}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
        >
          <i className="fa-solid fa-cloud-upload-alt" /> Upload Document
        </button>
      </div>
    </div>
  );
}

/* ------------------------- Small UI Components ------------------------- */
function OverviewCard({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-5 text-center shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 text-3xl text-sky-600">
        <i className={cn("fa-solid", icon)} />
      </div>
      <h4 className="text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
