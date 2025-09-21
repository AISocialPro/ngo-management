// src/components/Chatbot.tsx
"use client";

import { useEffect, useState } from "react";

type Msg = { id: string; role: "bot" | "user"; text: string; time: string };

const LS_KEY_OPEN = "ngo__chat_open";
const LS_KEY_HISTORY = "ngo__chat_history";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<Msg[]>([
    {
      id: crypto.randomUUID(),
      role: "bot",
      text: "Hi! I can help you find donors, volunteers, and reports. What do you need?",
      time: "Just now",
    },
  ]);

  useEffect(() => {
    try {
      const savedOpen = localStorage.getItem(LS_KEY_OPEN);
      const savedHistory = localStorage.getItem(LS_KEY_HISTORY);
      if (savedOpen) setOpen(savedOpen === "1");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as Msg[];
        if (Array.isArray(parsed) && parsed.length) setHistory(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_OPEN, open ? "1" : "0");
      localStorage.setItem(LS_KEY_HISTORY, JSON.stringify(history));
    } catch {}
  }, [open, history]);

  const send = () => {
    if (!msg.trim()) return;
    const now: Msg[] = [
      { id: crypto.randomUUID(), role: "user", text: msg.trim(), time: "Just now" },
      {
        id: crypto.randomUUID(),
        role: "bot",
        text:
          "Thanks! I’ve captured that. (Demo reply)\nTip: Try “show active branches”, “latest donations”, or “export monthly report”.",
        time: "Just now",
      },
    ];
    setHistory((h) => [...h, ...now]);
    setMsg("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-[1100] grid h-14 w-14 place-items-center rounded-full bg-[#1e88e5] text-white shadow-xl transition hover:scale-105"
        aria-label="Open chat"
      >
        <i className="fa-solid fa-comments text-2xl" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[1100] w-[340px] max-w-[88vw] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center justify-between bg-[#1e88e5] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                <i className="fa-solid fa-robot" />
              </span>
              <div>
                <div className="font-semibold leading-4">NGO Assistant</div>
                <div className="text-xs text-white/90">Online</div>
              </div>
            </div>
            <button
              className="text-white/90 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <i className="fa-solid fa-xmark text-xl" />
            </button>
          </div>

          <div className="max-h-[340px] space-y-2 overflow-y-auto bg-gray-50 px-3 py-3">
            {history.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm shadow ${
                    m.role === "user" ? "bg-[#e3f2fd] text-gray-800" : "bg-white text-gray-800"
                  }`}
                >
                  {m.text}
                  <div className="mt-1 text-[10px] text-gray-400">{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t bg-white p-2">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1e88e5]"
            />
            <button
              onClick={send}
              className="rounded-lg bg-[#1e88e5] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
