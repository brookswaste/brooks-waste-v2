// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

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

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === "brookswaste" && password === "admin123") {
      sessionStorage.setItem("isAdminLoggedIn", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (quickAddPassword !== "brooks123") {
      setQuickAddError("Invalid quick add password");
      return;
    }

    try {
      const { error } = await supabase.from("bookings").insert({
        ...formData,
        assigned_driver: formData.assigned_driver
          ? [formData.assigned_driver]
          : [],
        portaloo_numbers: formData.portaloo_numbers
          ? formData.portaloo_numbers.split(",").map((s) => s.trim())
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
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Login</h2>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Log In
        </button>
        {error && (
          <p className="text-red-600 text-sm font-medium mt-2">{error}</p>
        )}
      </form>

      <button
        onClick={() => setShowQuickAdd(true)}
        className="mt-6 text-green-600 hover:underline text-sm"
      >
        + Quick Add Booking
      </button>

      <Link
        to="/"
        className="mt-3 text-blue-600 hover:underline text-sm"
      >
        ← Back to home
      </Link>

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

export default AdminLogin;
