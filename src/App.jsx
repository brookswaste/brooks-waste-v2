// src/App.jsx
import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

const driverOptions = [
  "Ben Scourfiled",
  "Dean Thorne",
  "Thomas Brooks",
  "Billy Smith",
  "Josh Brooks",
  "Thomas Evans",
  "Daniel Palmer",
  "Luke Miller",
  "Jack Walsh",
  "Lee Scourfield",
  "Emergency Driver",
];

function App() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddPassword, setQuickAddPassword] = useState("");
  const [quickAddError, setQuickAddError] = useState("");

  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    job_address: "",
    postcode: "",
    job_type: "",
    tank_size: "",
    assigned_driver: "",
    waste_type: "",
    portaloo_numbers: "",
    portaloo_colour: "",
    dropoff_date: "",
    pickup_date: "",
    service_date: "",
    payment_status: "",
    special_notes: "",
  });

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (quickAddPassword !== "brooks123") {
      setQuickAddError("Invalid quick add password");
      return;
    }

    // Convert empty dates to null
    const prepared = { ...formData };
    ["dropoff_date", "pickup_date", "service_date"].forEach((key) => {
      if (prepared[key] === "") prepared[key] = null;
    });

    try {
      const { error } = await supabase.from("bookings").insert({
        ...prepared,
        assigned_driver: prepared.assigned_driver
          ? [prepared.assigned_driver]
          : [],
        portaloo_numbers: prepared.portaloo_numbers
          ? prepared.portaloo_numbers.split(",").map((s) => s.trim())
          : [],
      });
      if (error) {
        alert("Error saving booking: " + error.message);
      } else {
        alert("Booking saved successfully!");
        setShowQuickAdd(false);
        setFormData({
          client_name: "",
          client_phone: "",
          client_email: "",
          job_address: "",
          postcode: "",
          job_type: "",
          tank_size: "",
          assigned_driver: "",
          waste_type: "",
          portaloo_numbers: "",
          portaloo_colour: "",
          dropoff_date: "",
          pickup_date: "",
          service_date: "",
          payment_status: "",
          special_notes: "",
        });
        setQuickAddPassword("");
        setQuickAddError("");
      }
    } catch (err) {
      alert("Unexpected error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Brooks Waste Portal</h1>
        <p className="text-gray-700 mt-2 text-lg">Select your login type</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-md mb-6">
        <a
          href="/driver"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-4 rounded-xl text-lg font-semibold shadow-md transition duration-200"
        >
          Driver Login
        </a>
        <a
          href="/admin"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl text-lg font-semibold shadow-md transition duration-200"
        >
          Admin Login
        </a>
      </div>

      <button
        onClick={() => setShowQuickAdd(true)}
        className="mt-2 text-green-600 hover:underline text-sm"
      >
        + Quick Add Booking
      </button>

      {showQuickAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold">Quick Add Booking</h2>
            <form onSubmit={handleQuickAddSubmit} className="space-y-3">
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {key.replace(/_/g, " ")}
                  </label>
                  {key === "assigned_driver" ? (
                    <select
                      value={formData.assigned_driver}
                      onChange={(e) =>
                        setFormData({ ...formData, assigned_driver: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded"
                    >
                      <option value="">Select Driver</option>
                      {driverOptions.map((driver) => (
                        <option key={driver} value={driver}>
                          {driver}
                        </option>
                      ))}
                    </select>
                  ) : key.includes("date") ? (
                    <input
                      type="date"
                      value={formData[key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quick Add Password
                </label>
                <input
                  type="password"
                  value={quickAddPassword}
                  onChange={(e) => setQuickAddPassword(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                {quickAddError && (
                  <p className="text-red-600 text-sm mt-1">{quickAddError}</p>
                )}
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
