/**
 * useBookingDetail.js — Single Booking Detail Hook
 *
 * Encapsulates: booking fetch, resource detail fetch, QR token fetch,
 * HATEOAS link following, SWR cache hydration, loading & error state.
 *
 * Returns everything a BookingDetails page needs without a single
 * `fetch` call or `useEffect` inside the page component.
 */

import { useState, useEffect, useCallback } from 'react';
import { bookingCache } from '../utils/bookingCache';
import {
    fetchBookingById,
    fetchResourceById,
    fetchBookingQrToken,
} from '../services/bookingService';

/**
 * @param {string} bookingCode  — URL param (booking ID / code)
 * @returns {{
 *   booking: Object|null,
 *   resourceDetails: Object|null,
 *   qrToken: string|null,
 *   isLoading: boolean,
 *   error: string,
 *   refetch: () => void
 * }}
 */
export function useBookingDetail(bookingCode) {
    const [booking, setBooking] = useState(() => bookingCache.getBookingDetail(bookingCode));
    const [resourceDetails, setResourceDetails] = useState(() => {
        const cached = bookingCache.getBookingDetail(bookingCode);
        return cached?.resourceId ? bookingCache.getResourceDetail(cached.resourceId) : null;
    });
    const [qrToken, setQrToken] = useState(null);
    const [isLoading, setIsLoading] = useState(!bookingCache.getBookingDetail(bookingCode));
    const [error, setError] = useState('');

    const fetchAll = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Not authenticated.');
            setIsLoading(false);
            return;
        }

        // Only show full-page skeleton on first-ever load
        if (!bookingCache.getBookingDetail(bookingCode)) setIsLoading(true);

        const { data, error: bookingErr } = await fetchBookingById(bookingCode, token);
        if (bookingErr || !data) {
            setError(bookingErr || 'Booking not found.');
            setIsLoading(false);
            return;
        }

        // Persist booking and update state
        bookingCache.setBookingDetail(bookingCode, data);
        setBooking(data);

        // ── Follow HATEOAS _links for downstream requests ──────────────────
        // The server controls URLs — client navigates via provided links
        // (Uniform Interface — REST Constraint 4 / RFC 8288 Web Linking).
        const links = data._links || {};
        const resourceHateoasPath = links.resource || null;
        const qrHateoasPath = links['qr-token'] || null;

        // ── Resource detail — prefer SWR cache ────────────────────────────
        const cachedResource = bookingCache.getResourceDetail(data.resourceId);

        // ── QR token — only fetch for APPROVED bookings ───────────────────
        const qrPromise = data.status === 'APPROVED'
            ? fetchBookingQrToken(bookingCode, qrHateoasPath, token)
            : Promise.resolve({ data: null, error: null });

        // Always fetch the resource directly by ID — the HATEOAS path (/resources/{id})
        // cannot be passed to fetchBookingById (which builds /api/bookings/... URLs).
        const resourcePromise = cachedResource
            ? Promise.resolve({ data: cachedResource, error: null })
            : fetchResourceById(data.resourceId, token);

        const [resourceResult, qrResult] = await Promise.all([resourcePromise, qrPromise]);

        if (!cachedResource && resourceResult.data) {
            bookingCache.setResourceDetail(data.resourceId, resourceResult.data);
            setResourceDetails(resourceResult.data);
        } else if (cachedResource) {
            setResourceDetails(cachedResource);
        }

        if (qrResult.data?.qrToken) {
            setQrToken(qrResult.data.qrToken);
        }

        setIsLoading(false);
        setError('');
    }, [bookingCode]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        booking,
        resourceDetails,
        qrToken,
        isLoading,
        error,
        refetch: fetchAll,
    };
}
