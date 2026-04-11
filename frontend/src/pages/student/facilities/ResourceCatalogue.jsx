import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout.jsx";

const API_BASE_URL = "http://localhost:8081";
const QUICK_BOOK_DUMMY_PATH = "/student/booking/new?resourceId=:resourceId"; // TODO: Replace with final booking route.

const prettifyType = (type) =>
	(type || "")
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");

function ResourceCatalogue() {
	const navigate = useNavigate();
	const [resources, setResources] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [locationFilter, setLocationFilter] = useState("");
	const [minCapacityFilter, setMinCapacityFilter] = useState("");
	const [maxCapacityFilter, setMaxCapacityFilter] = useState("");
	const [sortOption, setSortOption] = useState("name-asc");

	useEffect(() => {
		const loadResources = async () => {
			try {
				setLoading(true);
				setError("");

				const response = await fetch(`${API_BASE_URL}/resources`);
				if (!response.ok) {
					throw new Error("Failed to load resources.");
				}

				const data = await response.json();
				const activeResources = (Array.isArray(data) ? data : []).filter(
					(item) => item?.status === "ACTIVE",
				);
				setResources(activeResources);
			} catch (err) {
				setError(err.message || "Unable to load resources.");
			} finally {
				setLoading(false);
			}
		};

		loadResources();
	}, []);

	const availableTypes = useMemo(
		() => Array.from(new Set(resources.map((item) => item.type).filter(Boolean))),
		[resources],
	);

	const filteredResources = useMemo(() => {
		const term = search.trim().toLowerCase();
		const normalizedLocation = locationFilter.trim().toLowerCase();
		const minCapacity = minCapacityFilter === "" ? null : Number(minCapacityFilter);
		const maxCapacity = maxCapacityFilter === "" ? null : Number(maxCapacityFilter);

		return resources.filter((item) => {
			const matchesType = typeFilter === "" || item.type === typeFilter;
			const matchesLocation =
				normalizedLocation === "" ||
				(item.location || "").toLowerCase().includes(normalizedLocation);
			const matchesMinCapacity = minCapacity === null || (item.capacity ?? 0) >= minCapacity;
			const matchesMaxCapacity = maxCapacity === null || (item.capacity ?? 0) <= maxCapacity;
			const matchesSearch =
				term === "" ||
				String(item.resourceId || "").includes(term) ||
				(item.name || "").toLowerCase().includes(term) ||
				(item.location || "").toLowerCase().includes(term) ||
				(item.type || "").toLowerCase().includes(term);

			return (
				matchesType &&
				matchesLocation &&
				matchesMinCapacity &&
				matchesMaxCapacity &&
				matchesSearch
			);
		});
	}, [
		resources,
		search,
		typeFilter,
		locationFilter,
		minCapacityFilter,
		maxCapacityFilter,
	]);

	const sortedResources = useMemo(() => {
		const sorted = [...filteredResources];

		sorted.sort((a, b) => {
			switch (sortOption) {
				case "capacity-asc":
					return (a.capacity ?? 0) - (b.capacity ?? 0);
				case "capacity-desc":
					return (b.capacity ?? 0) - (a.capacity ?? 0);
				case "type-asc":
					return (a.type || "").localeCompare(b.type || "");
				case "name-desc":
					return (b.name || "").localeCompare(a.name || "");
				case "name-asc":
				default:
					return (a.name || "").localeCompare(b.name || "");
			}
		});

		return sorted;
	}, [filteredResources, sortOption]);

	const handleQuickBook = (resourceId) => {
		const targetPath = QUICK_BOOK_DUMMY_PATH.replace(":resourceId", String(resourceId));
		navigate(targetPath);
	};

	return (
		<DashboardLayout title="Resource Catalogue">
			<div className="space-y-5">
				<div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
					<h2 className="text-xl font-semibold text-slate-800">Available Resources</h2>
					<p className="mt-1 text-sm text-slate-600">
						Browse bookable lecture halls, labs, meeting rooms, and equipment.
					</p>

					<div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by name, type, location or ID"
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>

						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						>
							<option value="">All Types</option>
							{availableTypes.map((type) => (
								<option key={type} value={type}>
									{prettifyType(type)}
								</option>
							))}
						</select>

						<input
							type="text"
							value={locationFilter}
							onChange={(e) => setLocationFilter(e.target.value)}
							placeholder="Filter by location"
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>

						<input
							type="number"
							min="0"
							value={minCapacityFilter}
							onChange={(e) => setMinCapacityFilter(e.target.value)}
							placeholder="Min capacity"
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>

						<input
							type="number"
							min="0"
							value={maxCapacityFilter}
							onChange={(e) => setMaxCapacityFilter(e.target.value)}
							placeholder="Max capacity"
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>

						<select
							value={sortOption}
							onChange={(e) => setSortOption(e.target.value)}
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						>
							<option value="name-asc">Sort: Name (A-Z)</option>
							<option value="name-desc">Sort: Name (Z-A)</option>
							<option value="type-asc">Sort: Type (A-Z)</option>
							<option value="capacity-asc">Sort: Capacity (Low-High)</option>
							<option value="capacity-desc">Sort: Capacity (High-Low)</option>
						</select>

						<div className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
							Showing {sortedResources.length} of {resources.length} active resources
						</div>
					</div>
				</div>

				{loading ? <div className="text-slate-600">Loading resources...</div> : null}
				{!loading && error ? <div className="text-red-600">{error}</div> : null}

				{!loading && !error ? (
					sortedResources.length ? (
						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{sortedResources.map((item) => {
								const imageName = item.imageName || item.itemImage || "";
								const imageUrl = imageName ? `${API_BASE_URL}/uploads/${imageName}` : "";

								return (
									<article
										key={item.resourceId}
										className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
									>
										{imageUrl ? (
											<img
												src={imageUrl}
												alt={item.name || "Resource"}
												className="h-40 w-full object-cover"
												loading="lazy"
											/>
										) : (
											<div className="flex h-40 items-center justify-center bg-slate-100 text-slate-500">
												No image
											</div>
										)}

										<div className="space-y-2 p-4">
											<div className="flex items-start justify-between gap-3">
												<h3 className="text-lg font-semibold text-slate-800">{item.name}</h3>
												<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
													Active
												</span>
											</div>

											<p className="text-sm text-slate-600">{prettifyType(item.type)}</p>

											<dl className="grid grid-cols-2 gap-y-1 text-sm text-slate-700">
												<dt className="text-slate-500">Resource ID</dt>
												<dd>#{item.resourceId}</dd>

												<dt className="text-slate-500">Location</dt>
												<dd>{item.location || "-"}</dd>

												<dt className="text-slate-500">Capacity</dt>
												<dd>{item.capacity ?? "-"}</dd>

												<dt className="text-slate-500">Available</dt>
												<dd>
													{item.availableFrom || "-"} - {item.availableTo || "-"}
												</dd>
											</dl>

											<button
												type="button"
												onClick={() => handleQuickBook(item.resourceId)}
												className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
											>
												Quick Book
											</button>
										</div>
									</article>
								);
							})}
						</div>
					) : (
						<div className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
							No resources match your current filters.
						</div>
					)
				) : null}
			</div>
		</DashboardLayout>
	);
}

export default ResourceCatalogue;
