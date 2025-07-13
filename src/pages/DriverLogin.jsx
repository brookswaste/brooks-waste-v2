// src/pages/DriverLogin.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const DRIVER_NAMES = [
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
  "Emergency Driver"
];

function DriverLogin() {
  const [driverName, setDriverName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!DRIVER_NAMES.includes(driverName)) {
      setError("Invalid driver name.");
      return;
    }
    if (password !== "driver123") {
      setError("Invalid password.");
      return;
    }

    sessionStorage.setItem("driverName", driverName);
    navigate("/driver/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Driver Login</h2>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <select
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          className="w-full border px-4 py-3 rounded-lg"
        >
          <option value="">Select Driver</option>
          {DRIVER_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Log In
        </button>

        {error && (
          <p className="text-red-600 text-sm font-medium mt-2">{error}</p>
        )}
      </form>

      <Link
        to="/"
        className="mt-6 text-green-600 hover:underline text-sm"
      >
        ← Back to home
      </Link>
    </div>
  );
}

export default DriverLogin;
