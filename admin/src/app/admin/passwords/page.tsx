// src/app/admin/passwords/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import LiveDate from "@/components/LiveDate";
import Swal from "sweetalert2";

/* -------------------------------------------
-----------------------
  Password Manager — LIGHT UI (matches your Branches page style)
  - Global search, tag filters, sort, view toggle (Table / Cards)
  - Centered modal for Add/Edit (same feel as Branch form modal)
  - Generator + strength meter inside modal
  - Copy with toasts; double-intent reveal
  - Encrypted Import/Export (AES-GCM in browser)
  - Auto-lock countdown chip (resets on activity)
  - Uses same colors & rings: white cards, ring-slate-200, #3498db primary
------------------------------------------------------------------- */

/* -------------------------------- Types ------------------------------- */
type Item = {
  id: string;
  title: string; // Site label e.g., "GitHub"
  username: string;
  password: string;
  url?: string;
  notes?: string | null;
  tags?: string[]; // ["Work","Banking"]
  status: "active" | "archived";
  updatedAt?: string; // ISO
  createdAt?: string; // ISO
};

type SortKey = "updatedDesc" | "az" | "za";

type ViewMode = "table" | "cards";

/* ------------------------------ Constants ----------------------------- */
const PAGE_SIZE = 9;
const BORDER_RING = "ring-1 ring-slate-200";
const BTN_PRIMARY = "rounded-lg bg-[#3498db] px-4 py-2 text-white shadow hover:bg-[#2f89c7]";
const BTN_OUTLINE = "rounded-lg bg-white px-4 py-2 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50";

const DEFAULT_TAGS = ["All", "Work", "Personal", "Banking", "Social"]; // shown as chips

