/**
 * AdminBookingReview.jsx — Admin Review & Decision Page
 *
 * Thin orchestration page.
 * Data-fetching and mutations delegated to bookingService.
 * Admin identity extracted from JWT token (not hardcoded).
 * Inline error state replaces alert() calls.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { formatTime, formatDate, formatCode } from '../../../utils/formatters';
import Toast from '../../../components/booking/Toast';

import {
    fetchAdminBookingReview,
    approveBooking,
    rejectBooking,
    getAdminIdFromToken,
} from '../../../services/bookingService';

export default function AdminBookingReview() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminReason, setAdminReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetchAdminBookingReview(id, token).then(({ data, error: fetchErr }) => {
            if (fetchErr) setError(fetchErr);
            else setReviewData(data);
            setLoading(false);
        });
    }, [id]);

    const handleAction = async (actionType) => {
        if (actionType === 'REJECT' && !adminReason.trim()) {
            setActionError('A reason must be provided when rejecting a booking.');
            return;
        }

        setSubmitting(true);
        setActionError('');

        const token = localStorage.getItem('token');
        // Extract admin identity from JWT — no hardcoded "SystemAdmin"
        const adminId = getAdminIdFromToken();

        const { error: actionErr } = actionType === 'APPROVE'
            ? await approveBooking(id, adminId, adminReason, token)
            : await rejectBooking(id, adminId, adminReason, token);

        if (actionErr) {
            setActionError(actionErr);
            setSubmitting(false);
            return;
        }

        const msg = actionType === 'APPROVE'
            ? '✅ Booking approved! Student has been notified.'
            : '❌ Booking rejected. Student has been notified.';
        setToast({ type: 'success', message: msg });
        setTimeout(() => navigate('/admin/booking'), 1600);
    };

    /* ── Loading ──────────────────────────────────────────────────────── */
    if (loading) return (
        <DashboardLayout title="Reviewing Booking" hideHeader hideSidebar noPadding>
            <div className="min-h-screen bg-[#0a0f1c] flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500" />
            </div>
        </DashboardLayout>
    );

    /* ── Error ────────────────────────────────────────────────────────── */
    if (error || !reviewData) return (
        <DashboardLayout title="Error" hideHeader hideSidebar noPadding>
            <div className="min-h-screen bg-[#0a0f1c] flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl text-rose-500 mb-4">{error || 'Data not found'}</h2>
                <Link to="/admin/booking" className="px-6 py-2 bg-indigo-600 rounded">Go Back</Link>
            </div>
        </DashboardLayout>
    );

    const { bookingDetails, overlappingBookings, canApprove } = reviewData;

    return (
        <DashboardLayout title="Review Booking" hideHeader hideSidebar noPadding>
            <div className="min-h-screen bg-transparent py-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-indigo-900/30 blur-3xl mix-blend-screen pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <Link to="/admin/booking" className="inline-flex items-center gap-2 text-indigo-400 hover:text-white font-bold text-xs uppercase tracking-widest mb-8 transition-colors">
                        <FaArrowLeft /> Back to Log
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-10 drop-shadow-md">
                        Review Protocol:{' '}
                        <span className="text-indigo-400">{formatCode(bookingDetails.bookingCode)}</span>
                    </h1>

                    {/* ── Request profile ──────────────────────────── */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl mb-8">
                        <h2 className="text-lg font-bold text-gray-300 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                            Request Profile
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resource ID</p>
                                <p className="text-xl font-mono">{bookingDetails.resourceId}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Requested By</p>
                                <p className="text-xl font-mono">{bookingDetails.userId}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date & Time</p>
                                <p className="text-lg">
                                    {formatDate(bookingDetails.bookingDate)} | {formatTime(bookingDetails.startTime)} - {formatTime(bookingDetails.endTime)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Est. Attendees</p>
                                <p className="text-lg">{bookingDetails.expectedAttendees || 'Not specified'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Statement of Purpose</p>
                                <div className="bg-black/20 rounded-lg p-4 border border-white/5 text-gray-300">
                                    {bookingDetails.purpose}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Conflict warning ─────────────────────────── */}
                    {overlappingBookings && overlappingBookings.length > 0 && (
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 shadow-2xl mb-8">
                            <div className="flex items-center gap-3 text-rose-400 mb-4">
                                <FaExclamationTriangle className="text-2xl" />
                                <h3 className="text-lg font-black uppercase tracking-widest">Schedule Conflict Detected</h3>
                            </div>
                            <p className="text-rose-200 text-sm mb-4">
                                The following approved bookings overlap with this time slot:
                            </p>
                            <ul className="list-disc pl-6 text-rose-300 text-sm font-mono space-y-1">
                                    {overlappingBookings.map((ob) => (
                                        <li key={ob.bookingCode}>
                                            {formatCode(ob.bookingCode)} | {formatTime(ob.startTime)} - {formatTime(ob.endTime)}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}

                    {/* ── Decision section ─────────────────────────── */}
                    {bookingDetails.status === 'PENDING' ? (
                        <div className="bg-indigo-900/20 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-8 shadow-2xl">
                            <h3 className="text-lg font-bold text-indigo-300 uppercase tracking-widest mb-6 border-b border-indigo-500/20 pb-4">
                                Admin Decision
                            </h3>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Remarks / Justification
                                </label>
                                <textarea
                                    className="w-full bg-black/40 border border-indigo-500/30 rounded-lg p-4 text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all font-sans"
                                    rows="3"
                                    placeholder="Enter reason for approval or rejection..."
                                    value={adminReason}
                                    onChange={(e) => { setAdminReason(e.target.value); setActionError(''); }}
                                />
                            </div>

                            {/* Inline action error */}
                            {actionError && (
                                <div className="mb-4 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                                    <FaExclamationTriangle className="text-rose-400 mt-0.5 shrink-0" />
                                    <p className="text-rose-300 text-sm font-semibold">{actionError}</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleAction('APPROVE')}
                                    disabled={submitting || !canApprove}
                                    className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                                        canApprove
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <FaCheckCircle className="text-lg" />
                                    {submitting ? 'Processing...' : 'Authorize Access'}
                                </button>
                                <button
                                    onClick={() => handleAction('REJECT')}
                                    disabled={submitting}
                                    className="flex-1 flex justify-center items-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition-all"
                                >
                                    <FaTimesCircle className="text-lg" />
                                    {submitting ? 'Processing...' : 'Deny Request'}
                                </button>
                            </div>
                            {!canApprove && (
                                <p className="text-rose-400 text-xs text-center mt-4">
                                    Approval disabled due to scheduling conflicts.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-400">
                            This booking has already been processed and is currently marked as{' '}
                            <span className="font-bold text-white">{bookingDetails.status}</span>.
                        </div>
                    )}
                </div>
            </div>
            <Toast toast={toast} onClose={() => setToast(null)} />
        </DashboardLayout>
    );
}
