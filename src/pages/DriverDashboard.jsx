import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

function DriverDashboard() {
  const [driver, setDriver] = useState("");
  const [jobs, setJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [noteData, setNoteData] = useState({
    description_of_waste: "",
    quantity: "",
    carrier_name: "",
    carrier_reg_no: "",
    producer_name: "",
    producer_address: "",
    receiver_name: "",
    receiver_address: "",
  });

  const sigPadRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const d = sessionStorage.getItem("driverName");
    if (!d) {
      navigate("/driver");
      return;
    }
    setDriver(d);
    fetchJobs(d);
  }, []);

  async function fetchJobs(driverName) {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .contains("assigned_driver", [driverName]);

    if (error) {
      alert("Error fetching jobs: " + error.message);
      return;
    }

    const active = data.filter((job) => !job.completed);
    const completed = data.filter((job) => job.completed);
    setJobs(active);
    setCompletedJobs(completed);
  }

  async function handleMarkComplete(jobId) {
    const { error } = await supabase
      .from("bookings")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", jobId);
    if (error) {
      alert("Error marking job complete: " + error.message);
    } else {
      alert("Job marked as completed.");
      fetchJobs(driver);
    }
  }

  async function handleSubmitNote() {
    if (!activeJob) return;
    if (sigPadRef.current.isEmpty()) {
      alert("Signature required.");
      return;
    }

    const dataUrl = sigPadRef.current.getCanvas().toDataURL("image/png");
    const byteString = atob(dataUrl.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const sigBlob = new Blob([ab], { type: "image/png" });

    const sigFileName = `signature_${activeJob.id}_${Date.now()}.png`;
    const { data: sigUpload, error: sigError } = await supabase.storage
      .from("waste-transfer-notes")
      .upload(sigFileName, sigBlob, { upsert: true });

    if (sigError) {
      alert("Error uploading signature: " + sigError.message);
      return;
    }

    // Correctly get public URL
    const { data: urlData, error: urlError } = supabase.storage
      .from("waste-transfer-notes")
      .getPublicUrl(sigUpload.path);

    if (urlError) {
      alert("Error getting public URL: " + urlError.message);
      return;
    }

    const publicUrl = urlData.publicUrl;

    const { error } = await supabase.from("waste_transfer_notes").insert([
      {
        booking_id: activeJob.id,
        ...noteData,
        signature_url: publicUrl,
      },
    ]);

    if (error) {
      alert("Error saving waste note: " + error.message);
    } else {
      alert("Waste Transfer Note saved.");
      setActiveJob(null);
      sigPadRef.current.clear();
      setNoteData({
        description_of_waste: "",
        quantity: "",
        carrier_name: "",
        carrier_reg_no: "",
        producer_name: "",
        producer_address: "",
        receiver_name: "",
        receiver_address: "",
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Driver Dashboard</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("driverName");
            navigate("/driver");
          }}
          className="text-red-600 underline"
        >
          Log Out
        </button>
      </div>

      <p className="mb-4 font-semibold">Welcome, {driver}</p>

      <h2 className="text-lg font-semibold mb-2">Current Jobs</h2>
      {jobs.length === 0 && <p>No active jobs.</p>}
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white rounded shadow p-4 mb-2 space-y-2"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{job.client_name}</p>
              <p className="text-sm">{job.job_address}</p>
              <p className="text-sm">{job.postcode}</p>
              <p className="text-sm">{job.job_type}</p>
            </div>
            <button
              onClick={() =>
                setExpandedJob(expandedJob === job.id ? null : job.id)
              }
              className="text-blue-600 underline text-sm"
            >
              {expandedJob === job.id ? "Hide Details" : "View Details"}
            </button>
          </div>
          {expandedJob === job.id && (
            <div className="space-y-2 mt-2 text-sm">
              <p><strong>Notes:</strong> {job.special_notes || "—"}</p>
              <p><strong>Tank Size:</strong> {job.tank_size || "—"}</p>
              <p><strong>Waste Type:</strong> {job.waste_type || "—"}</p>
              <p><strong>Portaloo Numbers:</strong> {(job.portaloo_numbers || []).join(", ") || "—"}</p>
              <p><strong>Portaloo Colour:</strong> {job.portaloo_colour || "—"}</p>
              <p><strong>Payment:</strong> {job.payment_status || "—"}</p>
              <div className="flex gap-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => setActiveJob(job)}
                >
                  Complete Waste Transfer Note
                </button>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMarkComplete(job.id)}
                >
                  Mark Complete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <h2 className="text-lg font-semibold mt-6 mb-2">Completed Jobs</h2>
      {completedJobs.length === 0 && <p>No completed jobs yet.</p>}
      <div className="space-y-2">
        {completedJobs.map((job) => (
          <div
            key={job.id}
            className="bg-gray-200 rounded p-3 text-sm"
          >
            <p className="font-semibold">{job.client_name}</p>
            <p>{job.job_address} - {job.postcode}</p>
            <p>{job.job_type}</p>
          </div>
        ))}
      </div>

      {activeJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-3">
            <h2 className="text-lg font-semibold mb-2">Waste Transfer Note</h2>
            {Object.entries(noteData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm mb-1 capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    setNoteData({ ...noteData, [key]: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm mb-1">Signature</label>
              <SignatureCanvas
                ref={sigPadRef}
                penColor="black"
                canvasProps={{
                  className: "border w-full h-24",
                }}
              />
              <button
                onClick={() => sigPadRef.current.clear()}
                className="text-sm text-blue-600 underline mt-1"
              >
                Clear Signature
              </button>
            </div>
            <div className="flex justify-between mt-3">
              <button
                onClick={handleSubmitNote}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setActiveJob(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;
