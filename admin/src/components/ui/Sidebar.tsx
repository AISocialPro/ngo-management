"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, GitBranch, Megaphone, Banknote, Users, BarChart3, Settings } from "lucide-react";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ngos", label: "NGOs", icon: Building2 },
  { href: "/admin/branches", label: "Branches", icon: GitBranch },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/donations", label: "Donations", icon: Banknote },
  { href: "/admin/volunteers", label: "Volunteers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[var(--panel)] border-r">
      <div className="h-14 flex items-center px-4 border-b">
        <div className="text-lg font-semibold tracking-tight">NGO CRM</div>
      </div>
      <nav className="px-3 py-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border
                ${active ? "bg-[var(--brand)] border-[var(--brand)] text-white" : "hover:bg-[var(--panel-2)]"}`}
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 text-[var(--muted)] text-xs border-t mt-4">© 2025 NGO CRM</div>
    </aside>
  );
}
