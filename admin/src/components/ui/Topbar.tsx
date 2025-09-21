"use client";
import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-14 sticky top-0 z-10 bg-[var(--panel)] border-b flex items-center gap-3 px-4">
      <div className="hidden md:flex items-center gap-2 flex-1">
        <Search size={16} className="text-[var(--muted)]" />
        <input className="crm-input w-full" placeholder="Search NGOs, donors, volunteers..." />
      </div>
      <button className="crm-btn"><Bell size={16} /></button>
      <div className="w-8 h-8 rounded-full bg-[var(--brand)] grid place-items-center text-white text-sm font-semibold">N</div>
    </header>
  );
}