/* ------------------------------ Utilities ----------------------------- */
const mask = (s: string) => (s ? "•".repeat(Math.min(8, s.length)) + (s.length > 8 ? "…" : "") : "");

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(+d)) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function strengthScore(pw: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

function domainFromUrl(u?: string) {
  try {
    if (!u) return "";
    const has = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    return new URL(has).hostname.replace(/^www\./, "");
  } catch {
    return u || "";
  }
}

function favicon(url?: string) {
  const d = domainFromUrl(url);
  if (!d) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=64`;
}

/* ------------------------------ Toast --------------------------------- */
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

/* --------------------------- Crypto (Export/Import) --------------------------- */
// AES-GCM with PBKDF2 key derivation
async function deriveKey(passphrase: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptJSON(obj: unknown, passphrase: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(obj));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data));
  return { iv: Array.from(iv), salt: Array.from(salt), ct: Array.from(ct) };
}

async function decryptJSON(payload: { iv: number[]; salt: number[]; ct: number[] }, passphrase: string) {
  const { iv, salt, ct } = payload;
  const key = await deriveKey(passphrase, new Uint8Array(salt));
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, new Uint8Array(ct));
  const dec = new TextDecoder().decode(pt);
  return JSON.parse(dec);
}

/* ------------------------------ Page Root ------------------------------ */
export default function PasswordsPage() {
  const searchParams = useSearchParams();

  // NGO ID: URL param -> localStorage -> ""
  const ngoId = useMemo(() => {
    const urlNgo = searchParams.get("ngoId");
    if (urlNgo) return urlNgo;

    if (typeof window !== "undefined") {
      const ls = window.localStorage.getItem("ngoId");
      if (ls) return ls;
    }
    return "";
  }, [searchParams]);

  /* ---------------------------- Data State ---------------------------- */
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);

  /* ------------------------------ Filters ----------------------------- */
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("updatedDesc");
  const [view, setView] = useState<ViewMode>("table");

  /* ------------------------------ UI State ---------------------------- */
  type ModalState = { open: false } | { open: true; mode: "add" | "edit"; data?: Item };
  const [modal, setModal] = useState<ModalState>({ open: false });

  const [viewItem, setViewItem] = useState<Item | null>(null);

  /* ----------------------- Reveal (double-intent) --------------------- */
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [armed, setArmed] = useState<Record<string, number>>({});

  const armReveal = (id: string) => {
    const now = Date.now();
    setArmed((m) => ({ ...m, [id]: now }));
    Toast.fire({ icon: "info", title: "Click again to reveal" });
    setTimeout(() => setArmed((m) => { const { [id]: _, ...rest } = m; return rest; }), 3000);
  };

  
  const toggleReveal = (id: string) => {
  if (locked) {
    Toast.fire({
      icon: "warning",
      title: "Unlock session to view password",
    });
    return;
  }

  setRevealed((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};



  /* ---------------------------- Auto-lock ----------------------------- */
  const LOCK_SECONDS = 300; // 5 min
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(LOCK_SECONDS);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const onActivity = () => { lastActivityRef.current = Date.now(); setSecondsLeft(LOCK_SECONDS); };
    ["mousemove","keydown","click","scroll","touchstart"].forEach((evt)=> window.addEventListener(evt, onActivity, { passive: true }));
    const t = setInterval(() => {
      if (locked) return;
      const left = Math.max(0, LOCK_SECONDS - Math.floor((Date.now() - lastActivityRef.current)/1000));
      setSecondsLeft(left);
      if (left === 0) setLocked(true);
    }, 1000);
    return () => { ["mousemove","keydown","click","scroll","touchstart"].forEach((evt)=> window.removeEventListener(evt, onActivity)); clearInterval(t); };
  }, [locked]);

  const requestUnlock = async () => {
    // ✅ UNLOCK FLOW (same as handleLockUnlock when locked)
    // Agar pehle se koi password set nahi hai, toh seedha unlock kar do
    if (!masterPassword) {
      setLocked(false);
      setSecondsLeft(LOCK_SECONDS);
      lastActivityRef.current = Date.now();
      Toast.fire({ icon: "success", title: "Session unlocked" });
      return;
    }

    const { value: pass } = await Swal.fire({
      title: "Unlock Password Manager",
      input: "password",
      inputLabel: "Enter unlock password",
      inputPlaceholder: "Enter password",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Unlock",
      confirmButtonColor: "#3498db",
    });

    if (!pass) return;

    // ✅ User ne jo password diya, wahi masterPassword se match karega
    if (pass === masterPassword) {
      setLocked(false);
      setSecondsLeft(LOCK_SECONDS);
      lastActivityRef.current = Date.now();
      Toast.fire({ icon: "success", title: "Session unlocked" });
    } else {
      Swal.fire({
        icon: "error",
        title: "Incorrect password",
        text: "Unlock failed",
      });
    }
  };

  const handleLockUnlock = async () => {
    if (locked) {
      // ✅ UNLOCK FLOW
      requestUnlock(); // Same function call kar do
    } else {
      // ✅ LOCK FLOW
      // Agar pehli baar lock kar rahe hain, toh password set kare
      if (!masterPassword) {
        const { value: newPass } = await Swal.fire({
          title: "Set Lock Password",
          input: "password",
          inputLabel: "Set a password for locking",
          inputPlaceholder: "Enter new password",
          inputAttributes: {
            autocapitalize: "off",
            autocorrect: "off",
          },
          showCancelButton: true,
          confirmButtonText: "Set & Lock",
          confirmButtonColor: "#3498db",
        });

        if (!newPass) return; // Cancel kar diya

        setMasterPassword(newPass);
        Toast.fire({ icon: "success", title: "Password set successfully" });
      }

      // ✅ Lock kar do
      setLocked(true);
      setRevealed({});
      setSecondsLeft(LOCK_SECONDS);
    }
  };

  /* -------------------------------- Load -------------------------------- */
  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch(`/api/passwords?ngoId=${ngoId || ""}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load (status ${res.status})`);
      const json = await res.json();
      let data: any[] = [];
      if (Array.isArray(json)) data = json;
      else if (Array.isArray(json?.data)) data = json.data;
      else if (Array.isArray(json?.items)) data = json.items;

      const normalized: Item[] = data.map((d: any) => ({
  ...d,
  password: d.password ?? d.passwordEnc ?? "",
  status: (String(d.status ?? "active").toLowerCase() as Item["status"]),
  tags: Array.isArray(d.tags)
    ? d.tags
    : String(d.tags ?? "")
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean),
}));

      setItems(normalized);
    } catch (e: any) {
      setErr(e?.message || "Failed to load passwords");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [ngoId]);

  /* -------------------------------- CRUD -------------------------------- */
  async function upsert(payload: Partial<Item>, mode: "add" | "edit") {
    try {
      if (mode === "add") {
        const res = await fetch("/api/passwords", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-ngo-id": ngoId || "" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Create failed");
        const created = (await res.json()) as Item;
        setItems((prev)=>[created, ...prev]);
      } else {
        if (!payload.id) throw new Error("Missing id for edit");
        const res = await fetch(`/api/passwords/${payload.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-ngo-id": ngoId || "" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Update failed");
        const updated = (await res.json()) as Item;
        setItems((arr)=>arr.map((x)=> x.id === updated.id ? updated : x));
      }
      setModal({ open: false });
      Toast.fire({ icon: "success", title: "Saved successfully" });
    } catch (e:any) {
      Toast.fire({ icon: "error", title: e?.message || "Operation failed" });
    }
  }

  async function destroy(id: string, title: string) {
    const result = await Swal.fire({
      title: "Delete entry?",
      text: `This will permanently delete "${title}". You can't undo this action.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/passwords/${id}`, {
          method: "DELETE",
          headers: { "x-ngo-id": ngoId || "" }
        });
        if (!res.ok) throw new Error("Delete failed");
        setItems((b)=> b.filter((x)=> x.id !== id));
        Toast.fire({ icon: "success", title: "Deleted successfully" });
      } catch (e:any) { Toast.fire({ icon: "error", title: e?.message || "Delete failed" }); }
    }
  }

  /* ------------------------------ Derived ------------------------------ */
  const tagSet = useMemo(() => {
    const s = new Set<string>(DEFAULT_TAGS.filter((t) => t !== "All"));
    items.forEach((i) => (i.tags || []).forEach((t) => s.add(t)));
    return ["All", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byQ = (i: Item) => !q || i.title.toLowerCase().includes(q) || i.username.toLowerCase().includes(q) || (i.notes||"").toLowerCase().includes(q) || domainFromUrl(i.url).toLowerCase().includes(q);
    const byTag = (i: Item) => activeTag === "All" || (i.tags || []).includes(activeTag);
    let arr = items.filter((i)=> byQ(i) && byTag(i));
    switch (sortKey) {
      case "az": arr = arr.sort((a,b)=> a.title.localeCompare(b.title)); break;
      case "za": arr = arr.sort((a,b)=> b.title.localeCompare(a.title)); break;
      default: arr = arr.sort((a,b)=> (new Date(b.updatedAt||0).getTime() - new Date(a.updatedAt||0).getTime()));
    }
    return arr;
  }, [items, search, activeTag, sortKey]);

  /* ----------------------------- Pagination ---------------------------- */
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = filtered.slice(start, start + PAGE_SIZE);
  useEffect(()=> setPage(1), [search, activeTag, sortKey, view]);
  useEffect(()=> setPage((p)=> Math.min(p, totalPages)), [totalPages]);

  /* ---------------------------- Import/Export -------------------------- */
  const fileRef = useRef<HTMLInputElement>(null);
  const doExport = async () => {
    const pass = prompt("Set a passphrase to encrypt export");
    if (!pass) return;
    const payload = await encryptJSON({ version: 1, items }, pass);
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `vault-export-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
    Toast.fire({ icon: "success", title: "Encrypted export downloaded" });
  };
  const onImportClick = () => fileRef.current?.click();
  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const text = await f.text(); const json = JSON.parse(text);
      const pass = prompt("Enter passphrase to decrypt import"); if (!pass) return;
      const data = (await decryptJSON(json, pass)) as { version:number; items: Item[] };
      if (!Array.isArray(data.items)) throw new Error("Invalid file");
      setItems((prev)=> [...data.items, ...prev]); Toast.fire({ icon: "success", title: "Imported entries added" });
    } catch (e:any) { Toast.fire({ icon: "error", title: e?.message || "Import failed" }); } finally { e.target.value = ""; }
  };

  const copyToClipboard = (text?: string, label?: string) => {
  if (!text) {
    Toast.fire({
      icon: "error",
      title: `${label || "Value"} not available`,
    });
    return;
  }

  navigator.clipboard.writeText(text).then(() =>
    Toast.fire({
      icon: "success",
      title: `${label || "Value"} copied`,
    })
  );
};



  /* -------------------------------- Render ---------------------------- */
  return (
    <div className="min-h-screen w-full overflow-x-hidden p-5">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-[#343a40]">Password Manager</h2>
          {/* Auto-lock chip */}
          <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600" title="Auto-lock countdown">
            {locked ? (
              <button suppressHydrationWarning className="underline" onClick={requestUnlock}>Locked — Unlock</button>
            ) : (
              <span>
                Auto-lock in {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
              </span>
            )}
          </span>
        </div>
        <LiveDate className="text-gray-600" />
      </div>

      {/* Error banner */}
      {err && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation" />
            <span>{err}</span>
            <button onClick={() => load()} className="ml-auto text-sm underline underline-offset-4">Retry</button>
          </div>
        </div>
      )}

      {/* Actions / Search */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              suppressHydrationWarning
              className={`w-full rounded-lg border border-slate-300 bg-white px-9 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring`}
              placeholder="Search by site / username / notes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Global search"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button suppressHydrationWarning onClick={() => setModal({ open: true, mode: "add" })} className={BTN_PRIMARY}>
            <i className="fa-solid fa-plus mr-2"/> New
          </button>
          <button suppressHydrationWarning
          onClick={onImportClick} className={BTN_OUTLINE}>
            <i className="fa-solid fa-file-import mr-2"/> Import
          </button>
          <button
           suppressHydrationWarning
           onClick={doExport} className={BTN_OUTLINE}>
            <i className="fa-solid fa-file-export mr-2"/> Export
          </button>
          <button 
            suppressHydrationWarning
            onClick={handleLockUnlock}
            className={BTN_OUTLINE}>
            <i className={`fa-solid ${locked ? "fa-unlock" : "fa-lock"} mr-2`}/> {locked ? "Unlock" : "Lock"}
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
        </div>
      </div>

      {/* Filters row */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {tagSet.map((t) => (
            <button suppressHydrationWarning 
            key={t} onClick={() => setActiveTag(t)} className={`rounded-full px-3 py-1 text-sm ring-1 ring-slate-200 ${activeTag===t?"bg-slate-100":"bg-white hover:bg-slate-50"}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-slate-600">Sort</label>
          <select suppressHydrationWarning id="sort" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={`rounded-lg border border-slate-300 bg-white px-3 py-2`}>
            <option value="updatedDesc">Updated desc</option>
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
          </select>
          <div className="inline-flex overflow-hidden rounded-lg ring-1 ring-slate-200">
            <button suppressHydrationWarning onClick={() => setView("table")} className={`px-3 py-2 text-sm ${view === "table" ? "bg-slate-100" : "bg-white hover:bg-slate-50"}`} aria-pressed={view === "table"}>
              <i className="fa-solid fa-table"/> Table
            </button>
            <button suppressHydrationWarning onClick={() => setView("cards")} className={`px-3 py-2 text-sm ${view === "cards" ? "bg-slate-100" : "bg-white hover:bg-slate-50"}`} aria-pressed={view === "cards"}>
              <i className="fa-solid fa-grid-2"/> Cards
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <Skeleton />
      ) : current.length === 0 ? (
        <div className={`rounded-2xl bg-white p-10 text-center ${BORDER_RING}`}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <i className="fa-solid fa-key"/>
          </div>
          <h4 className="text-lg font-semibold text-slate-900">No entries yet</h4>
          <p className="mt-1 text-sm text-slate-600">Add your first password to get started.</p>
          <button onClick={() => setModal({ open: true, mode: "add" })} className={`mt-4 ${BTN_PRIMARY}`}>
            <i className="fa-solid fa-plus mr-2"/> Add your first password
          </button>
        </div>
      ) : view === "table" ? (
        <div className={`overflow-hidden rounded-2xl bg-white ${BORDER_RING}`}>
          <table className="w-full table-auto">
            <thead className="bg-slate-50 text-left text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Password</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
             {current.map((it) => {
  // 🔍 BACKEND CHECK (temporary – baad me hata sakti ho)
  console.log("ITEM FROM BACKEND 👉", it);

  return (
    <tr key={it.id} className="border-t border-slate-200">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {domainFromUrl(it.url) ? (
            <img
              src={favicon(it.url)}
              alt=""
              className="h-5 w-5 rounded"
            />
          ) : (
            <span className="inline-grid h-5 w-5 place-items-center rounded bg-slate-200 text-xs text-slate-700">
              {it.title.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <div className="font-medium text-slate-900">{it.title}</div>
            <div className="text-xs text-slate-500">
              {domainFromUrl(it.url)}
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 align-top text-slate-800">
        {it.username}
      </td>

      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2 font-mono text-slate-800">
          {/* 👁 PASSWORD SHOW / HIDE (SAFE) */}
          {!locked && revealed[it.id]
            ? it.password ?? "—"
            : mask(it.password)}

          {/* 📋 COPY (SAFE) */}
          <button
            className="rounded-md bg-white px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            onClick={() => copyToClipboard(it.password, "Password")}
          >
            Copy
          </button>

          {/* 👁 SHOW / HIDE */}
          <button
            className="rounded-md bg-white px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            onClick={() => toggleReveal(it.id)}
          >
            {revealed[it.id] ? "Hide" : "Show"}
          </button>
        </div>
      </td>

      <td className="px-4 py-3 align-top text-slate-800">
        {fmt(it.updatedAt)}
      </td>

      <td className="px-4 py-3 align-top text-right">
        <div className="inline-flex gap-2">
          <button
            className="rounded-md bg-sky-50 px-3 py-1 text-sm text-sky-700"
            onClick={() => setViewItem(it)}
          >
            <i className="fa-solid fa-eye mr-1" /> View
          </button>
          <button
            className="rounded-md bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
            onClick={() => setModal({ open: true, mode: "edit", data: it })}
          >
            <i className="fa-solid fa-pen mr-1" /> Edit
          </button>
          <button
            className="rounded-md bg-rose-50 px-3 py-1 text-sm text-rose-700"
            onClick={() => destroy(it.id, it.title)}
          >
            <i className="fa-solid fa-trash mr-1 "/> Delete
          </button>
        </div>
      </td>
    </tr>
  );
})}

            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {current.map((it) => (
            <div key={it.id} className={`rounded-2xl bg-white p-5 ${BORDER_RING}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {domainFromUrl(it.url) ? (
                    <img src={favicon(it.url)} alt="" className="h-6 w-6 rounded"/>
                  ) : (
                    <span className="inline-grid h-6 w-6 place-items-center rounded bg-slate-200 text-xs text-slate-700">{it.title.charAt(0).toUpperCase()}</span>
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">{it.title}</div>
                    <div className="text-xs text-slate-500">{domainFromUrl(it.url) || "—"}</div>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${it.status === "active" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"}`}>{it.status}</span>
              </div>

              <div className="space-y-2 text-sm text-slate-800">
                <div className="flex items-center gap-2"><i className="fa-solid fa-user text-sky-600"/> {it.username}
                  <button className="ml-auto text-xs underline" onClick={() => copyToClipboard(it.username, "Username")}>Copy</button>
                </div>
                <div className="flex items-center gap-2 font-mono"><i className="fa-solid fa-key text-sky-600"/>
                  {locked ? mask(it.password) : revealed[it.id] ? it.password : mask(it.password)}
                  <div className="ml-auto inline-flex gap-2">
                    <button className="text-xs underline" onClick={() => copyToClipboard(it.password, "Password")}>Copy</button>
                    <button className="text-xs underline" onClick={() => toggleReveal(it.id)}>{revealed[it.id] ? "Hide" : "Show"}</button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>Updated: {fmt(it.updatedAt)}</span>
                <div className="inline-flex gap-2">
                  <button className="underline" onClick={() => setViewItem(it)}>View</button>
                  <button className="underline" onClick={() => setModal({ open: true, mode: "edit", data: it })}>Edit</button>
                  <button className="underline" onClick={() => destroy(it.id, it.title)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && current.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}

      {/* Modals */}
      {modal.open && (
        <EntryModal
          title={modal.mode === "add" ? "Add New Password" : `Edit — ${modal.data?.title}`}
          onClose={() => setModal({ open: false })}
        >
          <EntryForm
            data={modal.mode === "edit" ? modal.data : undefined}
            onCancel={() => setModal({ open: false })}
            onSave={(payload) => upsert(payload, modal.mode)}
          />
        </EntryModal>
      )}

      {/* View Modal */}
      {viewItem && (
        <ViewPasswordModal data={viewItem} onClose={() => setViewItem(null)} copyToClipboard={copyToClipboard} revealed={revealed[viewItem.id]} toggleReveal={() => toggleReveal(viewItem.id)} locked={locked} />
      )}
    </div>
  );
}

/* ------------------------------ Components ---------------------------- */
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const to = (p: number) => onPage(Math.min(totalPages, Math.max(1, p)));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="inline-flex items-center gap-1">
      <button className={`rounded-md px-2 py-1 text-slate-700 ${BORDER_RING} hover:bg-slate-50 disabled:opacity-40`} onClick={() => to(page - 1)} disabled={page === 1}>
        <i className="fa-solid fa-chevron-left"/>
      </button>
      {pages.map((p) => (
        <button key={p} className={`rounded-md px-2 py-1 text-sm ${BORDER_RING} ${p === page ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50"}`} onClick={() => to(p)} aria-current={p === page ? "page" : undefined}>
          {p}
        </button>
      ))}
      <button className={`rounded-md px-2 py-1 text-slate-700 ${BORDER_RING} hover:bg-slate-50 disabled:opacity-40`} onClick={() => to(page + 1)} disabled={page === totalPages}>
        <i className="fa-solid fa-chevron-right"/>
      </button>
    </div>
  );
}

function ViewPasswordModal({ data, onClose, copyToClipboard, revealed, toggleReveal, locked }: { data: Item; onClose: () => void; copyToClipboard: (t: string, l: string) => void; revealed: boolean; toggleReveal: () => void; locked: boolean }) {
  return (
    <EntryModal title={`Details — ${data.title}`} onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Site</label>
            <div className="text-slate-900 font-medium">{data.title}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">URL</label>
            <div className="text-slate-900 truncate"><a href={data.url} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">{data.url || "—"}</a></div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Username</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-900">{data.username}</span>
              <button onClick={() => copyToClipboard(data.username, "Username")} className="text-slate-400 hover:text-sky-600"><i className="fa-solid fa-copy"/></button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-900">{locked ? mask(data.password) : revealed ? data.password : mask(data.password)}</span>
              <button onClick={() => copyToClipboard(data.password, "Password")} className="text-slate-400 hover:text-sky-600"><i className="fa-solid fa-copy"/></button>
              <button onClick={toggleReveal} className="text-slate-400 hover:text-sky-600"><i className={`fa-solid ${revealed ? "fa-eye-slash" : "fa-eye"}`}/></button>
            </div>
          </div>
        </div>
        {data.notes && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Notes</div>
            {data.notes}
          </div>
        )}
        <div className="flex justify-end pt-2"><button onClick={onClose} className={BTN_OUTLINE}>Close</button></div>
      </div>
    </EntryModal>
  );
}

function EntryModal({ title, children, onClose }: { title?: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[1800] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200`} onClick={(e) => e.stopPropagation()}>
        {title ? (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} aria-label="Close" className="text-2xl leading-none text-slate-500 hover:text-slate-700">&times;</button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-2xl bg-white p-5 ${BORDER_RING}`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="h-5 w-40 rounded bg-slate-200"/>
            <div className="h-6 w-16 rounded-full bg-slate-200"/>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-200"/>
            <div className="h-4 w-1/2 rounded bg-slate-200"/>
            <div className="h-4 w-3/4 rounded bg-slate-200"/>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- Entry Form ----------------------------- */
function EntryForm({ data, onSave, onCancel }: { data?: Item; onSave: (payload: Partial<Item>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<Item>>(data ? { ...data } : { status: "active", tags: [] });

  // Ctrl/Cmd+Enter saves
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") submit(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [form]);

  const submit = () => { if (!form.title || !form.username || !form.password) return; if (data) form.id = data.id; onSave({ ...form, tags: (form.tags || []).map((t)=>t.trim()).filter(Boolean) }); };
  const setTagString = (v: string) => setForm((f) => ({ ...f, tags: v.split(",").map((x)=>x.trim()).filter(Boolean) }));
  const tagString = Array.isArray(form.tags) ? form.tags.join(", ") : "";

  return (
    <div className="max-h-[85vh] overflow-y-auto px-5 py-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Site" required value={form.title ?? ""} onChange={(v) => setForm((f)=>({ ...f, title: v }))} />
        <TextField label="Username / Email" required value={form.username ?? ""} onChange={(v) => setForm((f)=>({ ...f, username: v }))} />
        <PasswordField label="Password" required value={form.password ?? ""} onChange={(v)=> setForm((f)=>({ ...f, password: v }))} />
        <TextField label="Login URL" value={form.url ?? ""} onChange={(v)=> setForm((f)=>({ ...f, url: v }))} placeholder="https://…" />
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
          <textarea rows={3} className={`w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring`} value={form.notes ?? ""} onChange={(e)=> setForm((f)=>({ ...f, notes: e.target.value }))} />
        </div>
        <TextField label="Tags (comma separated)" value={tagString} onChange={setTagString} placeholder="Work, Banking" />
        <Select label="Status" value={form.status ?? "active"} onChange={(v)=> setForm((f)=>({ ...f, status: v as Item["status"] }))} options={[ ["active","Active"], ["archived","Archived"] ]} />

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Strength</label>
          <StrengthBar value={form.password ?? ""} />
        </div>

        <div className="md:col-span-2">
          <Generator onGenerate={(pw)=> setForm((f)=>({ ...f, password: pw }))} />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 mt-5 flex items-center justify-end gap-2 border-t bg-white px-5 py-3">
        <button onClick={onCancel} className="rounded-md bg-slate-600 px-3 py-2 text-white hover:bg-slate-700">Cancel</button>
        <button onClick={submit} className="rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700">Save</button>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string)=>void; placeholder?: string; required?: boolean }) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring" value={value} onChange={(e)=> onChange(e.target.value)} placeholder={placeholder} required={required} />
    </div>
  );
}

function PasswordField({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string)=>void; required?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input type={show?"text":"password"} className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring font-mono" value={value} onChange={(e)=> onChange(e.target.value)} required={required} autoComplete="new-password" />
        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700" onClick={()=> setShow((s)=>!s)} aria-label={show?"Hide password":"Show password"}>
          <i className={`fa-solid ${show?"fa-eye-slash":"fa-eye"}`} />
        </button>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string)=>void; options: [string,string][] }) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring" value={value} onChange={(e)=> onChange(e.target.value)}>
        {options.map(([v,t])=> <option key={v} value={v}>{t}</option>)}
      </select>
    </div>
  );
}

