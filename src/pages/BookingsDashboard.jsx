// src/pages/BookingsDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";

function BookingsDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [addingBooking, setAddingBooking] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [showTable, setShowTable] = useState(true);
  const [creatingWTN, setCreatingWTN] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("isAdminLoggedIn") !== "true") {
      navigate("/admin");
      return;
    }
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });
    if (error) {
      alert("Error loading bookings: " + error.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  }

  function applyFilters(booking) {
    if (
      search &&
      !booking.client_name?.toLowerCase().includes(search.toLowerCase()) &&
      !booking.postcode?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (paymentFilter && booking.payment_status !== paymentFilter) {
      return false;
    }
    if (
      driverFilter &&
      !(booking.assigned_driver || []).includes(driverFilter)
    ) {
      return false;
    }
    if (
      dateFilter &&
      dayjs(booking.service_date).format("YYYY-MM-DD") !== dateFilter
    ) {
      return false;
    }
    return true;
  }

  async function handleSaveEdit() {
    const { id, ...updateFields } = editingBooking;
    ["dropoff_date", "pickup_date", "service_date"].forEach((key) => {
      if (updateFields[key] === "") updateFields[key] = null;
    });
    const { error } = await supabase
      .from("bookings")
      .update(updateFields)
      .eq("id", id);
    if (error) {
      alert("Error updating booking: " + error.message);
    } else {
      alert("Booking updated.");
      setEditingBooking(null);
      fetchBookings();
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Archive this booking instead of deleting?")) return;
    const { error } = await supabase
      .from("bookings")
      .update({ is_archived: true })
      .eq("id", id);
    if (error) {
      alert("Error archiving booking: " + error.message);
    } else {
      alert("Booking archived.");
      fetchBookings();
    }
  }

  async function handleAddNew() {
    if (!addingBooking.client_name || !addingBooking.client_phone || !addingBooking.job_type) {
      alert("Client name, phone, and job type are required.");
      return;
    }
    const prepared = { ...addingBooking };
    ["dropoff_date", "pickup_date", "service_date"].forEach((key) => {
      if (prepared[key] === "") prepared[key] = null;
    });
    const { error } = await supabase.from("bookings").insert([prepared]);
    if (error) {
      alert("Error adding booking: " + error.message);
    } else {
      alert("Booking added.");
      setAddingBooking(false);
      fetchBookings();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Bookings CRM Dashboard</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("isAdminLoggedIn");
            navigate("/admin");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Log Out
        </button>
      </div>

      <button
        onClick={() => navigate("/admin/dashboard")}
        className="text-blue-500 hover:underline mb-4"
      >
        ← Back to Admin Dashboard
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or postcode"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <select
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">All Drivers</option>
          {[
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
          ].map((driver) => (
            <option key={driver} value={driver}>
              {driver}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={() => {
            setSearch("");
            setPaymentFilter("");
            setDriverFilter("");
            setDateFilter("");
          }}
          className="bg-gray-200 hover:bg-gray-300 rounded px-4 py-2"
        >
          Clear Filters
        </button>
      </div>

      <button
        onClick={() =>
          setAddingBooking({
            client_name: "",
            client_phone: "",
            client_email: "",
            job_address: "",
            postcode: "",
            job_type: "",
            tank_size: "",
            assigned_driver: [],
            waste_type: "",
            portaloo_numbers: [],
            portaloo_colour: "",
            dropoff_date: "",
            pickup_date: "",
            service_date: "",
            payment_status: "",
            special_notes: "",
          })
        }
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        + Add New Booking
      </button>
      <br></br>
      <button
  onClick={() => setShowTable(!showTable)}
  className="mb-4 text-blue-600 hover:underline text-sm"
>
  {showTable ? "Hide Bookings Table" : "Show Bookings Table"}
</button>
      {loading ? (
  <p>Loading bookings...</p>
) : showTable ? (
  <div className="w-full overflow-x-auto">
    <table className="w-full whitespace-nowrap bg-white border border-gray-200 rounded shadow">
            <thead className="bg-gray-100 text-sm text-gray-700">
              <tr>
                <th className="p-2">Client</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Job Type</th>
                <th className="p-2">Postcode</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Payment Method</th>
                <th className="p-2">Completed</th>
                <th className="p-2">Service Date</th>
                <th className="p-2">Assigned Drivers</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.filter(applyFilters).map((b) => (
                <tr key={b.id} className="border-t text-sm">
                  <td className="p-2">{b.client_name}</td>
                  <td className="p-2">{b.client_phone}</td>
                  <td className="p-2">{b.job_type}</td>
                  <td className="p-2">{b.postcode}</td>
                  <td className="p-2 capitalize">{b.payment_status}</td>
                  <td className="p-2">{b.payment_method || "—"}</td>
                  <td className="p-2">{b.completed ? "✅" : "—"}</td>
                  <td className="p-2">{b.service_date || "—"}</td>
                  <td className="p-2">{(b.assigned_driver || []).join(", ")}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => setEditingBooking({ ...b })}
                      >
                        Edit
                      </button>
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => setViewingNote(b.id)}
                      >
                        WTN
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(b.id)}
                      >
                        Archive
                      </button>
                      <button
                        className="text-purple-600 hover:underline"
                        onClick={() => setCreatingWTN(b)}
                      >
                        Create WTN
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
              {bookings.filter(applyFilters).length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
  </div>
) : (
  <p className="text-gray-500 italic">Bookings table is hidden.</p>
)}

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold">Edit Booking</h2>
            {Object.entries(editingBooking).map(([key, value]) =>
              key !== "id" && (
                <div key={key}>
                  <label className="block text-sm mb-1 capitalize">
                    {key.replace(/_/g, " ")}
                  </label>
                  {key === "assigned_driver" ? (
                    <select
                      multiple
                      value={value}
                      onChange={(e) =>
                        setEditingBooking({
                          ...editingBooking,
                          [key]: Array.from(e.target.selectedOptions).map(
                            (o) => o.value
                          ),
                        })
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      {[
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
                      ].map((driver) => (
                        <option key={driver} value={driver}>
                          {driver}
                        </option>
                      ))}
                    </select>
                  ) : key === "payment_method" ? (
                    <select
                      value={value || ""}
                      onChange={(e) =>
                        setEditingBooking({
                          ...editingBooking,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Invoice">Invoice</option>
                    </select>
                  ) : (
                    <input
                      type={key.includes("date") ? "date" : "text"}
                      value={value || ""}
                      onChange={(e) =>
                        setEditingBooking({
                          ...editingBooking,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  )}
                </div>
              )
            )}
            <div className="flex justify-between">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSaveEdit}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setEditingBooking(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold">Add Booking</h2>
            {Object.entries(addingBooking).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm mb-1 capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                {key === "assigned_driver" ? (
                  <select
                    multiple
                    value={value}
                    onChange={(e) =>
                      setAddingBooking({
                        ...addingBooking,
                        [key]: Array.from(e.target.selectedOptions).map(
                          (o) => o.value
                        ),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    {[
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
                    ].map((driver) => (
                      <option key={driver} value={driver}>
                        {driver}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={key.includes("date") ? "date" : "text"}
                    value={
                      Array.isArray(value)
                        ? value.join(", ")
                        : value || ""
                    }
                    onChange={(e) =>
                      setAddingBooking({
                        ...addingBooking,
                        [key]: Array.isArray(value)
                          ? e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter((v) => v !== "")
                          : e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                )}
              </div>
            ))}
            <div className="flex justify-between">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleAddNew}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setAddingBooking(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {creatingWTN && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold">Create Waste Transfer Note</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const payload = {
                  booking_id: creatingWTN.id,
                  client_name: creatingWTN.client_name,
                  date_created: form.get("date_created"),
                  waste_type: form.get("waste_type"),
                  quantity: form.get("quantity"),
                  notes: form.get("notes"),
                };
                const { error } = await supabase
                  .from("waste_transfer_notes")
                  .insert(payload);
                if (error) {
                  alert("Error creating WTN: " + error.message);
                } else {
                  alert("WTN created successfully!");
                  setCreatingWTN(null);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm mb-1">Date Created</label>
                <input
                  name="date_created"
                  type="date"
                  defaultValue={dayjs().format("YYYY-MM-DD")}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Waste Type</label>
                <input
                  name="waste_type"
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Quantity</label>
                <input
                  name="quantity"
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Notes</label>
                <textarea
                  name="notes"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setCreatingWTN(null)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingNote && (
        <WasteTransferNoteModal
          bookingId={viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}

      <ArchivedJobsSection />
    </div>
  );
}

// Component to load and show waste transfer note
function WasteTransferNoteModal({ bookingId, onClose }) {
  const [note, setNote] = useState(null);
  const [noNote, setNoNote] = useState(false);

  useEffect(() => {
    async function loadNote() {
      const { data, error } = await supabase
        .from("waste_transfer_notes")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle(); // ← handles no rows gracefully

      if (error) {
        alert("Error loading note: " + error.message);
        onClose();
      } else if (!data) {
        setNoNote(true);
      } else {
        setNote(data);
      }
    }
    loadNote();
  }, [bookingId, onClose]);

  async function handleDownloadPDF() {
    if (!note) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Waste Transfer Note", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    let y = 30;

    // Draw a rectangle around all details
    const boxPadding = 5;
    const boxStartY = y;
    const boxWidth = pageWidth - 2 * boxPadding;

    // Collect entries (excluding special keys)
    const entries = Object.entries(note).filter(
      ([key]) => !["id", "booking_id", "signature_url"].includes(key)
    );

    // Draw each entry with lines
    entries.forEach(([key, value]) => {
      const label = key.replace(/_/g, " ");
      doc.text(`${label}:`, 10, y + 7);
      doc.setFont("helvetica", "bold");
      doc.text(`${value}`, 60, y + 7);
      doc.setFont("helvetica", "normal");

      // Horizontal line under each row
      doc.setDrawColor(200);
      doc.line(10, y + 10, pageWidth - 10, y + 10);

      y += 12;
    });

    y += 5;

    // Draw rectangle around section
    doc.setDrawColor(100);
    doc.rect(8, boxStartY - 2, pageWidth - 16, y - boxStartY + 2);

    // Signature
    if (note.signature_url) {
      try {
        const res = await fetch(note.signature_url);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;

          doc.setFont("helvetica", "normal");
          doc.text("Signature:", 10, y + 10);
          doc.addImage(base64data, "PNG", 10, y + 12, 60, 30);
          doc.save(`waste_transfer_note_${note.booking_id}.pdf`);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error fetching signature image:", err);
        doc.text("Signature could not be loaded.", 10, y + 10);
        doc.save(`waste_transfer_note_${note.booking_id}.pdf`);
      }
    } else {
      doc.text("Signature: None provided", 10, y + 10);
      doc.save(`waste_transfer_note_${note.booking_id}.pdf`);
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-lg font-semibold">Waste Transfer Note</h2>

        {noNote ? (
          <div className="text-center space-y-4">
            <p>No Waste Transfer Note found for this booking.</p>
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : note ? (
          <>
            {Object.entries(note).map(([key, value]) =>
              key !== "id" &&
              key !== "booking_id" &&
              key !== "signature_url" ? (
                <div key={key}>
                  <label className="block text-xs uppercase font-medium text-gray-500">
                    {key.replace(/_/g, " ")}
                  </label>
                  <p className="text-sm">{value}</p>
                </div>
              ) : null
            )}
            {note.signature_url && (
              <div>
                <label className="block text-xs uppercase font-medium text-gray-500">
                  Signature
                </label>
                <img
                  src={note.signature_url}
                  alt="Signature"
                  className="border mt-1 max-w-xs"
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Download PDF
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <p>Loading note...</p>
        )}
      </div>
    </div>
  );
}
function ArchivedJobsSection() {
  const [archived, setArchived] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [searchArchived, setSearchArchived] = useState("");
  const [postcodeFilter, setPostcodeFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [viewingNote, setViewingNote] = useState(null);

  async function fetchArchived() {
    setLoadingArchived(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("is_archived", true)
      .order("created_at", { ascending: false });
    if (error) {
      alert("Error loading archived bookings: " + error.message);
    } else {
      setArchived(data || []);
    }
    setLoadingArchived(false);
  }

  useEffect(() => {
    fetchArchived();
  }, []);

  function applyArchivedFilters(job) {
    // If no filters are entered, return false (show nothing)
    if (
      !searchArchived &&
      !postcodeFilter &&
      !monthFilter &&
      !driverFilter
    ) {
      return false;
    }
    if (
      searchArchived &&
      !job.client_name?.toLowerCase().includes(searchArchived.toLowerCase()) &&
      !job.job_address?.toLowerCase().includes(searchArchived.toLowerCase())
    ) {
      return false;
    }
    if (
      postcodeFilter &&
      !job.postcode?.toLowerCase().includes(postcodeFilter.toLowerCase())
    ) {
      return false;
    }
    if (
      monthFilter &&
      dayjs(job.service_date).format("YYYY-MM") !== monthFilter
    ) {
      return false;
    }
    if (
      driverFilter &&
      !(job.assigned_driver || []).includes(driverFilter)
    ) {
      return false;
    }
    return true;
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Archived Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by client or address"
          value={searchArchived}
          onChange={(e) => setSearchArchived(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Filter by postcode"
          value={postcodeFilter}
          onChange={(e) => setPostcodeFilter(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <select
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">All Drivers</option>
          {[
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
          ].map((driver) => (
            <option key={driver} value={driver}>
              {driver}
            </option>
          ))}
        </select>
      </div>

      {loadingArchived ? (
        <p>Loading archived jobs...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap bg-white border border-gray-200 rounded shadow">
            <thead className="bg-gray-100 text-sm text-gray-700">
              <tr>
                <th className="p-2">Client</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Job Type</th>
                <th className="p-2">Postcode</th>
                <th className="p-2">Service Date</th>
                <th className="p-2">Assigned Drivers</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {archived.filter(applyArchivedFilters).map((job) => (
                <tr key={job.id} className="border-t text-sm">
                  <td className="p-2">{job.client_name}</td>
                  <td className="p-2">{job.client_phone}</td>
                  <td className="p-2">{job.job_type}</td>
                  <td className="p-2">{job.postcode}</td>
                  <td className="p-2">{job.service_date || "—"}</td>
                  <td className="p-2">{(job.assigned_driver || []).join(", ")}</td>
                  <td className="p-2">
                    <button
                      className="text-green-600 hover:underline"
                      onClick={() => setViewingNote(job.id)}
                    >
                      WTN
                    </button>
                  </td>
                </tr>
              ))}
              {archived.filter(applyArchivedFilters).length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    {searchArchived || postcodeFilter || monthFilter || driverFilter
                      ? "No archived jobs found."
                      : "Use filters above to search archived jobs."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewingNote && (
        <WasteTransferNoteModal
          bookingId={viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}
    </div>
  );
}

export default BookingsDashboard;
