import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import DashboardLayout from "../../../../components/DashboardLayout.jsx";
import { FaBoxes, FaFilePdf } from "react-icons/fa";

const API_BASE_URL = "http://localhost:8081";
const BRAND_NAME = "CampusNexus";
const REPORT_TITLE = "Resource Catalogue Report";
const PDF_LOGO_PATH = "/campusnexus-logo.png";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const prettifyType = (type) =>
  (type || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function DisplayResource() {
  const navigate = useNavigate();
  const [resource, setResource] = useState([]);
  const [bookingCountsByResourceId, setBookingCountsByResourceId] = useState({});
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
    loadBookingCounts();
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

  const loadBookingCounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
        cache: "no-store",
      });

      if (!response.ok) {
        setBookingCountsByResourceId({});
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      const rawBody = await response.text();

      if (!contentType.includes("application/json")) {
        setBookingCountsByResourceId({});
        return;
      }

      const bookings = JSON.parse(rawBody);

      const countableStatuses = new Set(["PENDING", "APPROVED"]);

      const counts = (Array.isArray(bookings) ? bookings : []).reduce((acc, booking) => {
        if (!countableStatuses.has(booking?.status)) {
          return acc;
        }

        const key = String(booking?.resourceId ?? "").trim();
        if (!key) {
          return acc;
        }

        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      setBookingCountsByResourceId(counts);
    } catch (_) {
      setBookingCountsByResourceId({});
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Resource Catalogue">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Loading resources...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Resource Catalogue">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      </DashboardLayout>
    );
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
    const pageWidth = doc.internal.pageSize.getWidth();
    const headerHeight = 34;

    const now = new Date();
    const generatedAt = now.toLocaleString();
    const activeCount = resources.filter((item) => item.status === "ACTIVE").length;
    const outOfServiceCount = resources.filter((item) => item.status === "OUT_OF_SERVICE").length;

    const logoUrl = `${window.location.origin}${PDF_LOGO_PATH}`;

    doc.setFillColor(8, 47, 73);
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    const logoWidth = 40;
    const logoHeight = 12;
    const logoX = 14;
    const logoY = (headerHeight - logoHeight) / 2;
    const textX = logoX + logoWidth + 8;
    try {
      const logoDataUrl = await loadImageAsDataUrl(logoUrl);
      doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoWidth, logoHeight);
    } catch (_) {
      // Continue without logo if image loading fails.
    }

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(BRAND_NAME, textX, 13);

    doc.setFontSize(11);
    doc.setTextColor(219, 234, 254);
    doc.text(REPORT_TITLE, textX, 19);

    doc.setFontSize(9);
    doc.setTextColor(224, 242, 254);
    doc.text(`Generated: ${generatedAt}`, textX, 25);

    doc.setDrawColor(14, 116, 144);
    doc.setFillColor(236, 254, 255);
    doc.roundedRect(14, 40, 44, 16, 2, 2, "FD");
    doc.roundedRect(62, 40, 44, 16, 2, 2, "FD");
    doc.roundedRect(110, 40, 44, 16, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setTextColor(8, 47, 73);
    doc.text("Total Resources", 18, 46);
    doc.text("Active", 66, 46);
    doc.text("Out of Service", 114, 46);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(String(resources.length), 18, 53);
    doc.text(String(activeCount), 66, 53);
    doc.text(String(outOfServiceCount), 114, 53);

    const tableData = resources.map((item) => [
      item.resourceId,
      item.name,
      item.type,
      item.capacity,
      item.location,
      item.availableFrom || "-",
      item.availableTo || "-",
      item.status,
      bookingCountsByResourceId[String(item.resourceId)] ?? 0,
    ]);

    autoTable(doc, {
      head: [["ID", "Name", "Type", "Capacity/Qty", "Location", "Available From", "Available To", "Status", "Active bookings"]],
      body: tableData,
      startY: 62,
      theme: "grid",
      headStyles: {
        fillColor: [8, 47, 73],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 8);
        doc.text("CampusNexus Facilities", pageWidth - 56, doc.internal.pageSize.height - 8);
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
    <DashboardLayout title="Resource Catalogue">
      <div className="space-y-5">
        <style>{`@keyframes facilitiesFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <section
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-blue-100 p-6 shadow-sm"
          style={{ animation: "facilitiesFadeUp 420ms ease-out both" }}
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-200/40 blur-2xl" />
          <div className="absolute -bottom-12 left-20 h-40 w-40 rounded-full bg-blue-300/30 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Facilities</p>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-800 sm:text-3xl"><FaBoxes className="text-cyan-700" /> Resource Library</h1>
            <p className="mt-1 text-sm text-slate-600">
              Search, filter, update and export resources with a cleaner management view.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => generatePdf(filteredData)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:translate-y-px active:scale-[0.98]"
              >
                <span className="inline-flex items-center gap-2"><FaFilePdf /> Generate PDF</span>
              </button>
              <span className="rounded-xl bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                Showing {filteredData.length} of {resource.length}
              </span>
            </div>
          </div>
        </section>

        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          style={{ animation: "facilitiesFadeUp 520ms ease-out both" }}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-12">
            <input
              type="text"
              placeholder="Search by ID, name, type, location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 2xl:col-span-3"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 2xl:col-span-2"
            >
              <option value="">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {prettifyType(type)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Min Capacity"
              value={minCapacityFilter}
              onChange={(e) => setMinCapacityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 2xl:col-span-2"
            />
            <input
              type="number"
              min="0"
              placeholder="Max Capacity"
              value={maxCapacityFilter}
              onChange={(e) => setMaxCapacityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 2xl:col-span-2"
            />
            <input
              type="text"
              placeholder="Filter by location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 2xl:col-span-3"
            />
          </div>
        </section>

        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          style={{ animation: "facilitiesFadeUp 620ms ease-out both" }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Capacity/Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Available</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <div className="leading-tight">
                      <div>Bookings</div>
                      <div className="mt-0.5 text-[10px] font-medium normal-case tracking-normal text-slate-500">
                        Active bookings
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {!filteredData.length ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12">
                      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                        <div className="relative mb-3 h-12 w-12 rounded-full bg-cyan-100">
                          <div className="absolute left-3 top-3 h-6 w-6 rounded-md border-2 border-cyan-700" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No resources match this filter set</p>
                        <p className="mt-1 text-xs text-slate-500">Try clearing one or more filters or searching with broader keywords.</p>
                      </div>
                    </td>
                  </tr>
                ) : null}
                {filteredData.map((item, index) => {
                  const imageUrl = `${API_BASE_URL}/uploads/${item.imageName || item.itemImage || ""}`;
                  const isActive = item.status === "ACTIVE";
                  const bookingsCount = bookingCountsByResourceId[String(item.resourceId)] ?? 0;

                  return (
                    <tr key={item.resourceId ?? index} className="hover:bg-cyan-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">#{item.resourceId}</td>
                      <td className="px-4 py-3">
                        {item.imageName || item.itemImage ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-[11px] text-slate-500 ring-1 ring-slate-200">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{prettifyType(item.type)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.capacity}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.location || "-"}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.availableFrom || "-"} - {item.availableTo || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{bookingsCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateNavigate(item.resourceId)}
                            className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-700 active:translate-y-px active:scale-[0.97]"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => deleteResource(item.resourceId)}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 active:translate-y-px active:scale-[0.97]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default DisplayResource;