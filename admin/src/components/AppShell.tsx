"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const OPEN_W = 250;       // sidebar width when open
const CLOSED_W = 70;      // sidebar width when collapsed
const STORAGE_KEY = "ngoc_sidebar_collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // restore/save collapsed state (optional)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCollapsed(saved === "1");
    } catch {}
  }, []);
  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  // content left margin must match the sidebar width
  const leftOffset = useMemo(() => (collapsed ? CLOSED_W : OPEN_W), [collapsed]);

  return (
    <>
      <Sidebar collapsed={collapsed} onToggle={toggle} />

      {/* Content wrapper shifts with the sidebar */}
      <div
        className="min-h-screen flex flex-col transition-[margin] duration-200"
        style={{ marginLeft: leftOffset }}
      >
        {/* If your Topbar has a hamburger, pass toggle down (optional) */}
        <Topbar /* onToggle={toggle} collapsed={collapsed} */ />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </>
  );
}
