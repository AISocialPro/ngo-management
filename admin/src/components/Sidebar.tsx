"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

type Item = {
  icon: string;     // Font Awesome class (without the 'fas ' prefix)
  label: string;
  href: string;
};

/** Tweak widths if you change them in AppShell, too */
export const SIDEBAR_OPEN_W = 250;
export const SIDEBAR_CLOSED_W = 70;

const MENU: Item[] = [
  { icon: "fa-home",               label: "Dashboard",              href: "/admin" },
  { icon: "fa-code-branch",        label: "Branches",               href: "/admin/branches" },
  { icon: "fa-project-diagram",    label: "Campaigns/Projects",     href: "/admin/campaigns" },
  { icon: "fa-donate",             label: "Donations",              href: "/admin/donations" },
  { icon: "fa-hands-helping",      label: "Volunteers",             href: "/admin/volunteers" },
  { icon: "fa-hand-holding-heart", label: "Beneficiaries",          href: "/admin/beneficiaries" },
  { icon: "fa-chart-line",         label: "Reports & Analytics",    href: "/admin/reports" },
  { icon: "fa-calendar-alt",       label: "Events",                 href: "/admin/events" },
  { icon: "fa-file-contract",      label: "Compliance/Documents",   href: "/admin/compliance" },
  { icon: "fa-comments",           label: "Communication Center",   href: "/admin/communication" },
  { icon: "fa-cog",                label: "Settings",               href: "/admin/settings" },
  { icon: "fa-life-ring",          label: "Help & Support",         href: "/admin/help" },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="
        fixed left-0 top-0 z-[1000] h-screen text-white
        bg-gradient-to-b from-[var(--primary,#3498db)] to-[#2980b9]
        overflow-y-auto transition-[width] duration-200
        shadow-[0_10px_30px_rgba(0,0,0,.1)]
      "
      style={{ width: collapsed ? SIDEBAR_CLOSED_W : SIDEBAR_OPEN_W }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3713/3713765.png"
            alt="NGO Logo"
            className="h-8 w-8"
          />
          {!collapsed && (
            <h2 className="text-lg font-semibold leading-none">NGO Connect</h2>
          )}
        </div>

        {/* Hamburger */}
        <button
          aria-label="Toggle sidebar"
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <div className="space-y-1.5">
            <span className="block h-[2px] w-5 bg-white"></span>
            <span className="block h-[2px] w-5 bg-white"></span>
            <span className="block h-[2px] w-5 bg-white"></span>
          </div>
        </button>
      </div>

      {/* Menu */}
      <nav className="py-3">
        {MENU.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center gap-3 px-5 py-3 text-left
                transition border-l-4
                ${active ? "bg-white/15 border-white" : "border-transparent hover:bg-white/10 hover:border-white/60"}
              `}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <i className={`fas ${item.icon} text-base`} />
              {!collapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
