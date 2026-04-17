/**
 * VerifyBooking.jsx — Public QR Verification Page
 * 
 * This page is meant to be opened when a QR code is scanned.
 * It fetches the booking details using a public token and displays
 * an "ACCESS GRANTED" or "INVALID" card.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaUserGraduate } from 'react-icons/fa';

export default function VerifyBooking() {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(`http://localhost:8081/api/bookings/verify/${token}`);
                if (!response.ok) throw new Error('Invalid Token');
                const data = await response.ok ? await response.json() : null;
                
                if (data) {
                    setBooking(data);
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus('error');
            }
        };

        if (token) verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6 font-sans">
            {/* Background Decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-white/95 backdrop-blur-2xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
                    
                    {/* Header Status Section */}
                    <div className={`py-12 text-center ${status === 'success' ? 'bg-emerald-500' : status === 'error' ? 'bg-rose-500' : 'bg-gray-800'}`}>
                        {status === 'loading' && (
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto" />
                        )}
                        {status === 'success' && (
                            <>
                                <FaCheckCircle className="text-7xl text-white mx-auto mb-6 drop-shadow-lg animate-bounce" />
                                <h1 className="text-white text-3xl font-black uppercase tracking-[0.2em]">Access Granted</h1>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-2 italic">Verified by CampusNexus Authentication</p>
                            </>
                        )}
                        {status === 'error' && (
                            <>
                                <FaTimesCircle className="text-7xl text-white mx-auto mb-6 drop-shadow-lg" />
                                <h1 className="text-white text-3xl font-black uppercase tracking-[0.2em]">Verification Failed</h1>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-2">Invalid or Expired QR Token</p>
                            </>
                        )}
                    </div>

                    {/* Content Section */}
                    {status === 'success' && booking && (
                        <div className="p-8 space-y-8">
                            {/* Student Identity */}
                            <div className="bg-gray-50 p-6 border border-gray-100 relative group overflow-hidden">
                                <div className="absolute top-[-10px] right-[-10px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                    <FaUserGraduate className="text-9xl text-gray-900" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4">Authorized Student</p>
                                <h2 className="text-2xl font-black text-gray-800 truncate">{booking.studentName || 'Authenticated User'}</h2>
                                <p className="text-indigo-600 font-mono font-bold tracking-widest text-sm mt-1">{booking.studentRegNumber || 'REG-ID-PENDING'}</p>
                            </div>

                            {/* Booking Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-5 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FaCalendarAlt className="text-indigo-500" /> Date</p>
                                    <p className="text-lg font-black text-gray-800">{booking.bookingDate}</p>
                                </div>
                                <div className="bg-gray-50 p-5 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FaUsers className="text-indigo-500" /> Attendees</p>
                                    <p className="text-lg font-black text-gray-800">{booking.expectedAttendees} <span className="text-[10px] text-gray-400 ml-1">People</span></p>
                                </div>
                                <div className="col-span-2 bg-gray-950 p-5 border border-white/5">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><FaMapMarkerAlt /> Confirmed Venue</p>
                                    <p className="text-xl font-black text-white uppercase tracking-tight">{booking.resourceId}</p>
                                </div>
                            </div>

                            {/* Time Slot Banner */}
                            <div className="bg-indigo-600 p-6 flex items-center justify-between text-white shadow-[0_20px_40px_rgba(99,102,241,0.3)]">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 flex items-center gap-1.5"><FaClock /> Check-In Window</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black tracking-tighter tabular-nums">{booking.startTime.substring(0,5)}</span>
                                        <span className="text-white/40 font-light">—</span>
                                        <span className="text-2xl font-black tracking-tighter tabular-nums">{booking.endTime.substring(0,5)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[20px] font-black tracking-widest text-white/20 uppercase rotate-[-90deg] translate-x-4">TIME</p>
                                </div>
                            </div>

                            {/* Purpose */}
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Scheduled Activity</p>
                                <p className="text-gray-700 font-medium leading-relaxed italic line-clamp-2">"{booking.purpose}"</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                This QR code has either expired, been cancelled, or is counterfeit. Please contact the CampusNexus support desk if you believe this is an error.
                            </p>
                            <Link to="/login" className="bg-rose-500 text-white px-8 py-3 font-bold uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95 inline-block shadow-lg rounded-none">
                                Return to Portal
                            </Link>
                        </div>
                    )}

                    {/* Footer Brand */}
                    <div className="bg-gray-50 py-4 px-8 border-t border-gray-100 flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Official CampusNexus Verification Layer</span>
                    </div>
                </div>

                {/* Return link for convenience */}
                <div className="mt-8 text-center">
                    <Link to="/" className="text-white/20 hover:text-white/60 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                        ← Exit Secure Verification
                    </Link>
                </div>
            </div>
        </div>
    );
}
