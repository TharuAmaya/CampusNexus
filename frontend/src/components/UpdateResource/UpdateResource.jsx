import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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

function UpdateResource() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    resourceId: "",
    name: "",
    type: RESOURCE_TYPES[0],
    capacity: "",
    location: "",
    status: RESOURCE_STATUSES[0],
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  // Submit update
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const data = new FormData();

    data.append(
      "resourceDetails",
      JSON.stringify({
        resourceId: formData.resourceId,
        name: formData.name,
        type: formData.type,
        capacity: Number(formData.capacity),
        location: formData.location,
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
    return <div>Loading resource...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Update Resource</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Name"
          className="w-full rounded border p-2"
          required
        />

        <select
          name="type"
          value={formData.type}
          onChange={onInputChange}
          className="w-full rounded border p-2"
        >
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="capacity"
          min="0"
          value={formData.capacity}
          onChange={onInputChange}
          placeholder="Capacity"
          className="w-full rounded border p-2"
          required
        />

        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={onInputChange}
          placeholder="Location"
          className="w-full rounded border p-2"
          required
        />

        <select
          name="status"
          value={formData.status}
          onChange={onInputChange}
          className="w-full rounded border p-2"
        >
          {RESOURCE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={onInputChange}
          className="w-full rounded border p-2"
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {saving ? "Updating..." : "Update Resource"}
        </button>
      </form>
    </div>
  );
}

export default UpdateResource;
