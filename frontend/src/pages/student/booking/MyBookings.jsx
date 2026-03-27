import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
    FaCalendarPlus, FaCalendarAlt, FaClock, 
    FaInfoCircle, FaMapMarkerAlt, FaCheckCircle, 
    FaTimesCircle, FaHourglassHalf, FaArrowRight 
} from 'react-icons/fa';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');

                // First get the user profile to find the user ID
                const profileRes = await fetch('http://localhost:8081/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!profileRes.ok) throw new Error('Failed to fetch user profile');
                const user = await profileRes.json();

                // Now fetch the bookings using the user ID
                const userId = user.id.toString();

                const bookingsRes = await fetch(`http://localhost:8081/api/bookings/my?userId=${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (bookingsRes.ok) {
                    const data = await bookingsRes.json();
                    setBookings(data);
                } else {
                    setError('Unable to retrieve your bookings at this time.');
                }
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError('A network error occurred. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <FaCheckCircle className="text-emerald-500" />;
            case 'REJECTED': return <FaTimesCircle className="text-rose-500" />;
            case 'CANCELLED': return <FaTimesCircle className="text-gray-400" />;
            default: return <FaHourglassHalf className="text-amber-500 animate-pulse" />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'REJECTED': return 'bg-rose-50 text-rose-800 border-rose-200';
            case 'CANCELLED': return 'bg-gray-50 text-gray-800 border-gray-200';
            default: return 'bg-amber-50 text-amber-800 border-amber-200';
        }
    };

    return (
        <DashboardLayout hideTitle={true} hideBranding={true} hideHeader={true} hideSidebar={true} noPadding={true}>
            <div className="relative min-h-screen font-sans overflow-hidden bg-gray-950 flex flex-col pt-44 pb-20">

                {/* Immersive Background Image (library.jpg) */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[1px] z-0 scale-105"
                    style={{ backgroundImage: "url('/library.jpg')" }}
                ></div>

                {/* Dark color overlay */}
                <div className="absolute inset-0 bg-[#0a1e35]/70 z-10"></div>

                {/* Top Navigation Bar Positioning (Absolute) */}
                <div className="absolute top-0 left-0 z-30 w-full px-8 py-6 bg-black/10 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/student-dashboard"
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg transition-all flex items-center gap-2 border border-white/10 group shadow-lg"
                        >
                            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                            <span className="font-bold tracking-widest text-xs uppercase">BACK</span>
                        </Link>

                        <div className="h-6 w-[1px] bg-white/20 ml-2"></div>

                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <span className="text-blue-400">Reserve Reservation</span>
                        </nav>
                    </div>

                    <Link
                        to="/student/booking/new"
                        className="flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-8 py-3 rounded-none shadow-lg transition-all font-bold uppercase tracking-widest text-xs active:scale-95"
                    >
                        <FaCalendarPlus /> Create Reservation
                    </Link>
                </div>

                {/* Main Content Area */}
                <div className="relative z-20 w-full flex flex-col px-8 mx-auto max-w-7xl">
                    <header className="mb-16 text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tighter uppercase">
                            Your Facility Reservations
                        </h1>
                        <p className="text-lg md:text-xl font-light text-gray-200 leading-relaxed max-w-3xl mx-auto">
                            Oversee and organize all your upcoming campus resource bookings with our intuitive reservation dashboard. Stay updated on approval statuses in real-time.
                        </p>
                    </header>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 text-center max-w-2xl mx-auto rounded-none shadow-2xl">
                            <FaInfoCircle className="text-5xl text-rose-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Access Interrupted</h2>
                            <p className="text-gray-300 mb-8">{error}</p>
                            <button onClick={() => window.location.reload()} className="bg-white text-gray-900 px-8 py-3 font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-gray-100 transition-all">
                                Refresh View
                            </button>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-20 text-center max-w-3xl mx-auto rounded-none shadow-2xl">
                            <FaCalendarPlus className="text-6xl text-white/20 mx-auto mb-8" />
                            <h2 className="text-3xl font-black text-white mb-6 leading-tight tracking-tighter uppercase">No Active Reservations</h2>
                            <p className="text-lg font-light text-gray-300 mb-10 leading-relaxed">
                                You currently have no resource bookings scheduled. Start exploring available campus facilities and submit your first request today.
                            </p>
                            <Link to="/student/booking/new" className="bg-[#f4511e] hover:bg-[#d84315] text-white px-10 py-4 font-bold uppercase tracking-widest text-xs shadow-lg inline-flex items-center gap-3 transition-all active:scale-95">
                                Discover Resources <FaArrowRight />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {bookings.map((booking) => (
                                <Link
                                    to={`/student/booking/${booking.bookingCode}`}
                                    key={booking.bookingCode}
                                    className="group relative bg-white/95 backdrop-blur-2xl p-0 shadow-2xl hover:shadow-[0_45px_100px_rgba(0,0,0,0.5)] border border-white/50 transition-all duration-700 hover:-translate-y-4 flex flex-col overflow-hidden"
                                >
                                    {/* Design Element: Abstract Glass Flare */}
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-bl-full filter blur-3xl group-hover:bg-blue-400/20 transition-all duration-700 pointer-events-none"></div>

                                    <div className="p-10 pb-6 flex-1 relative z-10">
                                        <div className="flex justify-between items-start mb-10">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-none border ${getStatusBadgeClass(booking.status)} shadow-sm`}>
                                                {getStatusIcon(booking.status)}
                                                <span>{booking.status}</span>
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase opacity-60">
                                                ID: {booking.bookingCode.substring(0, 8)}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 line-clamp-1 group-hover:text-[#f4511e] transition-colors duration-500 tracking-tight uppercase">
                                            {booking.resourceId || 'Facility Booking'}
                                        </h3>
                                        <p className="text-xs font-bold text-[#f4511e] mb-12 flex items-center gap-2 uppercase tracking-widest opacity-80">
                                            <FaMapMarkerAlt className="opacity-70" />
                                            Main Campus Hub
                                        </p>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-6 bg-gray-50 p-6 border border-gray-100 group-hover:bg-white/80 transition-all duration-500 shadow-sm">
                                                <FaCalendarAlt className="text-[#f4511e] text-xl opacity-70" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reservation Date</p>
                                                    <p className="text-lg font-bold text-gray-800 tracking-tight">{booking.bookingDate}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 bg-gray-50 p-6 border border-gray-100 group-hover:bg-white/80 transition-all duration-500 shadow-sm">
                                                <FaClock className="text-[#f4511e] text-xl opacity-70" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time Slice</p>
                                                    <p className="text-lg font-bold text-gray-800 tracking-tight">
                                                        {booking.startTime.substring(0, 5)} <span className="text-gray-300 font-normal mx-1">—</span> {booking.endTime.substring(0, 5)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 border-t border-gray-100 flex items-center justify-center py-6 transition-all duration-500 group-hover:bg-[#f4511e]">
                                        <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase group-hover:text-white transition-colors">VIEW RESERVATION</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer pinned absolutely at the bottom */}
                <div className="absolute bottom-8 left-0 w-full z-20 text-center px-4">
                    <p className="text-white/40 text-[10px] tracking-[0.3em] font-bold uppercase opacity-50">
                        © 2026 CampusNexus Hub. All Rights Reserved
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyBookings;
