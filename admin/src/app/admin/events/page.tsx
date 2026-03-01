"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Swal from "sweetalert2";

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

type EventStatus = "Active" | "Upcoming" | "Completed";

type EventItem = {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
  status: EventStatus;
  organizer?: string;
  category?: string;
  capacity?: number;
  ngoId?: string;
};

/* -------------------------------------------------------------------------- */
/* PAGE */
/* -------------------------------------------------------------------------- */

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<EventStatus | "All">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<EventItem>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- FETCH EVENTS ---------------- */

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/events");
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Ensure data is an array
      const eventsList = Array.isArray(data) ? data : [];
      
      // Normalize ID and ensure proper typing
      const normalizedEvents = eventsList.map((e: any) => ({
        id: e._id || e.id,
        _id: e._id || e.id,
        title: e.title || e.name || "",
        description: e.description || "",
        location: e.location || "",
        date: e.date || "",
        startTime: e.startTime || "",
        endTime: e.endTime || "",
        status: (e.status === "Active" || e.status === "Upcoming" || e.status === "Completed") 
          ? e.status as EventStatus 
          : "Upcoming",
        organizer: e.organizer || "",
        category: e.category || e.type || "",
        capacity: e.capacity || undefined,
        ngoId: e.ngoId || "",
      }));
      
      setEvents(normalizedEvents);
    } catch (error: any) {
      console.error("Fetch events error:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Could not load events",
        icon: "error",
        confirmButtonColor: "#0284c7",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ---------------- CLICK EVENT (CALENDAR) ---------------- */

  const openEventCard = (event: EventItem) => {
    Swal.fire({
      title: event.title,
      html: `
        <div class="text-left space-y-2">
          <p><b>Status:</b> <span class="px-2 py-0.5 rounded-full text-xs ${
            event.status === "Active"
              ? "bg-emerald-100 text-emerald-800"
              : event.status === "Upcoming"
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-800"
          }">${event.status}</span></p>
          <p><b>Date:</b> ${event.date}</p>
          <p><b>Time:</b> ${event.startTime || "--"} - ${event.endTime || "--"}</p>
          <p><b>Location:</b> ${event.location}</p>
          <p><b>Organizer:</b> ${event.organizer || "N/A"}</p>
          <p><b>Category:</b> ${event.category || "General"}</p>
          <p><b>Capacity:</b> ${event.capacity || "Unlimited"}</p>
          ${event.ngoId ? `<p><b>NGO ID:</b> ${event.ngoId}</p>` : ''}
          <div class="mt-3 p-3 bg-slate-50 rounded text-sm text-slate-600">
            ${event.description || "No description provided."}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Edit",
      cancelButtonText: "Close",
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#64748b",
    }).then((res) => {
      if (res.isConfirmed && event.id) {
        editEvent(event.id);
      }
    });
  };

  /* ---------------- CREATE & DELETE ---------------- */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentEvent.title?.trim() || !currentEvent.date || !currentEvent.location?.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all required fields (Title, Date, Location)",
        icon: "error",
        confirmButtonColor: "#0284c7",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        title: currentEvent.title.trim(),
        location: currentEvent.location.trim(),
        description: currentEvent.description?.trim() || "",
        date: currentEvent.date,
        startTime: currentEvent.startTime?.trim() || "",
        endTime: currentEvent.endTime?.trim() || "",
        capacity: currentEvent.capacity || null,
        category: currentEvent.category || "Other",
        status: currentEvent.status || "Upcoming",
        organizer: currentEvent.organizer?.trim() || "",
      };

      if (currentEvent.id) {
        // Update existing event - use query parameter
        const res = await fetch(`/api/events?id=${currentEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.details || "Failed to update event");
        }

        // Optimistic update
        setEvents(prev => prev.map(event => 
          event.id === currentEvent.id 
            ? { ...event, ...eventData, status: eventData.status as EventStatus }
            : event
        ));

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Event has been updated.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // Create new event
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.details || "Failed to create event");
        }

        const newEvent = await res.json();
        
        // Add new event to state
        setEvents(prev => [{
          id: newEvent.id,
          _id: newEvent._id,
          title: newEvent.title,
          description: newEvent.description,
          location: newEvent.location,
          date: newEvent.date,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          status: newEvent.status,
          organizer: newEvent.organizer,
          category: newEvent.category,
          capacity: newEvent.capacity,
          ngoId: newEvent.ngoId,
        }, ...prev]);

        Swal.fire({
          icon: "success",
          title: "Created!",
          text: "New event has been added.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      
      setIsModalOpen(false);
      setCurrentEvent({});
    } catch (error: any) {
      console.error("Save error:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Operation failed. Please try again.",
        icon: "error",
        confirmButtonColor: "#0284c7",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createEvent = () => {
    const today = new Date().toISOString().split("T")[0];
    setCurrentEvent({
      status: "Upcoming",
      startTime: "09:00",
      endTime: "17:00",
      date: today,
      capacity: undefined,
    });
    setIsModalOpen(true);
  };

  const editEvent = (id: string) => {
    const ev = events.find((e) => e.id === id);
    if (ev) {
      setCurrentEvent({ 
        ...ev,
        capacity: ev.capacity || undefined,
      });
      setIsModalOpen(true);
    }
  };

  const deleteEvent = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/events?id=${id}`, { 
          method: "DELETE" 
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to delete event");
        }
        
        // Update UI immediately (optimistic update)
        setEvents(prev => prev.filter((e) => e.id !== id));
        
        Swal.fire({
          title: "Deleted!",
          text: "Event has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error("Delete error:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "Could not delete event",
          icon: "error",
          confirmButtonColor: "#0284c7",
        });
      }
    }
  };

  /* ---------------- FILTERING ---------------- */

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase()) ||
      event.organizer?.toLowerCase().includes(search.toLowerCase()) ||
      event.category?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  /* ------------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">
        Events Management
      </h2>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Summary label="Total Events" value={events.length} />
        <Summary
          label="Active"
          value={events.filter((e) => e.status === "Active").length}
        />
        <Summary
          label="Upcoming"
          value={events.filter((e) => e.status === "Upcoming").length}
        />
        <Summary
          label="Completed"
          value={events.filter((e) => e.status === "Completed").length}
        />
      </div>

      {/* EVENT TABLE SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-800">Events</h3>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search events..."
                className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Filter */}
            <select
              className="py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as EventStatus | "All")
              }
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
            {/* Create */}
            <button
              onClick={createEvent}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              <i className="fa-solid fa-plus" /> Create Event
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Organizer</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
                      Loading events...
                    </div>
                  </td>
                </tr>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {e.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          e.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : e.status === "Upcoming"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{e.location}</td>
                    <td className="px-6 py-4">{e.date}</td>
                    <td className="px-6 py-4">{e.organizer || "N/A"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEventCard(e)}
                          className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
                          title="View"
                        >
                          <i className="fa-solid fa-eye" />
                        </button>
                        <button
                          onClick={() => e.id && editEvent(e.id)}
                          className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          onClick={() => e.id && deleteEvent(e.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <i className="fa-solid fa-calendar-xmark text-3xl text-slate-300"></i>
                      <p>No events found matching your criteria.</p>
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="text-sky-600 hover:text-sky-700 text-sm"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BIG CALENDAR */}
      <div className="rounded-xl bg-white p-4 shadow ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold mb-3">Event Calendar</h3>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            backgroundColor: 
              e.status === "Active" ? "#10b981" :
              e.status === "Upcoming" ? "#f59e0b" :
              "#64748b",
            borderColor: 
              e.status === "Active" ? "#059669" :
              e.status === "Upcoming" ? "#d97706" :
              "#475569",
          }))}
          eventClick={(info) => {
            const ev = events.find((e) => e.id === info.event.id);
            if (ev) openEventCard(ev);
          }}
        />
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {currentEvent.id ? "Edit Event" : "New Event"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentEvent({});
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isSubmitting}
              >
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                  value={currentEvent.title || ""}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, title: e.target.value })
                  }
                  placeholder="Event title"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                    value={currentEvent.status || "Upcoming"}
                    onChange={(e) =>
                      setCurrentEvent({
                        ...currentEvent,
                        status: e.target.value as EventStatus,
                      })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                    value={currentEvent.date || ""}
                    onChange={(e) =>
                      setCurrentEvent({ ...currentEvent, date: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                    value={currentEvent.startTime || ""}
                    onChange={(e) =>
                      setCurrentEvent({ ...currentEvent, startTime: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                    value={currentEvent.endTime || ""}
                    onChange={(e) =>
                      setCurrentEvent({ ...currentEvent, endTime: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                  value={currentEvent.location || ""}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, location: e.target.value })
                  }
                  placeholder="Event location"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Organizer
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                    value={currentEvent.organizer || ""}
                    onChange={(e) =>
                      setCurrentEvent({ ...currentEvent, organizer: e.target.value })
                    }
                    placeholder="Event organizer"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                    value={currentEvent.category || ""}
                    onChange={(e) =>
                      setCurrentEvent({ ...currentEvent, category: e.target.value })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="">Select Category</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Fundraiser">Fundraiser</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Volunteering">Volunteering</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                  value={currentEvent.capacity || ""}
                  onChange={(e) =>
                    setCurrentEvent({ 
                      ...currentEvent, 
                      capacity: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                  placeholder="Leave empty for unlimited"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty for unlimited capacity
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                  value={currentEvent.description || ""}
                  onChange={(e) =>
                    setCurrentEvent({
                      ...currentEvent,
                      description: e.target.value,
                    })
                  }
                  placeholder="Event description..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentEvent({});
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {currentEvent.id ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {currentEvent.id ? "Update Event" : "Create Event"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SMALL COMPONENT */
/* -------------------------------------------------------------------------- */

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}