import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { FaSearch, FaFilter, FaBan, FaCheckCircle, FaClock, FaQrcode } from 'react-icons/fa';

const AdminBookingDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8081/api/admin/bookings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setBookings(data);
                } else {
                    setError("Unable to load booking records.");
                }
            } catch (err) {
                console.error("Error fetching admin bookings:", err);
                setError("Network error occurred. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filteredBookings = filter === 'ALL' 
        ? bookings 
        : bookings.filter(b => b.status === filter);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'PENDING': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            case 'REJECTED': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            case 'CANCELLED': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
            default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <FaCheckCircle />;
            case 'PENDING': return <FaClock />;
            case 'REJECTED': return <FaBan />;
            default: return <div className="w-3 h-3 rounded-full bg-current opacity-50"></div>;
        }
    };

    return (
        <DashboardLayout 
            title="Booking Administration" 
            hideHeader={true} 
            hideSidebar={true} 
            noPadding={true}
        >
            <div className="min-h-screen bg-transparent py-24 px-6 md:px-12 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-indigo-900/40 blur-3xl mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-blue-900/40 blur-3xl mix-blend-screen pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                        <div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-bold tracking-widest text-[#93c5fd] uppercase mb-4">
                                <Link to="/admin-dashboard" className="hover:text-white transition-colors duration-200 cursor-pointer">ADMIN COMMAND</Link>
                                <span className="opacity-50">/</span>
                                <span className="text-white">FACILITY BOOKINGS</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-lg">
                                Reservation Log
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <Link 
                                to="/admin/booking/scanner" 
                                className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-2xl shadow-emerald-900/50 backdrop-blur-md border border-emerald-400/30 transition-all flex items-center justify-center gap-3 group"
                            >
                                <FaQrcode className="text-lg group-hover:scale-110 transition-transform" /> 
                                Launch Scanner
                            </Link>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-3 text-gray-400">
                            <FaFilter className="text-sm" />
                            <span className="text-xs font-bold uppercase tracking-widest">Filter Status</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${filter === f ? 'bg-white text-gray-900 shadow-md transform scale-105' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    {loading ? (
                        <div className="flex justify-center items-center py-32">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-indigo-400"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-12 text-center backdrop-blur-md">
                            <p className="text-rose-400 font-bold uppercase tracking-widest">{error}</p>
                        </div>
                    ) : (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ID Code</th>
                                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Resource</th>
                                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Time</th>
                                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-gray-300">
                                        {filteredBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="p-12 text-center text-gray-500 font-medium">
                                                    No bookings found matching current criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBookings.map(booking => (
                                                <tr key={booking.bookingCode} className="hover:bg-white/5 transition-colors duration-150 group">
                                                    <td className="p-6">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(booking.status)}`}>
                                                            {getStatusIcon(booking.status)}
                                                            {booking.status}
                                                        </div>
                                                    </td>
                                                    <td className="p-6 font-mono text-sm tracking-wider text-white">
                                                        {booking.bookingCode}
                                                        {booking.hasConflict && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">Conflict</span>}
                                                    </td>
                                                    <td className="p-6 font-bold text-indigo-200">{booking.resourceId}</td>
                                                    <td className="p-6 whitespace-nowrap text-sm">{booking.bookingDate}</td>
                                                    <td className="p-6 whitespace-nowrap text-sm font-mono text-gray-400">
                                                        {booking.startTime.substring(0,5)} - {booking.endTime.substring(0,5)}
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <Link 
                                                            to={`/admin/booking/review/${booking.bookingCode}`}
                                                            className="inline-block px-5 py-2 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                                                        >
                                                            Review
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminBookingDashboard;
