"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function DashboardPage() {
  const donationRef = useRef<Chart | null>(null);
  const demoRef = useRef<Chart | null>(null);

  useEffect(() => {
    // ---- Donation line chart
    const donationEl = document.getElementById("donationChart") as HTMLCanvasElement | null;
    if (donationEl) {
      Chart.getChart(donationEl)?.destroy();
      const ctx = donationEl.getContext("2d");
      if (ctx) {
        donationRef.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
            datasets: [
              {
                label: "Monthly Donations ($)",
                data: [1200,1900,1500,2100,1800,2500,2200,2400,2100,2800,3200,3500],
                borderColor: "#3498db",
                backgroundColor: "rgba(52,152,219,0.12)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
          },
        });
      }
    }

    // ---- Donor demographics doughnut
    const demoEl = document.getElementById("demographicsChart") as HTMLCanvasElement | null;
    if (demoEl) {
      Chart.getChart(demoEl)?.destroy();
      const ctx = demoEl.getContext("2d");
      if (ctx) {
        demoRef.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Individual", "Corporate", "Foundation", "Other"],
            datasets: [
              {
                data: [65, 20, 10, 5],
                backgroundColor: ["#3498db", "#2ecc71", "#e74c3c", "#f39c12"],
                borderWidth: 0,
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
        });
      }
    }

    return () => {
      donationRef.current?.destroy();
      donationRef.current = null;
      demoRef.current?.destroy();
      demoRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden p-5">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-[#343a40]">Dashboard Overview</h2>
        <p className="text-gray-600">Monday, 15 January 2023</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { color: "#3498db", icon: "fa-donate", value: "$24,562", label: "Total Donations" },
          { color: "#2ecc71", icon: "fa-users", value: "1,258", label: "Active Donors" },
          { color: "#e74c3c", icon: "fa-hands-helping", value: "324", label: "Volunteers" },
          { color: "#f39c12", icon: "fa-project-diagram", value: "18", label: "Active Campaigns" },
        ].map((c, i) => (
          <div key={i} className="flex items-center rounded-xl bg-white p-5 shadow">
            <div
              className="mr-4 grid h-14 w-14 place-items-center rounded-xl text-xl text-white"
              style={{ backgroundColor: c.color }}
            >
              <i className={`fa-solid ${c.icon}`} />
            </div>
            <div>
              <div className="text-2xl font-semibold">{c.value}</div>
              <div className="text-sm text-gray-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-[#343a40]">Quick Actions</h3>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { icon: "fa-plus-circle", label: "Add Donation" },
          { icon: "fa-user-plus", label: "Register Donor" },
          { icon: "fa-bullhorn", label: "Create Campaign" },
          { icon: "fa-envelope", label: "Send Newsletter" },
          { icon: "fa-file-pdf", label: "Generate Report" },
        ].map((a, i) => (
          <button
            key={i}
            className="rounded-xl bg-white p-4 text-center shadow transition hover:-translate-y-0.5"
          >
            <i className={`fa-solid ${a.icon} mb-2 text-2xl text-[#3498db]`} />
            <div className="font-medium">{a.label}</div>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        {/* Left */}
        <div className="space-y-5">
          {/* Recent Activities */}
          <div className="rounded-xl bg-white p-5 shadow">
            <div className="mb-3 flex items-center justify-between border-b pb-3">
              <h4 className="text-lg font-medium">Recent Activities</h4>
              <a className="text-sm text-[#3498db]" href="#">View All</a>
            </div>
            {[
              { color: "#3498db", icon: "fa-donate", text: "New donation of $500 from John Smith", sub: "2 hours ago" },
              { color: "#2ecc71", icon: "fa-user-plus", text: "Sarah Johnson registered 5 new volunteers", sub: "5 hours ago" },
              { color: "#e74c3c", icon: "fa-bullhorn", text: "“Education for All” campaign launched", sub: "Yesterday" },
              { color: "#f39c12", icon: "fa-truck", text: "Food supplies delivered to rural community", sub: "2 days ago" },
            ].map((r, i, arr) => (
              <div key={i} className={`flex items-center py-3 ${i < arr.length - 1 ? "border-b" : ""}`}>
                <div
                  className="mr-4 grid h-10 w-10 place-items-center rounded-full text-white"
                  style={{ backgroundColor: r.color }}
                >
                  <i className={`fa-solid ${r.icon}`} />
                </div>
                <div>
                  <div>{r.text}</div>
                  <div className="text-xs text-gray-500">{r.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Campaign progress */}
          <div className="rounded-xl bg-white p-5 shadow">
            <div className="mb-3 flex items-center justify-between border-b pb-3">
              <h4 className="text-lg font-medium">Campaign Progress</h4>
              <a className="text-sm text-[#3498db]" href="#">View All</a>
            </div>

            {[
              { title: "Clean Water Initiative", pct: 75, raised: "$15,000", goal: "$20,000", color: "#3498db" },
              { title: "Education for All", pct: 45, raised: "$9,000", goal: "$20,000", color: "#2ecc71" },
              { title: "Healthcare Outreach", pct: 30, raised: "$6,000", goal: "$20,000", color: "#e74c3c" },
            ].map((c, i) => (
              <div key={i} className={i ? "mt-4" : ""}>
                <div className="font-medium">{c.title}</div>
                <div className="mt-2 h-2 overflow-hidden rounded bg-gray-200">
                  <div className="h-full rounded" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
                  <span>{c.raised} raised</span>
                  <span>{c.goal} goal</span>
                </div>
              </div>
            ))}
          </div>

          {/* Donation analytics */}
          <div className="rounded-xl bg-white p-5 shadow">
            <div className="mb-3 flex items-center justify-between border-b pb-3">
              <h4 className="text-lg font-medium">Donation Analytics</h4>
              <a className="text-sm text-[#3498db]" href="#">View Full Report</a>
            </div>
            <div className="relative mt-4 h-[260px]">
              <canvas id="donationChart" />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Recent donations */}
          <div className="rounded-xl bg-white p-5 shadow">
            <div className="mb-3 flex items-center justify-between border-b pb-3">
              <h4 className="text-lg font-medium">Recent Donations</h4>
              <a className="text-sm text-[#3498db]" href="#">View All</a>
            </div>
            {[
              { color: "#3498db", name: "Michael Johnson", text: "$500 • 2 hours ago" },
              { color: "#2ecc71", name: "Emma Thompson", text: "$250 • 5 hours ago" },
              { color: "#e74c3c", name: "Robert Williams", text: "$1,000 • Yesterday" },
              { color: "#f39c12", name: "Sarah Davis", text: "$300 • 2 days ago" },
            ].map((d, i, arr) => (
              <div key={i} className={`flex items-center py-3 ${i < arr.length - 1 ? "border-b" : ""}`}>
                <div
                  className="mr-4 grid h-10 w-10 place-items-center rounded-full text-white"
                  style={{ backgroundColor: d.color }}
                >
                  <i className="fa-solid fa-donate" />
                </div>
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-gray-500">{d.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming events */}
          <div className="rounded-xl bg-white p-5 shadow">
            <div className="mb-3 flex items-center justify-between border-b pb-3">
              <h4 className="text-lg font-medium">Upcoming Events</h4>
              <a className="text-sm text-[#3498db]" href="#">View All</a>
            </div>
            {[
              { color: "#3498db", day: "20", title: "Fundraising Gala", sub: "Jan 20, 2023 • 6:00 PM" },
              { color: "#2ecc71", day: "25", title: "Volunteer Training", sub: "Jan 25, 2023 • 10:00 AM" },
              { color: "#e74c3c", day: "30", title: "Community Outreach", sub: "Jan 30, 2023 • 9:00 AM" },
            ].map((e, i, arr) => (
              <div key={i} className={`flex items-center py-3 ${i < arr.length - 1 ? "border-b" : ""}`}>
                <div
                  className="mr-4 grid h-10 w-10 place-items-center rounded-lg text-white"
                  style={{ backgroundColor: e.color }}
                >
                  <span className="font-bold">{e.day}</span>
                </div>
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-gray-500">{e.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Demographics */}
          <div className="rounded-xl bg-white p-5 shadow">
            <div className="mb-3 flex items-center justify-between border-b pb-3">
              <h4 className="text-lg font-medium">Donor Demographics</h4>
              <a className="text-sm text-[#3498db]" href="#">View Details</a>
            </div>
            <div className="relative mt-4 h-[260px]">
              <canvas id="demographicsChart" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
