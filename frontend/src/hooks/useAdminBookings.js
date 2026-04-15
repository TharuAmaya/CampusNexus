/**
 * useAdminBookings.js — Admin Booking List Hook
 *
 * Encapsulates: data fetching, resources map, status filter logic, loading & error state.
 * The AdminBookingDashboard page becomes a pure presentation component
 * by consuming this hook.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminBookings, fetchAllResources } from '../services/bookingService';

export const BOOKING_STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

/**
 * @returns {{
 *   bookings: Array,
 *   filteredBookings: Array,
 *   resourcesMap: Object,
 *   filter: string,
 *   setFilter: (status: string) => void,
 *   loading: boolean,
 *   error: string|null,
 *   reload: () => void
 * }}
 */
export function useAdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [resourcesMap, setResourcesMap] = useState({});
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        setError(null);

        // Fetch bookings and resources in parallel for efficiency
        const [bookingsResult, resourcesResult] = await Promise.all([
            fetchAdminBookings(token),
            fetchAllResources(token),
        ]);

        if (bookingsResult.error) {
            setError(bookingsResult.error);
        } else {
            setBookings(Array.isArray(bookingsResult.data) ? bookingsResult.data : []);
        }

        // Build resourceId → name map regardless of booking errors
        const resData = Array.isArray(resourcesResult.data) ? resourcesResult.data : [];
        const map = {};
        resData.forEach((r) => { map[String(r.resourceId)] = r.name; });
        setResourcesMap(map);

        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filteredBookings = filter === 'ALL'
        ? bookings
        : bookings.filter((b) => b.status === filter);

    return { bookings, filteredBookings, resourcesMap, filter, setFilter, loading, error, reload: load };
}