function StrengthBar({ value }: { value: string }) {
  const score = strengthScore(value);
  const labels = ["Very Weak","Weak","Fair","Good","Strong"]; const colors = ["#EF4444","#F97316","#F59E0B","#10B981","#059669"];
  const pct = ((score+1)/5)*100;
  return (
    <div>
      <div className="h-2 w-full rounded bg-slate-200">
        <div className="h-2 rounded" style={{ width: `${pct}%`, backgroundColor: colors[score] }}/>
      </div>
      <div className="mt-1 text-xs text-slate-600">{labels[score]}</div>
    </div>
  );
}

function Generator({ onGenerate }: { onGenerate: (pw: string)=>void }) {
  const [len, setLen] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);

  const make = () => {
    let set = ""; if (lower) set += "abcdefghijklmnopqrstuvwxyz"; if (upper) set += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; if (digits) set += "0123456789"; if (symbols) set += "!@#$%^&*()-_=+[]{}<>?,./"; if (!set) set = "abcdefghijklmnopqrstuvwxyz";
    let out = ""; const arr = new Uint32Array(len); crypto.getRandomValues(arr); for (let i=0;i<len;i++) out += set[arr[i] % set.length];
    onGenerate(out);
  };

  return (
    <div className={`rounded-xl bg-white p-3 ${BORDER_RING}`}>
      <div className="mb-3 text-sm text-slate-600">Password generator</div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Length</label>
          <input type="range" min={8} max={64} value={len} onChange={(e)=> setLen(Number(e.target.value))} className="w-full" />
          <div className="w-10 text-right text-sm text-slate-600">{len}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={upper} onChange={(e)=> setUpper(e.target.checked)} /> A–Z</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={lower} onChange={(e)=> setLower(e.target.checked)} /> a–z</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={digits} onChange={(e)=> setDigits(e.target.checked)} /> 0–9</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={symbols} onChange={(e)=> setSymbols(e.target.checked)} /> symbols</label>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button className={BTN_OUTLINE} onClick={make}><i className="fa-solid fa-wand-magic-sparkles mr-2"/> Generate</button>
      </div>
    </div>
  );
}