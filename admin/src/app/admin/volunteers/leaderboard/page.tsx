"use client";

import { useEffect, useState } from "react";

type Volunteer = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  totalHours: number;
  badges?: string[];
  level?: number; // computed based on hours
};

export default function VolunteerLeaderboardPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/volunteers/leaderboard");
        const data = await res.json();
        setVolunteers(data || []);
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading leaderboard…</p>;
  }

  const top3 = volunteers.slice(0, 3);
  const rest = volunteers.slice(3);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Volunteer Leaderboard 🏆</h1>
        <p className="text-gray-500 mt-2">
          Celebrating volunteer excellence, dedication & lifetime contribution.
        </p>
      </div>

      {/* TOP 3 SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {top3.map((v, index) => (
          <div
            key={v.id}
            className={`rounded-2xl p-6 text-center text-white shadow-lg 
              ${index === 1 ? "bg-blue-600 scale-105" : "bg-blue-500"}`}
          >
            <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
              <img
                src={v.avatar || "/default-avatar.png"}
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-2xl font-semibold mt-4">{v.name}</h2>
            <p className="text-sm opacity-90">{v.email}</p>

            <div className="mt-4 text-4xl font-bold">
              {v.totalHours}
              <span className="text-sm ml-1 font-normal opacity-90">hrs</span>
            </div>

            <p className="mt-2 text-sm opacity-90">Rank #{index + 1}</p>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE PANEL (Achievements) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left -> Full ranking table */}
        <div className="lg:col-span-2 border rounded-xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4 text-left text-gray-600">Rank</th>
                <th className="p-4 text-left text-gray-600">Volunteer</th>
                <th className="p-4 text-left text-gray-600">Hours</th>
                <th className="p-4 text-left text-gray-600">Badges</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((v, i) => (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{i + 4}</td>
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={v.avatar || "/default-avatar.png"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.email}</p>
                    </div>
                  </td>

                  <td className="p-4">{v.totalHours} hrs</td>

                  <td className="p-4 space-x-2">
                    {v.badges?.map((badge, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"
                      >
                        {badge}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT → Achievements Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border">
          <h3 className="text-xl font-bold">Achievements Overview</h3>

          <div className="space-y-4">
            {top3.map((v, index) => (
              <div key={v.id} className="p-4 rounded-lg border bg-gray-50">
                <div className="flex items-center gap-3">
                  <img
                    src={v.avatar || "/default-avatar.png"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-xs text-gray-500">Rank #{index + 1}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">Badges</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {v.badges?.map((b, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md"
                      >
                        {b}
                      </span>
                    )) || "No badges yet"}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
