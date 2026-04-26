/**
 * bookingService.js — Booking Data Access Layer
 *
 * All HTTP interactions for the Booking module live here.
 * Each function is a pure async function that:
 *   - Accepts required data as parameters
 *   - Returns { data, error } so callers can handle both success/failure
 *   - Never touches React state — that is the hook's responsibility
 *
 * Pages and hooks import from this service.
 * They never call `fetch` directly.
 */

import { ENDPOINTS } from '../constants/api';

// ── Internal helper ─────────────────────────────────────────────────────────
const authHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    'cache-control': 'no-store',
});

const jsonHeaders = (token) => ({
    ...authHeaders(token),
    'Content-Type': 'application/json',
});

async function handleResponse(response) {
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let message = `Request failed (HTTP ${response.status})`;
        try {
            const json = JSON.parse(text);
            message = json.message || message;
        } catch (_) {
            if (text) message = text;
        }
        return { data: null, error: message };
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        const data = await response.json();
        return { data, error: null };
    }
    const text = await response.text();
    return { data: text, error: null };
}

// ── Decodes the sub/email claim from a JWT token stored in localStorage ──────
export function getAdminIdFromToken() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return 'SystemAdmin';
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.email || payload.name || 'SystemAdmin';
    } catch (_) {
        return 'SystemAdmin';
    }
}

// ── Profile ──────────────────────────────────────────────────────────────────
export async function fetchUserProfile(token) {
    try {
        const res = await fetch(ENDPOINTS.userProfile(), { headers: authHeaders(token), cache: 'no-store' });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error. Is the backend running?' };
    }
}

// ── Resources ────────────────────────────────────────────────────────────────
export async function fetchAllResources(token) {
    try {
        const res = await fetch(ENDPOINTS.allResources(), { headers: authHeaders(token), cache: 'no-store' });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error fetching resources.' };
    }
}

export async function fetchResourceById(resourceId, token) {
    try {
        const res = await fetch(ENDPOINTS.resourceById(resourceId), { headers: authHeaders(token), cache: 'no-store' });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error fetching resource details.' };
    }
}

// ── Student Bookings ─────────────────────────────────────────────────────────
export async function fetchBookingsByUser(userId, token) {
    try {
        const res = await fetch(ENDPOINTS.bookingsByUser(userId), { headers: authHeaders(token), cache: 'no-store' });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error fetching bookings.' };
    }
}

export async function fetchBookingById(bookingCode, token) {
    try {
        const res = await fetch(ENDPOINTS.bookingById(bookingCode), { headers: authHeaders(token), cache: 'no-store' });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error fetching booking details.' };
    }
}

export async function fetchBookingQrToken(bookingCode, hateoasPath, token) {
    // Prefer HATEOAS-provided path if available (Uniform Interface — REST Constraint 4)
    const url = hateoasPath
        ? `http://localhost:8081${hateoasPath}`
        : ENDPOINTS.bookingQrToken(bookingCode);
    try {
        const res = await fetch(url, { headers: authHeaders(token), cache: 'no-store' });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error fetching QR token.' };
    }
}

export async function createBooking(payload, token) {
    try {
        const res = await fetch(ENDPOINTS.createBooking(), {
            method: 'POST',
            headers: jsonHeaders(token),
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error submitting booking.' };
    }
}

export async function updateBooking(bookingCode, editForm, hateoasPath, token) {
    const url = hateoasPath
        ? `http://localhost:8081${hateoasPath}`
        : ENDPOINTS.updateBooking(bookingCode);
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: jsonHeaders(token),
            body: JSON.stringify(editForm),
        });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error updating booking.' };
    }
}

export async function cancelBooking(bookingCode, userId, hateoasPath, token) {
    const url = hateoasPath
        ? `http://localhost:8081${hateoasPath}?cancelledBy=${userId}`
        : ENDPOINTS.cancelBooking(bookingCode, userId);
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: authHeaders(token),
        });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error cancelling booking.' };
    }
}

// ── Admin Bookings ───────────────────────────────────────────────────────────
export async function fetchAdminBookings(token) {
    try {
        const res = await fetch(ENDPOINTS.adminAllBookings(), { headers: authHeaders(token), cache: 'no-store' });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error fetching admin bookings.' };
    }
}

export async function fetchAdminBookingReview(bookingCode, token) {
    try {
        const res = await fetch(ENDPOINTS.adminBookingReview(bookingCode), { headers: authHeaders(token) });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error fetching review details.' };
    }
}

export async function approveBooking(bookingCode, adminId, reason, token) {
    try {
        const url = ENDPOINTS.adminApproveBooking(encodeURIComponent(bookingCode));
        const res = await fetch(url, {
            method: 'PATCH',
            headers: jsonHeaders(token),
            body: JSON.stringify({
                adminDecisionReason: reason !== undefined && reason !== null ? reason : 'Approved standard request',
                approvedBy: adminId,
            }),
        });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error approving booking.' };
    }
}

export async function rejectBooking(bookingCode, adminId, reason, token) {
    try {
        const url = ENDPOINTS.adminRejectBooking(encodeURIComponent(bookingCode));
        const res = await fetch(url, {
            method: 'PATCH',
            headers: jsonHeaders(token),
            body: JSON.stringify({
                adminDecisionReason: reason,
                rejectedBy: adminId,
            }),
        });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error rejecting booking.' };
    }
}

export async function verifyQrToken(qrToken, adminId, token) {
    try {
        const res = await fetch(ENDPOINTS.adminVerifyQr(), {
            method: 'POST',
            headers: jsonHeaders(token),
            body: JSON.stringify({ qrToken, scannedByAdminId: adminId }),
        });
        return handleResponse(res);
    } catch (err) {
        return { data: null, error: 'Network error during QR verification.' };
    }
}
