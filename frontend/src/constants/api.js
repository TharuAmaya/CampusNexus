/**
 * api.js — Central API configuration
 *
 * All endpoint URLs live here. Pages, hooks, and services
 * import from this file — never hardcode "http://localhost:8081".
 *
 * In production, override BASE_URL via an environment variable:
 *   VITE_API_BASE_URL=https://your-prod-api.com
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const ENDPOINTS = {
    // ── Auth / Profile ─────────────────────────────────────────────────
    userProfile: () => `${BASE_URL}/api/user/profile`,

    // ── Student Bookings ────────────────────────────────────────────────
    bookingsByUser: (userId) => `${BASE_URL}/api/bookings?userId=${userId}`,
    bookingById: (id) => `${BASE_URL}/api/bookings/${id}`,
    createBooking: () => `${BASE_URL}/api/bookings`,
    cancelBooking: (id, userId) => `${BASE_URL}/api/bookings/${id}?cancelledBy=${userId}`,
    updateBooking: (id) => `${BASE_URL}/api/bookings/${id}`,
    bookingQrToken: (id) => `${BASE_URL}/api/bookings/${id}/qr`,

    // ── Resources ───────────────────────────────────────────────────────
    allResources: () => `${BASE_URL}/resources`,
    resourceById: (id) => `${BASE_URL}/resources/${id}`,
    resourceImage: (imageName) => `${BASE_URL}/uploads/${imageName}`,

    // ── Admin Bookings ──────────────────────────────────────────────────
    adminAllBookings: () => `${BASE_URL}/api/admin/bookings`,
    adminBookingReview: (id) => `${BASE_URL}/api/admin/bookings/${id}/review`,
    adminApproveBooking: (id) => `${BASE_URL}/api/admin/bookings/${id}/approve`,
    adminRejectBooking: (id) => `${BASE_URL}/api/admin/bookings/${id}/reject`,
    adminVerifyQr: () => `${BASE_URL}/api/admin/bookings/verify-qr`,
};
