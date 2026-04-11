import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../../components/DashboardLayout.jsx";

const RESOURCE_TYPES = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "EQUIPMENT",
  "SPORTS_FACILITY",
];

const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

const API_BASE_URL = "http://localhost:8081";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const initialForm = {
  name: "",
  type: RESOURCE_TYPES[0],
  capacity: "",
  location: "",
  availableFrom: "08:00",
  availableTo: "17:00",
  status: RESOURCE_STATUSES[0],
};

function AddResource() {
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const isEquipment = formData.type === "EQUIPMENT";

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return "";

    const imageForm = new FormData();
    imageForm.append("file", imageFile);
    setUploading(true);

    const response = await fetch(`${API_BASE_URL}/resources/resourceImg`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: imageForm,
    });

    setUploading(false);
    if (!response.ok) {
      throw new Error("Image upload failed. Please try again.");
    }

    const filename = await response.text();
    return filename;
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (formData.capacity === "") {
      return isEquipment ? "Quantity is required." : "Capacity is required.";
    }
    if (Number(formData.capacity) < 0) {
      return isEquipment
        ? "Quantity cannot be negative."
        : "Capacity cannot be negative.";
    }
    if (!isEquipment && !formData.location.trim()) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setLoading(true);
      let uploadedFilename = "";
      if (imageFile) {
        uploadedFilename = await uploadImage();
      }

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        capacity: Number(formData.capacity),
        location: formData.location.trim(),
        availableFrom: formData.availableFrom,
        availableTo: formData.availableTo,
        imageName: uploadedFilename || null,
        status: formData.status,
      };

      const response = await fetch(`${API_BASE_URL}/resources`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          "Failed to create resource. Please check backend and try again.",
        );
      }

      const contentType = response.headers.get("content-type") || "";
      const rawBody = await response.text();
      if (!contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please verify login/session and API URL.",
        );
      }

      const created = JSON.parse(rawBody);
      setSuccess(
        `Resource created successfully (ID: ${created.resourceId})${uploadedFilename ? `, Image: ${uploadedFilename}` : ""}.`,
      );
      setFormData(initialForm);
      setImageFile(null);
    } catch (submitError) {
      setError(
        submitError.message ||
          "Something went wrong while saving the resource.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
              Add New Resource
            </h1>
            <Link
              to="/resourcehome"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Back
            </Link>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="name"
                >
                  Resource Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Main Auditorium"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="type"
                >
                  Type (Enum)
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="status"
                >
                  Status (Enum)
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {RESOURCE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="capacity"
                >
                  {isEquipment ? "Quantity" : "Capacity"}
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder={isEquipment ? "Ex: 10 units" : "Ex: 120"}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="location"
                >
                  Location {isEquipment ? "(Optional for equipment)" : ""}
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={
                    isEquipment
                      ? "Ex: Storage Room A (optional)"
                      : "Ex: Block A, Ground Floor"
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required={!isEquipment}
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="availableFrom"
                >
                  Available From
                </label>
                <input
                  id="availableFrom"
                  name="availableFrom"
                  type="time"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="availableTo"
                >
                  Available To
                </label>
                <input
                  id="availableTo"
                  name="availableTo"
                  type="time"
                  value={formData.availableTo}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="image"
                >
                  Upload Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                />
                {imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="mt-4 h-44 w-full rounded-xl object-cover sm:w-80"
                  />
                )}
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
              createdAt and updatedAt are generated automatically by backend.
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                {success}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading || uploading ? "Saving Resource..." : "Create Resource"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AddResource;
