"use client";

import { useMemo, useState } from "react";

/* --------------------------- small helper --------------------------- */
function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ------------------------------- Types ------------------------------ */
type Channel = "Inbox" | "Sent" | "Announcements";
type Message = { id: string; from: string; to: string; text: string; time: string; mine?: boolean };
type Thread = {
  id: string;
  subject: string;
  participants: string[];
  unread: boolean;
  lastTime: string;
  channel: Channel;
  preview: string;
  messages: Message[];
};

/* --------------------------- Page Component ------------------------- */
export default function CommunicationCenterPage() {
  /* --------------------------- Demo threads --------------------------- */
  const threads = useMemo<Thread[]>(
    () => [
      {
        id: "t1",
        subject: "Volunteer roster for Cleanup Day",
        participants: ["Emily Chen", "You"],
        unread: true,
        lastTime: "10:12 AM",
        channel: "Inbox",
        preview: "We’ve confirmed 28 volunteers so far…",
        messages: [
          { id: "m1", from: "Emily Chen", to: "You", text: "We’ve confirmed 28 volunteers so far. Need 10 more for logistics.", time: "10:12 AM" },
          { id: "m2", from: "You", to: "Emily Chen", text: "Awesome! I’ll ping the newsletter list.", time: "10:15 AM", mine: true },
        ],
      },
      {
        id: "t2",
        subject: "Thank-you note template",
        participants: ["Robert Johnson", "You"],
        unread: false,
        lastTime: "Yesterday",
        channel: "Inbox",
        preview: "Sharing the updated donor thank-you template…",
        messages: [
          { id: "m1", from: "Robert Johnson", to: "You", text: "Sharing the updated donor thank-you template. Thoughts?", time: "Yesterday 4:40 PM" },
          { id: "m2", from: "You", to: "Robert Johnson", text: "Looks great—adding our logo variant.", time: "Yesterday 5:02 PM", mine: true },
        ],
      },
      {
        id: "t3",
        subject: "Monthly donor update (Jan)",
        participants: ["You"],
        unread: false,
        lastTime: "Mon",
        channel: "Sent",
        preview: "Hi all—here’s a quick update on funds and impact…",
        messages: [
          { id: "m1", from: "You", to: "Donor List", text: "Hi all—here’s a quick update on funds and impact. PDF attached.", time: "Mon 9:14 AM", mine: true },
        ],
      },
      {
        id: "t4",
        subject: "Community Cleanup • Call for volunteers",
        participants: ["You"],
        unread: false,
        lastTime: "Fri",
        channel: "Announcements",
        preview: "Join us this Saturday at Riverside Park…",
        messages: [
          { id: "m1", from: "You", to: "All Volunteers", text: "Join us this Saturday at Riverside Park. Check-in 8:30 AM.", time: "Fri 11:00 AM", mine: true },
        ],
      },
    ],
    []
  );

  /* ------------------------------ State ------------------------------ */
  const [activeChannel, setActiveChannel] = useState<Channel>("Inbox");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(() => threads[0]?.id ?? "");
  const [store, setStore] = useState<Thread[]>(threads);

  const selected = store.find((t) => t.id === selectedId) ?? store[0];

  const filtered = store.filter(
    (t) =>
      t.channel === activeChannel &&
      (t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.preview.toLowerCase().includes(search.toLowerCase()) ||
        t.participants.join(", ").toLowerCase().includes(search.toLowerCase()))
  );

  /* --------------------------- Actions --------------------------- */
  const sendToThread = (text: string) => {
    if (!selected) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    setStore((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? {
              ...t,
              preview: trimmed,
              lastTime: "Just now",
              unread: false,
              messages: [
                ...t.messages,
                { id: crypto.randomUUID(), from: "You", to: t.participants.join(", "), text: trimmed, time: "Just now", mine: true },
              ],
            }
          : t
      )
    );
  };

  /* ---------------------- Announcement modal ---------------------- */
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");

  const postAnnouncement = () => {
    const subject = annTitle.trim() || "Untitled announcement";
    const body = annBody.trim() || "(No content)";
    const newItem: Thread = {
      id: crypto.randomUUID(),
      subject,
      participants: ["You"],
      unread: false,
      lastTime: "Just now",
      channel: "Announcements",
      preview: body.slice(0, 120),
      messages: [{ id: crypto.randomUUID(), from: "You", to: "All", text: body, time: "Just now", mine: true }],
    };
    setStore((p) => [newItem, ...p]);
    setAnnounceOpen(false);
    setActiveChannel("Announcements");
    setSelectedId(newItem.id);
    setAnnTitle("");
    setAnnBody("");
  };

  /* ------------------------------ UI ------------------------------ */
  return (
    <div className="p-5 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Communication Center</h2>
          <p className="text-slate-500">Reach donors, volunteers, and teams—fast.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnnounceOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            <i className="fa-solid fa-bullhorn" /> New Announcement
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="fa-inbox" label="Inbox" value={store.filter((t) => t.channel === "Inbox").length} />
        <Stat icon="fa-paper-plane" label="Sent" value={store.filter((t) => t.channel === "Sent").length} />
        <Stat icon="fa-bullhorn" label="Announcements" value={store.filter((t) => t.channel === "Announcements").length} />
        <Stat icon="fa-envelope-open-text" label="Unread" value={store.filter((t) => t.channel === "Inbox" && t.unread).length} />
      </div>

      {/* Channel tabs + search */}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {(["Inbox", "Sent", "Announcements"] as Channel[]).map((c) => (
            <button
              key={c}
              onClick={() => setActiveChannel(c)}
              className={cn(
                "rounded-full px-4 py-2 text-sm",
                activeChannel === c ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
          />
        </div>
      </div>

      {/* 3-pane layout: list • thread • composer */}
      <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
        {/* Thread list */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="font-medium text-slate-700">{activeChannel}</div>
            <span className="text-xs text-slate-500">{filtered.length} conversations</span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  "block w-full border-b px-4 py-3 text-left hover:bg-slate-50",
                  selectedId === t.id && "bg-sky-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800">{t.subject}</div>
                  <div className="text-xs text-slate-500">{t.lastTime}</div>
                </div>
                <div className="mt-1 text-sm text-slate-600 line-clamp-1">{t.preview}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <i className="fa-regular fa-user" />
                  <span className="truncate">{t.participants.join(", ")}</span>
                  {t.unread && <span className="ml-auto rounded-full bg-emerald-100 px-2 py-[2px] text-[10px] font-semibold text-emerald-700">UNREAD</span>}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-slate-500">No conversations here yet.</div>
            )}
          </div>
        </div>

        {/* Conversation thread + composer */}
        <div className="rounded-xl border border-slate-200 bg-white">
          {/* Thread header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="font-semibold text-slate-800">{selected?.subject ?? "No conversation"}</div>
              <div className="text-xs text-slate-500">
                {selected?.participants.join(", ") || "—"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert("Archive (demo)")}
                className="rounded-md border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <i className="fa-regular fa-folder-open" /> Archive
              </button>
              <button
                onClick={() => alert("Export (demo)")}
                className="rounded-md border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <i className="fa-solid fa-file-export" /> Export
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-[48vh] space-y-3 overflow-y-auto px-4 py-4">
            {selected?.messages.map((m) => (
              <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow",
                    m.mine ? "bg-sky-50 text-slate-800" : "bg-white ring-1 ring-slate-200 text-slate-800"
                  )}
                >
                  <div className="mb-1 text-[11px] font-medium text-slate-500">
                    {m.mine ? "You" : m.from} • {m.time}
                  </div>
                  <div className="whitespace-pre-line">{m.text}</div>
                </div>
              </div>
            ))}
            {!selected && <div className="text-center text-slate-500">Select a conversation to view messages.</div>}
          </div>

          {/* Composer */}
          <Composer
            onSend={(text) => sendToThread(text)}
            templates={[
              "Thanks for your support! We’ll share an update soon.",
              "Hi! Could you confirm attendance for Saturday’s event?",
              "Appreciate your donation—receipt attached.",
            ]}
          />
        </div>
      </div>

      {/* Announcement modal */}
      {announceOpen && (
        <div className="fixed inset-0 z-[1100] grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-semibold text-slate-800">
                <i className="fa-solid fa-bullhorn mr-2" />
                New Announcement
              </div>
              <button className="text-slate-500 hover:text-slate-700" onClick={() => setAnnounceOpen(false)}>
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring"
                  placeholder="Community Cleanup • Call for volunteers"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring"
                  placeholder="Write the announcement…"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <button onClick={() => setAnnounceOpen(false)} className="rounded-md border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={postAnnouncement} className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700">
                Post Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- UI Subcomponents --------------------------- */
function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-1 text-sky-600"><i className={cn("fa-solid", icon)} /></div>
      <div className="text-2xl font-semibold text-slate-800">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

function Composer({
  onSend,
  templates = [],
}: {
  onSend: (text: string) => void;
  templates?: string[];
}) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="border-t p-3">
      {/* Quick templates */}
      {templates.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => setText((prev) => (prev ? `${prev}\n${t}` : t))}
              className="rounded-full border px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
              title="Insert template"
            >
              <i className="fa-regular fa-message mr-1" />
              {t.slice(0, 36)}
              {t.length > 36 ? "…" : ""}
            </button>
          ))}
        </div>
      )}
      {/* Input row */}
      <div className="flex items-center gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          rows={2}
          className="max-h-40 flex-1 resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
        />
        <button
          onClick={send}
          className="h-[38px] shrink-0 rounded-md bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-700"
        >
          <i className="fa-solid fa-paper-plane" /> Send
        </button>
      </div>
    </div>
  );
}
