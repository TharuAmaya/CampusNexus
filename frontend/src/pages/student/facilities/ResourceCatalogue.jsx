import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout.jsx";
import { FaLightbulb, FaBoxes } from "react-icons/fa";

const API_BASE_URL = "http://localhost:8081";
const QUICK_BOOK_DUMMY_PATH = "/student/booking/new?resourceId=:resourceId"; // TODO: Replace with final booking route.

const prettifyType = (type) =>
	(type || "")
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");

const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return token ? { Authorization: `Bearer ${token}` } : {};
};

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
	const [recommendCapacity, setRecommendCapacity] = useState("");
	const [recommendLocation, setRecommendLocation] = useState("");
	const [recommendType, setRecommendType] = useState("");
	const [recommendLimit, setRecommendLimit] = useState("3");
	const [recommendations, setRecommendations] = useState([]);
	const [recommendLoading, setRecommendLoading] = useState(false);
	const [recommendError, setRecommendError] = useState("");
	const [recommendSearched, setRecommendSearched] = useState(false);

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

	const handleViewAvailability = (resourceId) => {
		navigate(`/resources/availability?resourceId=${resourceId}`);
	};

	const handleRecommend = async (event) => {
		event.preventDefault();
		setRecommendSearched(true);
		setRecommendError("");
		setRecommendLoading(true);

		try {
			const params = new URLSearchParams();
			if (recommendCapacity !== "") {
				params.set("requiredCapacity", recommendCapacity);
			}
			if (recommendLocation.trim() !== "") {
				params.set("preferredLocation", recommendLocation.trim());
			}
			if (recommendType !== "") {
				params.set("preferredType", recommendType);
			}
			params.set("limit", recommendLimit || "3");

			const response = await fetch(`${API_BASE_URL}/resources/recommendations?${params.toString()}`, {
				headers: {
					...getAuthHeaders(),
				},
			});
			if (!response.ok) {
				const errorBody = await response.json().catch(() => ({}));
				throw new Error(errorBody?.message || "Failed to fetch recommendations.");
			}

			const data = await response.json();
			setRecommendations(Array.isArray(data) ? data : []);
		} catch (err) {
			setRecommendError(err.message || "Unable to fetch recommendations.");
			setRecommendations([]);
		} finally {
			setRecommendLoading(false);
		}
	};

	return (
		<DashboardLayout title="Resource Catalogue">
			<div className="relative space-y-5">
				<style>{`@keyframes facilitiesFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
				<div className="pointer-events-none absolute -right-12 top-24 -z-10 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
				<div className="pointer-events-none absolute -left-16 bottom-8 -z-10 h-56 w-56 rounded-full bg-orange-100/35 blur-3xl" />
				<div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-blue-100 p-5 shadow-sm" style={{ animation: "facilitiesFadeUp 420ms ease-out both" }}>
					<div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-200/45 blur-2xl" />
					<div className="absolute -bottom-10 left-16 h-36 w-36 rounded-full bg-blue-200/35 blur-2xl" />
					<div className="relative">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Smart Assistant</p>
					<h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800"><FaLightbulb className="text-cyan-700" /> Smart Resource Recommendation</h2>
					<p className="mt-1 text-sm text-slate-600">
						Get top matches using your requirements (capacity, type, location).
					</p>

					<form onSubmit={handleRecommend} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
						<input
							type="number"
							min="0"
							value={recommendCapacity}
							onChange={(e) => setRecommendCapacity(e.target.value)}
							placeholder="Required capacity"
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>
						<input
							type="text"
							value={recommendLocation}
							onChange={(e) => setRecommendLocation(e.target.value)}
							placeholder="Preferred location"
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>
						<select
							value={recommendType}
							onChange={(e) => setRecommendType(e.target.value)}
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						>
							<option value="">Any type</option>
							{availableTypes.map((type) => (
								<option key={type} value={type}>
									{prettifyType(type)}
								</option>
							))}
						</select>
						<select
							value={recommendLimit}
							onChange={(e) => setRecommendLimit(e.target.value)}
							className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						>
							<option value="3">Top 3</option>
							<option value="5">Top 5</option>
						</select>
						<button
							type="submit"
							disabled={recommendLoading}
							className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:translate-y-px active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
						>
							{recommendLoading ? "Finding..." : "Find Best Matches"}
						</button>
					</form>

					{recommendError ? <p className="mt-3 text-sm text-red-600">{recommendError}</p> : null}

					{recommendSearched && !recommendLoading ? (
						recommendations.length ? (
							<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
								{recommendations.map((item) => {
									const recommendationImageName = item.imageName || item.itemImage || "";
									const recommendationImageUrl = recommendationImageName
										? `${API_BASE_URL}/uploads/${recommendationImageName}`
										: "";

									return (
									<div
										key={item.resourceId}
										className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:shadow-md"
									>
										{recommendationImageUrl ? (
											<img
												src={recommendationImageUrl}
												alt={item.name || "Resource"}
												className="h-32 w-full object-cover"
												loading="lazy"
											/>
										) : (
											<div className="flex h-32 items-center justify-center bg-slate-200 text-sm text-slate-500">
												No image
											</div>
										)}

										<div className="p-4">
										<div className="flex items-center justify-between gap-2">
											<h3 className="text-base font-semibold text-slate-800">{item.name}</h3>
											<span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
												Score {item.score}
											</span>
										</div>
										<p className="mt-1 text-sm text-slate-600">{prettifyType(item.type)}</p>
										<p className="mt-2 text-sm text-slate-700">{item.recommendationReason}</p>
										<dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-slate-700">
											<dt className="text-slate-500">Resource ID</dt>
											<dd>#{item.resourceId}</dd>
											<dt className="text-slate-500">Location</dt>
											<dd>{item.location || "-"}</dd>
											<dt className="text-slate-500">
												{item.type === "EQUIPMENT" ? "Quantity" : "Capacity"}
											</dt>
											<dd>{item.capacity ?? "-"}</dd>
											<dt className="text-slate-500">Available</dt>
											<dd>
												{item.availableFrom || "-"} - {item.availableTo || "-"}
											</dd>
										</dl>
										<div className="mt-3 grid grid-cols-2 gap-2">
											<button
												type="button"
												onClick={() => handleViewAvailability(item.resourceId)}
														className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:translate-y-px active:scale-[0.98]"
											>
												Calendar
											</button>
											<button
												type="button"
												onClick={() => handleQuickBook(item.resourceId)}
														className="w-full rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 active:translate-y-px active:scale-[0.98]"
											>
												Quick Book
											</button>
										</div>
										</div>
									</div>
									);
								})}
							</div>
						) : (
							<div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white/80 p-4 text-center text-sm text-slate-600">
								<div className="mx-auto mb-2 h-6 w-6 rounded border border-slate-400" />
								No recommendations found for the given requirements.
							</div>
						)
					) : null}
					</div>
				</div>

				<div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" style={{ animation: "facilitiesFadeUp 520ms ease-out both" }}>
					<h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800"><FaBoxes className="text-cyan-700" /> Available Resources</h2>
					<p className="mt-1 text-sm text-slate-600">
						Browse bookable lecture halls, labs, meeting rooms, and equipment.
					</p>

					<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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

						<div className="rounded-xl bg-orange-100/70 px-4 py-2.5 text-sm text-orange-900">
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
									<div
										key={item.resourceId}
										className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
									>
										{imageUrl ? (
											<img
												src={imageUrl}
												alt={item.name || "Resource"}
												className="h-32 w-full object-cover"
												loading="lazy"
											/>
										) : (
											<div className="flex h-32 items-center justify-center bg-slate-200 text-sm text-slate-500">
												No image
											</div>
										)}

										<div className="p-4">
											<div className="flex items-center justify-between gap-2">
												<h3 className="text-base font-semibold text-slate-800">{item.name}</h3>
												<span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
													Available
												</span>
											</div>

											<p className="mt-1 text-sm text-slate-600">{prettifyType(item.type)}</p>

											<dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-slate-700">
												<dt className="text-slate-500">Resource ID</dt>
												<dd>#{item.resourceId}</dd>

												<dt className="text-slate-500">Location</dt>
												<dd>{item.location || "-"}</dd>

												<dt className="text-slate-500">
													{item.type === "EQUIPMENT" ? "Quantity" : "Capacity"}
												</dt>
												<dd>{item.capacity ?? "-"}</dd>

												<dt className="text-slate-500">Available</dt>
												<dd>
													{item.availableFrom || "-"} - {item.availableTo || "-"}
												</dd>
											</dl>

											<div className="mt-3 grid grid-cols-2 gap-2">
												<button
													type="button"
													onClick={() => handleViewAvailability(item.resourceId)}
													className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:translate-y-px active:scale-[0.98]"
												>
													Calendar
												</button>
												<button
													type="button"
													onClick={() => handleQuickBook(item.resourceId)}
													className="w-full rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 active:translate-y-px active:scale-[0.98]"
												>
													Quick Book
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
							<div className="mx-auto mb-3 h-10 w-10 rounded-full border border-slate-300 bg-slate-50" />
							No resources match your current filters.
						</div>
					)
				) : null}
			</div>
		</DashboardLayout>
	);
}

export default ResourceCatalogue;
