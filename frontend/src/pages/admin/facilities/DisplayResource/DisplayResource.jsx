import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = "http://localhost:8081";
const BRAND_NAME = "CampusNexus";
const REPORT_TITLE = "Resource Catalogue Report";
const PDF_LOGO_PATH = "/campusnexus-logo.png";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function DisplayResource() {
  const navigate = useNavigate();
  const [resource, setResource] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minCapacityFilter, setMinCapacityFilter] = useState("");
  const [maxCapacityFilter, setMaxCapacityFilter] = useState("");

  const updateNavigate = (id) => {
    navigate(`/updateresource/${id}`);
  };

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/resources`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load resources. Please try again.");
      }

      const contentType = response.headers.get("content-type") || "";
      const rawBody = await response.text();

      if (!contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please verify login/session and API URL.",
        );
      }

      const data = JSON.parse(rawBody);
      setResource(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load resources.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading resources...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const deleteResource = async (id) => {

    const confirmMessage = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (confirmMessage) {
      try {
        await axios.delete(`${API_BASE_URL}/resources/${id}`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        alert("Resource deleted successfully");

        // reload data
        loadResources();

      } catch (error) {
        console.error(error);
        const serverMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          (typeof error?.response?.data === "string" ? error.response.data : "");
        alert(serverMessage || "Error deleting resource");
      }
    }
  };

  const loadImageAsDataUrl = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Unable to create canvas context"));
          return;
        }

        ctx.drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => reject(new Error("Failed to load image"));
      image.src = src;
    });

  const generatePdf = async (resources) => {
    if (!resources.length) {
      alert("No resources to export.");
      return;
    }

    const doc = new jsPDF("portrait");

    const now = new Date();
    const generatedAt = now.toLocaleString();
    const activeCount = resources.filter((item) => item.status === "ACTIVE").length;
    const outOfServiceCount = resources.filter((item) => item.status === "OUT_OF_SERVICE").length;

    const logoUrl = `${window.location.origin}${PDF_LOGO_PATH}`;
    try {
      const logoDataUrl = await loadImageAsDataUrl(logoUrl);
      doc.addImage(logoDataUrl, "PNG", 14, 8, 40, 12);
    } catch (_) {
      // Continue without logo if image loading fails.
    }

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(BRAND_NAME, 58, 14);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(REPORT_TITLE, 58, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 14, 30);
    doc.text(`Total: ${resources.length}`, 14, 36);
    doc.text(`Active: ${activeCount}`, 60, 36);
    doc.text(`Out of Service: ${outOfServiceCount}`, 100, 36);

    const tableData = resources.map((item) => [
      item.resourceId,
      item.name,
      item.type,
      item.capacity,
      item.location,
      item.availableFrom || "-",
      item.availableTo || "-",
      item.status,
    ]);

    autoTable(doc, {
      head: [["ID", "Name", "Type", "Capacity/Qty", "Location", "Available From", "Available To", "Status"]],
      body: tableData,
      startY: 42,
      didDrawPage: (data) => {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 8);
      },
    });

    doc.save("resource_list.pdf");
  };

  const filteredData = resource.filter((item) =>
    (searchQuery.trim() === "" ||
      String(item.resourceId ?? "").includes(searchQuery.trim()) ||
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.type || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
    (typeFilter === "" || (item.type || "") === typeFilter) &&
    (locationFilter.trim() === "" ||
      (item.location || "").toLowerCase().includes(locationFilter.toLowerCase())) &&
    (minCapacityFilter === "" || (item.capacity ?? 0) >= Number(minCapacityFilter)) &&
    (maxCapacityFilter === "" || (item.capacity ?? 0) <= Number(maxCapacityFilter))
  );

  const uniqueTypes = Array.from(new Set(resource.map((item) => item.type).filter(Boolean)));

  return (
    <div>
      <h1>Resources</h1>
      <button onClick={() => generatePdf(filteredData)}>Generate PDF</button>
      <input
        type="text"
        placeholder="Search by ID, name, type, location"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
        <option value="">All Types</option>
        {uniqueTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <input
        type="number"
        min="0"
        placeholder="Min Capacity"
        value={minCapacityFilter}
        onChange={(e) => setMinCapacityFilter(e.target.value)}
      />
      <input
        type="number"
        min="0"
        placeholder="Max Capacity"
        value={maxCapacityFilter}
        onChange={(e) => setMaxCapacityFilter(e.target.value)}
      />
      <input
        type="text"
        placeholder="Filter by location"
        value={locationFilter}
        onChange={(e) => setLocationFilter(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Capacity/Qty</th>
            <th>Location</th>
            <th>Available From</th>
            <th>Available To</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
    {filteredData.map((resource, index) => (
      <tr key={resource.resourceId ?? index}>
        <td>{resource.resourceId}</td>

        <td>
            <img
        src={`${API_BASE_URL}/uploads/${resource.imageName || resource.itemImage || ""}`}
            alt={resource.name}
            width="50"
            height="50"
         />
        </td>

        <td>{resource.name}</td>
        <td>{resource.type}</td>
        <td>{resource.capacity}</td>
        <td>{resource.location}</td>
        <td>{resource.availableFrom || "-"}</td>
        <td>{resource.availableTo || "-"}</td>
        <td>{resource.status}</td>
        <td>
          <button onClick={() => updateNavigate(resource.resourceId)}>
            Update
          </button>
          <button onClick={() => deleteResource(resource.resourceId)}>
            Delete
          </button>
        </td>
        </tr>
    ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayResource;