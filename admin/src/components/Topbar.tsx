// src/components/Topbar.tsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!dropRef.current) return;
      if (!dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="h-[70px] bg-white shadow flex items-center justify-between px-5 sticky top-0 z-[100]">
      {/* Search */}
      <div className="relative flex items-center bg-[#f8f9fa] rounded-full px-4 py-2 w-[300px]">
        <i className="fas fa-search text-gray-500"></i>
        <input
          type="text"
          placeholder="Search..."
          className="ml-2 bg-transparent outline-none w-full"
          onFocus={(e) => (e.currentTarget.nextElementSibling as HTMLDivElement).style.display = "block"}
          onBlur={(e) => setTimeout(() => (e.currentTarget.nextElementSibling as HTMLDivElement).style.display = "none", 200)}
        />
        <div className="absolute left-0 top-full w-full bg-white rounded-b-lg shadow hidden">
          {[
            { icon: "fa-donate", text: "Donation ID: #D-1025" },
            { icon: "fa-user", text: "Donor: Robert Williams" },
            { icon: "fa-project-diagram", text: "Campaign: Education for All" },
            { icon: "fa-file-alt", text: "Report: Monthly Financials" },
          ].map((r, i) => (
            <div key={i} className="px-4 py-2 border-b hover:bg-[#f5f7f9] cursor-pointer">
              <i className={`fas ${r.icon} mr-2`}></i>{r.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center">
        <div className="relative mr-5" ref={dropRef}>
          <button
            className="relative"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            <i className="fas fa-bell"></i>
            <span className="absolute -top-1 -right-2 bg-[#e74c3c] text-white w-[18px] h-[18px] text-[10px]
                             rounded-full grid place-items-center">3</span>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-[120%] w-[300px] bg-white rounded-lg shadow z-[102]">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h4 className="font-medium">Notifications</h4>
                <span className="text-sm text-[var(--primary,#3498db)] cursor-pointer">Mark all as read</span>
              </div>
              {[
                { text: "New donation of $500 received", sub: "10 minutes ago", unread: true },
                { text: "Volunteer training session tomorrow", sub: "2 hours ago", unread: true },
                { text: "Campaign 'Clean Water' reached 75% of goal", sub: "5 hours ago", unread: true },
                { text: "Monthly report is ready for review", sub: "Yesterday", unread: false },
                { text: "New volunteer registrations pending", sub: "2 days ago", unread: false },
              ].map((n, i) => (
                <div key={i} className={`px-4 py-2 border-b cursor-pointer ${n.unread ? "bg-[#f0f7ff]" : ""}`}>
                  <p>{n.text}</p>
                  <small className="text-gray-500">{n.sub}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="User"
            className="w-10 h-10 rounded-full object-cover mr-2"
          />
          <div>
            <h4 className="font-semibold leading-tight">Sarah Johnson</h4>
            <p className="text-sm text-gray-500 leading-tight">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
