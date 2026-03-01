"use client";

import React, { useState } from "react";

export default function VolunteerFormModal({
  mode,
  data,
  onClose,
  onSubmit,
}: any) {
  const [form, setForm] = useState(
    data || {
      // PERSONAL
      name: "",
      gender: "",
      dob: "",

      // CONTACT
      phone: "",
      email: "",
      address: "",

      // IDENTIFICATION
      avatar: "",

      // ROLE INFO
      volunteerType: "",
      skills: "",
      areaOfInterest: "",
      availability: "",

      // EMERGENCY
      emergencyName: "",
      emergencyPhone: "",

      // SYSTEM
      joiningDate: "",
      status: "Active",
    }
  );

  const update = (key: string, val: any) =>
    setForm((prev: any) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    onSubmit({
      ...form,
      skills: form.skills
        ? form.skills.split(",").map((s: string) => s.trim())
        : [],
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">
              {mode === "add" ? "Add New Volunteer" : "Edit Volunteer"}
            </h2>
            <p className="text-sm text-blue-100">Complete volunteer information</p>
          </div>

          <button
            onClick={onClose}
            className="text-white text-2xl font-bold hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-8 py-6 overflow-y-auto space-y-8">

          {/* AVATAR */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={
                form.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="h-24 w-24 rounded-full border shadow object-cover"
            />
          </div>

          {/* ------------------------------ SECTION 1: PERSONAL ------------------------------ */}
          <h3 className="text-lg font-semibold text-gray-700">1. Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="font-medium text-gray-700">Full Name *</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => update("dob", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ------------------------------ SECTION 2: CONTACT ------------------------------ */}
          <h3 className="text-lg font-semibold text-gray-700">2. Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="font-medium text-gray-700">Mobile Number *</label>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">Email (optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-medium text-gray-700">Address</label>
              <input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ------------------------------ SECTION 3: IDENTIFICATION ------------------------------ */}
          <h3 className="text-lg font-semibold text-gray-700">3. Identification</h3>

          <div>
            <label className="font-medium text-gray-700">Profile Photo URL</label>
            <input
              value={form.avatar}
              onChange={(e) => update("avatar", e.target.value)}
              className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ------------------------------ SECTION 4: ROLE INFO ------------------------------ */}
          <h3 className="text-lg font-semibold text-gray-700">
            4. Volunteer Role Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="font-medium text-gray-700">Volunteer Type</label>
              <select
                value={form.volunteerType}
                onChange={(e) => update("volunteerType", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option>General</option>
                <option>Event</option>
                <option>Field</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-gray-700">Area of Interest</label>
              <input
                value={form.areaOfInterest}
                onChange={(e) => update("areaOfInterest", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-medium text-gray-700">Skills (comma separated)</label>
              <input
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">Availability</label>
              <select
                value={form.availability}
                onChange={(e) => update("availability", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Only Events</option>
              </select>
            </div>
          </div>

          {/* ------------------------------ SECTION 5: EMERGENCY ------------------------------ */}
          <h3 className="text-lg font-semibold text-gray-700">
            5. Emergency Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="font-medium text-gray-700">Emergency Contact Name</label>
              <input
                value={form.emergencyName}
                onChange={(e) => update("emergencyName", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">Emergency Contact Number</label>
              <input
                value={form.emergencyPhone}
                onChange={(e) => update("emergencyPhone", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ------------------------------ SECTION 6: SYSTEM FIELDS ------------------------------ */}
          <h3 className="text-lg font-semibold text-gray-700">6. System Fields</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="font-medium text-gray-700">Joining Date</label>
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) =>
                  update("joiningDate", e.target.value)
                }
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">Volunteer Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {mode === "add" ? "Add Volunteer" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
