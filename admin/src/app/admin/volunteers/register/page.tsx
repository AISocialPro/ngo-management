"use client";

import { useState } from "react";

export default function VolunteerRegistrationPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postal: "",
    areas: [] as string[],
  });

  const update = (key: string, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const toggleArea = (area: string) => {
    setForm((p) => {
      const exists = p.areas.includes(area);
      return {
        ...p,
        areas: exists ? p.areas.filter((a) => a !== area) : [...p.areas, area],
      };
    });
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.firstName + " " + form.lastName,
      email: form.email,
      skills: form.areas,
      phone: form.phone,
      address: `${form.address1}, ${form.address2}, ${form.city}, ${form.state} - ${form.postal}`,
    };

    await fetch("/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Volunteer Registered Successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10 bg-white">

      {/* HEADER */}
      <h1 className="text-4xl font-bold text-gray-900">
        Volunteer Registration
      </h1>

      {/* FORM */}
      <div className="space-y-8">

        {/* NAME */}
        <div>
          <label className="text-lg font-medium">Name</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <input
              placeholder="First Name"
              className="border p-3 rounded-lg"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
            <input
              placeholder="Last Name"
              className="border p-3 rounded-lg"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-lg font-medium">E-mail</label>
          <input
            placeholder="example@example.com"
            className="border p-3 rounded-lg w-full mt-2"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        {/* BIRTH DATE */}
        <div>
          <label className="text-lg font-medium">Birth Date</label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <select
              className="border p-3 rounded-lg"
              value={form.birthMonth}
              onChange={(e) => update("birthMonth", e.target.value)}
            >
              <option value="">Month</option>
              {[
                "January","February","March","April","May","June",
                "July","August","September","October","November","December",
              ].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <select
              className="border p-3 rounded-lg"
              value={form.birthDay}
              onChange={(e) => update("birthDay", e.target.value)}
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }).map((_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>

            <select
              className="border p-3 rounded-lg"
              value={form.birthYear}
              onChange={(e) => update("birthYear", e.target.value)}
            >
              <option value="">Year</option>
              {Array.from({ length: 80 }).map((_, i) => {
                const y = 2025 - i;
                return <option key={y}>{y}</option>;
              })}
            </select>
          </div>
        </div>

        {/* PHONE */}
        <div>
          <label className="text-lg font-medium">Phone Number</label>
          <input
            placeholder="(000) 000-0000"
            className="border p-3 rounded-lg w-full mt-2"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>

        {/* ADDRESS */}
        <div>
          <label className="text-lg font-medium">Address</label>
          <input
            placeholder="Street Address"
            className="border p-3 rounded-lg w-full mt-2"
            value={form.address1}
            onChange={(e) => update("address1", e.target.value)}
          />
          <input
            placeholder="Street Address Line 2"
            className="border p-3 rounded-lg w-full mt-3"
            value={form.address2}
            onChange={(e) => update("address2", e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <input
              placeholder="City"
              className="border p-3 rounded-lg"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
            <input
              placeholder="State / Province"
              className="border p-3 rounded-lg"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            />
          </div>

          <input
            placeholder="Postal / Zip Code"
            className="border p-3 rounded-lg w-full mt-3"
            value={form.postal}
            onChange={(e) => update("postal", e.target.value)}
          />
        </div>

        {/* AREAS TO VOLUNTEER */}
        <div>
          <label className="text-lg font-medium">
            Please indicate areas to volunteer according to your skills
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">

            {[
              "Hospitals",
              "Orphanages",
              "Schools",
              "Community services",
              "Computer classes",
              "Arts and Entertainment",
            ].map((area) => (
              <label key={area} className="flex items-center gap-3 text-gray-700">
                <input
                  type="checkbox"
                  checked={form.areas.includes(area)}
                  onChange={() => toggleArea(area)}
                />
                {area}
              </label>
            ))}

          </div>
        </div>

      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-6">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
        >
          Submit Form
        </button>
      </div>
    </div>
  );
}
