import { ReactNode } from "react";

export default function StatCard({ title, value, hint, icon }: { title: string; value: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="crm-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">{title}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div>}
    </div>
  );
}
