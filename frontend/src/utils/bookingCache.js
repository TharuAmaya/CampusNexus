/**
 * bookingCache.js
 *
 * A lightweight, module-level in-memory cache for the student booking portal.
 * This cache lives for the duration of the browser session (survives React Router
 * navigations and component unmounts, but resets on full page refresh).
 *
 * Pattern: Stale-While-Revalidate (SWR)
 *   1. Return stale (cached) data immediately → UI renders instantly
 *   2. Fetch fresh data in the background
 *   3. Update UI with fresh data when it arrives
 */

const _cache = {
    /** @type {string|null} */
    userId: null,

    /** @type {Array|null} List of the user's bookings */
    bookings: null,

    /** @type {Object|null} Map of resourceId -> resource name */
    resourcesMap: null,

    /** @type {Array|null} Full resources array for dropdowns */
    resources: null,

    /** @type {Object} Map of bookingCode -> booking detail object */
    bookingDetails: {},

    /** @type {Object} Map of resourceId -> resource detail object */
    resourceDetails: {},
};

export const bookingCache = {
    // ── User profile ──────────────────────────────────────────────
    getUserId: () => _cache.userId,
    setUserId: (id) => { _cache.userId = id; },

    // ── Booking list ──────────────────────────────────────────────
    getBookings: () => _cache.bookings,
    setBookings: (list) => { _cache.bookings = list; },

    // ── Resources map (id → name) ─────────────────────────────────
    getResourcesMap: () => _cache.resourcesMap,
    setResourcesMap: (map) => { _cache.resourcesMap = map; },

    // ── Full resources array (for dropdowns) ─────────────────────
    getResources: () => _cache.resources,
    setResources: (list) => { _cache.resources = list; },

    // ── Individual booking detail ─────────────────────────────────
    getBookingDetail: (code) => _cache.bookingDetails[code] ?? null,
    setBookingDetail: (code, data) => { _cache.bookingDetails[code] = data; },
    invalidateBookingDetail: (code) => { delete _cache.bookingDetails[code]; },

    // ── Individual resource detail ────────────────────────────────
    getResourceDetail: (id) => _cache.resourceDetails[id] ?? null,
    setResourceDetail: (id, data) => { _cache.resourceDetails[id] = data; },

    // ── Full cache clear (on logout etc.) ─────────────────────────
    clear: () => {
        _cache.userId = null;
        _cache.bookings = null;
        _cache.resourcesMap = null;
        _cache.resources = null;
        _cache.bookingDetails = {};
        _cache.resourceDetails = {};
    },
};
