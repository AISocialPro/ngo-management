"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Users, HeartHandshake, Wallet } from "lucide-react";

/* ---------------- TYPES ---------------- */
type EventItem = {
  id: string;
  name?: string;
  dateISO?: string;
  location?: string;
  budget?: number | null;
};

/* ---------------- PAGE ---------------- */
export default function EventsPage() {
  // 🔒 NO API, ONLY LOCAL STATE
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ---------------- INIT (NO BACKEND) ---------------- */
  useEffect(() => {
    // simulate loading (UX purpose only)
    const timer = setTimeout(() => {
      setEvents([]); // empty state (backend not ready)
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  /* ---------------- SAFE EVENTS ---------------- */
  const safeEvents: EventItem[] = Array.isArray(events) ? events : [];

  /* ---------------- FILTER (NO MAP) ---------------- */
  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return safeEvents;

    const out: EventItem[] = [];
    for (let i = 0; i < safeEvents.length; i++) {
      const name = (safeEvents[i]?.name || "").toLowerCase();
      if (name.includes(q)) out.push(safeEvents[i]);
    }
    return out;
  }, [safeEvents, search]);

  /* ---------------- STATS ---------------- */
  const totalEvents = safeEvents.length;
  const totalParticipants = 0;
  const totalVolunteers = 0;

  let budgetTotal = 0;
  for (let i = 0; i < safeEvents.length; i++) {
    budgetTotal += Number(safeEvents[i]?.budget || 0);
  }

  /* ---------------- RENDER CARDS (NO MAP) ---------------- */
  const eventCards: JSX.Element[] = [];
  for (let i = 0; i < filteredEvents.length; i++) {
    const e = filteredEvents[i];

    const dateText =
      e?.dateISO && !Number.isNaN(new Date(e.dateISO).getTime())
        ? new Date(e.dateISO).toLocaleDateString()
        : "Date not set";

    eventCards.push(
      <div
        key={e.id || i}
        className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
      >
        <h3 className="font-semibold text-lg">
          {e?.name || "Untitled Event"}
        </h3>
        <p className="text-sm text-gray-500">{dateText}</p>
        <p className="text-sm text-gray-700 mt-1">
          📍 {e?.location || "Location not set"}
        </p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<CalendarCheck />} label="Total Events" value={totalEvents} />
        <StatCard icon={<Users />} label="Participants" value={totalParticipants} />
        <StatCard icon={<HeartHandshake />} label="Volunteers" value={totalVolunteers} />
        <StatCard icon={<Wallet />} label="Budget Total" value={`₹${budgetTotal}`} />
      </div>

      {/* Events */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Events</h2>

          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="border rounded-md px-3 py-2 text-sm"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
              + Create Event
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading events...</p>
        ) : eventCards.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg font-medium">No events yet</p>
            <p className="text-sm mt-1">
              Plan your first event to kickstart your NGO's activities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventCards}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-center gap-4 bg-white border rounded-xl p-5 shadow-sm">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
