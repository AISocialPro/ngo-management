"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/ngos", label: "NGOs" },
  { href: "/admin/branches", label: "Branches" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/volunteers", label: "Volunteers" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--sidebar)] text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-blue-900">
          NGO CRM
        </div>
        <nav className="flex-1 p-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 mb-1 
                ${pathname === item.href
                  ? "bg-[var(--primary-light)]"
                  : "hover:bg-blue-700"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 text-sm border-t border-blue-900">
          © 2025 NGO CRM
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-[var(--primary)]">Admin Panel</h1>
          <button className="px-3 py-1 bg-[var(--primary)] text-white rounded-md">
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}
