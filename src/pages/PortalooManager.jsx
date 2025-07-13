import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const PortalooManager = () => {
  const [portaloos, setPortaloos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [showToday, setShowToday] = useState(true);
  const [showSoon, setShowSoon] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const [viewList, setViewList] = useState(null);
  const [bookingSelection, setBookingSelection] = useState(null);

  const [filterStatus, setFilterStatus] = useState({
    Rented: true,
    Available: true,
    "Out of Order": true,
  });
  const [filterColour, setFilterColour] = useState({
    Blue: true,
    Pink: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchPortaloos();
  }, []);

  const fetchPortaloos = async () => {
    const { data } = await supabase
      .from("portaloos")
      .select("*")
      .order("id", { ascending: true });
    setPortaloos(data || []);
  };

  const handleSave = async () => {
    let updated = { ...selected };
    const original = portaloos.find((p) => p.id === selected.id);

    if (original.status === "Rented" && updated.status === "Available") {
      const confirmClear = window.confirm(
        "Changing status to Available will clear all other fields for this portaloo. Do you wish to continue?"
      );
      if (!confirmClear) return;

      updated = {
        ...updated,
        price: "",
        rental_start_date: "",
        rental_end_date: "",
        location: "",
        notes: "",
        colour: "",
        paid_status: "",
      };
    }

    if (updated.price === "") updated.price = null;
    if (updated.rental_start_date === "")
      updated.rental_start_date = null;
    if (updated.rental_end_date === "")
      updated.rental_end_date = null;

    const { id, ...fieldsToUpdate } = updated;

    const { error } = await supabase
      .from("portaloos")
      .update(fieldsToUpdate)
      .eq("id", id);

    if (error) {
      console.error("Supabase Save Error: ", error);
      alert("Failed to save changes.");
      return;
    }

    setShowEdit(false);
    setSelected(null);
    fetchPortaloos();
  };

  const handleAdd = async () => {
    const { error } = await supabase.from("portaloos").insert([selected]);
    if (error) {
      console.error("Supabase Add Error: ", error);
      alert("Failed to add portaloo.");
      return;
    }
    setShowAdd(false);
    setSelected(null);
    fetchPortaloos();
  };

  const handleBook = async () => {
  if (!bookingSelection) {
    alert("Please select a portaloo to book.");
    return;
  }

  // Build an update payload from `selected`, excluding `id`
  const { id, ...fieldsToUpdate } = selected;
  // Force status to "Rented"
  fieldsToUpdate.status = "Rented";

  const { error } = await supabase
    .from("portaloos")
    .update(fieldsToUpdate)
    .eq("id", id);

  if (error) {
    console.error("Supabase Booking Error:", error);
    alert("Failed to book portaloo.");
    return;
  }

  setShowBook(false);
  setBookingSelection(null);
  setSelected(null);
  fetchPortaloos();
};

  const today = dayjs().format("YYYY-MM-DD");
  const soon = dayjs().add(2, "day").format("YYYY-MM-DD");

  const portaloosEndingToday = portaloos.filter(
    (p) => p.rental_end_date === today && p.status?.toLowerCase() === "rented"
  );
  const portaloosEndingSoon = portaloos.filter(
    (p) =>
      p.rental_end_date > today &&
      p.rental_end_date <= soon &&
      p.status?.toLowerCase() === "rented"
  );
  const portaloosAvailable = portaloos.filter(
    (p) => p.status?.toLowerCase() === "available"
  );
  const portaloosRented = portaloos.filter(
    (p) => p.status?.toLowerCase() === "rented"
  );

  const toggleFilterStatus = (status) => {
    setFilterStatus((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const toggleFilterColour = (colour) => {
    setFilterColour((prev) => ({ ...prev, [colour]: !prev[colour] }));
  };

  const filteredPortaloos = portaloos.filter((p) => {
    const statusMatch = filterStatus[p.status];
    const colourMatch = p.colour
      ? filterColour[
          p.colour.charAt(0).toUpperCase() +
            p.colour.slice(1).toLowerCase()
        ]
      : true;
    return statusMatch && colourMatch;
  });

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="text-blue-500 hover:underline"
    >
       ← Back to Admin Dashboard
    </button>

      <h1 className="text-4xl font-semibold mb-4">Portaloo Manager</h1>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="bg-white p-5 rounded-xl shadow cursor-pointer hover:ring-1 hover:ring-red-400"
          onClick={() => setViewList(portaloosRented)}
        >
          <p className="text-lg text-gray-600">Rented</p>
          <p className="text-2xl font-bold text-red-500">
            {portaloosRented.length}
          </p>
        </div>
        <div
          className="bg-white p-5 rounded-xl shadow cursor-pointer hover:ring-1 hover:ring-green-400"
          onClick={() => setViewList(portaloosAvailable)}
        >
          <p className="text-lg text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {portaloosAvailable.length}
          </p>
        </div>
        <div
          className="bg-white p-5 rounded-xl shadow cursor-pointer hover:ring-1 hover:ring-yellow-400"
          onClick={() => setViewList(portaloosEndingSoon)}
        >
          <p className="text-lg text-gray-600">Ending in 2 Days</p>
          <p className="text-2xl font-bold text-yellow-500">
            {portaloosEndingSoon.length}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={() => {
            setShowBook(true);
            setSelected({
              rental_start_date: "",
              rental_end_date: "",
              location: "",
              notes: "",
              colour: "",
              paid_status: "",
            });
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          🚽 Book Portaloo
        </button>
        <button
          onClick={() => {
            setShowAdd(true);
            setSelected({
              status: "Available",
              price: "",
              rental_start_date: "",
              rental_end_date: "",
              location: "",
              notes: "",
              colour: "",
              paid_status: "",
            });
          }}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
        >
          ➕ Add New
        </button>
      </div>
      {/* Collapsible Lists */}
      {[{ title: "Portaloos Ending Today", data: portaloosEndingToday, toggle: showToday, setToggle: setShowToday },
        { title: "Portaloos Ending in 2 Days", data: portaloosEndingSoon.sort((a, b) => dayjs(a.rental_end_date).isAfter(dayjs(b.rental_end_date)) ? 1 : -1), toggle: showSoon, setToggle: setShowSoon }
      ].map((section, idx) => (
        <div key={idx} className="mt-4">
          <button
            onClick={() => section.setToggle(!section.toggle)}
            className="text-white bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg shadow"
          >
            {section.toggle ? "▼" : "▶"} {section.title}
          </button>
          {section.toggle && (
            <ul className="mt-2 space-y-1">
              {section.data.map((p) => (
                <li key={p.id}>
                  #{p.id} – {p.rental_end_date} – {p.location}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* Show All + Filters */}
      <div className="mt-6">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-white bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg shadow"
        >
          {showAll ? "▼" : "▶"} Show All Portaloos
        </button>

        {showAll && (
          <>
            <div className="mt-4 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <strong>Status:</strong>
                {["Rented", "Available", "Out of Order"].map((status) => (
                  <label key={status} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={filterStatus[status]}
                      onChange={() => toggleFilterStatus(status)}
                    />
                    {status}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <strong>Colour:</strong>
                {["Blue", "Pink"].map((colour) => (
                  <label key={colour} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={filterColour[colour]}
                      onChange={() => toggleFilterColour(colour)}
                    />
                    {colour}
                  </label>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-sm bg-white rounded-xl shadow border border-gray-200">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Start</th>
                    <th className="p-2">End</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Notes</th>
                    <th className="p-2">Colour</th>
                    <th className="p-2">Paid</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPortaloos.map((p) => (
                    <tr
                      key={p.id}
                      className={
                        p.status === "Rented" ? "bg-red-50" : "bg-green-50"
                      }
                    >
                      <td className="p-2">{p.id}</td>
                      <td className="p-2">{p.status}</td>
                      <td className="p-2">{p.price}</td>
                      <td className="p-2">{p.rental_start_date}</td>
                      <td className="p-2">{p.rental_end_date}</td>
                      <td className="p-2">{p.location}</td>
                      <td className="p-2">{p.notes}</td>
                      <td className="p-2">{p.colour}</td>
                      <td className="p-2">{p.paid_status}</td>
                      <td className="p-2 space-x-2">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => {
                            setSelected(p);
                            setShowEdit(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modals (Add / Book / Edit) */}
      {(showEdit || showAdd || showBook) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold">
              {showAdd ? "Add New" : showBook ? "Book" : "Edit"} Portaloo
            </h2>

            {showBook && (
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Select Portaloo
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={bookingSelection || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    const p = portaloos.find((pt) => pt.id == id);
                    setBookingSelection(id);
                    setSelected({
                      ...p,
                      rental_start_date: "",
                      rental_end_date: "",
                      location: "",
                      notes: "",
                      colour: "",
                      paid_status: "",
                    });
                  }}
                >
                  <option value="">-- Choose an available portaloo --</option>
                  {portaloosAvailable.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {[
              {
                label: "Status",
                key: "status",
                type: "select",
                options: ["Rented", "Available", "Out of Order"],
              },
              { label: "Price", key: "price" },
              {
                label: "Rental Start Date",
                key: "rental_start_date",
                type: "date",
              },
              {
                label: "Rental End Date",
                key: "rental_end_date",
                type: "date",
              },
              { label: "Location", key: "location" },
              { label: "Notes", key: "notes" },
              { label: "Colour", key: "colour" },
              {
                label: "Paid",
                key: "paid_status",
                type: "select",
                options: ["Paid", "Unpaid"],
              },
            ].map(({ label, key, type, options }) => (
              <div key={key}>
                <label className="block text-sm mb-1">{label}</label>
                {type === "select" ? (
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={selected?.[key] || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, [key]: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={type || "text"}
                    className="w-full border rounded px-3 py-2"
                    value={selected?.[key] || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, [key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}

            <div className="flex justify-between">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={showAdd ? handleAdd : showBook ? handleBook : handleSave}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                onClick={() => {
                  setShowEdit(false);
                  setShowAdd(false);
                  setShowBook(false);
                  setBookingSelection(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalooManager;
