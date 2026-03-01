"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import "flatpickr/dist/themes/material_blue.css";

const Flatpickr = dynamic(() => import("react-flatpickr"), { ssr: false });

type DonationStatus = "CONFIRMED" | "PENDING" | "FAILED";
type PaymentMode =
  | "UPI"
  | "BANK_TRANSFER"
  | "CARD"
  | "CASH"
  | "CHEQUE"
  | "OTHER";

export default function DonationAddModal({
  open,
  onClose,
  donor,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  donor: any;
  onSave: () => Promise<void>;
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
    fcra: false,
    giftInMemoryOf: "",
    giftInHonourOf: "",
    note: "",
    status: "CONFIRMED",
  });

  /* ---------------------- Load campaigns ---------------------- */
  useEffect(() => {
    if (open) {
      fetch("/api/campaigns")
        .then((res) => res.json())
        .then(setCampaigns)
        .catch(() => setCampaigns([]));
    }
  }, [open]);

  /* ---------------------- Assign donor ---------------------- */
  useEffect(() => {
    if (donor && donor.id && open) {
      setForm((prev: any) => ({
        ...prev,
        donorId: donor.id,
      }));
    }
  }, [donor, open]);

  /* ---------------------- Handlers ---------------------- */
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
      const payload = { ...form, donorId: donor?.id };
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        Swal.fire("Success!", "Donation added successfully.", "success");
        onSave();
        onClose();
      } else {
        Swal.fire("Error", "Failed to save donation.", "error");
      }
    } catch {
      Swal.fire("Error", "Unexpected server error.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  /* ---------------------- Render ---------------------- */
  const donorName = donor?.name?.trim() || "Selected Donor";
  const donorEmail = donor?.email?.trim() || "No Email";

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 overflow-y-auto p-4">
      <div className="relative w-full max-w-5xl mt-20 bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-20 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            Add Donation — {donorName}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto max-h-[80vh] px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor (Locked field) */}
            <div>
              <label className="text-sm font-medium text-slate-600">Donor</label>
              <input
                type="text"
                value={`${donorName} — ${donorEmail}`}
                disabled
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-100 cursor-not-allowed text-slate-700"
              />
            </div>

            {/* Campaign */}
            <SelectField
              label="Campaign (optional)"
              name="campaignId"
              value={form.campaignId}
              onChange={handleChange}
              options={campaigns.map((c) => ({
                label: c.title,
                value: c.id,
              }))}
            />

            {/* Amount, Date, Payment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="Amount (₹)"
                name="amount"
                value={form.amount ?? ""}
                onChange={handleChange}
                type="number"
              />
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Donation Date
                </label>
                <Flatpickr
                  value={form.donatedAt}
                  onChange={(dates: any) =>
                    setForm((f: any) => ({ ...f, donatedAt: dates[0] }))
                  }
                  options={{ dateFormat: "Y-m-d" }}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                />
              </div>
              <SelectField
                label="Payment Mode"
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                options={[
                  { label: "UPI", value: "UPI" },
                  { label: "BANK_TRANSFER", value: "BANK_TRANSFER" },
                  { label: "CARD", value: "CARD" },
                  { label: "CASH", value: "CASH" },
                  { label: "CHEQUE", value: "CHEQUE" },
                  { label: "OTHER", value: "OTHER" },
                ]}
              />
            </div>

            {/* UTR, Bank, Gateway */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <LabeledInfoInput
                label="UTR / Ref No (optional)"
                info="Unique transaction number provided by your bank or UPI app."
                name="utr"
                value={form.utr ?? ""}
                onChange={handleChange}
              />
              <LabeledInfoInput
                label="Bank Name (optional)"
                info="Name of the bank used for this transaction."
                name="bankName"
                value={form.bankName ?? ""}
                onChange={handleChange}
              />
              <LabeledInfoInput
                label="Gateway (optional)"
                info="Payment gateway like Razorpay, Paytm, etc."
                name="gateway"
                value={form.gateway ?? ""}
                onChange={handleChange}
              />
            </div>

            {/* Currency, FX Rate, Gateway Ref */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <LabeledInfoInput
                label="Currency"
                info="Currency used for donation (e.g., INR, USD)."
                name="currency"
                value={form.currency ?? ""}
                onChange={handleChange}
              />
              <LabeledInfoInput
                label="FX Rate (optional)"
                info="Exchange rate if donation received in another currency."
                name="fxRate"
                value={form.fxRate ?? ""}
                onChange={handleChange}
              />
              <LabeledInfoInput
                label="Gateway Ref (optional)"
                info="Unique reference ID from payment gateway."
                name="gatewayRef"
                value={form.gatewayRef ?? ""}
                onChange={handleChange}
              />
            </div>

            {/* Gift Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <LabeledInfoInput
                label="Gift In Memory Of (optional)"
                info="If donation made in remembrance of someone."
                name="giftInMemoryOf"
                value={form.giftInMemoryOf ?? ""}
                onChange={handleChange}
              />
              <LabeledInfoInput
                label="Gift In Honour Of (optional)"
                info="If donation made in honour of someone."
                name="giftInHonourOf"
                value={form.giftInHonourOf ?? ""}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Notes (optional)
              </label>
              <textarea
                name="note"
                value={form.note ?? ""}
                onChange={handleChange}
                rows={2}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
              />
            </div>

            {/* Status and FCRA */}
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex gap-3 items-center">
                <label className="text-sm font-medium text-slate-600">
                  Status:
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                >
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="fcra"
                  type="checkbox"
                  name="fcra"
                  checked={!!form.fcra}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600"
                />
                 <label
    htmlFor="fcra"
    className="text-sm text-slate-600 flex items-center gap-1"
  >
    FCRA Donation (optional)
    <span
      className="text-sky-500 cursor-pointer"
      title="Foreign Contribution Regulation Act — required only for accepting overseas donations."
    >
      ℹ️
    </span>
  </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
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
                {loading ? "Saving..." : "Add Donation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Components --------------------------- */
function LabeledInfoInput({
  label,
  info,
  name,
  value,
  onChange,
}: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
        {label}
        <span className="text-sky-500 cursor-pointer" title={info}>
          ℹ️
        </span>
      </label>
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        type={type}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
      >
        <option value="">Select {label}</option>
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
