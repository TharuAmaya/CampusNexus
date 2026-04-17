/**
 * AdminBookingDashboard.jsx — Admin Booking Management Console
 *
 * - PENDING  → Action button: "Review"
 * - APPROVED / REJECTED / CANCELLED → Action button: "Update Decision"
 * - QR Code column: "View QR" only for APPROVED bookings
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import {
    FaBan, FaCheckCircle, FaHourglassHalf, FaTimesCircle,
    FaSearch, FaInbox, FaCalendarCheck, FaQrcode,
    FaExclamationTriangle, FaChevronLeft, FaChevronRight,
    FaClipboardCheck, FaEdit,
} from 'react-icons/fa';
import { useAdminBookings, BOOKING_STATUSES } from '../../../hooks/useAdminBookings';
import { formatTime, formatDate, formatCode } from '../../../utils/formatters';

/* ─── Constants ───────────────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

const STATUS_CFG = {
    APPROVED: { dot: '#10b981', badge: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.3)', icon: <FaCheckCircle /> },
    PENDING: { dot: '#f59e0b', badge: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)', icon: <FaHourglassHalf /> },
    REJECTED: { dot: '#ef4444', badge: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.3)', icon: <FaTimesCircle /> },
    CANCELLED: { dot: '#6b7280', badge: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.3)', icon: <FaBan /> },
};
const DEFAULT_CFG = { dot: '#6366f1', badge: 'rgba(99,102,241,0.12)', text: '#a5b4fc', border: 'rgba(99,102,241,0.3)', icon: null };

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
    const c = STATUS_CFG[status] || DEFAULT_CFG;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
            style={{ background: c.badge, color: c.text, border: `1px solid ${c.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
            {status}
        </span>
    );
}

function StatCard({ label, value, icon, accentColor, glowColor }) {
    return (
        <div className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4"
            style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', boxShadow: `0 0 24px ${glowColor}` }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: accentColor + '22', color: accentColor }}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[22px] font-black text-white leading-none">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-0.5 truncate" style={{ color: '#94a3b8' }}>{label}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-[0.06]"
                style={{ background: accentColor }} />
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function AdminBookingDashboard() {
    const { bookings, filteredBookings, resourcesMap, filter, setFilter, loading, error } = useAdminBookings();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [highlightedCode, setHighlightedCode] = useState(null);
    const location = useLocation();
    const rowRefs = useRef({});

    // ── Highlighting Logic ───────────────────────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('highlight');
        
        if (code) {
            setFilter('ALL'); // Reset filter to ALL so the record is visible regardless of its new status
            setSearch(code); // Filter by the overridden code
            setHighlightedCode(code);
            
            // Remove highlight after 4 seconds
            const timer = setTimeout(() => setHighlightedCode(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [location.search]);

    useEffect(() => {
        if (highlightedCode && rowRefs.current[highlightedCode]) {
            setTimeout(() => {
                rowRefs.current[highlightedCode].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [highlightedCode]);

    const handleFilter = (f) => { setFilter(f); setPage(1); };
    const handleSearch = (v) => { setSearch(v); setPage(1); };

    const counts = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        approved: bookings.filter(b => b.status === 'APPROVED').length,
        rejected: bookings.filter(b => b.status === 'REJECTED').length,
    }), [bookings]);

    const searched = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return filteredBookings;
        return (filteredBookings || []).filter(b =>
            (String(b.bookingCode || '').toLowerCase().includes(q)) ||
            (String(resourcesMap[String(b.resourceId)] || '').toLowerCase().includes(q)) ||
            (String(b.studentRegNumber || '').toLowerCase().includes(q)) ||
            (String(b.studentName || '').toLowerCase().includes(q)) ||
            (String(b.userId || '').toLowerCase().includes(q))
        );
    }, [filteredBookings, search, resourcesMap]);

    const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageSlice = searched.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    /* Tab styling */
    const tabStyle = (f) => {
        const active = filter === f;
        const colors = {
            ALL: { bg: '#f4511e', glow: 'rgba(244,81,30,0.45)' },
            PENDING: { bg: '#f59e0b', glow: 'rgba(245,158,11,0.45)' },
            APPROVED: { bg: '#10b981', glow: 'rgba(16,185,129,0.45)' },
            REJECTED: { bg: '#ef4444', glow: 'rgba(239,68,68,0.45)' },
            CANCELLED: { bg: '#6b7280', glow: 'rgba(107,114,128,0.4)' },
        };
        const col = colors[f] || colors.ALL;
        return active
            ? { background: col.bg, color: '#fff', boxShadow: `0 0 14px ${col.glow}`, border: `1px solid transparent` }
            : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.07)' };
    };

    return (
        <DashboardLayout title="Booking Management">
            <div className="min-h-full" style={{ background: 'linear-gradient(160deg,#070d1a 0%,#0b1323 55%,#07101e 100%)' }}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

                    {/* ── Hero Header ──────────────────────────────────── */}
                    <div className="mb-9">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-2.5"
                            style={{ color: '#f4511e' }}>
                            Admin Console · Booking Management
                        </p>
                        <h1 className="font-black tracking-tight"
                            style={{
                                fontSize: 'clamp(2rem,5vw,3rem)',
                                lineHeight: 1.2,
                                paddingBottom: '0.12em',
                                background: 'linear-gradient(90deg,#ff8a65 0%,#f4511e 50%,#d84315 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                            Reservation Log
                        </h1>
                        <p className="mt-2 text-sm font-medium" style={{ color: '#94a3b8' }}>
                            Review, approve, and manage all facility booking requests across campus.
                        </p>
                    </div>

                    {/* ── Stat Cards ───────────────────────────────────── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Reservations" value={counts.total} icon={<FaCalendarCheck />} accentColor="#f4511e" glowColor="rgba(244,81,30,0.1)" />
                        <StatCard label="Pending Review" value={counts.pending} icon={<FaHourglassHalf />} accentColor="#f59e0b" glowColor="rgba(245,158,11,0.1)" />
                        <StatCard label="Approved" value={counts.approved} icon={<FaCheckCircle />} accentColor="#10b981" glowColor="rgba(16,185,129,0.1)" />
                        <StatCard label="Rejected" value={counts.rejected} icon={<FaTimesCircle />} accentColor="#ef4444" glowColor="rgba(239,68,68,0.1)" />
                    </div>

                    {/* ── Filter Tabs + Search ──────────────────────────── */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">

                        <div className="flex flex-wrap gap-2">
                            {BOOKING_STATUSES.map(f => {
                                const cnt = f === 'ALL' ? bookings.length : bookings.filter(b => b.status === f).length;
                                return (
                                    <button key={f}
                                        onClick={() => handleFilter(f)}
                                        style={tabStyle(f)}
                                        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200">
                                        {f} <span className="opacity-60 font-bold ml-1">({cnt})</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative w-full md:w-72 flex-shrink-0">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: '#374151' }} />
                            <input
                                type="text"
                                placeholder="Search by ID, facility, user…"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full py-2.5 pl-9 pr-8 text-sm font-medium rounded-xl transition-all"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none', color: '#e5e7eb' }}
                                onFocus={e => e.currentTarget.style.borderColor = 'rgba(244,81,30,0.5)'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                            {search && (
                                <button onClick={() => handleSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none transition-colors"
                                    style={{ color: '#4b5563' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Main Table Panel ──────────────────────────────── */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12"
                                style={{ border: '3px solid transparent', borderTopColor: '#f4511e', borderBottomColor: '#f4511e' }} />
                            <p className="text-xs font-bold uppercase tracking-widest animate-pulse" style={{ color: '#374151' }}>
                                Loading reservations…
                            </p>
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl p-14 text-center"
                            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <FaExclamationTriangle className="text-3xl mx-auto mb-3" style={{ color: '#ef4444' }} />
                            <p className="font-semibold text-sm" style={{ color: '#f87171' }}>{error}</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl overflow-hidden"
                            style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 50px rgba(0,0,0,0.4)' }}>

                            {/* Result count bar */}
                            <div className="flex items-center justify-between px-6 py-3.5"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
                                <p className="text-xs font-semibold" style={{ color: '#4b5563' }}>
                                    Showing{' '}
                                    <span className="font-black" style={{ color: '#9ca3af' }}>
                                        {searched.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, searched.length)}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-black" style={{ color: '#9ca3af' }}>{searched.length}</span>
                                    {' '}result{searched.length !== 1 ? 's' : ''}
                                    {search && <span className="ml-1.5" style={{ color: '#f4511e' }}>· "{search}"</span>}
                                </p>
                                <div className="flex gap-2">
                                    {['APPROVED', 'PENDING', 'REJECTED'].map(s => {
                                        const c = STATUS_CFG[s];
                                        const n = bookings.filter(b => b.status === s).length;
                                        return (
                                            <span key={s}
                                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                style={{ background: c.badge, color: c.text, border: `1px solid ${c.border}` }}>
                                                {n} {s}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <style>{`
                                @keyframes pulse-highlight {
                                    0% { box-shadow: inset 0 0 0px rgba(244,81,30,0); background: rgba(244,81,30,0.1); }
                                    50% { box-shadow: inset 0 0 25px rgba(244,81,30,0.4); background: rgba(244,81,30,0.25); }
                                    100% { box-shadow: inset 0 0 0px rgba(244,81,30,0); background: rgba(244,81,30,0.1); }
                                }
                            `}</style>
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                                            {['Status', 'Booking ID', 'Student Reg. ID', 'Facility', 'Date', 'Time Slot', 'QR Code', 'Action'].map(h => (
                                                <th key={h}
                                                    className="px-5 py-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap"
                                                    style={{ color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageSlice.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-24 text-center">
                                                    <FaInbox className="text-4xl mx-auto mb-3" style={{ color: '#1f2937' }} />
                                                    <p className="text-sm font-semibold" style={{ color: '#374151' }}>No reservations found</p>
                                                    {(search || filter !== 'ALL') && (
                                                        <p className="text-xs mt-1.5" style={{ color: '#1f2937' }}>
                                                            Try adjusting your filters or search.
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : pageSlice.map((booking, idx) => {
                                            const isPending = booking.status === 'PENDING';
                                            const isApproved = booking.status === 'APPROVED';
                                            return (
                                                <tr key={booking.bookingCode}
                                                    ref={el => rowRefs.current[booking.bookingCode] = el}
                                                    className="transition-colors duration-150"
                                                    style={{ 
                                                        borderBottom: '1px solid rgba(255,255,255,0.04)', 
                                                        background: booking.bookingCode === highlightedCode 
                                                            ? 'rgba(244,81,30,0.15)' 
                                                            : (idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'),
                                                        animation: booking.bookingCode === highlightedCode ? 'pulse-highlight 2s infinite' : 'none'
                                                    }}
                                                    onMouseEnter={e => {
                                                        if (booking.bookingCode !== highlightedCode) {
                                                            e.currentTarget.style.background = 'rgba(244,81,30,0.05)';
                                                        }
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (booking.bookingCode !== highlightedCode) {
                                                            e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)';
                                                        }
                                                    }}>

                                                    {/* Status */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <StatusBadge status={booking.status} />
                                                    </td>

                                                    {/* Booking ID */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="font-mono text-sm font-bold tracking-wider" style={{ color: '#e5e7eb' }}>
                                                            {formatCode(booking.bookingCode)}
                                                        </span>
                                                        {booking.hasConflict && (
                                                            <span className="ml-2 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase"
                                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                                                                ⚠ Conflict
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Student ID */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="text-xs font-black text-blue-400 uppercase tracking-tight bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                                            {booking.studentRegNumber || '—'}
                                                        </span>
                                                    </td>

                                                    {/* Facility */}
                                                    <td className="px-5 py-4">
                                                        <span className="text-sm font-semibold" style={{ color: '#a5b4fc' }}>
                                                            {resourcesMap[String(booking.resourceId)] || (
                                                                <span className="font-mono text-xs" style={{ color: '#f4511e' }}>
                                                                    ID #{booking.resourceId}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#9ca3af' }}>
                                                        {formatDate(booking.bookingDate)}
                                                    </td>

                                                    {/* Time Slot */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg"
                                                            style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                                                        </span>
                                                    </td>

                                                    {/* QR Code — only for APPROVED */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        {isApproved ? (
                                                            <Link
                                                                to={`/admin/booking/scanner?booking=${booking.bookingCode}`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200"
                                                                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 12px rgba(5,150,105,0.5)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#34d399'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                                <FaQrcode className="text-[10px]" /> View QR
                                                            </Link>
                                                        ) : (
                                                            <span style={{ color: '#1f2937' }}>—</span>
                                                        )}
                                                    </td>

                                                    {/* Action — "Review" for PENDING, "View" for CANCELLED, "Update" for others */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        {isPending ? (
                                                            <Link to={`/admin/booking/review/${booking.bookingCode}`}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200"
                                                                style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#d97706'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 14px rgba(245,158,11,0.5)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#fbbf24'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                                <FaClipboardCheck className="text-[10px]" /> Review
                                                            </Link>
                                                        ) : booking.status === 'CANCELLED' ? (
                                                            <Link to={`/admin/booking/review/${booking.bookingCode}`}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200"
                                                                style={{ background: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.25)' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#4b5563'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 14px rgba(107,114,128,0.4)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(107,114,128,0.1)'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                                <FaSearch className="text-[10px]" /> View
                                                            </Link>
                                                        ) : (
                                                            <Link to={`/admin/booking/review/${booking.bookingCode}`}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200"
                                                                style={{ background: 'rgba(244,81,30,0.1)', color: '#ff8a65', border: '1px solid rgba(244,81,30,0.25)' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#f4511e'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 14px rgba(244,81,30,0.5)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,81,30,0.1)'; e.currentTarget.style.color = '#ff8a65'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                                <FaEdit className="text-[10px]" /> Update
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Pagination ───────────────────────────── */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                    <p className="text-xs font-semibold" style={{ color: '#374151' }}>
                                        Page <span style={{ color: '#9ca3af' }}>{safePage}</span> of <span style={{ color: '#9ca3af' }}>{totalPages}</span>
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all disabled:opacity-20"
                                            style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                                            <FaChevronLeft />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                                            .reduce((acc, n, i, arr) => {
                                                if (i > 0 && n - arr[i - 1] > 1) acc.push('…');
                                                acc.push(n);
                                                return acc;
                                            }, [])
                                            .map((n, i) =>
                                                typeof n === 'string' ? (
                                                    <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-xs" style={{ color: '#374151' }}>…</span>
                                                ) : (
                                                    <button key={n} onClick={() => setPage(n)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                                                        style={n === safePage
                                                            ? { background: '#f4511e', color: '#fff', boxShadow: '0 0 10px rgba(244,81,30,0.5)' }
                                                            : { background: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>
                                                        {n}
                                                    </button>
                                                )
                                            )}
                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all disabled:opacity-20"
                                            style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}
