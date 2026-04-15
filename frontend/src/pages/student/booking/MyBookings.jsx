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
import { FaCalendarPlus, FaInfoCircle, FaArrowRight } from 'react-icons/fa';

import { useBookings } from '../../../hooks/useBookings';
import BookingCard from '../../../components/booking/BookingCard';
import SkeletonCard from '../../../components/booking/SkeletonCard';
import Pagination from '../../../components/booking/Pagination';

const ITEMS_PER_PAGE = 6;

export default function MyBookings() {
    const { bookings, resourcesMap, isLoading, isRefreshing, error, refresh } = useBookings();
    const [currentPage, setCurrentPage] = useState(1);
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

    return (
        <DashboardLayout title="All Bookings" noPadding={true}>
            <div className="relative min-h-screen font-sans overflow-hidden bg-gray-950 flex flex-col pt-44">

                {/* ── Background ──────────────────────────────────────── */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[1px] z-0 scale-105"
                    style={{ backgroundImage: "url('/library.jpg')" }}
                />
                <div className="absolute inset-0 bg-[#0a1e35]/70 z-10" />

                {/* ── Top bar ─────────────────────────────────────────── */}
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
                            className="flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-8 py-3 rounded-none shadow-lg transition-all font-bold uppercase tracking-widest text-xs active:scale-95"
                        >
                            <FaCalendarPlus /> Create Reservation
                        </Link>
                    </div>
                </div>

                {/* ── Main ────────────────────────────────────────────── */}
                <div className="relative z-20 w-full flex flex-col px-8 mx-auto max-w-7xl">
                    <header className="mb-16 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-md mb-3 flex items-center justify-center gap-4">
                            Your Facility Reservations
                        </h1>
                        <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed tracking-wide">
                            Oversee and organize all your upcoming campus resource bookings with our intuitive reservation dashboard.
                        </p>
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
                                className="bg-[#f4511e] hover:bg-[#d84315] text-white px-10 py-4 font-bold uppercase tracking-widest text-xs shadow-lg inline-flex items-center gap-3 transition-all active:scale-95"
                            >
                                Discover Resources <FaArrowRight />
                            </Link>
                        </div>
                    )}

                    {/* Booking grid + pagination */}
                    {!isLoading && !error && bookings.length > 0 && (
                        <div className="flex flex-col gap-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {bookings
                                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                    .map((booking) => (
                                        <BookingCard
                                            key={booking.bookingCode}
                                            booking={booking}
                                            resourcesMap={resourcesMap}
                                            isNew={booking.bookingCode === newBookingCode}
                                        />
                                    ))}
                            </div>

                            <Pagination
                                total={bookings.length}
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
