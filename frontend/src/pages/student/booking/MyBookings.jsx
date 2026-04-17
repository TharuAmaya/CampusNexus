/**
 * MyBookings.jsx — Student Booking List Page
 *
 * Thin orchestration page.
 * All data-fetching logic lives in useBookings().
 * All reusable UI lives in components/booking/.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { FaCalendarPlus, FaInfoCircle, FaArrowRight, FaSearch, FaClock, FaCheckCircle, FaTimesCircle, FaBan, FaLayerGroup } from 'react-icons/fa';

import { useBookings } from '../../../hooks/useBookings';
import BookingCard from '../../../components/booking/BookingCard';
import SkeletonCard from '../../../components/booking/SkeletonCard';
import Pagination from '../../../components/booking/Pagination';

const ITEMS_PER_PAGE = 6;

export default function MyBookings() {
    const { bookings, resourcesMap, isLoading, isRefreshing, error, refresh } = useBookings();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const location = useLocation();
    const newBookingCode = location.state?.newBookingCode ?? null;

    // When bookings load, jump to the page containing the new booking
    useEffect(() => {
        if (!newBookingCode || bookings.length === 0) return;
        const idx = bookings.findIndex((b) => b.bookingCode === newBookingCode);
        if (idx === -1) return;
        const targetPage = Math.ceil((idx + 1) / ITEMS_PER_PAGE);
        setCurrentPage(targetPage);
    }, [newBookingCode, bookings]);

    // Filter bookings based on Student Registration Number OR Facility Name AND Status
    const filteredBookings = bookings.filter(b => {
        const regNumber = b.studentRegNumber || '';
        const facilityName = resourcesMap[b.resourceId] || '';
        
        const matchesSearch = 
            regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            facilityName.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout title="All Bookings" noPadding={true}>
            <div className="relative min-h-screen font-sans overflow-hidden bg-gray-950 flex flex-col pt-32">

                {/* ── Background ──────────────────────────────────────── */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[1px] z-0 scale-105"
                    style={{ backgroundImage: "url('/library.jpg')" }}
                />
                <div className="absolute inset-0 bg-[#0a1e35]/70 z-10" />

                {/* ... existing top bar code ... */}
                <div className="absolute top-0 left-0 z-30 w-full px-8 py-6 bg-black/10 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/student-dashboard"
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg transition-all flex items-center gap-2 border border-white/10 group shadow-lg"
                        >
                            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                            <span className="font-bold tracking-widest text-xs uppercase">BACK</span>
                        </Link>
                        <div className="h-6 w-[1px] bg-white/20 ml-2" />
                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <span className="text-blue-400">All Reservations</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {isRefreshing && (
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                Syncing…
                            </span>
                        )}
                        <Link
                            to="/student/booking/new"
                            className="group/btn relative flex items-center gap-3 bg-gradient-to-r from-[#f4511e] to-[#ff7043] text-white px-8 py-4 overflow-hidden shadow-[0_10px_20px_-5px_rgba(244,81,30,0.3)] hover:shadow-[0_20px_35px_-10px_rgba(244,81,30,0.5)] transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px] hover:-translate-y-1 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                            <FaCalendarPlus className="relative z-10 text-sm" />
                            <span className="relative z-10">Create Reservation</span>
                        </Link>
                    </div>
                </div>

                {/* ── Main ────────────────────────────────────────────── */}
                <div className="relative z-20 w-full flex flex-col px-8 mx-auto max-w-7xl">
                    <header className="mb-6 text-center">
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md mb-2 flex items-center justify-center gap-4">
                            Your Facility Reservations
                        </h1>
                        <p className="text-white/40 text-[10px] md:text-xs max-w-xl mx-auto font-normal leading-relaxed tracking-[0.2em] uppercase">
                            Oversee and organize all your upcoming campus resource bookings.
                        </p>

                        {/* ── Modern Unified Toolbar ── */}
                        <div className="mt-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full bg-white/[0.02] backdrop-blur-xl border border-white/5 p-2 rounded-2xl shadow-inner mb-6 transition-all duration-500 hover:bg-white/5">

                            {/* Filters First (Left) */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                                <div className="inline-flex p-1 bg-white/[0.03] border border-white/5 rounded-xl gap-1 flex-nowrap shrink-0">
                                    {[
                                        { id: 'ALL', label: 'All', icon: FaLayerGroup, color: 'text-blue-400', count: bookings.length },
                                        { id: 'PENDING', label: 'Pending', icon: FaClock, color: 'text-amber-400', count: bookings.filter(b => b.status === 'PENDING').length },
                                        { id: 'APPROVED', label: 'Approved', icon: FaCheckCircle, color: 'text-emerald-400', count: bookings.filter(b => b.status === 'APPROVED').length },
                                        { id: 'REJECTED', label: 'Rejected', icon: FaTimesCircle, color: 'text-rose-400', count: bookings.filter(b => b.status === 'REJECTED').length },
                                        { id: 'CANCELLED', label: 'Cancelled', icon: FaBan, color: 'text-slate-400', count: bookings.filter(b => b.status === 'CANCELLED').length },
                                    ].map((filter) => {
                                        const Icon = filter.icon;
                                        const isActive = statusFilter === filter.id;
                                        return (
                                            <button
                                                key={filter.id}
                                                onClick={() => {
                                                    setStatusFilter(filter.id);
                                                    setCurrentPage(1);
                                                }}
                                                className={`relative flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all duration-500 overflow-hidden group shrink-0 ${isActive
                                                    ? 'bg-[#f4511e] text-white shadow-xl scale-[1.02] z-10'
                                                    : 'hover:bg-white/[0.05] text-white/40 hover:text-white'
                                                    }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full animate-shimmer" />
                                                )}

                                                <Icon className={`text-xs ${isActive ? 'text-white' : filter.color + ' opacity-60'}`} />
                                                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{filter.label}</span>

                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${isActive ? 'bg-black/20 text-white' : 'bg-white/5 text-white/20 group-hover:bg-white/10'
                                                    }`}>
                                                    {filter.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Search (Right) */}
                            <div className="relative group w-full lg:w-72 h-[48px]">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaSearch className="text-white/20 group-focus-within:text-[#f4511e] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search Registration or Facility..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full h-full bg-white/[0.03] border border-white/5 px-12 text-white text-[11px] font-bold placeholder:text-white/20 outline-none focus:border-[#f4511e]/50 focus:bg-white/10 transition-all tracking-widest uppercase rounded-xl"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white transition-colors"
                                    >
                                        <FaTimesCircle className="text-xs" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Results Counter */}
                        {!isLoading && !error && bookings.length > 0 && (
                            <div className="mb-4 text-center animate-fade-in">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                                    Displaying <span className="text-[#f4511e]">{filteredBookings.length}</span> matching reservations
                                </p>
                            </div>
                        )}
                    </header>

                    {/* Error state */}
                    {error && (
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 text-center max-w-2xl mx-auto rounded-none shadow-2xl mb-8">
                            <FaInfoCircle className="text-5xl text-rose-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Access Interrupted</h2>
                            <p className="text-gray-300 mb-8">{error}</p>
                            <div className="flex items-center justify-center gap-4">
                                {error.includes('session') || error.includes('log in') ? (
                                    <Link
                                        to="/login"
                                        className="bg-[#f4511e] hover:bg-[#d84315] text-white px-8 py-3 font-bold uppercase tracking-widest text-xs shadow-lg transition-all"
                                    >
                                        Log In Again
                                    </Link>
                                ) : (
                                    <button
                                        onClick={refresh}
                                        className="bg-white text-gray-900 px-8 py-3 font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-gray-100 transition-all"
                                    >
                                        Retry
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Skeleton (first load only) */}
                    {isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && !error && bookings.length === 0 && (
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-20 text-center max-w-3xl mx-auto rounded-none shadow-2xl">
                            <FaCalendarPlus className="text-6xl text-white/20 mx-auto mb-8" />
                            <h2 className="text-3xl font-black text-white mb-6 leading-tight tracking-tighter uppercase">
                                No Active Reservations
                            </h2>
                            <p className="text-lg font-light text-gray-300 mb-10 leading-relaxed">
                                You currently have no resource bookings scheduled. Start exploring
                                available campus facilities and submit your first request today.
                            </p>
                            <Link
                                to="/student/booking/new"
                                className="group/btn relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-br from-[#f4511e] to-[#ff7043] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 shadow-[0_20px_40px_-15px_rgba(244,81,30,0.4)] hover:shadow-[0_30px_55px_-12px_rgba(244,81,30,0.6)] hover:-translate-y-1.5 active:scale-95 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                                <span className="relative z-10 flex items-center gap-3">
                                    Discover Resources <FaArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    )}

                    {/* No matching results state */}
                    {!isLoading && !error && bookings.length > 0 && filteredBookings.length === 0 && (
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-16 text-center max-w-2xl mx-auto mt-12 shadow-2xl">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                                <FaSearch className="text-white/20 text-2xl" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">No matching reservations</h3>
                            <p className="text-white/40 text-sm font-light leading-relaxed mb-8">
                                We couldn't find any reservations matching your {statusFilter !== 'ALL' ? `"${statusFilter}" status filter` : 'search criteria'}.
                                Try adjusting your filters or search terms.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                }}
                                className="text-[#f4511e] font-black uppercase tracking-[0.25em] text-[10px] hover:text-white transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {/* Booking grid + pagination */}
                    {!isLoading && !error && filteredBookings.length > 0 && (
                        <div className="flex flex-col gap-10 mb-20 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBookings
                                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                    .map((booking, idx) => (
                                        <div key={booking.bookingCode} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <BookingCard
                                                booking={booking}
                                                resourcesMap={resourcesMap}
                                                isNew={booking.bookingCode === newBookingCode}
                                            />
                                        </div>
                                    ))}
                            </div>

                            <Pagination
                                total={filteredBookings.length}
                                pageSize={ITEMS_PER_PAGE}
                                current={currentPage}
                                onChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────────────── */}
                <div className="absolute bottom-8 left-0 w-full z-20 text-center px-4">
                    <p className="text-white/40 text-[10px] tracking-[0.3em] font-bold uppercase opacity-50">
                        © 2026 CampusNexus Hub. All Rights Reserved
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
