/**
 * useBookings.js — Student Booking List Hook
 *
 * Encapsulates: userId resolution, parallel bookings + resources fetch,
 * Stale-While-Revalidate (SWR) cache strategy, loading & error state.
 *
 * Returns an object so new fields can be added without breaking callers.
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingCache } from '../utils/bookingCache';
import {
    fetchUserProfile,
    fetchBookingsByUser,
    fetchAllResources,
    fetchBookingQrToken,
} from '../services/bookingService';

/**
 * @returns {{
 *   bookings: Array,
 *   resourcesMap: Object,
 *   isLoading: boolean,
 *   isRefreshing: boolean,
 *   error: string,
 *   refresh: () => void
 * }}
 */
export function useBookings() {
    const [bookings, setBookings] = useState(() => bookingCache.getBookings() ?? []);
    const [resourcesMap, setResourcesMap] = useState(() => bookingCache.getResourcesMap() ?? {});
    const [isLoading, setIsLoading] = useState(!bookingCache.getBookings());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');

    const location = useLocation();

    const load = useCallback(async (isBackground = false) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You are not logged in. Please log in to continue.');
            setIsLoading(false);
            return;
        }

        if (!isBackground) setIsLoading(true);
        else setIsRefreshing(true);
        setError('');

        try {
            // ── Step 1: Resolve userId — prefer cache to avoid extra round-trip ──
            let userId = bookingCache.getUserId();
            if (!userId) {
                const { data: user, error: profileErr } = await fetchUserProfile(token);
                if (profileErr || !user) {
                    // If it's an auth error, clear the cached token so user is prompted to log in
                    const isAuthError = profileErr && (
                        profileErr.includes('401') ||
                        profileErr.includes('403') ||
                        profileErr.includes('token') ||
                        profileErr.includes('Unauthorized') ||
                        profileErr.includes('forbidden')
                    );
                    if (isAuthError) {
                        localStorage.removeItem('token');
                        bookingCache.clear();
                        setError('Your session has expired. Please log in again.');
                    } else {
                        setError(profileErr || 'Could not load your profile. Is the backend running?');
                    }
                    return;
                }
                userId = String(user.id);
                bookingCache.setUserId(userId);
            }

            // ── Step 2: Fire bookings + resources in parallel ──────────────────
            const [bookingsResult, resourcesResult] = await Promise.all([
                fetchBookingsByUser(userId, token),
                fetchAllResources(token),
            ]);

            if (bookingsResult.error) {
                setError(bookingsResult.error);
                return;
            }

            const bookingsData = Array.isArray(bookingsResult.data) ? bookingsResult.data : [];
            const resourcesData = Array.isArray(resourcesResult.data) ? resourcesResult.data : [];

            // Build id → name map
            const map = {};
            resourcesData.forEach((r) => { map[r.resourceId] = r.name; });

            // Persist to SWR cache
            bookingCache.setBookings(bookingsData);
            bookingCache.setResourcesMap(map);
            bookingCache.setResources(resourcesData); // pre-warms the Create Booking dropdown

            // ── FULL-SPECTRUM PRIMING — Pre-populate all facility details ──
            // This ensures every "Swimming Pool", "Lab", etc. is ready INSTANTLY.
            resourcesData.forEach((r) => {
                bookingCache.setResourceDetail(r.resourceId, r);
            });

            // ── DEEP CACHE PRIMING — Pre-populate individual detail caches ──
            // This ensures clicking a card opens the detail page INSTANTLY (0ms wait)
            bookingsData.forEach((b) => {
                bookingCache.setBookingDetail(b.bookingCode, b);
            });

            // ── PREDICTIVE QR FETCHING — Pre-fetch approved booking QR tokens ──
            // Fires in parallel in the background, making approved access instant.
            const approvedBookings = bookingsData.filter(b => b.status === 'APPROVED');
            approvedBookings.forEach(async (b) => {
                // Skip if already in cache
                if (bookingCache.getQrToken(b.bookingCode)) return;
                
                const { data: qrResult } = await fetchBookingQrToken(b.bookingCode, b._links?.['qr-token'], token);
                if (qrResult?.qrToken) {
                    bookingCache.setQrToken(b.bookingCode, qrResult.qrToken);
                }
            });

            // Sync UI state
            setBookings(bookingsData);
            setResourcesMap(map);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Re-run on every navigation to this page
    useEffect(() => {
        const hasCachedData = bookingCache.getBookings() !== null;
        if (hasCachedData) {
            // Instant render from cache → silent background refresh
            load(true);
        } else {
            // First visit → show skeleton
            load(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return {
        bookings,
        resourcesMap,
        isLoading,
        isRefreshing,
        error,
        refresh: () => load(false),
    };
}
