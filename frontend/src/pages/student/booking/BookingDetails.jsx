/**
 * BookingDetails.jsx — Student Booking Detail Page
 *
 * Thin orchestration page.
 * All data-fetching, caching, and HATEOAS navigation live in useBookingDetail().
 * Mutation calls (cancel, update) are delegated to bookingService.
 * Inline error state replaces alert() calls.
 */

import React, { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import {
    FaCalendarAlt, FaClock, FaUsers,
    FaInfoCircle, FaQrcode, FaEdit, FaTrash, FaCheck,
    FaMapMarkerAlt, FaExclamationTriangle
} from 'react-icons/fa';

import { useBookingDetail } from '../../../hooks/useBookingDetail';
import BookingStatusBadge from '../../../components/booking/BookingStatusBadge';
import Toast from '../../../components/booking/Toast';
import {
    cancelBooking,
    updateBooking,
} from '../../../services/bookingService';
import { bookingCache } from '../../../utils/bookingCache';
import { formatTime, formatDate, formatCode } from '../../../utils/formatters';

/* ── Shared input styles for the edit form ─────────────────────────────────── */
const inputCls = 'w-full bg-gray-50 text-gray-800 text-sm px-4 py-3 outline-none border border-gray-200 focus:border-[#f4511e] focus:bg-white transition-colors rounded-none font-semibold';
const labelCls = 'text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1.5';

export default function BookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { booking, resourceDetails, qrToken, isLoading, error, refetch } = useBookingDetail(id);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [actionError, setActionError] = useState('');
    const [toast, setToast] = useState(null);


    // Keep edit form initialised from the live booking object
    const [editForm, setEditForm] = useState(null);

    // When a fresh booking arrives, reset the edit form
    const getEditForm = (b) => b ? {
        resourceId: b.resourceId,
        bookingDate: b.bookingDate,
        startTime: b.startTime,
        endTime: b.endTime,
        purpose: b.purpose,
        expectedAttendees: b.expectedAttendees,
    } : null;

    const currentEditForm = editForm ?? (booking ? getEditForm(booking) : null);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...(prev ?? getEditForm(booking)), [name]: value }));
    };

    const handleSaveChanges = useCallback(async () => {
        if (!currentEditForm) return;

        // ── Validation 1: Time range ───────────────────────────────────────
        if (currentEditForm.startTime >= currentEditForm.endTime) {
            setActionError('End time must be after start time.');
            return;
        }

        // ── Validation 2: Attendees vs max capacity ────────────────────────
        const attendees = parseInt(currentEditForm.expectedAttendees, 10);
        const maxCapacity = resourceDetails?.capacity;
        if (maxCapacity && attendees > maxCapacity) {
            setActionError(`Attendees (${attendees}) exceeds ${resourceDetails.name}'s max capacity of ${maxCapacity} people.`);
            return;
        }

        // ── Validation 3: Attendees must be at least 1 ────────────────────
        if (!attendees || attendees < 1) {
            setActionError('Expected attendees must be at least 1.');
            return;
        }

        // ── Validation 4: Booking date must not be in the past ────────────
        const today = new Date().toISOString().split('T')[0];
        if (currentEditForm.bookingDate < today) {
            setActionError('Reservation date cannot be in the past.');
            return;
        }

        setIsSaving(true);
        setActionError('');
        const token = localStorage.getItem('token');
        const hateoasUpdate = booking._links?.update || booking._links?.self || null;
        const { error: saveErr } = await updateBooking(id, currentEditForm, hateoasUpdate, token);
        if (saveErr) {
            setActionError(saveErr);
            setIsSaving(false);
            return;
        }
        setIsEditing(false);
        setEditForm(null);
        bookingCache.invalidateBookingDetail(id);
        bookingCache.setBookings(null);
        refetch();
        setToast({ type: 'success', message: '✅ Reservation updated successfully!' });
        setIsSaving(false);
    }, [id, currentEditForm, booking, resourceDetails, refetch]);

    const handleCancel = useCallback(async () => {
        if (!window.confirm('Cancel this booking? This action cannot be undone.')) return;
        setIsCancelling(true);
        setActionError('');
        const token = localStorage.getItem('token');
        const hateoasCancel = booking._links?.cancel || null;
        const { error: cancelErr } = await cancelBooking(id, booking.userId, hateoasCancel, token);
        if (cancelErr) {
            setActionError(cancelErr);
            setIsCancelling(false);
            return;
        }
        bookingCache.invalidateBookingDetail(id);
        bookingCache.setBookings(null);
        setToast({ type: 'success', message: '🚫 Booking cancelled successfully.' });
        setTimeout(() => refetch(), 400);
        setIsCancelling(false);
    }, [id, booking, refetch]);

    /* ── Loading screen ───────────────────────────────────────────────── */
    if (isLoading) {
        return (
            <DashboardLayout title="Booking Details" noPadding={true}>
                <div className="relative min-h-screen bg-gray-950 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f4511e]" />
                </div>
            </DashboardLayout>
        );
    }

    /* ── Error / not found screen ─────────────────────────────────────── */
    if (error || !booking) {
        return (
            <DashboardLayout title="Booking Details" noPadding={true}>
                <div className="relative min-h-screen bg-gray-950 flex items-center justify-center p-8">
                    <div className="bg-white/95 backdrop-blur-xl p-12 text-center shadow-2xl border border-white/20 max-w-lg w-full">
                        <FaInfoCircle className="text-5xl text-rose-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase tracking-widest">Access Denied</h2>
                        <p className="text-gray-600 mb-8 font-light leading-relaxed">{error || 'Booking data is unavailable.'}</p>
                        <Link
                            to="/student/booking"
                            className="bg-[#f4511e] hover:bg-[#d84315] text-white px-8 py-3 transition-all font-bold uppercase tracking-widest text-xs inline-block shadow-lg"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const { status, bookingCode, resourceId, resourceName, purpose, expectedAttendees, bookingDate, startTime, endTime, adminDecisionReason } = booking;

    return (
        <DashboardLayout title="Booking Details" noPadding={true}>
            <div className="relative min-h-screen font-sans overflow-hidden bg-gray-950 flex flex-col pt-32">

                {/* ── Background ─────────────────────────────────────── */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[1px] z-0 scale-105"
                    style={{ backgroundImage: "url('/library02.png')" }}
                />
                <div className="absolute inset-0 bg-[#0a1e35]/75 z-10" />

                {/* ── Top nav ────────────────────────────────────────── */}
                <div className="absolute top-0 left-0 z-30 w-full px-8 py-6 bg-black/10 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/student/booking')}
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg transition-all flex items-center gap-2 border border-white/10 group shadow-lg"
                        >
                            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                            <span className="font-bold tracking-widest text-xs uppercase">BACK</span>
                        </button>
                        <div className="h-6 w-[1px] bg-white/20 ml-2" />
                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <span
                                className="text-white/40 cursor-pointer hover:text-white transition-colors"
                                onClick={() => navigate('/student/booking/new')}
                            >
                                New Reservation
                            </span>
                            <span className="text-white/20">/</span>
                            <span className="text-blue-400">Booking Details</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-white/30 tracking-widest uppercase">
                            ID: {formatCode(bookingCode)}
                        </span>
                    </div>
                </div>

                {/* ── Main content ───────────────────────────────────── */}
                <div className="relative z-20 w-full flex flex-col px-8 mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* ═══════════════ LEFT: Main Booking Card ═══════════════ */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            <div className="bg-white/95 backdrop-blur-2xl shadow-[0_45px_100px_rgba(0,0,0,0.6)] border border-white/50 overflow-hidden">

                                {/* Hero banner */}
                                <div className="relative w-full h-60 overflow-hidden bg-[#0d1b2a]">
                                    {resourceDetails?.imageName ? (
                                        <img
                                            src={`http://localhost:8081/uploads/${resourceDetails.imageName}`}
                                            alt={resourceDetails.name}
                                            className="w-full h-full object-cover opacity-75"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center">
                                            <FaMapMarkerAlt className="text-8xl text-white/5" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

                                    {/* Status badge */}
                                    <div className="absolute top-5 right-6 z-10">
                                        <BookingStatusBadge status={status} className="backdrop-blur-sm" />
                                    </div>

                                    {/* Venue name + details */}
                                    <div className="absolute bottom-0 left-0 right-0 px-8 pb-7 z-10">
                                        {resourceDetails?.location && (
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                                                <FaMapMarkerAlt className="opacity-80" />
                                                {resourceDetails.location}
                                            </p>
                                        )}
                                        <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-tight drop-shadow-2xl">
                                            {resourceDetails?.name || resourceName || resourceId}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                                            {resourceDetails?.type && (
                                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{resourceDetails.type}</p>
                                            )}
                                            {resourceDetails?.capacity && (
                                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <FaUsers className="opacity-60" />
                                                    {resourceDetails.capacity} People
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action bar */}
                                {(status === 'PENDING' || status === 'APPROVED') && (
                                    <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-end gap-3 bg-gray-50/60">
                                        {status === 'PENDING' && (
                                            !isEditing ? (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 bg-[#f4511e]/10 text-[#f4511e] hover:bg-[#f4511e] hover:text-white px-8 py-3 border border-[#f4511e]/20 transition-all font-bold uppercase tracking-widest text-[11px] shadow-sm hover:-translate-y-0.5 active:scale-95"
                                                >
                                                    <FaEdit /> Modify Request
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveChanges}
                                                        disabled={isSaving}
                                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 transition-all font-bold uppercase tracking-widest text-[11px] shadow-lg disabled:opacity-50"
                                                    >
                                                        {isSaving ? 'Processing...' : <><FaCheck /> Confirm Revision</>}
                                                    </button>
                                                    <button
                                                        onClick={() => { setIsEditing(false); setEditForm(null); setActionError(''); }}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 font-bold uppercase tracking-widest text-[11px] transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )
                                        )}
                                        {status === 'APPROVED' && (
                                            <button
                                                onClick={handleCancel}
                                                disabled={isCancelling}
                                                className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-8 py-3 border border-rose-100 transition-all font-bold uppercase tracking-widest text-[11px] shadow-sm hover:-translate-y-0.5 active:scale-95"
                                            >
                                                <FaTrash /> Withdraw Access
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Action error */}
                                {actionError && (
                                    <div className="mx-8 mt-4 flex items-start gap-3 bg-rose-50 border border-rose-200 p-4">
                                        <FaExclamationTriangle className="text-rose-500 mt-0.5 shrink-0" />
                                        <p className="text-rose-700 text-sm font-semibold">{actionError}</p>
                                    </div>
                                )}

                                {/* Body */}
                                <div className="p-8">
                                    {isEditing && currentEditForm ? (
                                        /* Edit mode */
                                        <div className="border border-[#f4511e]/25 overflow-hidden shadow-sm">
                                            <div className="px-6 py-3.5 bg-[#f4511e]/5 border-b border-[#f4511e]/10 flex items-center gap-2">
                                                <FaEdit className="text-[#f4511e] text-xs" />
                                                <span className="text-[10px] font-black text-[#f4511e] uppercase tracking-[0.2em]">Modify Reservation Details</span>
                                            </div>
                                            <div className="p-6 bg-white flex flex-col gap-5">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={labelCls}><FaCalendarAlt className="text-[#f4511e] opacity-70" /> Reservation Date</label>
                                                        <input type="date" name="bookingDate" value={currentEditForm.bookingDate} onChange={handleEditChange} required min={new Date().toISOString().split('T')[0]} className={inputCls} />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}><FaClock className="text-[#f4511e] opacity-70" /> Start Time</label>
                                                        <input type="time" name="startTime" value={currentEditForm.startTime} onChange={handleEditChange} required className={inputCls} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={labelCls}><FaClock className="text-[#f4511e] opacity-70" /> End Time</label>
                                                        <input type="time" name="endTime" value={currentEditForm.endTime} onChange={handleEditChange} required className={inputCls} />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}><FaUsers className="text-[#f4511e] opacity-70" /> Expected Attendees</label>
                                                        <input type="number" name="expectedAttendees" value={currentEditForm.expectedAttendees} onChange={handleEditChange} required min="1" className={inputCls} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={labelCls}><FaInfoCircle className="text-[#f4511e] opacity-70" /> Statement of Purpose</label>
                                                    <textarea name="purpose" value={currentEditForm.purpose} onChange={handleEditChange} required rows="4" placeholder="Describe the purpose of this reservation..." className={`${inputCls} resize-none leading-relaxed`} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* View mode */
                                        <div className="flex flex-col gap-5">
                                            {/* Summary bar */}
                                            <div className="bg-gray-50 border border-gray-100 shadow-sm overflow-hidden">
                                                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                                                    <div className="flex-1 px-6 py-5">
                                                        <p className="text-[9px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-2 flex items-center gap-2 opacity-80"><FaCalendarAlt /> Reservation Date</p>
                                                        <p className="text-xl font-bold text-gray-800 tracking-tight">{formatDate(bookingDate)}</p>
                                                    </div>
                                                    <div className="flex-[1.4] px-6 py-5">
                                                        <p className="text-[9px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-2 flex items-center gap-2 opacity-80"><FaClock /> Scheduled Slot</p>
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block">Start Time</span>
                                                                <span className="text-xl font-black text-gray-800 tabular-nums">{formatTime(startTime)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-4">
                                                                <div className="w-4 h-[2px] bg-gray-300 rounded-full" />
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#f4511e] opacity-60" />
                                                                <div className="w-4 h-[2px] bg-gray-300 rounded-full" />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block">End Time</span>
                                                                <span className="text-xl font-black text-gray-800 tabular-nums">{formatTime(endTime)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 px-6 py-5">
                                                        <p className="text-[9px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-2 flex items-center gap-2 opacity-80"><FaUsers /> Attendees</p>
                                                        <div>
                                                            <span className="text-xl font-black text-gray-800">{expectedAttendees}</span>
                                                            <span className="text-gray-400 font-light text-sm ml-1">people</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Purpose */}
                                            <div className="bg-gray-50 p-8 border border-gray-100 shadow-sm">
                                                <p className="text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                                    <FaInfoCircle /> Statement of Purpose
                                                </p>
                                                <p className="text-gray-900 leading-relaxed font-semibold tracking-tight text-lg">{purpose}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ═══════════════ RIGHT: QR Code & Admin Feedback ═══════════════ */}
                        <div className="lg:col-span-4 flex flex-col gap-8">


                            {/* QR Token */}
                            {status === 'APPROVED' && qrToken ? (
                                <div className="bg-[#111e2f]/85 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.6)] border border-white/10 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mt-24 -mr-24 opacity-30" />
                                    <FaQrcode className="text-6xl text-blue-400 mx-auto mb-8 opacity-90" />
                                    <h4 className="text-white text-2xl font-bold tracking-widest uppercase mb-4">Access Token</h4>
                                    <p className="text-white/50 text-[11px] uppercase tracking-widest mb-12 leading-relaxed px-4 font-light">
                                        Digitally generated access credentials. Scan at the facility entry point for automated check-in.
                                    </p>
                                    <div className="bg-white p-8 inline-block rounded-none shadow-2xl group-hover:scale-105 transition-transform duration-700 delay-100">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrToken)}`}
                                            alt="Access QR Code"
                                            className="w-56 h-56"
                                        />
                                    </div>
                                    <div className="mt-12 pt-10 border-t border-white/10">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Digital Signature</p>
                                        <p className="text-[11px] font-mono text-blue-400 bg-black/40 py-4 px-6 break-all leading-relaxed tracking-widest border border-white/5 shadow-inner">
                                            {qrToken}
                                        </p>
                                    </div>
                                </div>
                            ) : status === 'PENDING' ? (
                                <div className="bg-[#111e2f]/85 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.5)] border border-white/10 text-center">
                                    <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <svg className="text-4xl text-amber-500 animate-pulse w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                                    </div>
                                    <h4 className="text-white text-xl font-bold tracking-widest uppercase mb-6">Under Review</h4>
                                    <p className="text-white/80 text-base md:text-lg leading-relaxed font-light tracking-tight">
                                        Your resource requisition is currently being processed by the facility administration.
                                    </p>
                                </div>
                            ) : null}

                            {/* Admin decision remarks */}
                            {adminDecisionReason && (
                                <div className={`p-10 border shadow-2xl backdrop-blur-md relative overflow-hidden ${
                                    status === 'APPROVED' ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : status === 'REJECTED' ? 'bg-rose-500/5 border-rose-500/20'
                                    : 'bg-blue-500/5 border-blue-500/20'
                                }`}>
                                    <div className={`absolute top-0 left-0 w-2 h-full ${
                                        status === 'APPROVED' ? 'bg-emerald-500'
                                        : status === 'REJECTED' ? 'bg-rose-500'
                                        : 'bg-blue-500'
                                    }`} />
                                    <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">Official Remarks</h4>
                                    <p className="text-white leading-relaxed font-light italic text-xl md:text-2xl tracking-tight">
                                        "{adminDecisionReason}"
                                    </p>
                                </div>
                            )}

                            {/* ── HATEOAS API Navigator ─────────────────── */}
                            {booking._links && (() => {
                                const linkMeta = {
                                    self:       { label: 'Self',        desc: 'URL of this booking resource', poweredBy: null,                      icon: '🔗', color: 'text-blue-400' },
                                    update:     { label: 'Update',      desc: 'Modify this reservation',      poweredBy: '↑ Powers "Save Changes"',  icon: '✏️', color: 'text-amber-400' },
                                    cancel:     { label: 'Cancel',      desc: 'Cancel this reservation',      poweredBy: '↑ Powers "Cancel" button',  icon: '🚫', color: 'text-rose-400' },
                                    'qr-token': { label: 'QR Token',    desc: 'Fetch the check-in QR code',   poweredBy: '↑ Powers "View QR" panel',  icon: '📱', color: 'text-purple-400' },
                                    resource:   { label: 'Facility',    desc: 'View the booked facility',     poweredBy: null,                        icon: '🏛️', color: 'text-emerald-400' },
                                    collection: { label: 'All Bookings', desc: 'Return to bookings list',     poweredBy: null,                        icon: '📋', color: 'text-indigo-400' },
                                };
                                return (
                                    <div className="bg-[#06101c] border border-indigo-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">

                                        {/* Header */}
                                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-indigo-900/20">
                                            <div className="flex gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.25em]">
                                                    HATEOAS · API Navigator
                                                </p>
                                                <p className="text-[9px] text-white/30 tracking-wide mt-0.5">
                                                    REST Constraint 4 — Uniform Interface
                                                </p>
                                            </div>
                                        </div>

                                        {/* What is HATEOAS explanation */}
                                        <div className="px-5 py-3.5 bg-indigo-500/5 border-b border-white/5">
                                            <p className="text-[10px] text-indigo-200/70 leading-relaxed">
                                                <span className="text-indigo-300 font-bold">How it works: </span>
                                                The server sends these navigation links inside every API response.
                                                The app follows them dynamically — it never constructs or hardcodes any URL.
                                            </p>
                                        </div>

                                        {/* Link rows */}
                                        <div className="divide-y divide-white/[0.04]">
                                            {Object.entries(booking._links).map(([rel, href]) => {
                                                const meta = linkMeta[rel] || { label: rel, desc: 'API navigation link', icon: '→', color: 'text-gray-400' };
                                                return (
                                                    <div key={rel} className="flex items-center gap-3 px-5 py-3 group hover:bg-white/[0.03] transition-colors">
                                                        {/* Icon */}
                                                        <span className="text-sm w-6 text-center shrink-0">{meta.icon}</span>
                                                        {/* Label + description */}
                                                        <div className="w-28 shrink-0">
                                                            <p className={`text-[10px] font-black uppercase tracking-widest ${meta.color}`}>{meta.label}</p>
                                                            <p className="text-[9px] text-white/30 mt-0.5 leading-tight">{meta.desc}</p>
                                                            {meta.poweredBy && (
                                                                <p className="text-[8px] font-bold text-emerald-400/70 mt-1">
                                                                    {meta.poweredBy}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {/* URL */}
                                                        <p className="text-[9px] font-mono text-white/30 group-hover:text-indigo-300/70 transition-colors break-all leading-relaxed flex-1">
                                                            {href}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Footer */}
                                        <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                                            <p className="text-[9px] text-white/20 leading-relaxed">
                                                <span className="text-indigo-400/60 font-bold">RFC 8288 Web Linking</span>
                                                {' · '}These links are also sent in HTTP{' '}
                                                <span className="font-mono text-white/30">Link:</span> response headers,
                                                enabling any HTTP client to discover and navigate the API without documentation.
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                    </div>
                </div>

                {/* ── Footer ─────────────────────────────────────────── */}
                <div className="absolute bottom-8 left-0 w-full z-20 text-center px-4">
                    <p className="text-white/40 text-[10px] tracking-widest font-bold uppercase opacity-50">
                        © 2026 CampusNexus Hub. All Rights Reserved
                    </p>
                </div>
            </div>
            <Toast toast={toast} onClose={() => setToast(null)} />
        </DashboardLayout>
    );
}
