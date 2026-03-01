"use client";

import { useEffect, useMemo, useState } from "react";
import LiveDate from "@/components/LiveDate";
import DonationFormModal from "./DonationFormModal";
import DonationEditModal from "./DonationEditModal";
import DonationAddModal from "./DonationAddModal";
import Swal from "sweetalert2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Doughnut, Pie, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

type DonationStatus = "CONFIRMED" | "PENDING" | "FAILED";
type PaymentMode =
  | "UPI"
  | "BANK_TRANSFER"
  | "CARD"
  | "CASH"
  | "CHEQUE"
  | "OTHER";

type Donation = {
  id: string;
  donor: { id: string; name: string; email: string; phone?: string; avatar?: string; type?: string };
  campaign?: { id: string; title?: string };
  amount: number;
  donatedAt: string;
  paymentMode?: PaymentMode;
  utr?: string;
  bankName?: string;
  gateway?: string;
  gatewayRef?: string;
  currency?: string;
  fxRate?: string;
  giftInMemoryOf?: string;
  giftInHonourOf?: string;
  note?: string;
  receiptNo?: string;
  fcra?: boolean;
  status: DonationStatus;
  createdAt?: string;
  updatedAt?: string;
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DonationStatus>("all");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // ---------- Fetch ----------
  async function loadDonations() {
    try {
      const res = await fetch("/api/donations");
      const data = await res.json();
      setDonations(data);
    } catch (e) {
      console.error("Failed to load donations:", e);
    }
  }

  useEffect(() => {
    loadDonations();
  }, []);

  // ---------- Filters ----------
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return donations.filter((d) => {
      const donorName = d.donor?.name?.toLowerCase() || "";
      const donorEmail = d.donor?.email?.toLowerCase() || "";
      const campaign = d.campaign?.title?.toLowerCase() || "";
      const matchSearch = donorName.includes(q) || donorEmail.includes(q) || campaign.includes(q);
      const matchStatus = statusFilter === "all" ? true : d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, donations]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // ---------- Export ----------
  async function exportCsv() {
    const res = await fetch("/api/donations/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------- Email Composer ----------
  async function openEmailComposer(ids: string[]) {
    const { value: form } = await Swal.fire({
      title: "Compose Email",
      html: `
        <input id="swal-subject" class="swal2-input" placeholder="Subject" value="Thank you for your contribution!" />
        <textarea id="swal-message" class="swal2-textarea" rows="6" placeholder="Message">Dear Donor,\n\nThank you for your generous contribution to our cause.\nYour support helps us continue our mission.\n\nWarm regards,\n{Organization Name}</textarea>
        <label style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:10px;">
          <input type="checkbox" id="swal-attach" /> Attach Receipt (PDF)
        </label>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Send Email",
      preConfirm: () => {
        const subject = (document.getElementById("swal-subject") as HTMLInputElement)?.value || "";
        const message = (document.getElementById("swal-message") as HTMLTextAreaElement)?.value || "";
        const attach = (document.getElementById("swal-attach") as HTMLInputElement)?.checked || false;
        return { subject, message, attach };
      },
    });

    if (!form) return;

    Swal.fire({ title: "Sending...", didOpen: () => Swal.showLoading() });

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, subject: form.subject, message: form.message, attach: form.attach }),
      });

      if (res.ok) Swal.fire("✅ Sent!", "Email sent successfully.", "success");
      else Swal.fire("Error", "Failed to send email.", "error");
    } catch (err) {
      Swal.fire("Error", "Something went wrong while sending email.", "error");
    }
  }

  // ---------- Delete ----------
  async function deleteDonation(id: string | string[]) {
    const confirm = await Swal.fire({
      title: Array.isArray(id) ? "Delete selected donations?" : "Delete Donation?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (!confirm.isConfirmed) return;

    const res = await fetch("/api/donations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.isArray(id) ? id : [id] }),
    });
    if (res.ok) {
      Swal.fire("Deleted!", "Donation(s) removed.", "success");
      loadDonations();
      setSelectedIds([]);
    } else Swal.fire("Error", "Failed to delete.", "error");
  }

  // ---------- Handlers ----------
  function handleAdd(donor?: any) {
    setSelectedDonation(donor || null);
    setShowAddModal(true);
  }
  function handleFormAdd() {
    setShowFormModal(true);
  }
  function handleEdit(d: Donation) {
    setSelectedDonation(d);
    setShowEditModal(true);
  }
  function handleView(d: Donation) {
    setSelectedDonation(d);
    setShowViewModal(true);
  }
  
  async function handleSave() {
    await loadDonations();
  }

  // ---------- Select ----------
  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }
  function toggleSelectAll() {
    if (paginated.every((d) => selectedIds.includes(d.id))) {
      setSelectedIds((prev) => prev.filter((id) => !paginated.some((d) => d.id === id)));
    } else {
      const newIds = paginated.map((d) => d.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...newIds])));
    }
  }

  // ---------- Totals ----------
  const totals = useMemo(() => {
    const totalAmount = donations.reduce((a, b) => a + Number(b.amount), 0);
    const confirmed = donations.filter((d) => d.status === "CONFIRMED").length;
    const pending = donations.filter((d) => d.status === "PENDING").length;
    const failed = donations.filter((d) => d.status === "FAILED").length;
    return { totalAmount, confirmed, pending, failed };
  }, [donations]);

  // ---------- Charts ----------
  const charts = useMemo(() => {
    const campaignTotals: Record<string, number> = {};
    donations.forEach((d) => {
      const campaign = d.campaign?.title || "Uncategorized";
      campaignTotals[campaign] = (campaignTotals[campaign] || 0) + Number(d.amount);
    });

    const monthlyTotals: Record<string, number> = {};
    donations.forEach((d) => {
      const date = new Date(d.donatedAt);
      const month = date.toLocaleString("en-US", { month: "short" });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(d.amount);
    });

    const paymentTotals: Record<string, number> = {};
    donations.forEach((d) => {
      const mode = d.paymentMode || "OTHER";
      paymentTotals[mode] = (paymentTotals[mode] || 0) + 1;
    });

    const statusTotals = {
      CONFIRMED: donations.filter((d) => d.status === "CONFIRMED").length,
      PENDING: donations.filter((d) => d.status === "PENDING").length,
      FAILED: donations.filter((d) => d.status === "FAILED").length,
    };

    return {
      campaigns: { labels: Object.keys(campaignTotals), data: Object.values(campaignTotals) },
      monthly: { labels: Object.keys(monthlyTotals), data: Object.values(monthlyTotals) },
      payments: { labels: Object.keys(paymentTotals), data: Object.values(paymentTotals) },
      status: { labels: Object.keys(statusTotals), data: Object.values(statusTotals) },
    };
  }, [donations]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto p-5">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-[#343a40]">Donations Management</h2>
        <LiveDate className="text-gray-600" />
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard color="bg-sky-500" icon="fa-sack-dollar" label="Total Donations" value={`₹${totals.totalAmount.toLocaleString("en-IN")}`} />
        <SummaryCard color="bg-green-500" icon="fa-check-circle" label="Confirmed" value={totals.confirmed} />
        <SummaryCard color="bg-amber-500" icon="fa-hourglass-half" label="Pending" value={totals.pending} />
        <SummaryCard color="bg-rose-500" icon="fa-times-circle" label="Failed" value={totals.failed} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">All Donations ({filtered.length})</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            disabled={selectedIds.length === 0}
            onClick={() => openEmailComposer(selectedIds)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow ${
              selectedIds.length ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-slate-200 text-slate-400"
            }`}
          >
            <i className="fa-solid fa-envelope" /> Bulk Email
          </button>

          <button
            disabled={selectedIds.length === 0}
            onClick={() => deleteDonation(selectedIds)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow ${
              selectedIds.length ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-slate-200 text-slate-400"
            }`}
          >
            <i className="fa-solid fa-trash" /> Bulk Delete
          </button>

          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | DonationStatus)}
          >
            <option value="all">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor, email or campaign..."
            className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
          />

          <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
            <i className="fa-solid fa-file-csv" /> Export
          </button>

          <button onClick={handleFormAdd} className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm text-white shadow hover:bg-sky-700">
            <i className="fa-solid fa-plus" /> Add Donation
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-10 text-center ring-1 ring-slate-200">
          <i className="fa-solid fa-hand-holding-heart text-4xl text-sky-500 mb-3" />
          <p className="text-lg font-semibold text-slate-700">No donations yet</p>
          <p className="text-slate-500 text-sm mb-4">Create your first donation to get started.</p>
          <button
            onClick={handleFormAdd}
            className="flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 shadow"
          >
            <i className="fa-solid fa-plus"></i> Add Donation
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow ring-1 ring-slate-200 mb-6">
            <table className="min-w-full text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">
                    <input type="checkbox" onChange={toggleSelectAll} checked={paginated.every((d) => selectedIds.includes(d.id))} />
                  </th>
                  <th className="px-5 py-3 text-left">Donor</th>
                  <th className="px-5 py-3 text-left">Campaign</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Payment</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d, i) => (
                  <tr key={d.id} className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition`}>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" checked={selectedIds.includes(d.id)} onChange={() => toggleSelect(d.id)} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {d.donor.avatar ? (
                          <img src={d.donor.avatar} alt={d.donor.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
                            {d.donor.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sky-700">{d.donor.name}</p>
                          <p className="text-xs text-slate-500">{d.donor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{d.campaign?.title || "—"}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">₹{d.amount.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3">{d.paymentMode || "N/A"}</td>
                    <td className="px-5 py-3">{new Date(d.donatedAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          d.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : d.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleAdd(d.donor)} className="rounded bg-sky-100 px-3 py-1 text-xs text-sky-700 hover:bg-sky-200">Add</button>
                        <button onClick={() => handleEdit(d)} className="rounded bg-amber-100 px-3 py-1 text-xs text-amber-700 hover:bg-amber-200">Edit</button>
                        <button onClick={() => handleView(d)} className="rounded bg-indigo-100 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-200">View</button>
                        <button onClick={() => openEmailComposer([d.id])} className="rounded bg-emerald-100 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-200">Email</button>
                        <button onClick={() => deleteDonation(d.id)} className="rounded bg-rose-100 px-3 py-1 text-xs text-rose-700 hover:bg-rose-200">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-3 py-1 rounded border ${page === 1 ? "text-slate-400 border-slate-200" : "text-sky-700 border-sky-200 hover:bg-sky-50"}`}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? "bg-sky-600 text-white" : "bg-white border text-sky-700 hover:bg-sky-50"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-3 py-1 rounded border ${page === totalPages ? "text-slate-400 border-slate-200" : "text-sky-700 border-sky-200 hover:bg-sky-50"}`}
            >
              ›
            </button>
          </div>
        </>
      )}

      {/* Charts */}
      <ChartsSection charts={charts} />

      {/* Modals */}
      <DonationFormModal open={showFormModal} onClose={() => setShowFormModal(false)} onSave={handleSave} editData={editData} />
      <DonationEditModal open={showEditModal} onClose={() => setShowEditModal(false)} onSave={handleSave} editData={selectedDonation} />
      <DonationAddModal open={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleSave} donor={selectedDonation} />
        <DonationViewModal
  open={showViewModal}
  onClose={() => setShowViewModal(false)}
  donation={selectedDonation}
/>

    </div>
  );
}
/* ---------------------- View Modal ---------------------- */
/* ---------------------- View Modal (Scrollable + All Details) ---------------------- */
function DonationViewModal({
  open,
  onClose,
  donation,
}: {
  open: boolean;
  onClose: () => void;
  donation: any | null;
}) {
  if (!open || !donation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-hand-holding-heart text-sky-600" />
            Donation Details
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-[15px] text-slate-700">
          {/* Donor Info */}
          <div className="flex items-center gap-3 border-b pb-4">
            {donation.donor?.avatar ? (
              <img
                src={donation.donor.avatar}
                alt={donation.donor.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-sky-200"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold text-base">
                {donation.donor?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div>
              <h4 className="font-semibold text-sky-700 text-base">
                {donation.donor?.name}
              </h4>
              <p className="text-slate-500 text-sm">{donation.donor?.email}</p>
              {donation.donor?.phone && (
                <p className="text-slate-500 text-sm">{donation.donor?.phone}</p>
              )}
            </div>
          </div>

          {/* Donation Info */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <p>
              <b>Campaign:</b> {donation.campaign?.title || "—"}
            </p>
            <p>
              <b>Amount:</b>{" "}
              <span className="text-green-600 font-semibold">
                ₹{donation.amount?.toLocaleString("en-IN")}
              </span>
            </p>
            <p>
              <b>Payment Mode:</b> {donation.paymentMode || "N/A"}
            </p>
            <p>
              <b>Date:</b>{" "}
              {new Date(donation.donatedAt).toLocaleDateString("en-IN")}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  donation.status === "CONFIRMED"
                    ? "bg-green-100 text-green-700"
                    : donation.status === "PENDING"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {donation.status}
              </span>
            </p>
            {donation.fcra && (
              <p>
                <b>FCRA Donation:</b>{" "}
                <span className="text-blue-600 font-medium">Yes</span>
              </p>
            )}
            {donation.receiptNo && (
              <p>
                <b>Receipt No:</b> {donation.receiptNo}
              </p>
            )}
          </div>

          {/* Transaction Details */}
          <div className="rounded-lg border bg-slate-50 p-4 text-sm space-y-1">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-building-columns text-sky-600"></i>
              Transaction Details
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <p>
                <b>UTR / Ref No:</b> {donation.utr || "—"}
              </p>
              <p>
                <b>Bank Name:</b> {donation.bankName || "—"}
              </p>
              <p>
                <b>Gateway:</b> {donation.gateway || "—"}
              </p>
              <p>
                <b>Gateway Ref:</b> {donation.gatewayRef || "—"}
              </p>
              <p>
                <b>Currency:</b> {donation.currency || "INR"}
              </p>
              <p>
                <b>FX Rate:</b> {donation.fxRate || "—"}
              </p>
            </div>
          </div>

          {/* Gift Information */}
          {(donation.giftInMemoryOf || donation.giftInHonourOf) && (
            <div className="rounded-lg border bg-blue-50 p-4 text-sm space-y-1">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-gift text-blue-500"></i>
                Gift Information
              </h4>
              {donation.giftInMemoryOf && (
                <p>
                  <i className="fa-solid fa-dove text-blue-400 mr-1"></i>
                  <b>In Memory Of:</b> {donation.giftInMemoryOf}
                </p>
              )}
              {donation.giftInHonourOf && (
                <p>
                  <i className="fa-solid fa-heart text-pink-400 mr-1"></i>
                  <b>In Honour Of:</b> {donation.giftInHonourOf}
                </p>
              )}
            </div>
          )}

          {/* Additional Fields */}
          {(donation.gateway || donation.gatewayRef || donation.fxRate) && (
            <div className="rounded-lg border bg-teal-50 p-4 text-sm">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-globe text-teal-600"></i>
                International / Gateway Info
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <p>
                  <b>Gateway:</b> {donation.gateway || "—"}
                </p>
                <p>
                  <b>Gateway Ref:</b> {donation.gatewayRef || "—"}
                </p>
                <p>
                  <b>FX Rate:</b> {donation.fxRate || "—"}
                </p>
              </div>
            </div>
          )}

          {/* Note */}
          {donation.note && (
            <div className="rounded-lg border bg-amber-50 p-4 text-sm text-slate-700">
              <i className="fa-solid fa-note-sticky text-amber-500 mr-2"></i>
              <b>Note:</b> {donation.note}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="rounded-lg bg-sky-600 text-white px-5 py-2 text-sm font-medium hover:bg-sky-700 shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


/* ---------------------- Summary Cards & Charts ---------------------- */
function SummaryCard({ icon, color, label, value }: { icon: string; color: string; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow ring-1 ring-slate-200">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${color}`}>
        <i className={`fa-solid ${icon} text-lg`} />
      </div>
      <div>
        <h4 className="text-xl font-semibold text-slate-800">{value}</h4>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function ChartsSection({ charts }: { charts: any }) {
  return (
    <div className="mt-10">
      <h3 className="mb-4 text-xl font-semibold text-slate-800">Donation Analytics</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
        <ChartCard title="Donations by Campaign">
  <Pie
    data={{
      labels: charts.campaigns.labels.filter((_, i) => charts.campaigns.data[i] > 0),
      datasets: [
        {
          data: charts.campaigns.data.filter((v: number) => v > 0),
          backgroundColor: ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c"],
          borderWidth: 1,
        },
      ],
    }}
    options={{
      plugins: {
        legend: { position: "bottom" },
        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ₹${ctx.parsed.toLocaleString("en-IN")}` } },
      },
      maintainAspectRatio: false,
    }}
  />
</ChartCard>


        <ChartCard title="Monthly Donation Trend">
          <Line
            data={{
              labels: charts.monthly.labels,
              datasets: [{ label: "Donations (₹)", data: charts.monthly.data, borderColor: "#3498db", backgroundColor: "rgba(52,152,219,0.1)", fill: true, tension: 0.3 }],
            }}
            options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } }, maintainAspectRatio: false }}
          />
        </ChartCard>

        <ChartCard title="Donations by Payment Method">
          <Doughnut
            data={{
              labels: charts.payments.labels,
              datasets: [{ data: charts.payments.data, backgroundColor: ["#3498db", "#2ecc71", "#9b59b6", "#f39c12", "#95a5a6"], cutout: "70%" }],
            }}
            options={{ plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false }}
          />
        </ChartCard>

        <ChartCard title="Donation Status Overview">
          <Bar
            data={{
              labels: charts.status.labels,
              datasets: [{ data: charts.status.data, backgroundColor: ["#2ecc71", "#f39c12", "#e74c3c"] }],
            }}
            options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, maintainAspectRatio: false }}
          />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow ring-1 ring-slate-200 overflow-hidden">
      <h4 className="mb-3 text-base font-semibold text-slate-800">{title}</h4>
      <div className="h-[260px] flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-[95%] h-[230px]">{children}</div>
      </div>
    </div>
  );
}
