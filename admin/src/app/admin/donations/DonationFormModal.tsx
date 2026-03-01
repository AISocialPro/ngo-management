"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import "flatpickr/dist/themes/material_blue.css";

const Flatpickr = dynamic(() => import("react-flatpickr"), { ssr: false });

type DonationStatus = "CONFIRMED" | "PENDING" | "FAILED";
type PaymentMode = "UPI" | "BANK_TRANSFER" | "CARD" | "CASH" | "CHEQUE" | "OTHER";

export default function DonationFormModal({
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
  const [donors, setDonors] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showNewDonorForm, setShowNewDonorForm] = useState(false);
  const [newDonor, setNewDonor] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

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

  useEffect(() => {
    if (open) {
      fetch("/api/donors").then((res) => res.json()).then(setDonors);
      fetch("/api/campaigns").then((res) => res.json()).then(setCampaigns);
    }
  }, [open]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "donorId" && value === "new") setShowNewDonorForm(true);
  }

  function handleNewDonorChange(e: any) {
    const { name, value } = e.target;
    setNewDonor((prev) => ({ ...prev, [name]: value }));
  }

  async function saveNewDonor() {
    if (!newDonor.name.trim()) {
      Swal.fire("Warning", "Please enter donor name.", "warning");
      return;
    }
    try {
      const res = await fetch("/api/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDonor),
      });
      if (res.ok) {
        const newD = await res.json();
        const all = await fetch("/api/donors").then((r) => r.json());
        setDonors(all);
        setForm((f: any) => ({ ...f, donorId: newD.id }));
        setShowNewDonorForm(false);
        Swal.fire("Success", "Donor added successfully!", "success");
      } else Swal.fire("Error", "Failed to add donor.", "error");
    } catch {
      Swal.fire("Error", "Server error occurred.", "error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editData ? "PUT" : "POST";
      const url = editData ? `/api/donations/${editData.id}` : `/api/donations`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        Swal.fire("Success!", "Donation saved successfully.", "success");
        onSave();
        onClose();
      } else Swal.fire("Error", "Failed to save donation.", "error");
    } catch {
      Swal.fire("Error", "Unexpected server error.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 overflow-y-auto p-4">
      <div className="relative w-full max-w-5xl mt-20 bg-white rounded-lg shadow-xl flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-20 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            {editData ? "Edit Donation" : "Add New Donation"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-lg">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[80vh] px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor & Campaign */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField
                label="Donor"
                name="donorId"
                value={form.donorId}
                onChange={handleChange}
                options={[
                  { label: "➕ Create New Donor", value: "new" },
                  ...donors.map((d) => ({
                    label: `${d.name} — ${d.email ?? "N/A"}`,
                    value: d.id,
                  })),
                ]}
                required
              />
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
            </div>

            {/* Inline new donor form */}
            {showNewDonorForm && (
              <div className="border p-4 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-slate-700 mb-2">New Donor Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Full Name" name="name" value={newDonor.name} onChange={handleNewDonorChange} />
                  <InputField label="Email (optional)" name="email" value={newDonor.email} onChange={handleNewDonorChange} />
                  <InputField label="Phone (optional)" name="phone" value={newDonor.phone} onChange={handleNewDonorChange} />
                  <InputField label="Address (optional)" name="address" value={newDonor.address} onChange={handleNewDonorChange} />
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button type="button" onClick={() => setShowNewDonorForm(false)} className="text-slate-600 text-sm px-3 py-1 border rounded-md hover:bg-slate-100">
                    Cancel
                  </button>
                  <button type="button" onClick={saveNewDonor} className="bg-sky-600 text-white text-sm px-4 py-1 rounded-md hover:bg-sky-700">
                    Save Donor
                  </button>
                </div>
              </div>
            )}

            {/* Amount, Date, Payment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField label="Amount (₹)" name="amount" value={form.amount ?? ""} onChange={handleChange} type="number" />
              <div>
                <label className="text-sm font-medium text-slate-600">Donation Date</label>
                <Flatpickr
                  value={form.donatedAt}
                  onChange={(dates: any) => setForm((f: any) => ({ ...f, donatedAt: dates[0] }))}
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

            {/* UTR, Bank, Gateway (with ℹ️ icons) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InfoInput label="UTR / Ref No" info="Unique transaction number provided by your bank or UPI app." name="utr" value={form.utr ?? ""} onChange={handleChange} />
              <InfoInput label="Bank Name" info="Name of the bank used for this transaction." name="bankName" value={form.bankName ?? ""} onChange={handleChange} />
              <InfoInput label="Gateway" info="Payment gateway like Razorpay, Paytm, etc." name="gateway" value={form.gateway ?? ""} onChange={handleChange} />
            </div>

            {/* Currency, FX, GatewayRef */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InfoInput label="Currency" info="Currency used for donation (e.g. INR, USD)." name="currency" value={form.currency ?? ""} onChange={handleChange} />
              <InfoInput label="FX Rate" info="Exchange rate if donation received in other currency." name="fxRate" value={form.fxRate ?? ""} onChange={handleChange} />
              <InfoInput label="Gateway Ref" info="Unique transaction reference from payment gateway." name="gatewayRef" value={form.gatewayRef ?? ""} onChange={handleChange} />
            </div>

            {/* Gift fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoInput label="Gift In Memory Of" info="If donation made in remembrance of someone." name="giftInMemoryOf" value={form.giftInMemoryOf ?? ""} onChange={handleChange} />
              <InfoInput label="Gift In Honour Of" info="If donation made to honour someone." name="giftInHonourOf" value={form.giftInHonourOf ?? ""} onChange={handleChange} />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-slate-600">Notes (optional)</label>
              <textarea name="note" value={form.note ?? ""} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none" />
            </div>

            {/* Status and FCRA */}
            <div className="flex justify-between flex-wrap items-center gap-5">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-slate-600">Status:</label>
                <select name="status" value={form.status} onChange={handleChange} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none">
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input id="fcra" type="checkbox" name="fcra" checked={!!form.fcra} onChange={handleChange} className="h-4 w-4 border-slate-300 text-sky-600" />
                <label htmlFor="fcra" className="text-sm text-slate-600">
                  FCRA Donation (optional) ℹ️
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
                {loading ? "Saving..." : editData ? "Update Donation" : "Add Donation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* --------------------- Components --------------------- */
function InfoInput({ label, info, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
        {label}
        <span className="text-sky-500 cursor-pointer" title={info}>
          ℹ️
        </span>
      </label>
      <input name={name} value={value ?? ""} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none" />
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <input name={name} value={value || ""} onChange={onChange} type={type} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none" />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <select name={name} value={value} onChange={onChange} required={required} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none">
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
