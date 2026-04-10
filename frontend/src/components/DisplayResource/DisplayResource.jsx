import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = "http://localhost:8081";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function DisplayResource() {
  const navigate = useNavigate();
  const [resource, setResource] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const generatePdf = (resources) => {
    if (!resources.length) {
      alert("No resources to export.");
      return;
    }

    const doc = new jsPDF("portrait");

    doc.text("Resource List", 14, 10);

    const tableData = resources.map((item) => [
      item.resourceId,
      item.name,
      item.type,
      item.capacity,
      item.location,
      item.status,
    ]);

    autoTable(doc, {
      head: [["ID", "Name", "Type", "Capacity", "Location", "Status"]],
      body: tableData,
      startY: 20,
    });

    doc.save("resource_list.pdf");
  };

  return (
    <div>
      <h1>Resources</h1>
      <button onClick={() => generatePdf(resource)}>Generate PDF</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Location</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
    {resource.map((resource, index) => (
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