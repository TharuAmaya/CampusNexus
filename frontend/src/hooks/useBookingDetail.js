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
        const cachedBooking = bookingCache.getBookingDetail(bookingCode);
        return cachedBooking?.resourceId ? bookingCache.getResourceDetail(cachedBooking.resourceId) : null;
    });
    const [qrToken, setQrToken] = useState(() => bookingCache.getQrToken(bookingCode));
    
    // STARTING STATE: If we have cached data (primed by dashboard), don't show the full spinner.
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

        // ── Step 1: Core Booking Data ──
        const { data: freshBooking, error: bookingErr } = await fetchBookingById(bookingCode, token);
        
        if (bookingErr || !freshBooking) {
            setError(bookingErr || 'Booking not found.');
            setIsLoading(false);
            return;
        }

        // ── Step 2: Background Hydration (Resource & QR) ──
        // Start QR fetch if approved
        let qrPromise = (freshBooking.status === 'APPROVED')
            ? fetchBookingQrToken(bookingCode, freshBooking._links?.['qr-token'], token)
            : null;

        // Start Resource fetch if we don't have it or it's different
        const existingResource = bookingCache.getResourceDetail(freshBooking.resourceId);
        let resourcePromise = (!existingResource)
            ? fetchResourceById(freshBooking.resourceId, token)
            : null;

        // Fetch remaining details in parallel
        const [resourceResult, qrResult] = await Promise.all([
            resourcePromise || Promise.resolve({ data: existingResource }),
            qrPromise || Promise.resolve({ data: null })
        ]);

        // ── Final Step: Unified State Update ──
        // We update EVERYTHING in one go to prevent 'staggered' UI loading
        if (resourceResult?.data) {
            bookingCache.setResourceDetail(freshBooking.resourceId, resourceResult.data);
            setResourceDetails(resourceResult.data);
        }

        if (qrResult?.data?.qrToken) {
            setQrToken(qrResult.data.qrToken);
        }

        bookingCache.setBookingDetail(bookingCode, freshBooking);
        setBooking(freshBooking);
        
        // UNLOCK UI: Everything is now ready for a unified render
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
