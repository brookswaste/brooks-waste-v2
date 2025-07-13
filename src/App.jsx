// src/App.jsx
import React from "react";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Brooks Waste Portal</h1>
        <p className="text-gray-700 mt-2 text-lg">Select your login type</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
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
    </div>
  );
}

export default App;
