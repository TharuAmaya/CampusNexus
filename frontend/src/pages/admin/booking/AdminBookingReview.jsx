/**
 * AdminBookingReview.jsx — Admin Review & Decision Page
 *
 * Thin orchestration page. Data-fetching via Promise.all.
 * Admin identity from JWT. Inline error state.
 * Supports: initial PENDING decision + override for APPROVED/REJECTED.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import {
    FaArrowLeft, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
    FaCalendarAlt, FaClock, FaBuilding, FaFileAlt,
    FaHourglassHalf, FaBan, FaCheck, FaRedoAlt, FaQrcode, FaUserGraduate,
    FaEdit,
} from 'react-icons/fa';
import { formatTime, formatDate, formatCode } from '../../../utils/formatters';
import Toast from '../../../components/booking/Toast';
import {
    fetchAdminBookingReview,
    approveBooking,
    rejectBooking,
    getAdminIdFromToken,
    fetchAllResources,
} from '../../../services/bookingService';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const STATUS_STYLE = {
    APPROVED: { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: 'rgba(16,185,129,0.4)', icon: <FaCheck /> },
    REJECTED: { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: 'rgba(239,68,68,0.4)', icon: <FaBan /> },
    CANCELLED: { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af', border: 'rgba(107,114,128,0.4)', icon: <FaBan /> },
    PENDING: { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: 'rgba(245,158,11,0.4)', icon: <FaHourglassHalf /> },
};

function InfoCard({ label, icon, accent, children, span2 = false }) {
    return (
        <div
            className={`rounded-2xl p-6 relative overflow-hidden ${span2 ? 'md:col-span-2' : ''}`}
            style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}
        >
            <p className="text-[10px] font-black uppercase tracking-[0.22em] flex items-center gap-2 mb-3"
                style={{ color: accent }}>
                {icon}
                {label}
            </p>
            {children}
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function AdminBookingReview() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [reviewData, setReviewData] = useState(null);
    const [resourcesMap, setResourcesMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminReason, setAdminReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState('');
    const [toast, setToast] = useState(null);
    const [showOverride, setShowOverride] = useState(false); // for already-processed bookings
    const [isEditingRemarks, setIsEditingRemarks] = useState(false); // Premium Quick Edit
    const [tempRemarks, setTempRemarks] = useState('');

    useEffect(() => {
        const load = async () => {
            const token = localStorage.getItem('token');
            const [revRes, resRes] = await Promise.all([
                fetchAdminBookingReview(id, token),
                fetchAllResources(token),
            ]);
            if (revRes.error) setError(revRes.error);
            else setReviewData(revRes.data);
            const rData = Array.isArray(resRes.data) ? resRes.data : [];
            const map = {};
            rData.forEach(r => { map[String(r.resourceId)] = r.name; });
            setResourcesMap(map);
            setLoading(false);
        };
        load();
    }, [id]);

    const [approvedCode, setApprovedCode] = useState(null); // set after successful approval

    const handleAction = async (actionType, explicitRemarks = null) => {
        // Use the ID from useParams for maximum reliability across scopes
        const identifier = id;
        const remarksToUse = explicitRemarks !== null ? explicitRemarks : adminReason;

        if (actionType === 'REJECT' && !remarksToUse.trim()) {
            setActionError('A reason must be provided when rejecting a booking.');
            return false;
        }

        setSubmitting(true);
        setActionError('');
        const token = localStorage.getItem('token');
        const adminId = getAdminIdFromToken();

        try {
            const { error: actionErr } = actionType === 'APPROVE'
                ? await approveBooking(identifier, adminId, remarksToUse, token)
                : await rejectBooking(identifier, adminId, remarksToUse, token);

            if (actionErr) {
                setActionError(actionErr);
                setSubmitting(false);
                return false;
            }

            if (actionType === 'APPROVE') {
                setApprovedCode(identifier);
                setToast({ type: 'success', message: '✅ Booking approved! QR generated.' });
            } else {
                setToast({ type: 'success', message: 'Action processed successfully.' });
                // Only navigate away if NOT in a Quick Edit flow. 
                // Fresh rejections and overrides will now trigger navigation to the log with highlighting.
                if (!isEditingRemarks) {
                    setTimeout(() => navigate(`/admin/booking?highlight=${identifier}`), 1600);
                }
            }

            // Refresh local data to show newest reason
            const revRes = await fetchAdminBookingReview(identifier, token);
            if (!revRes.error) setReviewData(revRes.data);

            setSubmitting(false);
            return true;
        } catch (err) {
            setActionError('System communication failure. Please check if your connection is stable.');
            setSubmitting(false);
            return false;
        }
    };

    /* ── Loading ─────────────────────────────────────────────────────── */
    if (loading) return (
        <DashboardLayout title="Review Booking">
            <div style={{ background: 'linear-gradient(160deg,#070d1a 0%,#0b1323 55%,#07101e 100%)' }}
                className="min-h-full flex items-center justify-center py-40">
                <div className="animate-spin rounded-full h-12 w-12"
                    style={{ border: '3px solid transparent', borderTopColor: '#6366f1', borderBottomColor: '#6366f1' }} />
            </div>
        </DashboardLayout>
    );

    /* ── Error ───────────────────────────────────────────────────────── */
    if (error || !reviewData) return (
        <DashboardLayout title="Review Booking">
            <div style={{ background: 'linear-gradient(160deg,#070d1a 0%,#0b1323 55%,#07101e 100%)' }}
                className="min-h-full flex flex-col items-center justify-center py-40 gap-6">
                <FaExclamationTriangle className="text-4xl" style={{ color: '#ef4444' }} />
                <p className="text-lg font-bold" style={{ color: '#fca5a5' }}>{error || 'Booking not found'}</p>
                <Link to="/admin/booking"
                    className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg"
                    style={{ background: '#6366f1', boxShadow: '0 0 15px rgba(99,102,241,0.3)' }}>
                    Back to Booking Log
                </Link>
            </div>
        </DashboardLayout>
    );

    const { bookingDetails, overlappingBookings, canApprove } = reviewData;
    const facilityName = resourcesMap[String(bookingDetails.resourceId)] || `Facility #${bookingDetails.resourceId}`;
    const statusCfg = STATUS_STYLE[bookingDetails.status] || STATUS_STYLE.PENDING;
    const isProcessed = ['APPROVED', 'REJECTED', 'CANCELLED'].includes(bookingDetails.status);
    const isCancelled = bookingDetails.status === 'CANCELLED';

    return (
        <DashboardLayout title="Review Booking">
            <div style={{ background: 'linear-gradient(160deg,#070d1a 0%,#0b1323 55%,#07101e 100%)', minHeight: '100%' }}>
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

                    {/* ── Back navigation ────────────────────────────── */}
                    <Link to="/admin/booking"
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] mb-8 transition-all duration-200"
                        style={{ color: '#6366f1' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6366f1'}
                    >
                        <FaArrowLeft /> Back to Booking Log
                    </Link>

                    {/* ── Hero ───────────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] mb-2"
                                style={{ color: '#818cf8' }}>
                                Admin Console · Review Protocol
                            </p>
                            <h1 className="font-black tracking-tight text-white leading-none"
                                style={{ fontSize: 'clamp(1.9rem,5vw,2.8rem)' }}>
                                {formatCode(bookingDetails.bookingCode)}
                            </h1>
                        </div>

                        {/* Student Identity Mini-Card */}
                        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all hover:bg-white/5"
                            style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                                <FaUserGraduate className="text-white text-sm" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1.5" style={{ color: '#818cf8' }}>Student Identifier</p>
                                <p className="text-sm font-black text-white leading-none uppercase tracking-tight">
                                    {bookingDetails.studentRegNumber || 'Anonymous'}
                                </p>
                                {bookingDetails.studentName && (
                                    <p className="text-[10px] font-bold text-gray-500 mt-1 leading-none uppercase">{bookingDetails.studentName}</p>
                                )}
                            </div>
                        </div>

                        {/* Status badge + QR launcher */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
                            {/* Launch QR Scanner — only for APPROVED bookings */}
                            {bookingDetails.status === 'APPROVED' && (
                                <Link
                                    to={`/admin/booking/scanner?booking=${bookingDetails.bookingCode}`}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all duration-300"
                                    style={{ background: '#059669', boxShadow: '0 0 18px rgba(5,150,105,0.4)', border: '1px solid rgba(52,211,153,0.35)' }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(16,185,129,0.6)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 18px rgba(5,150,105,0.4)'}
                                >
                                    <FaQrcode /> Launch QR Generator
                                </Link>
                            )}
                            {/* Status badge */}
                            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-widest"
                                style={{ background: statusCfg.bg, color: statusCfg.color, border: `1.5px solid ${statusCfg.border}` }}>
                                {statusCfg.icon}
                                {bookingDetails.status}
                            </div>
                        </div>
                    </div>

                    {/* ── Info Cards ─────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">

                        {/* Facility */}
                        <InfoCard label="Facility Requested" icon={<FaBuilding />} accent="#818cf8">
                            <p className="text-xl font-bold text-white mb-1">{facilityName}</p>
                            <p className="text-[10px] font-mono font-black uppercase tracking-widest" style={{ color: '#4b5563' }}>
                                NODE ID: {bookingDetails.resourceId}
                            </p>
                        </InfoCard>

                        {/* Attendees */}
                        <InfoCard label="Expected Attendees" icon={<FaBuilding />} accent="#34d399">
                            <p className="text-3xl font-black text-white leading-none">
                                {bookingDetails.expectedAttendees ?? '—'}
                            </p>
                            <p className="text-xs mt-1 font-medium" style={{ color: '#94a3b8' }}>
                                people attending
                            </p>
                        </InfoCard>

                        {/* Date + Time — full width */}
                        <div className="md:col-span-2 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between"
                            style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] flex items-center gap-2 mb-2"
                                    style={{ color: '#f59e0b' }}>
                                    <FaCalendarAlt /> Scheduled Date
                                </p>
                                <p className="text-2xl font-bold text-white">{formatDate(bookingDetails.bookingDate)}</p>
                            </div>
                            <div className="w-px h-10 hidden sm:block" style={{ background: 'rgba(255,255,255,0.08)' }} />
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] flex items-center gap-2 mb-2"
                                    style={{ color: '#60a5fa' }}>
                                    <FaClock /> Time Slot
                                </p>
                                <p className="text-2xl font-bold font-mono text-white">
                                    {formatTime(bookingDetails.startTime)}
                                    <span className="text-xs mx-2 font-bold" style={{ color: '#94a3b8' }}>to</span>
                                    {formatTime(bookingDetails.endTime)}
                                </p>
                            </div>
                        </div>

                        {/* Purpose */}
                        <InfoCard label="Statement of Purpose" icon={<FaFileAlt />} accent="#a78bfa" span2>
                            <div className="rounded-xl p-4 italic text-base leading-relaxed"
                                style={{ background: 'rgba(0,0,0,0.35)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.12)' }}>
                                "{bookingDetails.purpose}"
                            </div>
                        </InfoCard>
                    </div>

                    {/* ── Conflict warning ───────────────────────────── */}
                    {overlappingBookings && overlappingBookings.length > 0 && (
                        <div className="rounded-2xl p-6 mb-7"
                            style={{ background: 'rgba(127,29,29,0.25)', border: '1px solid rgba(239,68,68,0.45)', boxShadow: '0 0 28px rgba(239,68,68,0.12)' }}>
                            <div className="flex items-center gap-3 mb-4" style={{ color: '#fca5a5' }}>
                                <FaExclamationTriangle className="text-xl" />
                                <h3 className="text-base font-black uppercase tracking-widest">Schedule Conflict Detected</h3>
                            </div>
                            <p className="text-sm mb-4" style={{ color: 'rgba(252,165,165,0.7)' }}>
                                These approved bookings overlap with this time slot:
                            </p>
                            <div className="space-y-2">
                                {overlappingBookings.map(ob => (
                                    <div key={ob.bookingCode}
                                        className="flex items-center justify-between rounded-lg px-4 py-2.5"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <span className="font-mono font-bold text-xs tracking-wider" style={{ color: '#fca5a5' }}>
                                            {formatCode(ob.bookingCode)}
                                        </span>
                                        <span className="font-mono text-xs" style={{ color: 'rgba(252,165,165,0.5)' }}>
                                            {formatTime(ob.startTime)} – {formatTime(ob.endTime)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Cancellation Audit Notice: PREMIUM ARCHIVAL UX ── */}
                    {isCancelled && (
                        <div className="mb-10 p-8 rounded-[2rem] border relative overflow-hidden transition-all shadow-2xl"
                            style={{
                                background: 'rgba(107,114,128,0.04)',
                                borderColor: 'rgba(107,114,128,0.25)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.3), inset 0 0 40px rgba(107,114,128,0.05)'
                            }}>

                            {/* Institutional Watermark */}
                            <div className="absolute -right-12 -bottom-12 opacity-[0.04] pointer-events-none rotate-12">
                                <FaBan className="text-[180px]" />
                            </div>

                            <div className="flex flex-col gap-8 relative z-10">
                                {/* Header Row */}
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
                                            style={{ background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' }}>
                                            <FaBan className="text-3xl" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1.5 font-mono">
                                                Cancellation Protocol Record
                                            </p>
                                            <h3 className="text-2xl font-black text-white leading-none uppercase tracking-tight">
                                                Archival Status: <span style={{ color: '#fca5a5' }}>Withdrawn</span>
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                                        <FaCheck className="text-[10px]" /> Verified Audit Trail
                                    </div>
                                </div>

                                {/* Attribution Badge */}
                                <div className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 mb-2">Attribution Authority</p>
                                        <p className="text-lg font-black text-white flex items-center gap-3">
                                            Authorized Student Withdrawal
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 px-5 py-3 rounded-2xl shadow-xl"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                        <FaUserGraduate className="text-white text-lg" />
                                        <div className="text-right">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-100/70 mb-0.5">Registration ID</p>
                                            <p className="text-xl font-black text-white leading-none tracking-tight">
                                                {bookingDetails.cancelledBy || 'SYSTEM'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Official Statement */}
                                <div className="max-w-2xl">
                                    <p className="text-base font-bold text-gray-400 leading-relaxed">
                                        This reservation has been officially withdrawn from the campus schedule.
                                        In accordance with institutional policy, this record is now preserved
                                        as a <span className="text-gray-200">non-mutable archival log</span> for
                                        auditing and resource reallocation history.
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                                        Locked for modifications
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Decision Actions (Locked if Cancelled) ── */}
                    {!isCancelled && (
                        <>
                            {/* ── Decision Panel ─────────────────────────────── */}
                            {bookingDetails.status === 'PENDING' ? (
                                /* ── Fresh decision for PENDING ─────────────── */
                                <div className="rounded-2xl p-7 relative overflow-hidden"
                                    style={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 0 40px rgba(99,102,241,0.08)' }}>
                                    {/* Rainbow top bar */}
                                    <div className="absolute top-0 left-0 w-full h-[3px]"
                                        style={{ background: 'linear-gradient(90deg,#10b981,#6366f1,#ef4444)' }} />

                                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">
                                        Admin Decision
                                    </h3>

                                    <div className="mb-6">
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5"
                                            style={{ color: '#94a3b8' }}>
                                            Remarks / Justification
                                        </label>
                                        <textarea
                                            rows="3"
                                            placeholder="Enter reason for approval or rejection…"
                                            value={adminReason}
                                            onChange={e => { setAdminReason(e.target.value); setActionError(''); }}
                                            className="w-full p-4 text-sm text-white rounded-xl resize-none outline-none transition-all shadow-inner"
                                            style={{
                                                background: 'rgba(0,0,0,0.25)',
                                                border: '1px solid rgba(99,102,241,0.2)',
                                                fontFamily: 'inherit',
                                            }}
                                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'}
                                        />
                                    </div>

                                    {actionError && (
                                        <div className="flex items-start gap-3 rounded-xl p-4 mb-5"
                                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                            <FaExclamationTriangle style={{ color: '#fca5a5', marginTop: 2, flexShrink: 0 }} />
                                            <p className="text-sm font-semibold" style={{ color: '#fca5a5' }}>{actionError}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => handleAction('APPROVE')}
                                            disabled={submitting || !canApprove}
                                            className="flex-1 flex justify-center items-center gap-2.5 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all duration-300"
                                            style={canApprove
                                                ? { background: '#059669', boxShadow: '0 0 20px rgba(5,150,105,0.35)', border: '1px solid rgba(52,211,153,0.4)' }
                                                : { background: 'rgba(255,255,255,0.04)', color: '#374151', border: '1px solid rgba(255,255,255,0.06)', cursor: 'not-allowed' }}
                                        >
                                            <FaCheckCircle /> {submitting ? 'Processing…' : 'Approve Booking'}
                                        </button>
                                        <button
                                            onClick={() => handleAction('REJECT')}
                                            disabled={submitting}
                                            className="flex-1 flex justify-center items-center gap-2.5 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all duration-300"
                                            style={{ background: '#b91c1c', boxShadow: '0 0 20px rgba(185,28,28,0.35)', border: '1px solid rgba(252,165,165,0.3)' }}
                                        >
                                            <FaTimesCircle /> {submitting ? 'Processing…' : 'Reject Booking'}
                                        </button>
                                    </div>

                                    {!canApprove && (
                                        <p className="text-xs font-bold text-center mt-4 py-2 rounded-full"
                                            style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.08)' }}>
                                            Approval disabled — scheduling conflict detected above.
                                        </p>
                                    )}
                                </div>

                            ) : !isProcessed || showOverride ? null : (

                                /* ── Already processed + Override option ─────── */
                                <div className="rounded-2xl overflow-hidden"
                                    style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}>

                                    {/* Already processed summary */}
                                    <div className="flex flex-col px-8 py-7"
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

                                        {/* Header Row */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <p className="text-[10px] font-black mb-2 text-indigo-400/60 uppercase tracking-[0.3em]">
                                                    Decision Protocol Recorded
                                                </p>
                                                <p className="text-sm font-bold text-white">
                                                    Current Official Status: <span className="font-black px-3 py-1 rounded-full ml-2" style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>{bookingDetails.status}</span>
                                                </p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-3">
                                                {!isEditingRemarks && (
                                                    <button
                                                        onClick={() => { setActionError(''); setIsEditingRemarks(true); setAdminReason(bookingDetails.adminDecisionReason || ''); }}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white/5 text-gray-400 hover:bg-[#f4511e]/10 hover:text-[#f4511e] border border-white/5 hover:border-[#f4511e]/30 group"
                                                    >
                                                        <FaEdit className="group-hover:scale-110 transition-transform" /> Quick Edit Remarks
                                                    </button>
                                                )}
                                                {['APPROVED', 'REJECTED'].includes(bookingDetails.status) && !isEditingRemarks && (
                                                    <button
                                                        onClick={() => { setActionError(''); setAdminReason(''); setShowOverride(true); }}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-indigo-500/10 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/20"
                                                    >
                                                        <FaRedoAlt /> Override Decision
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inline Editor / Static Display */}
                                        {isEditingRemarks ? (
                                            <div className="animate-fade-in p-6 rounded-3xl bg-[#0a101d]/80 backdrop-blur-2xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Modifying Official Record
                                                </p>

                                                {actionError && (
                                                    <div className="flex items-start gap-3 rounded-xl p-3 mb-4"
                                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                                        <FaExclamationTriangle style={{ color: '#fca5a5', marginTop: 2, flexShrink: 0 }} />
                                                        <p className="text-xs font-semibold" style={{ color: '#fca5a5' }}>{actionError}</p>
                                                    </div>
                                                )}

                                                <textarea
                                                    rows="3"
                                                    value={adminReason}
                                                    onChange={e => { setAdminReason(e.target.value); setActionError(''); }}
                                                    className="w-full bg-black/40 text-white p-5 rounded-2xl text-base italic border border-white/5 outline-none focus:border-indigo-500/60 transition-all font-medium leading-relaxed resize-none"
                                                    placeholder="Enter updated remarks..."
                                                    autoFocus
                                                />
                                                <div className="flex justify-end items-center gap-6 mt-6">
                                                    <button
                                                        onClick={() => { setIsEditingRemarks(false); setActionError(''); }}
                                                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        Dismiss
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const currentStatus = bookingDetails.status;
                                                            const success = await handleAction(currentStatus === 'APPROVED' ? 'APPROVE' : 'REJECT');
                                                            if (success) {
                                                                setIsEditingRemarks(false);
                                                                setToast({ type: 'success', message: '✅ Official remarks updated successfully.' });
                                                                // Premium Navigation: Automatically return to log with highlight
                                                                setTimeout(() => navigate(`/admin/booking?highlight=${id}`), 1600);
                                                            }
                                                        }}
                                                        disabled={submitting}
                                                        className="px-8 py-3.5 rounded-2xl bg-[#f4511e] text-white text-[11px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(244,81,30,0.3)] hover:shadow-[0_15px_40px_rgba(244,81,30,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                                                    >
                                                        {submitting ? 'Syncing...' : 'Save & Log back'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 transition-all"
                                            >
                                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 opacity-40">Previous Statement</p>
                                                <p className="text-white font-medium italic text-lg leading-relaxed">
                                                    {bookingDetails.adminDecisionReason ? `"${bookingDetails.adminDecisionReason}"` : "No official remarks were provided for this decision."}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Override Panel (shown when admin clicks Override) ── */}
                            {showOverride && isProcessed && (
                                <div className="rounded-2xl p-7 relative overflow-hidden mt-4"
                                    style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 30px rgba(0,0,0,0.2)' }}>
                                    <div className="absolute top-0 left-0 w-full h-[3px]"
                                        style={{ background: 'linear-gradient(90deg,#6366f1,#818cf8)' }} />

                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white">
                                            Override Decision
                                        </h3>
                                        <button onClick={() => { setShowOverride(false); setAdminReason(''); setActionError(''); }}
                                            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                            style={{ color: '#6b7280', background: 'rgba(255,255,255,0.05)' }}>
                                            Cancel
                                        </button>
                                    </div>

                                    <p className="text-xs mb-5" style={{ color: '#6b7280' }}>
                                        You are about to change the status of{' '}
                                        <span className="font-mono font-bold" style={{ color: '#ff8a65' }}>
                                            {formatCode(bookingDetails.bookingCode)}
                                        </span>
                                        {' '}from{' '}
                                        <span className="font-black" style={{ color: statusCfg.color }}>
                                            {bookingDetails.status}
                                        </span>.
                                        {' '}Provide a reason below.
                                    </p>

                                    <div className="mb-6">
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5"
                                            style={{ color: '#94a3b8' }}>
                                            Override Reason (required)
                                        </label>
                                        <textarea
                                            rows="3"
                                            placeholder="Explain why this decision is being overridden…"
                                            value={adminReason}
                                            onChange={e => { setAdminReason(e.target.value); setActionError(''); }}
                                            className="w-full p-4 text-sm text-white rounded-xl resize-none outline-none transition-all"
                                            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(251,191,36,0.3)', fontFamily: 'inherit' }}
                                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.7)'}
                                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'}
                                        />
                                    </div>

                                    {actionError && (
                                        <div className="flex items-start gap-3 rounded-xl p-4 mb-5"
                                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                            <FaExclamationTriangle style={{ color: '#fca5a5', flexShrink: 0, marginTop: 2 }} />
                                            <p className="text-sm font-semibold" style={{ color: '#fca5a5' }}>{actionError}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Only show the opposite action */}
                                        {bookingDetails.status === 'REJECTED' && (
                                            <button
                                                onClick={async () => {
                                                    const success = await handleAction('APPROVE');
                                                    if (success) setShowOverride(false);
                                                }}
                                                disabled={submitting}
                                                className="flex-1 flex justify-center items-center gap-2.5 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all duration-300"
                                                style={{ background: '#059669', boxShadow: '0 0 20px rgba(5,150,105,0.35)', border: '1px solid rgba(52,211,153,0.4)' }}
                                            >
                                                <FaCheckCircle /> {submitting ? 'Processing…' : 'Approve Instead'}
                                            </button>
                                        )}
                                        {bookingDetails.status === 'APPROVED' && (
                                            <button
                                                onClick={async () => {
                                                    const success = await handleAction('REJECT');
                                                    if (success) setShowOverride(false);
                                                }}
                                                disabled={submitting}
                                                className="flex-1 flex justify-center items-center gap-2.5 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all duration-300"
                                                style={{ background: '#b91c1c', boxShadow: '0 0 20px rgba(185,28,28,0.35)', border: '1px solid rgba(252,165,165,0.3)' }}
                                            >
                                                <FaTimesCircle /> {submitting ? 'Processing…' : 'Reject Instead'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── QR Ready Panel — shown immediately after approval ── */}
                    {approvedCode && (
                        <div className="mt-6 rounded-2xl overflow-hidden"
                            style={{ background: '#0d1526', border: '1px solid rgba(16,185,129,0.4)', boxShadow: '0 0 40px rgba(16,185,129,0.1)' }}>
                            {/* Green top bar */}
                            <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg,#10b981,#059669)' }} />
                            <div className="p-8 flex flex-col sm:flex-row items-center gap-7">
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                    <FaQrcode className="text-3xl" style={{ color: '#10b981' }} />
                                </div>
                                {/* Text */}
                                <div className="flex-1 text-center sm:text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>
                                        Booking Approved · QR Token Generated
                                    </p>
                                    <h3 className="text-xl font-black text-white mb-1.5">
                                        Access QR is ready for <span className="font-mono" style={{ color: '#a5b4fc' }}>{formatCode(approvedCode)}</span>
                                    </h3>
                                    <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                                        The student's access QR token has been saved to the database. Launch the QR Generator to display it.
                                    </p>
                                </div>
                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                                    <Link
                                        to={`/admin/booking/scanner?booking=${approvedCode}`}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white transition-all duration-300 whitespace-nowrap"
                                        style={{ background: '#059669', boxShadow: '0 0 20px rgba(5,150,105,0.45)', border: '1px solid rgba(52,211,153,0.4)' }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(16,185,129,0.65)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(5,150,105,0.45)'}
                                    >
                                        <FaQrcode /> Launch QR Generator
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            <Toast toast={toast} onClose={() => setToast(null)} />
        </DashboardLayout>
    );
}
