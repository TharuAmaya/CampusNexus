/**
 * BookingDetails.jsx — Student Booking Detail Page
 *
 * Thin orchestration page.
 * All data-fetching, caching, and HATEOAS navigation live in useBookingDetail().
 * Mutation calls (cancel, update) are delegated to bookingService.
 * Inline error state replaces alert() calls.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { QRCodeSVG } from 'qrcode.react';
import {
    FaCalendarAlt, FaClock, FaUsers,
    FaInfoCircle, FaQrcode, FaEdit, FaTrash, FaCheck,
    FaMapMarkerAlt, FaExclamationTriangle, FaDownload,
    FaUserGraduate, FaIdCard
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
    const qrRef = useRef(null);

    const handleDownloadQR = () => {
        if (!qrRef.current) return;

        // Try finding SVG first (for generated QR)
        const svgEl = qrRef.current.querySelector('svg');
        // Try finding IMG second (for legacy/base64 QR)
        const imgEl = qrRef.current.querySelector('img');

        if (!svgEl && !imgEl) {
            console.error('No QR element found to download');
            return;
        }

        const bookingName = booking?.bookingCode || id;

        // Case 1: Already an Image (likely data:image)
        if (imgEl && imgEl.src.startsWith('data:image')) {
            const downloadLink = document.createElement('a');
            downloadLink.href = imgEl.src;
            downloadLink.download = `QR-${bookingName}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            return;
        }

        // Case 2: SVG (Needs canvas conversion)
        if (svgEl) {
            const svgData = new XMLSerializer().serializeToString(svgEl);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const targetSize = 500;
                const padding = 50;
                const canvas = document.createElement('canvas');
                canvas.width = targetSize;
                canvas.height = targetSize;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const qrDrawSize = targetSize - (padding * 2);
                ctx.drawImage(img, padding, padding, qrDrawSize, qrDrawSize);

                const pngUrl = canvas.toDataURL('image/png', 1.0);
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `QR-${bookingName}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                URL.revokeObjectURL(url);
            };
            img.src = url;
            return;
        }

        // Case 3: Image with external URL (rare but possible)
        if (imgEl) {
            const downloadLink = document.createElement('a');
            downloadLink.href = imgEl.src;
            downloadLink.download = `QR-${bookingName}.png`;
            downloadLink.target = "_blank"; // Fallback
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };


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

    const { status, bookingCode, resourceId, resourceName, purpose, expectedAttendees, bookingDate, startTime, endTime, adminDecisionReason, studentName, studentRegNumber } = booking || {};

    return (
        <DashboardLayout title="Booking Details" noPadding={true}>
            <div className="relative min-h-screen font-sans overflow-hidden bg-gray-950 flex flex-col pt-32">

                {/* ── Background (Loads Instantly) ──────────────────── */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[1px] z-0 scale-105 transition-opacity duration-700"
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
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-70">
                                                    <div>
                                                        <label className={labelCls}><FaUserGraduate className="text-gray-400" /> Student Name </label>
                                                        <input type="text" value={studentName || 'Anonymous'} disabled className={`${inputCls} bg-gray-50 border-gray-100 cursor-not-allowed`} title="Identity cannot be modified" />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}><FaIdCard className="text-gray-400" /> Registration Number</label>
                                                        <input type="text" value={studentRegNumber || '—'} disabled className={`${inputCls} bg-gray-50 border-gray-100 cursor-not-allowed`} title="Identity cannot be modified" />
                                                    </div>
                                                </div>

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
                                        <div className="flex flex-col gap-6">

                                            {/* Student Identity Card */}
                                            <div className="bg-[#f4511e]/5 p-6 border border-[#f4511e]/10 shadow-sm flex items-center gap-5">
                                                <div className="w-14 h-14 bg-[#f4511e] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                                    <FaUserGraduate className="text-white text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#f4511e] mb-1 opacity-80">Reserved By</p>
                                                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">{studentName || 'Anonymous'}</h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 font-bold rounded uppercase tracking-widest">{studentRegNumber || '—'}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Official Registration</span>
                                                    </div>
                                                </div>
                                            </div>

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

                        {/* ═══════════════ RIGHT: Status Feedback & QR ═══════════════ */}
                        <div className="lg:col-span-4 flex flex-col gap-8">

                            {/* 1. STATUS FEEDBACK (Immediate Skeleton / Content) */}
                            {!booking ? (
                                <div className="bg-[#111e2f]/85 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.5)] border border-white/5 text-center relative overflow-hidden animate-pulse">
                                    <div className="w-24 h-24 bg-white/5 rounded-full mx-auto mb-8" />
                                    <div className="h-6 bg-white/10 w-32 mx-auto mb-4 rounded" />
                                    <div className="h-4 bg-white/5 w-48 mx-auto rounded" />
                                </div>
                            ) : status === 'PENDING' ? (
                                <div className="bg-[#111e2f]/85 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.5)] border border-amber-500/20 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/30" />
                                    <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                                        <svg className="text-4xl text-amber-500 animate-pulse w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-white text-xl font-black tracking-widest uppercase mb-6">Under Review</h4>
                                    <p className="text-white/80 text-base md:text-lg leading-relaxed font-light tracking-tight">
                                        Your resource requisition is currently being processed by the facility administration.
                                    </p>
                                </div>
                            ) : status === 'REJECTED' ? (
                                <div className="bg-[#111e2f]/85 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.5)] border border-rose-500/20 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/30" />
                                    <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <FaExclamationTriangle className="text-4xl text-rose-500" />
                                    </div>
                                    <h4 className="text-white text-xl font-black tracking-widest uppercase mb-6">Request Declined</h4>
                                    <p className="text-white/80 text-base md:text-lg leading-relaxed font-light tracking-tight">
                                        This reservation request has been rejected by the administration. Please see the remarks below.
                                    </p>
                                </div>
                            ) : status === 'CANCELLED' ? (
                                <div className="bg-[#111e2f]/85 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.5)] border border-gray-500/20 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-500/30" />
                                    <div className="w-24 h-24 bg-gray-500/10 border border-gray-100/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <FaTrash className="text-4xl text-gray-400" />
                                    </div>
                                    <h4 className="text-white text-xl font-black tracking-widest uppercase mb-6">Withdrawn</h4>
                                    <p className="text-white/80 text-base md:text-lg leading-relaxed font-light tracking-tight">
                                        This reservation has been cancelled and is no longer active in the campus schedule.
                                    </p>
                                </div>
                            ) : status === 'APPROVED' ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 flex items-center gap-4 mb-2">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                                        <FaCheck className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Reservation Active</p>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">Confirmed Access Granted</p>
                                    </div>
                                </div>
                            ) : null}

                            {/* 2. ACCESS QR CODE (Lazy Load but non-blocking) */}
                            {status === 'APPROVED' && (
                                <div className="bg-[#111e2f]/85 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.6)] border border-white/10 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mt-24 -mr-24 opacity-30" />
                                    <FaQrcode className="text-6xl text-blue-400 mx-auto mb-8 opacity-90" />
                                    <h4 className="text-white text-2xl font-black uppercase tracking-widest mb-4">Access QR Code</h4>

                                    {!qrToken ? (
                                        <div className="flex flex-col items-center py-12">
                                            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
                                            <p className="text-blue-400/60 text-[10px] uppercase font-black tracking-widest animate-pulse">
                                                SYNCHRONIZING SECURE KEY...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in shadow-2xl">
                                            <p className="text-white/50 text-[11px] uppercase tracking-widest mb-8 leading-relaxed px-4 font-light">
                                                Scan at the facility entry point for automated check-in.
                                            </p>

                                            <div ref={qrRef} className="bg-white p-6 inline-block rounded-xl">
                                                {qrToken?.startsWith('data:image') ? (
                                                    <img src={qrToken} alt="Access QR Code" width={200} height={200} className="rounded-md" />
                                                ) : (
                                                    <QRCodeSVG
                                                        value={`${window.location.origin}/verify-booking/${qrToken || booking.qrToken}`}
                                                        size={200}
                                                        bgColor="#ffffff"
                                                        fgColor="#07101e"
                                                        level="H"
                                                        includeMargin={false}
                                                    />
                                                )}
                                            </div>

                                            <div className="mt-8">
                                                <button
                                                    onClick={handleDownloadQR}
                                                    className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl hover:-translate-y-1.5 active:scale-95"
                                                >
                                                    <FaDownload className="text-base" />
                                                    <span>Download QR</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. OFFICIAL REMARKS (Strict Authenticity: Admin Reason Only) */}
                            {!booking ? (
                                <div className="p-10 bg-white/5 border border-white/10 shadow-2xl animate-pulse">
                                    <div className="h-3 bg-white/10 w-24 mb-6 rounded" />
                                    <div className="h-6 bg-white/5 w-full mb-3 rounded" />
                                    <div className="h-6 bg-white/5 w-2/3 rounded" />
                                </div>
                            ) : (status === 'APPROVED' || status === 'REJECTED') && adminDecisionReason && (
                                <div className={`p-10 border shadow-2xl backdrop-blur-md relative overflow-hidden mt-4 ${status === 'APPROVED' ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-rose-500/5 border-rose-500/20'
                                    } animate-fade-in`}>
                                    <div className={`absolute top-0 left-0 w-2 h-full ${status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`} />

                                    <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6">
                                        {status === 'APPROVED' ? 'Official Approval Notice' : 'Institutional Rejection Reason'}
                                    </h4>

                                    <p className="text-white leading-relaxed font-light italic text-xl md:text-2xl tracking-tight">
                                        "{adminDecisionReason}"
                                    </p>
                                </div>
                            )}

                            {/* 4. API METADATA (Immediate Skeleton / Content) */}
                            {!booking ? (
                                <div className="bg-[#06101c]/50 border border-white/5 rounded-2xl p-6 animate-pulse">
                                    <div className="h-3 bg-white/10 w-32 mb-6 rounded" />
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4 mb-4">
                                            <div className="w-4 h-4 bg-white/10 rounded" />
                                            <div className="h-3 bg-white/5 w-24 rounded" />
                                            <div className="h-3 bg-white/5 w-32 rounded ml-auto" />
                                        </div>
                                    ))}
                                </div>
                            ) : booking._links && (() => {
                                const linkMeta = {
                                    self: { label: 'Self', desc: 'Resource URI', icon: '🔗', color: 'text-blue-400' },
                                    update: { label: 'Update', desc: 'Mutation Path', icon: '✏️', color: 'text-amber-400' },
                                    cancel: { label: 'Cancel', desc: 'Termination Path', icon: '🚫', color: 'text-rose-400' },
                                    'qr-token': { label: 'QR Key', desc: 'Security Token', icon: '📱', color: 'text-purple-400' },
                                    resource: { label: 'Ref', desc: 'Linked Facility', icon: '🏛️', color: 'text-emerald-400' },
                                    collection: { label: 'Root', desc: 'Booking Index', icon: '📋', color: 'text-indigo-400' },
                                };
                                return (
                                    <div className="bg-[#06101c]/50 border border-indigo-500/10 rounded-2xl overflow-hidden shadow-2xl mt-4">
                                        <div className="px-5 py-3 border-b border-white/5 bg-indigo-900/10 flex justify-between items-center">
                                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">HATEOAS Navigator</p>
                                            <span className="text-[8px] text-indigo-400/50 uppercase font-bold tracking-widest">v1.2 Secure</span>
                                        </div>
                                        <div className="divide-y divide-white/[0.04]">
                                            {Object.entries(booking._links).map(([rel, href]) => {
                                                const meta = linkMeta[rel] || { label: rel, desc: 'Link', icon: '→', color: 'text-gray-400' };
                                                return (
                                                    <div key={rel} className="px-5 py-2.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors group">
                                                        <span className="text-xs w-4">{meta.icon}</span>
                                                        <div className="w-24 shrink-0">
                                                            <p className={`text-[10px] font-black uppercase tracking-widest ${meta.color}`}>{meta.label}</p>
                                                        </div>
                                                        <p className="text-sm font-mono text-cyan-300 font-bold group-hover:text-white transition-colors truncate flex-1 drop-shadow-[0_0_8px_rgba(103,232,249,0.3)]">{typeof href === 'string' ? href : href.href}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="px-6 py-4 border-t border-white/5 bg-black/40">
                                            <p className="text-[11px] text-white/60 leading-relaxed font-bold">
                                                <span className="text-sky-400 font-black mr-2 tracking-widest underline decoration-sky-400/30 underline-offset-4">RFC 8288</span>
                                                Server-driven state transition metadata.
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
