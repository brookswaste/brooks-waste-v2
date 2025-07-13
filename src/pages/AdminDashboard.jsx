// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const tabs = [
  "Portaloo Manager",
  "Bookings",
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();

  // 🚧 Redirect if not logged in
  useEffect(() => {
    if (sessionStorage.getItem("isAdminLoggedIn") !== "true") {
      navigate("/admin/login");
    }
  }, [navigate]);

  const renderContent = () => {
    switch (activeTab) {
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("isAdminLoggedIn");
            navigate("/admin/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>

      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (tab === "Portaloo Manager") {
                navigate("/admin/portaloos");
              } else if (tab === "Bookings") {
                navigate("/admin/bookings");
              }
            }}
            className="px-4 py-2 rounded-lg font-semibold bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 transition"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminDashboard;
