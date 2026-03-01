"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import LiveDate from "@/components/LiveDate";
import { useConfirm } from "@/components/ConfirmDialog";
import "flatpickr/dist/themes/material_blue.css";
import Swal from "sweetalert2";

const Flatpickr = dynamic(() => import("react-flatpickr"), { ssr: false });

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type CampaignStatus = "Active" | "Completed" | "Upcoming";

type Campaign = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: CampaignStatus;
  location: string;
  startDate?: string;
  endDate?: string;
  lead: string;
  raised: number;
  goal: number;
  image?: string;
  category?: string;
};

/* -------------------------------------------------------------------------- */
/*                                   UTILS                                    */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 3;

const fmtINR = (n: number) =>
  n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const clampPct = (raised: number, goal: number) =>
  Math.max(0, Math.min(100, goal > 0 ? Math.round((raised / goal) * 100) : 0));

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%233498db'/><stop offset='100%' stop-color='%232980b9'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Segoe UI, Arial' font-size='22' fill='white' opacity='0.85'>Campaign Image</text></svg>`
  );

const apiToUiStatus = (s: string | null | undefined): CampaignStatus => {
  switch ((s || "").toUpperCase()) {
    case "ACTIVE":
    case "ACTIVE/ONGOING":
    case "ACTIVE-ONGOING":
    case "ACTIVE_ONGOING":
    case "ACT":
    case "ACTV":
    case "A":
      return "Active";
    case "COMPLETED":
    case "COMPLETE":
      return "Completed";
    case "UPCOMING":
    case "PLANNING":
    default:
      return "Upcoming";
  }
};

const uiToApiEnumStatus = (s: CampaignStatus) =>
  s === "Active" ? "ACTIVE" : s === "Completed" ? "COMPLETED" : "PLANNING";

function toYMD(d?: Date) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Auto-compute status from dates according to rules:
 * - startDate > today      -> Upcoming
 * - endDate < today        -> Completed
 * - else (overlapping now) -> Active
 * If both dates are missing, we fall back to the given fallback status.
 */
function computeStatusFromDates(
  startDate?: string,
  endDate?: string,
  fallback: CampaignStatus = "Upcoming"
): CampaignStatus {
  const today = toYMD(new Date());

  if (startDate && startDate > today) return "Upcoming";
  if (endDate && endDate < today) return "Completed";

  // If either date exists and it's not Upcoming/Completed, it's Active.
  if (startDate || endDate) return "Active";

  // No dates at all: keep whatever was there before.
  return fallback;
}

async function extractApiError(res: Response) {
  try {
    const txt = await res.text();
    try {
      const json = JSON.parse(txt);
      return (
        json?.message ||
        json?.error ||
        JSON.stringify(json) ||
        `${res.status} ${res.statusText}`
      );
    } catch {
      return txt || `${res.status} ${res.statusText}`;
    }
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

function sanitizeCampaign(p: Partial<Campaign>) {
  const S = (v?: string | null) => (v && v.trim() ? v.trim() : undefined);
  const D = (v?: string) => (v && v.trim() ? v.trim() : undefined);
  const N = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const startDate = D(p.startDate);
  const endDate = D(p.endDate);
  const fallbackStatus = (p.status as CampaignStatus) ?? "Active";
  const uiStatus = computeStatusFromDates(startDate, endDate, fallbackStatus);

  return {
    title: S(p.title)!, // required
    summary: S(p.summary ?? ""),
    status: uiToApiEnumStatus(uiStatus),
    location: S(p.location),
    startDate,
    endDate,
    lead: S(p.lead),
    goal: N(p.goal),
    category: S(p.category ?? undefined),
    image: p.image || undefined,
    // raised is computed from donations, so we don't send it
  };
}

/* -------------------------------------------------------------------------- */
/*                             SMALL INPUT COMPONENTS                         */
/* -------------------------------------------------------------------------- */

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
        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
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

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <Flatpickr
        value={value ?? ""}
        options={{ dateFormat: "Y-m-d", allowInput: true, clickOpens: true }}
        onChange={(dates: Date[]) => onChange(dates?.[0] ? toYMD(dates[0]) : "")}
        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            DISPLAY-ONLY COMPONENTS                         */
/* -------------------------------------------------------------------------- */

function Tile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
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
      <div
        className={`mr-4 grid h-14 w-14 place-items-center rounded-xl text-white ${color}`}
      >
        <i className={`fa-solid ${icon} text-xl`} />
      </div>
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

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
        type="button"
        className="rounded-md px-2 py-1 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40"
        onClick={() => to(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <i className="fa-solid fa-chevron-left" />
      </button>
      {pages.map((p) => (
        <button
          type="button"
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
        type="button"
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

/* -------------------------------------------------------------------------- */
/*                                   TOAST (kept – now routed via Swal)       */
/* -------------------------------------------------------------------------- */

function Toast({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[3000]">
      <div className="flex items-center gap-3 rounded-xl bg-slate-900/90 px-4 py-3 text-sm text-white shadow-lg ring-1 ring-slate-800/70">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500">
          <i className="fa-solid fa-link" />
        </span>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            LINK READY
          </div>
          <div className="text-sm">{message}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-slate-300 hover:text-white"
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           CAMPAIGN VIEW MODAL                              */
/* -------------------------------------------------------------------------- */

function CampaignViewModal({
  data,
  onClose,
  onShare,
}: {
  data: Campaign;
  onClose: () => void;
  onShare: (slug?: string) => void;
}) {
  const pct = clampPct(data.raised, data.goal);
  return (
    <div
      className="fixed inset-0 z-[2000] grid place-items-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-white px-5 py-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{data.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              {data.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700 ring-1 ring-indigo-200">
                  <i className="fa-solid fa-tag" /> {data.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-sky-700 ring-1 ring-sky-200">
                <i className="fa-solid fa-location-dot" /> {data.location || "—"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 ring-1 ring-amber-200">
                <i className="fa-solid fa-calendar" />{" "}
                {(data.startDate || "—") + (data.endDate ? ` → ${data.endDate}` : "")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-200">
                <i className="fa-solid fa-user-tie" /> {data.lead || "—"}
              </span>
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-800 ring-1 ring-gray-200">
                Status: {data.status}
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
            <div className="overflow-hidden rounded-lg ring-1 ring-slate-200">
              <img
                src={data.image || FALLBACK_IMG}
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = FALLBACK_IMG)
                }
                alt={data.title}
                className="h-56 w-full object-cover"
              />
            </div>

            <h4 className="mt-4 text-sm font-semibold text-slate-700">
              About this campaign
            </h4>
            <p className="mt-1 whitespace-pre-line text-slate-700">
              {data.summary || "—"}
            </p>
          </div>

          <div className="border-t p-5 md:border-l md:border-t-0">
            <div className="grid gap-3 sm:grid-cols-3">
              <Tile label="Raised" value={fmtINR(data.raised)} icon="fa-sack" />
              <Tile label="Goal" value={fmtINR(data.goal)} icon="fa-bullseye" />
              <Tile label="Progress" value={`${pct}%`} icon="fa-chart-line" />
            </div>

            <div className="mt-4">
              <div className="mb-1 text-sm text-slate-700">Funding Progress</div>
              <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>Public link:</span>
              <button
                onClick={() => onShare(data.slug)}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100"
              >
                <i className="fa-solid fa-link" /> Copy link
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-white px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md bg-slate-600 px-3 py-2 text-white hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           CAMPAIGN FORM MODAL                              */
/* -------------------------------------------------------------------------- */

function CampaignFormModal({
  mode,
  data,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  data?: Campaign;
  onClose: () => void;
  onSubmit: (payload: Partial<Campaign>) => void;
}) {
  const [form, setForm] = useState<Partial<Campaign>>(
    mode === "edit"
      ? { ...data }
      : {
          title: "",
          summary: "",
          status: "Active",
          location: "",
          startDate: "",
          endDate: "",
          lead: "",
          goal: 0,
          image: undefined,
          category: "",
        }
  );
  const [preview, setPreview] = useState<string | undefined>(data?.image);

  const submit = () => {
    if (!form.title?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Title required",
        text: "Please enter a title for the campaign.",
        confirmButtonColor: "#0284c7",
      });
      return;
    }
    if (mode === "edit" && data) form.id = data.id;
    onSubmit(form);
  };

  const onImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setPreview(dataUrl);
      setForm((f) => ({ ...f, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div
      className="fixed inset-0 z-[2000] grid place-items-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {mode === "edit" ? "Edit Campaign" : "Add New Campaign"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-2xl leading-none text-slate-500 hover:text-slate-700"
          >
            &times;
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto px-5 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Title"
              required
              value={form.title ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
            />
            <Select
              label="Status"
              value={(form.status as CampaignStatus) ?? "Active"}
              onChange={(v) =>
                setForm((f) => ({ ...f, status: v as CampaignStatus }))
              }
              options={[
                ["Active", "Active"],
                ["Upcoming", "Upcoming"],
                ["Completed", "Completed"],
              ]}
            />
            <TextField
              label="Location"
              value={form.location ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, location: v }))}
            />
            <TextField
              label="Category"
              value={form.category ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, category: v }))}
              placeholder="Health, Education, Environment..."
            />

            <DateField
              label="Start Date"
              value={form.startDate ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, startDate: v }))}
            />
            <DateField
              label="End Date"
              value={form.endDate ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, endDate: v }))}
            />

            <TextField
              label="Project Lead"
              value={form.lead ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, lead: v }))}
            />
            <NumberField
              label="Goal (₹)"
              value={Number(form.goal ?? 0)}
              onChange={(v) => setForm((f) => ({ ...f, goal: v }))}
            />

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                Campaign Image
              </label>
              <label className="grid cursor-pointer place-items-center rounded-md border border-slate-300 p-6 text-slate-600 hover:bg-slate-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageChange}
                />
                <div className="text-center">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl" />
                  <div className="mt-2 text-sm">
                    Click to upload or drag &amp; drop (JPG/PNG)
                  </div>
                </div>
              </label>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                Preview
              </label>
              <div className="flex h-[150px] items-center justify-center overflow-hidden rounded-md border border-slate-300">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-slate-500">
                    No image selected
                  </span>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
                value={form.summary ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, summary: e.target.value }))
                }
                placeholder="Brief description of the campaign…"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t bg-white px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md bg-slate-600 px-3 py-2 text-white hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700"
          >
            {mode === "edit" ? "Save Changes" : "Save Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  MAIN PAGE                                 */
/* -------------------------------------------------------------------------- */

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { confirm } = useConfirm();

  const [statusFilter, setStatusFilter] = useState<"All" | CampaignStatus>(
    "All"
  );
  const [searchTerm, setSearchTerm] = useState("");

  // kept for compatibility (now handled via SweetAlert2 toasts)
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SweetAlert2-based toast (top-end)
  const swalToast = (title: string, icon: "success" | "error" | "info" | "warning" = "success") =>
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
      icon,
      title,
    });

  // legacy function name preserved; now delegates to SweetAlert2
  const showToast = (message: string) => {
    // Do not open the old Toast UI anymore; just show a SweetAlert2 toast
    swalToast(message, "success");
    // keep old cleanup so we "didn't remove anything"
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ open: false, message: "" });
    }, 10);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const fetchCampaigns = async (): Promise<Campaign[]> => {
    try {
      const res = await fetch(`/api/campaigns?ts=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return [];
      const rows = await res.json();
      return (rows as any[]).map((r) => {
        const startDate = r.startDate
          ? String(r.startDate).slice(0, 10)
          : undefined;
        const endDate = r.endDate ? String(r.endDate).slice(0, 10) : undefined;
        const backendStatus = apiToUiStatus(r.status);
        const status = computeStatusFromDates(
          startDate,
          endDate,
          backendStatus
        );

        return {
          id: String(r.id),
          slug: r.slug,
          title: r.title,
          summary: r.summary ?? "",
          status,
          location: r.location ?? "",
          startDate,
          endDate,
          lead: r.lead ?? "",
          raised: Number(r.raised ?? 0),
          goal: Number(r.goal ?? 0),
          image: r.image ?? undefined,
          category: r.category ?? "",
        } as Campaign;
      });
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const data = await fetchCampaigns();
      if (alive) {
        setCampaigns(data);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  type ModalState =
    | { open: false }
    | { open: true; mode: "add"; data?: Campaign }
    | { open: true; mode: "edit"; data: Campaign }
    | { open: true; mode: "view"; data: Campaign };

  const [modal, setModal] = useState<ModalState>({ open: false });
  const closeModal = () => setModal({ open: false });

  const upsert = async (payload: Partial<Campaign>, mode: "add" | "edit") => {
    if (!payload.title?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Title required",
        text: "Please enter a title for the campaign.",
        confirmButtonColor: "#0284c7",
      });
      return;
    }
    const body = sanitizeCampaign(payload);

    try {
      if (mode === "add") {
        const res = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          Swal.fire({
            icon: "error",
            title: "Create failed",
            text: await extractApiError(res),
            confirmButtonColor: "#dc2626",
          });
          return;
        }
        swalToast("Campaign created");
      } else {
        const res = await fetch(`/api/campaigns/${payload.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          Swal.fire({
            icon: "error",
            title: "Update failed",
            text: await extractApiError(res),
            confirmButtonColor: "#dc2626",
          });
          return;
        }
        swalToast("Campaign updated");
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Please try again.",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    const fresh = await fetchCampaigns();
    setCampaigns(fresh);
    setPage(1);
    closeModal();
  };

  const remove = async (id: string) => {
    const ok = await confirm({
      title: "Archive campaign?",
      description:
        "This will archive the campaign (soft delete). You can keep its data and donations safe.",
      danger: true,
      confirmText: "Archive",
      cancelText: "Cancel",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Archive failed",
          text: await extractApiError(res),
          confirmButtonColor: "#dc2626",
        });
        return;
      }
      swalToast("Campaign archived");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Delete failed. Please try again.",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    const fresh = await fetchCampaigns();
    setCampaigns(fresh);
  };

  /* ----------------------- Share: copy only, no open --------------------- */

  const handleShare = async (slug?: string) => {
    if (!slug) {
      swalToast("Public link not available", "warning");
      return;
    }

    const url = `${window.location.origin}/campaigns/${slug}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        swalToast("Public link copied");
      } else {
        swalToast("Copy failed. URL in console", "error");
        console.log("Campaign link:", url);
      }
    } catch (err) {
      console.error(err);
      swalToast("Copy failed", "error");
    }
  };

  /* ------------------------------ Filtering ------------------------------ */

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (statusFilter !== "All" && c.status !== statusFilter) return false;
      if (q) {
        const haystack = (
          c.title +
          " " +
          c.summary +
          " " +
          c.location +
          " " +
          c.lead +
          " " +
          (c.category ?? "")
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [campaigns, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = filtered.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setPage((p) =>
      Math.min(p, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE) || 1))
    );
  }, [filtered.length]);

  const totals = useMemo(() => {
    const raised = filtered.reduce((a, b) => a + b.raised, 0);
    const goal = filtered.reduce((a, b) => a + b.goal, 0);
    return {
      raised,
      goal,
      progress: clampPct(raised, goal),
      active: filtered.filter((c) => c.status === "Active").length,
      count: filtered.length,
    };
  }, [filtered]);

  /* ---------------------------------------------------------------------- */
  /*                                  JSX                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="p-5">
      <style>
        {
          ".clamp-3{-webkit-line-clamp:3;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}"
        }
      </style>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-800">
          Campaigns / Projects
        </h2>
        <LiveDate className="text-gray-600" />
      </div>

      {/* Stats */}
      <div className="mb-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          color="bg-sky-600"
          icon="fa-layer-group"
          value={totals.count}
          label="Total Campaigns (Filtered)"
        />
        <Stat
          color="bg-emerald-600"
          icon="fa-circle-check"
          value={totals.active}
          label="Active Campaigns"
        />
        <Stat
          color="bg-amber-500"
          icon="fa-indian-rupee-sign"
          value={fmtINR(totals.raised)}
          label="Total Raised"
        />

        <div className="flex items-center rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mr-4 grid h-14 w-14 place-items-center rounded-xl bg-rose-500 text-white">
            <i className="fa-solid fa-chart-line text-xl" />
          </div>
          <div className="w-full">
            <div className="mb-0.5 flex items-center justify-between">
              <div className="text-sm text-slate-500">Funding Progress</div>
              <div className="text-sm font-semibold text-slate-700">
                {totals.progress}%
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${totals.progress}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>{fmtINR(totals.raised)} raised</span>
              <span>Goal: {fmtINR(totals.goal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header + Filters + Add button */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">All Campaigns</h3>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="min-w-[150px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "All" | CampaignStatus)
            }
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            type="text"
            className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
            placeholder="Search by title, location, lead..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            type="button"
            onClick={() =>
              setModal({ open: true, mode: "add", data: {} as any })
            }
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-700"
          >
            <i className="fa-solid fa-plus" /> Add Campaign
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="rounded-xl bg-white p-6 text-slate-500 ring-1 ring-slate-200">
          Loading…
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {current.map((c) => {
            const pct = clampPct(c.raised, c.goal);
            return (
              <div
                key={c.id}
                className="rounded-xl bg-white shadow ring-1 ring-slate-200"
              >
                <div className="relative h-44 w-full overflow-hidden rounded-t-xl">
                  <img
                    src={c.image || FALLBACK_IMG}
                    alt={c.title}
                    className="h-full w-full object-cover"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = FALLBACK_IMG)
                    }
                  />
                  <span className="absolute right-2 top-2 rounded-full bg-emerald-600/90 px-2 py-1 text-xs text-white">
                    {c.status}
                  </span>
                  {c.category && (
                    <span className="absolute left-2 top-2 rounded-full bg-indigo-600/90 px-2 py-1 text-xs text-white">
                      {c.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {c.title}
                  </h3>
                  <p className="mt-1 clamp-3 text-sm text-slate-600">
                    {c.summary}
                  </p>

                  <div className="mt-3 grid gap-1 text-sm text-slate-700">
                    <p>
                      <i className="fa-solid fa-location-dot mr-2 text-sky-600" />
                      {c.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <i className="fa-solid fa-calendar text-sky-600" />
                      <span>
                        {c.startDate || "—"}{" "}
                        {c.endDate ? ` → ${c.endDate}` : ""}
                      </span>
                    </p>
                    <p>
                      <i className="fa-solid fa-user-tie mr-2 text-sky-600" />
                      Project Lead: {c.lead || "—"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 text-sm text-slate-700">
                      Funding Progress
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
                      <div
                        className="h-full bg-emerald-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-slate-600">
                      <span>{fmtINR(c.raised)} raised</span>
                      <span>Goal: {fmtINR(c.goal)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setModal({ open: true, mode: "view", data: c });
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1.5 text-sky-600"
                      >
                        <i className="fa-solid fa-eye" /> View
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setModal({ open: true, mode: "edit", data: c });
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-600"
                      >
                        <i className="fa-solid fa-edit" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShare(c.slug);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-1.5 text-indigo-600 hover:bg-indigo-100"
                      >
                        <i className="fa-solid fa-link" /> Share
                      </button>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-3 py-1.5 text-rose-600"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await remove(c.id);
                      }}
                      aria-label="Archive campaign"
                    >
                      <i className="fa-solid fa-box-archive" /> Archive
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && current.length === 0 && (
        <div className="mt-6 rounded-xl bg-white p-10 text-center ring-1 ring-slate-200">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <i className="fa-solid fa-diagram-project" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900">
            No campaigns found
          </h4>
          <p className="mt-1 text-sm text-slate-600">
            Try changing filters or create your first campaign.
          </p>
          <button
            type="button"
            onClick={() =>
              setModal({ open: true, mode: "add", data: {} as any })
            }
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
          >
            <i className="fa-solid fa-plus" /> Add Campaign
          </button>
        </div>
      )}

      {/* Pagination */}
      {current.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}

      {/* Modals */}
      {modal.open && modal.mode === "add" && (
        <CampaignFormModal
          mode="add"
          onClose={closeModal}
          onSubmit={(payload) => upsert(payload, "add")}
        />
      )}
      {modal.open && modal.mode === "edit" && (
        <CampaignFormModal
          mode="edit"
          data={modal.data as Campaign}
          onClose={closeModal}
          onSubmit={(payload) => upsert(payload, "edit")}
        />
      )}
      {modal.open && modal.mode === "view" && (
        <CampaignViewModal
          data={modal.data as Campaign}
          onClose={closeModal}
          onShare={handleShare}
        />
      )}

      {/* Toast (kept but generally unused now) */}
      <Toast
        open={toast.open}
        message={toast.message}
        onClose={() => setToast({ open: false, message: "" })}
      />
    </div>
  );
}
