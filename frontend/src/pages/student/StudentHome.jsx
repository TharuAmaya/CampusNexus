import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaTicketAlt, FaCalendarCheck, FaTasks, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';

const StudentHome = () => {
    const [userName, setUserName] = useState('');
    const [tickets, setTickets] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pie Chart එකට ලස්සන පාට ටිකක්
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EF4444'];
    const BOOKING_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                // 1. User ගේ නම සහ ID එක ගන්නවා (Bookings වලට userId එක ඕනේ නිසා)
                const profileRes = await fetch('http://localhost:8081/api/user/profile', { headers });
                let userId = ''; // <-- මෙතන email වෙනුවට userId කියලා හැදුවා
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setUserName(profileData.fullName || 'Student');
                    userId = profileData.id; // <-- මෙතන email එක වෙනුවට id එක ගත්තා (යාළුවාගේ කෝඩ් එකේ වගේ)
                }

                // 2. Student ගේ Tickets ටික ගන්නවා
                const ticketsRes = await fetch('http://localhost:8081/api/tickets/my-tickets', { headers });
                const ticketsData = ticketsRes.ok ? await ticketsRes.json() : [];
                setTickets(ticketsData);

                // 3. Student ගේ Bookings ටික ගන්නවා
                if (userId) { // <-- මෙතන email වෙනුවට userId දැම්මා
                    // යවන URL එකටත් userId එක දැම්මා
                    const bookingsRes = await fetch(`http://localhost:8081/api/bookings?userId=${userId}`, { headers });
                    const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
                    setBookings(bookingsData);
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- Data Processing for Cards (Overall Tasks) ---
    const totalTasks = tickets.length + bookings.length;
    
    const activeTickets = tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    
    const completedTasks = 
        tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length + 
        bookings.filter(b => b.status === 'APPROVED' || b.status === 'CHECKED_IN').length;

    // --- Data Processing for Combined Table ---
    // Tickets සහ Bookings දෙකම එකම ලිස්ට් එකකට දාලා, අලුත්ම එක උඩින් එන්න Sort කරනවා
    const combinedActivity = [
        ...tickets.map(t => ({
            id: `TKT-#${t.ticketId}`,
            type: 'Support Ticket',
            category: t.category,
            status: t.status,
            date: t.createdAt,
            priority: t.priority
        })),
        ...bookings.map(b => ({
            id: `BKG-${b.bookingCode}`,
            type: 'Resource Booking',
            category: b.resourceId || 'Facility',
            status: b.status,
            date: b.createdAt || b.bookingDate, // Fallback to booking date if createdAt is missing in DTO
            priority: 'N/A'
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by newest first

    // --- Data Processing for Charts ---
    // 1. Ticket Status Chart Data
    const ticketStatusCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
    }, {});
    const ticketChartData = Object.keys(ticketStatusCounts).map(key => ({ name: key, value: ticketStatusCounts[key] }));

    // 2. Booking Status Chart Data
    const bookingStatusCounts = bookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
    }, {});
    const bookingChartData = Object.keys(bookingStatusCounts).map(key => ({ name: key, value: bookingStatusCounts[key] }));

    return (
        <DashboardLayout title="Student Dashboard">
            <div className="space-y-6">
                
                {/* Welcome Message */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome {userName}!!</h2>
                    <p className="text-gray-500 mt-1">Here is your overall activity summary for Tickets and Bookings.</p>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500 animate-pulse">Loading dashboard...</div>
                ) : (
                    <>
                        {/* --- TOP CARDS ROW (Overall Tasks) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Tasks Card */}
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">Total Activities</p>
                                    <h3 className="text-3xl font-bold text-gray-800">{totalTasks}</h3>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-xl">
                                    <FaTasks />
                                </div>
                            </div>

                            {/* Active Tickets Card */}
                            <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-sm font-medium text-orange-600 uppercase tracking-wider mb-1">Active Tickets</p>
                                    <h3 className="text-3xl font-bold text-gray-800">{activeTickets}</h3>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-xl">
                                    <FaTicketAlt />
                                </div>
                            </div>

                            {/* Pending Bookings Card */}
                            <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 uppercase tracking-wider mb-1">Pending Bookings</p>
                                    <h3 className="text-3xl font-bold text-gray-800">{pendingBookings}</h3>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center text-xl">
                                    <FaHourglassHalf />
                                </div>
                            </div>

                            {/* Completed Tasks Card */}
                            <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-sm font-medium text-green-600 uppercase tracking-wider mb-1">Completed</p>
                                    <h3 className="text-3xl font-bold text-gray-800">{completedTasks}</h3>
                                </div>
                                <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-xl">
                                    <FaCheckCircle />
                                </div>
                            </div>
                        </div>

                        {/* --- CHARTS ROW (Split by Type) --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart 1: Ticket Status */}
                            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <FaTicketAlt className="text-orange-500"/> Ticket Status Overview
                                </h3>
                                <div className="h-64">
                                    {ticketChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={ticketChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                    {ticketChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">No tickets found</div>
                                    )}
                                </div>
                            </div>

                            {/* Chart 2: Booking Status */}
                            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <FaCalendarCheck className="text-purple-500"/> Booking Status Overview
                                </h3>
                                <div className="h-64">
                                    {bookingChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={bookingChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                    {bookingChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={BOOKING_COLORS[index % BOOKING_COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">No bookings found</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- RECENT COMBINED ACTIVITY TABLE --- */}
                        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Overall Recent Activity</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider bg-gray-50">
                                            <th className="py-3 px-4 font-medium rounded-tl-lg">ID</th>
                                            <th className="py-3 px-4 font-medium">Type</th>
                                            <th className="py-3 px-4 font-medium">Subject / Resource</th>
                                            <th className="py-3 px-4 font-medium">Status</th>
                                            <th className="py-3 px-4 font-medium rounded-tr-lg">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {combinedActivity.slice(0, 6).map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                                                <td className="py-4 px-4 font-bold text-gray-700">{item.id}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`flex items-center gap-2 font-medium ${item.type === 'Support Ticket' ? 'text-orange-600' : 'text-purple-600'}`}>
                                                        {item.type === 'Support Ticket' ? <FaTicketAlt/> : <FaCalendarCheck/>}
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-gray-600">{item.category}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                        ['RESOLVED', 'APPROVED', 'CHECKED_IN', 'CLOSED'].includes(item.status) ? 'bg-green-100 text-green-700' :
                                                        ['REJECTED', 'CANCELLED'].includes(item.status) ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-gray-500">
                                                    {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                        {combinedActivity.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-gray-500">No recent activity found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentHome;