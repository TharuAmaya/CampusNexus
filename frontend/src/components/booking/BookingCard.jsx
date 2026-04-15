/**
 * BookingCard.jsx
 *
 * Student-facing booking tile used in the "My Bookings" grid.
 * Accepts a booking object and the resourcesMap (id → name).
 * Wraps itself in a Link for navigation to the details page.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
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
            className={`group relative bg-white/95 backdrop-blur-2xl p-0 shadow-2xl hover:shadow-[0_45px_100px_rgba(0,0,0,0.5)] border transition-all duration-700 hover:-translate-y-4 flex flex-col overflow-hidden ${
                isNew
                    ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)] ring-2 ring-emerald-400/60 animate-pulse-once'
                    : 'border-white/50'
            }`}
        >
            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-bl-full filter blur-3xl group-hover:bg-blue-400/20 transition-all duration-700 pointer-events-none" />

            {/* Card body */}
            <div className="p-10 pb-6 flex-1 relative z-10">
                {/* Status + ID */}
                <div className="flex justify-between items-start mb-10">
                    <BookingStatusBadge status={booking.status} />
                    <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase opacity-60">
                        ID: {formatCode(booking.bookingCode)}
                    </span>
                </div>

                {/* Facility name */}
                <h3
                    className="text-2xl md:text-3xl font-black text-gray-900 mb-3 line-clamp-1 group-hover:text-[#f4511e] transition-colors duration-500 tracking-tight uppercase"
                    title={facilityName}
                >
                    {facilityName}
                </h3>
                <p className="text-xs font-bold text-[#f4511e] mb-12 flex items-center gap-2 uppercase tracking-widest opacity-80">
                    <FaMapMarkerAlt className="opacity-70" /> Main Campus Hub
                </p>

                {/* Date & time */}
                <div className="space-y-6">
                    <div className="flex items-center gap-6 bg-gray-50 p-6 border border-gray-100 group-hover:bg-white/80 transition-all duration-500 shadow-sm">
                        <FaCalendarAlt className="text-[#f4511e] text-xl opacity-70" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reservation Date</p>
                            <p className="text-lg font-bold text-gray-800 tracking-tight">{formatDate(booking.bookingDate)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 bg-gray-50 p-6 border border-gray-100 group-hover:bg-white/80 transition-all duration-500 shadow-sm">
                        <FaClock className="text-[#f4511e] text-xl opacity-70" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time Slot</p>
                            <p className="text-lg font-bold text-gray-800 tracking-tight">
                                {formatTime(booking.startTime)}{' '}
                                <span className="text-gray-300 font-normal mx-1">—</span>{' '}
                                {formatTime(booking.endTime)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="bg-gray-50 border-t border-gray-100 flex items-center justify-center py-6 transition-all duration-500 group-hover:bg-[#f4511e]">
                <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase group-hover:text-white transition-colors">
                    VIEW RESERVATION
                </span>
            </div>
        </Link>
    );
}
