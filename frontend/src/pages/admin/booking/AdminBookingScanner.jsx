/**
 * AdminBookingScanner.jsx — QR Code Generator Console
 *
 * Two modes:
 *   SINGLE MODE  — URL has ?booking=BKG-XXXXX → shows only that booking + QR
 *   LIST MODE    — No URL param → shows list of pending-QR approved bookings
 *
 * QR tokens are permanently stored in the DB when a booking is approved.
 * This page renders them as scannable QR images. Nothing is lost on navigation.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../../../components/DashboardLayout';
import {
    FaArrowLeft, FaSearch, FaQrcode, FaCheckCircle,
    FaCalendarCheck, FaBuilding, FaClock, FaCalendarAlt,
    FaChevronRight, FaSave, FaUsers,
} from 'react-icons/fa';

import { useAdminBookings } from '../../../hooks/useAdminBookings';
import { formatDate, formatTime, formatCode } from '../../../utils/formatters';

/* ─── Single-booking QR view ────────────────────────────────────────────────── */
function SingleBookingQR({ booking, resourcesMap, autoShow = true }) {
    const [showQR, setShowQR] = useState(autoShow);
    const navigate = useNavigate();
    const qrValue = `CHECKIN_TOKEN:${booking.qrToken || booking.bookingCode}`;

    return (
        <div className="max-w-lg mx-auto">
            {/* Booking info card */}
            <div className="rounded-2xl p-6 mb-6"
                style={{ background: '#0d1526', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 30px rgba(16,185,129,0.08)' }}>
                <div className="h-[3px] w-full -mt-6 -mx-6 mb-6 rounded-t-2xl" style={{ background: 'linear-gradient(90deg,#10b981,#059669)', width: 'calc(100% + 3rem)' }} />
                <div className="flex items-center gap-2 mb-4" style={{ color: '#34d399' }}>
                    <FaCheckCircle className="text-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Approved Reservation</span>
                </div>
                <h2 className="font-mono font-black text-white text-2xl mb-5">
                    {formatCode(booking.bookingCode)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: '#94a3b8' }}>
                            <FaBuilding /> Facility
                        </p>
                        <p className="text-sm font-bold" style={{ color: '#a5b4fc' }}>
                            {resourcesMap[String(booking.resourceId)] || `#${booking.resourceId}`}
                        </p>
                    </div>
                    <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: '#94a3b8' }}>
                            <FaCalendarAlt /> Date
                        </p>
                        <p className="text-sm font-bold text-white">{formatDate(booking.bookingDate)}</p>
                    </div>
                    <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: '#94a3b8' }}>
                            <FaClock /> Time
                        </p>
                        <p className="text-sm font-bold text-white font-mono">
                            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                        </p>
                    </div>
                </div>
            </div>

            {/* QR Section */}
            <div className="rounded-2xl p-7 text-center"
                style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}>
                {!showQR ? (
                    <>
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                            style={{ background: 'rgba(16,185,129,0.07)', border: '2px dashed rgba(16,185,129,0.25)' }}>
                            <FaQrcode className="text-4xl" style={{ color: 'rgba(16,185,129,0.45)' }} />
                        </div>
                        <p className="text-sm font-semibold mb-2" style={{ color: '#4b5563' }}>
                            QR token is ready
                        </p>
                        <p className="text-xs mb-6" style={{ color: '#1f2937' }}>
                            Click to display the access QR code for this booking
                        </p>
                        <button
                            onClick={() => setShowQR(true)}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all duration-300"
                            style={{ background: '#059669', boxShadow: '0 0 24px rgba(5,150,105,0.45)', border: '1px solid rgba(52,211,153,0.4)' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 36px rgba(16,185,129,0.65)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(5,150,105,0.45)'}
                        >
                            <FaQrcode className="text-lg" /> Generate QR Code
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#34d399' }}>
                            ✓ Generated — Student scans this to check in
                        </p>
                        {/* QR Code */}
                        <div className="inline-block rounded-2xl p-5 mb-5 shadow-2xl"
                            style={{ background: '#ffffff' }}>
                            <QRCodeSVG
                                value={qrValue}
                                size={220}
                                bgColor="#ffffff"
                                fgColor="#07101e"
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <p className="text-[10px] font-semibold mb-7" style={{ color: '#374151' }}>
                            Student shows this at the facility entrance for automated check-in
                        </p>
                        {/* Buttons: Save + Reset */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => navigate(`/admin/booking?highlight=${booking.bookingCode}`)}
                                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white transition-all duration-200"
                                style={{ background: '#6366f1', boxShadow: '0 0 18px rgba(99,102,241,0.4)', border: '1px solid rgba(165,180,252,0.3)' }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.6)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 18px rgba(99,102,241,0.4)'}
                            >
                                <FaSave /> SAVE &amp; LOG BACK
                            </button>
                            <button
                                onClick={() => setShowQR(false)}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#9ca3af'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
                            >
                                Reset
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ─── Main component ────────────────────────────────────────────────────────── */
export default function AdminBookingScanner() {
    const { bookings, resourcesMap, loading } = useAdminBookings();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [doneCodes, setDoneCodes] = useState(new Set());

    const targetCode = searchParams.get('booking'); // e.g. BKG-XXXXX

    const approvedBookings = useMemo(
        () => bookings.filter(b => b.status === 'APPROVED'),
        [bookings]
    );

    /* Resolve the specific booking when in single mode */
    const singleBooking = useMemo(() => {
        if (!targetCode) return null;
        return approvedBookings.find(b => b.bookingCode === targetCode) || null;
    }, [targetCode, approvedBookings]);

    /* List mode: only bookings not yet saved this session */
    const pendingBookings = useMemo(
        () => approvedBookings.filter(b => !doneCodes.has(b.bookingCode)),
        [approvedBookings, doneCodes]
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return pendingBookings;
        return pendingBookings.filter(b =>
            b.bookingCode.toLowerCase().includes(q) ||
            (resourcesMap[String(b.resourceId)] || '').toLowerCase().includes(q) ||
            formatDate(b.bookingDate).includes(q)
        );
    }, [pendingBookings, search, resourcesMap]);

    const handleSelect = (b) => { setSelected(b); setShowQR(false); };
    const handleSave = () => {
        if (selected) setDoneCodes(prev => new Set([...prev, selected.bookingCode]));
        navigate(`/admin/booking?highlight=${selected?.bookingCode || ''}`);
    };

    const qrValue = selected
        ? `CHECKIN_TOKEN:${selected.qrToken || selected.bookingCode}`
        : '';

    /* ── Loading state ───────────────────────────────── */
    if (loading) return (
        <DashboardLayout title="QR Code Generator">
            <div style={{ background: 'linear-gradient(160deg,#070d1a 0%,#0b1323 55%,#07101e 100%)', minHeight: '100%' }}
                className="flex items-center justify-center py-40">
                <div className="animate-spin rounded-full h-12 w-12"
                    style={{ border: '3px solid transparent', borderTopColor: '#10b981', borderBottomColor: '#10b981' }} />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="QR Code Generator">
            <div style={{ background: 'linear-gradient(160deg,#070d1a 0%,#0b1323 55%,#07101e 100%)', minHeight: '100%' }}>
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

                    {/* ── Back nav ─────────────────────────────────────── */}
                    <Link to="/admin/booking"
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] mb-8 transition-all"
                        style={{ color: '#6366f1' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6366f1'}
                    >
                        <FaArrowLeft /> Back to Booking Log
                    </Link>

                    {/* ── Hero ─────────────────────────────────────────── */}
                    <div className="mb-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] mb-2" style={{ color: '#10b981' }}>
                            Admin Console · QR Code Generator
                        </p>
                        <h1 className="font-black tracking-tight text-white"
                            style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', lineHeight: 1.2, paddingBottom: '0.05em' }}>
                            QR Code{' '}
                            <span style={{ background: 'linear-gradient(90deg,#34d399,#059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Generator
                            </span>
                        </h1>
                        <p className="text-sm mt-1.5 font-medium" style={{ color: '#94a3b8' }}>
                            {singleBooking
                                ? `Displaying QR for booking ${formatCode(singleBooking.bookingCode)}`
                                : 'Select an approved booking to generate and display its QR access code.'}
                        </p>
                    </div>

                    {/* ════════════════════════════════════════════════════
                        SINGLE MODE — URL has ?booking=BKG-XXXXX
                    ════════════════════════════════════════════════════ */}
                    {singleBooking ? (
                        <SingleBookingQR
                            booking={singleBooking}
                            resourcesMap={resourcesMap}
                            onBack={() => navigate('/admin/booking')}
                        />
                    ) : targetCode && !singleBooking ? (
                        /* Booking code in URL but not found (e.g. not APPROVED) */
                        <div className="text-center py-20">
                            <FaQrcode className="text-4xl mx-auto mb-4" style={{ color: '#1f2937' }} />
                            <p className="text-sm font-semibold mb-2" style={{ color: '#374151' }}>Booking not found or not approved</p>
                            <p className="text-xs mb-6" style={{ color: '#1f2937' }}>
                                Only approved bookings have QR tokens. Check the booking code.
                            </p>
                            <Link to="/admin/booking"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white"
                                style={{ background: '#6366f1' }}>
                                <FaArrowLeft /> Back to Booking Log
                            </Link>
                        </div>
                    ) : (

                        /* ════════════════════════════════════════════════════
                            LIST MODE — Browse all pending approved bookings
                        ════════════════════════════════════════════════════ */
                        <>
                            {/* Stats */}
                            <div className="flex items-center gap-4 mb-6 px-5 py-3 rounded-xl"
                                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                                <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#34d399' }}>
                                    {pendingBookings.length} pending QR{pendingBookings.length !== 1 ? 's' : ''} to generate
                                </span>
                                {doneCodes.size > 0 && (
                                    <span className="text-xs font-bold" style={{ color: '#374151' }}>
                                        · {doneCodes.size} saved this session
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                                {/* LEFT: booking list */}
                                <div className="lg:col-span-2 rounded-2xl overflow-hidden flex flex-col"
                                    style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)', maxHeight: '580px' }}>
                                    <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#374151' }}>
                                            Approved — Pending QR
                                        </p>
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: '#374151' }} />
                                            <input type="text" placeholder="Search ID, facility, date…"
                                                value={search} onChange={e => setSearch(e.target.value)}
                                                className="w-full py-2.5 pl-8 pr-4 text-sm text-white rounded-xl outline-none"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                                                onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'} />
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {filtered.length === 0 ? (
                                            <div className="py-14 text-center px-6">
                                                <FaCalendarCheck className="text-3xl mx-auto mb-3" style={{ color: '#1f2937' }} />
                                                <p className="text-sm font-semibold" style={{ color: '#374151' }}>
                                                    {pendingBookings.length === 0 ? 'All QR codes generated ✓' : 'No results'}
                                                </p>
                                            </div>
                                        ) : filtered.map(b => {
                                            const isActive = selected?.bookingCode === b.bookingCode;
                                            return (
                                                <button key={b.bookingCode} onClick={() => handleSelect(b)}
                                                    className="w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all duration-150"
                                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', borderLeft: `3px solid ${isActive ? '#10b981' : 'transparent'}`, background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent' }}
                                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                        style={{ background: isActive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)', color: isActive ? '#10b981' : '#374151' }}>
                                                        <FaQrcode className="text-sm" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-mono font-bold text-xs text-white truncate">{formatCode(b.bookingCode)}</p>
                                                        <p className="text-xs mt-0.5 truncate" style={{ color: '#818cf8' }}>
                                                            {resourcesMap[String(b.resourceId)] || `Facility #${b.resourceId}`}
                                                        </p>
                                                    </div>
                                                    <FaChevronRight className="flex-shrink-0 text-xs" style={{ color: isActive ? '#10b981' : '#1f2937' }} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* RIGHT: QR panel */}
                                <div className="lg:col-span-3 rounded-2xl flex flex-col"
                                    style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    {!selected ? (
                                        <div className="flex-1 flex flex-col items-center justify-center py-24 px-8 text-center">
                                            <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center border-2 border-dashed"
                                                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                                                <FaQrcode className="text-4xl" style={{ color: '#1f2937' }} />
                                            </div>
                                            <p className="text-sm font-semibold" style={{ color: '#374151' }}>Select a booking to generate its QR</p>
                                        </div>
                                    ) : (
                                        <div className="p-7">
                                            {/* Booking summary */}
                                            <div className="rounded-xl p-5 mb-6 relative overflow-hidden"
                                                style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                                                    <FaQrcode className="text-6xl text-emerald-900" />
                                                </div>
                                                <div className="flex items-center gap-2 mb-2" style={{ color: '#34d399' }}>
                                                    <FaCheckCircle className="text-xs" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Approved Protocol</span>
                                                </div>
                                                <p className="font-mono font-bold text-white text-sm mb-2">{formatCode(selected.bookingCode)}</p>
                                                <p className="text-xs font-bold" style={{ color: '#818cf8' }}>{resourcesMap[String(selected.resourceId)] || `#${selected.resourceId}`}</p>
                                                <p className="text-xs mt-1 font-medium" style={{ color: '#94a3b8' }}>
                                                    {formatDate(selected.bookingDate)} · {formatTime(selected.startTime)} – {formatTime(selected.endTime)}
                                                </p>
                                            </div>

                                            {!showQR ? (
                                                <div className="flex flex-col items-center py-8">
                                                    <button onClick={() => setShowQR(true)}
                                                        className="flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all bg-emerald-600 shadow-lg shadow-emerald-100 hover:shadow-emerald-300 hover:-translate-y-0.5">
                                                        <FaQrcode className="text-lg" /> Generate QR Code
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="inline-block rounded-2xl p-5 mb-4 shadow-sm border border-slate-100 bg-white">
                                                        <QRCodeSVG value={qrValue} size={200} bgColor="#ffffff" fgColor="#0F172A" level="H" includeMargin={false} />
                                                    </div>
                                                    <p className="text-[10px] font-semibold text-center mb-5 text-slate-400 uppercase tracking-widest">Student scans at entrance</p>
                                                    <div className="flex gap-3">
                                                        <button onClick={handleSave}
                                                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-indigo-600 shadow-lg shadow-indigo-100 hover:shadow-indigo-300 hover:-translate-y-0.5">
                                                            <FaSave /> SAVE &amp; LOG BACK
                                                        </button>
                                                        <button onClick={() => setShowQR(false)}
                                                            className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 border border-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-600">
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
