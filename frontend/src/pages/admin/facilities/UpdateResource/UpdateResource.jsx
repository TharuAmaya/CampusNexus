import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../../components/DashboardLayout.jsx";
import { FaEdit, FaSave, FaTimesCircle } from "react-icons/fa";

const API_BASE_URL = "http://localhost:8081";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const RESOURCE_TYPES = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "EQUIPMENT",
  "SPORTS_FACILITY",
];

const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

const prettifyType = (type) =>
  (type || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function UpdateResource() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    resourceId: "",
    name: "",
    type: RESOURCE_TYPES[0],
    capacity: "",
    location: "",
    availableFrom: "08:00",
    availableTo: "17:00",
    status: RESOURCE_STATUSES[0],
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEquipment = formData.type === "EQUIPMENT";

  // Load existing resource
  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_BASE_URL}/resources/${id}`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        const data = response.data;

        setFormData({
          resourceId: data.resourceId || "",
          name: data.name || "",
          type: data.type || "",
          capacity: data.capacity || "",
          location: data.location || "",
          availableFrom: data.availableFrom || "08:00",
          availableTo: data.availableTo || "17:00",
          status: data.status || "",
          image: null,
        });
      } catch (err) {
        setError("Error fetching resource details.");
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
  }, [id]);

  // Handle input change
  const onInputChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name?.trim()) return "Name is required.";
    if (formData.capacity === "") {
      return isEquipment ? "Quantity is required." : "Capacity is required.";
    }
    if (Number(formData.capacity) < 0) {
      return isEquipment
        ? "Quantity cannot be negative."
        : "Capacity cannot be negative.";
    }
    if (!isEquipment && !formData.location?.trim()) {
      return "Location is required for this resource type.";
    }
    if (!formData.availableFrom || !formData.availableTo) {
      return "Availability window is required.";
    }
    if (formData.availableFrom >= formData.availableTo) {
      return "availableFrom must be before availableTo.";
    }
    return "";
  };

  // Submit update
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    const data = new FormData();

    data.append(
      "resourceDetails",
      JSON.stringify({
        resourceId: formData.resourceId,
        name: formData.name,
        type: formData.type,
        capacity: Number(formData.capacity),
        location: formData.location.trim(),
        availableFrom: formData.availableFrom,
        availableTo: formData.availableTo,
        status: formData.status,
      })
    );

    if (formData.image) {
      data.append("file", formData.image);
    }

    try {
      if (!localStorage.getItem("token")) {
        throw new Error("You are not logged in. Please log in and try again.");
      }

      await axios.put(`${API_BASE_URL}/resources/${id}`, data, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      alert("Resource updated successfully");
      navigate("/displayresource");

    } catch (err) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : "");
      const status = err?.response?.status;
      setError(
        serverMessage ||
          (status
            ? `Update failed (HTTP ${status}). Please check your session and input values.`
            : err.message || "Error updating resource"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Update Resource">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Loading resource...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Update Resource">
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 px-4 py-8 sm:px-6">
        <style>{`@keyframes facilitiesFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm" style={{ animation: 'facilitiesFadeUp 420ms ease-out both' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Facilities Admin</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-800 sm:text-3xl"><FaEdit className="text-cyan-700" /> Update Resource</h1>
            <p className="mt-1 text-sm text-slate-600">
              Edit availability metadata and keep resource details up to date.
            </p>
            <div className="mt-3 inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Resource ID: {formData.resourceId || id}
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" style={{ animation: 'facilitiesFadeUp 520ms ease-out both' }}>
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Resource Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  placeholder="Name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                >
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {prettifyType(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {isEquipment ? "Quantity" : "Capacity"}
                </label>
                <input
                  type="number"
                  name="capacity"
                  min="0"
                  value={formData.capacity}
                  onChange={onInputChange}
                  placeholder={isEquipment ? "Quantity" : "Capacity"}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Location {isEquipment ? "(Optional for equipment)" : ""}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={onInputChange}
                  placeholder={isEquipment ? "Location (optional)" : "Location"}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  required={!isEquipment}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Available From</label>
                <input
                  type="time"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Available To</label>
                <input
                  type="time"
                  name="availableTo"
                  value={formData.availableTo}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                >
                  {RESOURCE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {prettifyType(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Update Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={onInputChange}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-700"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:translate-y-px active:scale-[0.99] disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2"><FaSave /> {saving ? "Updating..." : "Update Resource"}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/displayresource")}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:translate-y-px active:scale-[0.99]"
              >
                <span className="inline-flex items-center gap-2"><FaTimesCircle /> Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UpdateResource;
