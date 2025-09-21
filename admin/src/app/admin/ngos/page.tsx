"use client";
import { useEffect, useState } from "react";

type NGO = { id: string; name: string; regNo?: string; createdAt: string };
const KEY = "ngos";

export default function NGOsPage() {
  const [rows, setRows] = useState<NGO[]>([]);
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    setRows(raw ? JSON.parse(raw) : []);
  }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(rows)); }, [rows]);

  const add = () => {
    if (!name.trim()) return;
    setRows(prev => [{ id: crypto.randomUUID(), name, regNo, createdAt: new Date().toISOString() }, ...prev]);
    setName(""); setRegNo("");
  };
  const remove = (id: string) => setRows(prev => prev.filter(x => x.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">NGOs</h1>
          <p className="text-sm text-[var(--muted)]">Manage organizations in your tenant</p>
        </div>
        <div className="flex gap-2">
          <input className="crm-input" placeholder="NGO name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="crm-input" placeholder="Registration no." value={regNo} onChange={e=>setRegNo(e.target.value)} />
          <button className="crm-btn crm-btn--primary" onClick={add}>Add NGO</button>
        </div>
      </div>

      <div className="crm-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--muted)] border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Reg. No</th>
              <th className="p-3">Created</th>
              <th className="p-3 w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="p-4 text-[var(--muted)]" colSpan={4}>No NGOs yet.</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.regNo || "—"}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button onClick={()=>remove(r.id)} className="crm-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
