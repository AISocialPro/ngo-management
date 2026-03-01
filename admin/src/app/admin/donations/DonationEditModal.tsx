"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import "flatpickr/dist/themes/material_blue.css";

const Flatpickr = dynamic(() => import("react-flatpickr"), { ssr: false });

export default function DonationEditModal({
  open,
  onClose,
  onSave,
  editData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  editData: any;
}) {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    donorId: "",
    campaignId: "",
    amount: "",
    donatedAt: new Date(),
    paymentMode: "UPI",
    utr: "",
    bankName: "",
    gateway: "",
    gatewayRef: "",
    currency: "INR",
    fxRate: "",
    giftInMemoryOf: "",
    giftInHonourOf: "",
    note: "",
    fcra: false,
    status: "CONFIRMED",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/campaigns")
        .then((res) => res.json())
        .then(setCampaigns)
        .catch(() => setCampaigns([]));
    }
  }, [open]);

  useEffect(() => {
    if (editData) {
      setForm({
        donorId: editData.donor?.id || "",
        campaignId: editData.campaign?.id || "",
        amount: editData.amount || "",
        donatedAt: editData.donatedAt ? new Date(editData.donatedAt) : new Date(),
        paymentMode: editData.paymentMode || "UPI",
        utr: editData.utr || "",
        bankName: editData.bankName || "",
        gateway: editData.gateway || "",
        gatewayRef: editData.gatewayRef || "",
        currency: editData.currency || "INR",
        fxRate: editData.fxRate || "",
        giftInMemoryOf: editData.giftInMemoryOf || "",
        giftInHonourOf: editData.giftInHonourOf || "",
        note: editData.note || "",
        fcra: editData.fcra || false,
        status: editData.status || "CONFIRMED",
      });
    }
  }, [editData, open]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/donations/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        Swal.fire("Updated!", "Donation updated successfully.", "success");
        onSave();
        onClose();
      } else Swal.fire("Error", "Failed to update donation.", "error");
    } catch {
      Swal.fire("Error", "Unexpected server error.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl mt-20 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-20 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Edit Donation</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-lg">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Donor */}
          <div>
            <label className="text-sm font-medium text-slate-700">Donor</label>
            <select
              name="donorId"
              value={form.donorId}
              disabled
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-100 cursor-not-allowed text-slate-700"
            >
              <option value={form.donorId}>
                {editData?.donor?.name || "Unknown"} — {editData?.donor?.email || "N/A"}
              </option>
            </select>
          </div>

          {/* Campaign */}
          <div>
            <label className="text-sm font-medium text-slate-700">Campaign (optional)</label>
            <select
              name="campaignId"
              value={form.campaignId}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select Campaign</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Amount, Date, Payment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input label="Amount (₹)" name="amount" value={form.amount} onChange={handleChange} required />
            <div>
              <label className="text-sm font-medium text-slate-700">Donation Date</label>
              <Flatpickr
                value={form.donatedAt}
                onChange={(date) => setForm({ ...form, donatedAt: date[0] })}
                options={{ dateFormat: "Y-m-d" }}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <Select
              label="Payment Mode"
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
              options={["UPI", "BANK_TRANSFER", "CARD", "CASH", "CHEQUE", "OTHER"]}
            />
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoInput label="UTR / Ref No" info="Unique transaction number from bank or UPI app." name="utr" value={form.utr} onChange={handleChange} />
            <InfoInput label="Bank Name" info="Bank used for this transaction." name="bankName" value={form.bankName} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoInput label="Gateway" info="Payment gateway (Razorpay, Paytm, etc.)." name="gateway" value={form.gateway} onChange={handleChange} />
            <InfoInput label="Gateway Ref" info="Unique reference from payment gateway." name="gatewayRef" value={form.gatewayRef} onChange={handleChange} />
          </div>

          {/* Currency & FX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoInput label="Currency" info="Currency used for donation (e.g. INR, USD)." name="currency" value={form.currency} onChange={handleChange} />
            <InfoInput label="FX Rate" info="Exchange rate if foreign currency donation." name="fxRate" value={form.fxRate} onChange={handleChange} />
          </div>

          {/* Gift Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoInput label="Gift In Memory Of" info="If made in remembrance of someone." name="giftInMemoryOf" value={form.giftInMemoryOf} onChange={handleChange} />
            <InfoInput label="Gift In Honour Of" info="If made in honour of someone." name="giftInHonourOf" value={form.giftInHonourOf} onChange={handleChange} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {/* FCRA Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="fcra"
              type="checkbox"
              name="fcra"
              checked={!!form.fcra}
              onChange={handleChange}
              className="h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="fcra" className="text-sm text-slate-600 flex items-center gap-1">
              FCRA Donation (optional)
              <span
                className="text-sky-500 cursor-pointer"
                title="Foreign Contribution Regulation Act — required only for accepting overseas donations."
              >
                ℹ️
              </span>
            </label>
          </div>

          {/* Status */}
          <Select label="Status" name="status" value={form.status} onChange={handleChange} options={["CONFIRMED", "PENDING", "FAILED"]} />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white z-10 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              {loading ? "Saving..." : "Update Donation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Reusable Components */
function InfoInput({ label, info, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        <span className="text-sky-500 cursor-pointer" title={info}>
          ℹ️
        </span>
      </label>
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring focus:ring-sky-200 outline-none"
      />
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", required = false }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        type={type}
        required={required}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring focus:ring-sky-200 outline-none"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring focus:ring-sky-200 outline-none"
      >
        {options.map((opt: any) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
