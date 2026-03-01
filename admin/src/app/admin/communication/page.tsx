"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* --------------------------- small helper --------------------------- */
function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ------------------------------- Types ------------------------------ */
type Channel = "Inbox" | "Sent" | "Announcements";
type Message = { 
  id: string; 
  from: string; 
  to: string; 
  text: string; 
  time: string; 
  mine?: boolean;
  createdAt?: string;
};

type Thread = {
  id: string;
  subject: string;
  participants: string[];
  unread: boolean;
  lastTime: string;
  channel: Channel;
  preview: string;
  messages: Message[];
  createdBy?: string;
  createdAt?: string;
};

/* --------------------------- API Functions --------------------------- */
const fetchThreads = async (channel?: string): Promise<Thread[]> => {
  const url = channel 
    ? `/api/communication/threads?channel=${channel}`
    : '/api/communication/threads';
    
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // For session cookies
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch threads');
  }
  
  const data = await response.json();
  return data.threads || data || [];
};

const sendMessage = async (threadId: string, text: string) => {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",   // 🔥 THIS TOO
    body: JSON.stringify({
      threadId,
      message: text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send message");
  }

  return response.json();
};


const createAnnouncement = async (title: string, body: string): Promise<Thread> => {
  const response = await fetch("/api/announcements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",   // 🔥 THIS WAS MISSING
    body: JSON.stringify({ title, body }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create announcement");
  }

  return response.json();
};


const markThreadAsRead = async (threadId: string): Promise<Thread> => {
  const response = await fetch(`/api/communication/threads/${threadId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ unread: false })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark as read');
  }
  
  return response.json();
};

/* --------------------------- Page Component ------------------------- */
export default function CommunicationCenterPage() {
  const queryClient = useQueryClient();
  
  /* ------------------------------ State ------------------------------ */
  const [activeChannel, setActiveChannel] = useState<Channel>("Inbox");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");

  /* --------------------------- React Query --------------------------- */
  const { 
    data: threads = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['threads', activeChannel],
    queryFn: () => fetchThreads(activeChannel),
    refetchInterval: 30000, // 30 seconds
    staleTime: 10000, // 10 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ threadId, text }: { threadId: string, text: string }) => 
      sendMessage(threadId, text),
    onSuccess: (data) => {
      // Update threads list
      queryClient.setQueryData(['threads', activeChannel], (old: Thread[] = []) =>
        old.map(t => t.id === data.thread.id ? data.thread : t)
      );
      
      // Update selected thread
      if (selectedId === data.thread.id) {
        queryClient.setQueryData(['thread', selectedId], data.thread);
      }
    }
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: ({ title, body }: { title: string, body: string }) =>
      createAnnouncement(title, body),
    onSuccess: (newThread) => {
      // Add new announcement to threads list
      queryClient.invalidateQueries({
  queryKey: ['threads'],
});

      
      // Switch to announcements and select new thread
      setActiveChannel("Announcements");
      setSelectedId(newThread.id);
      
      // Refetch threads to get updated list
      refetch();
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: (threadId: string) => markThreadAsRead(threadId),
    onSuccess: (updatedThread) => {
      // Update thread in the list
      queryClient.setQueryData(['threads', activeChannel], (old: Thread[] = []) =>
        old.map(t => t.id === updatedThread.id ? updatedThread : t)
      );
    }
  });

  /* --------------------------- Effects --------------------------- */
  useEffect(() => {
    if (threads.length > 0 && !selectedId) {
      setSelectedId(threads[0].id);
    }
  }, [threads, selectedId]);

  useEffect(() => {
    // Refetch when channel changes
    refetch();
  }, [activeChannel, refetch]);

  /* --------------------------- Filtered Threads --------------------------- */
  const filteredThreads = threads.filter(
    (t) =>
      t.channel === activeChannel &&
      (t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.preview.toLowerCase().includes(search.toLowerCase()) ||
        t.participants.join(", ").toLowerCase().includes(search.toLowerCase()))
  );

  const selectedThread = threads.find((t) => t.id === selectedId);

  /* --------------------------- Actions --------------------------- */
  const handleSendToThread = (text: string) => {
    if (!selectedThread) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    sendMessageMutation.mutate({
      threadId: selectedThread.id,
      text: trimmed
    });
  };

  const handleThreadSelect = (threadId: string) => {
    setSelectedId(threadId);
    
    // Mark as read when selected
    const thread = threads.find(t => t.id === threadId);
    if (thread?.unread) {
      markAsReadMutation.mutate(threadId);
    }
  };

  /* ---------------------- Announcement modal ---------------------- */
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");

  const handlePostAnnouncement = () => {
    const subject = annTitle.trim() || "Untitled announcement";
    const body = annBody.trim() || "(No content)";
    
    createAnnouncementMutation.mutate({
      title: subject,
      body: body
    });

    setAnnounceOpen(false);
    setAnnTitle("");
    setAnnBody("");
  };

  /* ---------------------- Stats Calculation ---------------------- */
  const stats = {
    inbox: threads.filter(t => t.channel === "Inbox").length,
    sent: threads.filter(t => t.channel === "Sent").length,
    announcements: threads.filter(t => t.channel === "Announcements").length,
    unread: threads.filter(t => t.channel === "Inbox" && t.unread).length
  };

  /* ------------------------------ UI ------------------------------ */
  if (isLoading && threads.length === 0) {
    return (
      <div className="p-5 md:p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-800">Communication Center</h2>
          <p className="text-slate-500">Loading conversations...</p>
        </div>
        <div className="grid h-64 place-items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600"></div>
            <div className="text-slate-500">Loading conversations...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 md:p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-800">Communication Center</h2>
          <p className="text-red-500">Error loading conversations: {(error as Error).message}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
        >
          Retry
        </button>
      </div>
    );
  }

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
            disabled={createAnnouncementMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-sky-300"
          >
            <i className="fa-solid fa-bullhorn" /> 
            {createAnnouncementMutation.isPending ? "Creating..." : "New Announcement"}
          </button>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <i className="fa-solid fa-rotate" /> Refresh
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="fa-inbox" label="Inbox" value={stats.inbox} />
        <Stat icon="fa-paper-plane" label="Sent" value={stats.sent} />
        <Stat icon="fa-bullhorn" label="Announcements" value={stats.announcements} />
        <Stat icon="fa-envelope-open-text" label="Unread" value={stats.unread} />
      </div>

      {/* Channel tabs + search */}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {(["Inbox", "Sent", "Announcements"] as Channel[]).map((c) => (
            <button
              key={c}
              onClick={() => {
                setActiveChannel(c);
                setSelectedId("");
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors",
                activeChannel === c 
                  ? "bg-sky-600 text-white" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {c}
              {c === "Inbox" && stats.unread > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {stats.unread}
                </span>
              )}
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{filteredThreads.length} conversations</span>
              {isLoading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
              )}
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThreadSelect(t.id)}
                className={cn(
                  "block w-full border-b px-4 py-3 text-left transition-colors hover:bg-slate-50",
                  selectedId === t.id && "bg-sky-50",
                  t.unread && "bg-emerald-50/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800 line-clamp-1">{t.subject}</div>
                  <div className="flex items-center gap-1">
                    {t.unread && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    )}
                    <div className="text-xs text-slate-500">{t.lastTime}</div>
                  </div>
                </div>
                <div className="mt-1 text-sm text-slate-600 line-clamp-1">{t.preview}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <i className="fa-regular fa-user" />
                  <span className="truncate">{t.participants.join(", ")}</span>
                  {t.channel === "Announcements" && (
                    <span className="ml-auto rounded-full bg-amber-100 px-2 py-[2px] text-[10px] font-semibold text-amber-700">
                      ANNOUNCEMENT
                    </span>
                  )}
                </div>
              </button>
            ))}
            {filteredThreads.length === 0 && !isLoading && (
              <div className="p-6 text-center text-slate-500">
                {search ? "No matching conversations found." : "No conversations here yet."}
                {activeChannel === "Announcements" && (
                  <button
                    onClick={() => setAnnounceOpen(true)}
                    className="mt-2 text-sky-600 hover:text-sky-700"
                  >
                    Create your first announcement
                  </button>
                )}
              </div>
            )}
            {isLoading && filteredThreads.length === 0 && (
              <div className="p-6 text-center text-slate-500">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
                <div className="mt-2">Loading conversations...</div>
              </div>
            )}
          </div>
        </div>

        {/* Conversation thread + composer */}
        <div className="rounded-xl border border-slate-200 bg-white">
          {/* Thread header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-800 truncate">{selectedThread?.subject ?? "Select a conversation"}</div>
              <div className="text-xs text-slate-500 truncate">
                {selectedThread?.participants.join(", ") || "—"}
                {selectedThread?.createdBy && ` • Created by ${selectedThread.createdBy}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedThread && (
                <>
                  <button
                    onClick={() => {
                      if (selectedThread.unread) {
                        markAsReadMutation.mutate(selectedThread.id);
                      }
                      alert("Archive feature coming soon");
                    }}
                    className="rounded-md border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <i className="fa-regular fa-folder-open" /> Archive
                  </button>
                  <button
                    onClick={() => alert("Export feature coming soon")}
                    className="rounded-md border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <i className="fa-solid fa-file-export" /> Export
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-[48vh] space-y-3 overflow-y-auto px-4 py-4">
            {selectedThread?.messages.map((m) => (
              <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow",
                    m.mine 
                      ? "bg-sky-600 text-white" 
                      : "bg-white ring-1 ring-slate-200 text-slate-800"
                  )}
                >
                  <div className={cn(
                    "mb-1 text-[11px] font-medium",
                    m.mine ? "text-sky-100" : "text-slate-500"
                  )}>
                    {m.mine ? "You" : m.from} • {m.time}
                    {m.createdAt && (
                      <span className="ml-2 text-[10px] opacity-75">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className={cn("whitespace-pre-line", m.mine ? "text-white" : "text-slate-800")}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl bg-sky-600 px-3 py-2 text-sm text-white opacity-70">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                    <div>Sending...</div>
                  </div>
                </div>
              </div>
            )}
            {!selectedThread && (
              <div className="flex h-64 items-center justify-center text-slate-500">
                <div className="text-center">
                  <i className="fa-regular fa-comments text-4xl text-slate-300 mb-3"></i>
                  <div>Select a conversation to view messages</div>
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          {selectedThread && (
            <Composer
              onSend={handleSendToThread}
              isSending={sendMessageMutation.isPending}
              disabled={selectedThread.channel === "Announcements"}
              templates={[
                "Thanks for your support! We'll share an update soon.",
                "Hi! Could you confirm attendance for Saturday's event?",
                "Appreciate your donation—receipt attached.",
              ]}
            />
          )}
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
              <button 
                className="text-slate-500 hover:text-slate-700" 
                onClick={() => setAnnounceOpen(false)}
                disabled={createAnnouncementMutation.isPending}
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring"
                  placeholder="Community Cleanup • Call for volunteers"
                  disabled={createAnnouncementMutation.isPending}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring"
                  placeholder="Write the announcement…"
                  disabled={createAnnouncementMutation.isPending}
                  required
                />
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-sm text-slate-600">
                  <i className="fa-solid fa-info-circle mr-2"></i>
                  Announcements will be visible to all organization members.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <button 
                onClick={() => setAnnounceOpen(false)} 
                className="rounded-md border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                disabled={createAnnouncementMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handlePostAnnouncement} 
                className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-sky-300"
                disabled={createAnnouncementMutation.isPending || !annTitle.trim() || !annBody.trim()}
              >
                {createAnnouncementMutation.isPending ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Posting...
                  </>
                ) : (
                  "Post Announcement"
                )}
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
      <div className="mb-1 text-sky-600">
        <i className={cn("fa-solid", icon)} />
      </div>
      <div className="text-2xl font-semibold text-slate-800">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

function Composer({
  onSend,
  isSending = false,
  disabled = false,
  templates = [],
}: {
  onSend: (text: string) => void;
  isSending?: boolean;
  disabled?: boolean;
  templates?: string[];
}) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending && !disabled) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="border-t p-3">
      {disabled && (
        <div className="mb-3 rounded-md bg-amber-50 p-2 text-sm text-amber-800">
          <i className="fa-solid fa-info-circle mr-2"></i>
          Announcements are read-only. Reply in Inbox conversations.
        </div>
      )}
      
      {/* Quick templates */}
      {templates.length > 0 && !disabled && (
        <div className="mb-2 flex flex-wrap gap-2">
          <div className="text-xs text-slate-500">Quick replies:</div>
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => setText((prev) => (prev ? `${prev}\n${t}` : t))}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
              title="Insert template"
              disabled={isSending || disabled}
            >
              <i className="fa-regular fa-message mr-1" />
              {t.slice(0, 30)}
              {t.length > 30 ? "…" : ""}
            </button>
          ))}
        </div>
      )}
      
      {/* Input row */}
      <div className="flex items-start gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={disabled ? "Announcements are read-only" : "Write a message…"}
          rows={2}
          className="max-h-40 flex-1 resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-200 focus:ring disabled:bg-slate-100 disabled:cursor-not-allowed"
          disabled={isSending || disabled}
        />
        <button
          onClick={send}
          disabled={isSending || !text.trim() || disabled}
          className="mt-1 h-[38px] shrink-0 rounded-md bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-sky-300 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              Sending
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane mr-2" />
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}