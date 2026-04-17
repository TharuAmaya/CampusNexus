/**
 * BookingCard.jsx
 *
 * Student-facing booking tile used in the "My Bookings" grid.
 * Accepts a booking object and the resourcesMap (id → name).
 * Wraps itself in a Link for navigation to the details page.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserGraduate } from 'react-icons/fa';
import BookingStatusBadge from './BookingStatusBadge';
import { formatTime, formatDate, formatCode } from '../../utils/formatters';

/**
 * @param {{
 *   booking: Object,
 *   resourcesMap: Object,
 *   isNew?: boolean
 * }} props
 */
export default function BookingCard({ booking, resourcesMap, isNew = false }) {
    const facilityName =
        resourcesMap[booking.resourceId] || booking.resourceId || 'Facility Booking';

    return (
        <Link
            to={`/student/booking/${booking.bookingCode}`}
            className={`group relative bg-white/95 backdrop-blur-2xl p-0 shadow-2xl hover:shadow-[0_45px_100px_rgba(0,0,0,0.5)] border transition-all duration-700 hover:-translate-y-4 flex flex-col overflow-hidden ${isNew
                ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)] ring-2 ring-emerald-400/60 animate-pulse-once'
                : 'border-white/50'
                }`}
        >
            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-bl-full filter blur-3xl group-hover:bg-blue-400/20 transition-all duration-700 pointer-events-none" />
            {/* Card body */}
            <div className="p-7 pb-6 flex-1 relative z-10">
                {/* Status + ID */}
                <div className="flex justify-between items-start mb-6">
                    <BookingStatusBadge status={booking.status} />
                    <span className="text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">
                        ID: {formatCode(booking.bookingCode)}
                    </span>
                </div>

                {/* Facility name */}
                <h3
                    className="text-xl md:text-2xl font-black text-gray-900 mb-2 line-clamp-1 group-hover:text-[#f4511e] transition-colors duration-500 tracking-tighter uppercase"
                    title={facilityName}
                >
                    {facilityName}
                </h3>
                <p className="text-[10px] font-black text-[#f4511e] mb-4 flex items-center gap-2 uppercase tracking-widest opacity-90">
                    <FaMapMarkerAlt className="opacity-70 text-[10px]" /> Main Campus Hub
                </p>

                {/* Requester Identity */}
                <div className="mb-6 flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 group-hover:bg-white transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                        <FaUserGraduate className="text-gray-400 text-xs" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Requester Identity</p>
                        <p className="text-[11px] font-black text-gray-800 uppercase tracking-tight group-hover:text-[#f4511e] transition-colors">
                            {booking.studentRegNumber || '—'}
                            <span className="mx-2 text-gray-200 font-normal">|</span>
                            <span className="text-gray-500 font-bold">{booking.studentName || 'Anonymous'}</span>
                        </p>
                    </div>
                </div>

                {/* Date & time */}
                <div className="space-y-3">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 group-hover:border-[#f4511e]/20 transition-all duration-500 shadow-sm hover:shadow-md">
                        <FaCalendarAlt className="text-[#f4511e] text-xl opacity-80" />
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reservation Date</p>
                            <p className="text-base font-black text-gray-900 tracking-tighter">{formatDate(booking.bookingDate)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 group-hover:border-[#f4511e]/20 transition-all duration-500 shadow-sm hover:shadow-md">
                        <FaClock className="text-[#f4511e] text-xl opacity-80" />
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time Slot</p>
                            <p className="text-base font-black text-gray-900 tracking-tighter">
                                {formatTime(booking.startTime)}{' '}
                                <span className="text-gray-300 font-normal mx-1">—</span>{' '}
                                {formatTime(booking.endTime)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="bg-gray-50 border-t border-gray-100 flex items-center justify-center py-4 transition-all duration-700 group-hover:bg-[#f4511e] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <span className="text-[10px] font-black text-gray-400 tracking-[0.4em] uppercase group-hover:text-white transition-all duration-500 relative z-10 group-hover:scale-105">
                    VIEW RESERVATION
                </span>
            </div>
        </Link>
    );
}
