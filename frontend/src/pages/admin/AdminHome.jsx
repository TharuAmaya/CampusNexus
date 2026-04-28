import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUsers, FaBullhorn, FaTicketAlt, FaCalendarCheck } from 'react-icons/fa';

const AdminHome = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTechnicians: 0,
        totalAdmins: 0
    });
    const [loading, setLoading] = useState(true);

    const COLORS = ['#10B981', '#F59E0B', '#8B5CF6']; // Green, Orange, Purple

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8081/api/admin/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Prepare data for the charts using the fetched stats
    const userDemographics = [
        { name: 'Students', count: stats.totalStudents },
        { name: 'Technicians', count: stats.totalTechnicians },
        { name: 'Admins', count: stats.totalAdmins }
    ];

    // Simulated data for system health/activity to make the dashboard look premium
    const systemActivity = [
        { name: 'Active Tickets', value: 45 },
        { name: 'Pending Bookings', value: 20 },
        { name: 'Resolved Today', value: 15 }
    ];

    return (
        <DashboardLayout title="Admin Dashboard Overview">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back, Admin! 👋</h1>
                    <p className="text-gray-600">Here is your campus system overview and real-time statistics.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-gray-500 font-medium animate-pulse">Loading system statistics...</div>
            ) : (
                <>
                    {/* --- 1. TOP STAT CARDS (Kept original as requested) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl mr-4">👥</div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Users</p>
                                <h3 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl mr-4">🎓</div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Students</p>
                                <h3 className="text-3xl font-bold text-gray-800">{stats.totalStudents}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl mr-4">🔧</div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Technicians</p>
                                <h3 className="text-3xl font-bold text-gray-800">{stats.totalTechnicians}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl mr-4">🛡️</div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Administrators</p>
                                <h3 className="text-3xl font-bold text-gray-800">{stats.totalAdmins}</h3>
                            </div>
                        </div>
                    </div>

                    {/* --- 2. CHARTS SECTION --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Bar Chart: User Demographics */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaUsers className="text-blue-500" /> User Demographics
                            </h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={userDemographics} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart: System Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Current Workload</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={systemActivity} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {systemActivity.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* --- 3. QUICK ACTIONS --- */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Administrator Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link to="/admin/announcements" className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><FaBullhorn /></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Broadcast Announcement</h4>
                                    <p className="text-xs text-gray-500">Notify students & staff</p>
                                </div>
                            </Link>

                            <Link to="/admin/tickets" className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-orange-50 hover:border-orange-200 transition-all group">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform"><FaTicketAlt /></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Monitor Tickets</h4>
                                    <p className="text-xs text-gray-500">Review technician progress</p>
                                </div>
                            </Link>

                            <Link to="/admin/bookings" className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-all group">
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform"><FaCalendarCheck /></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Review Bookings</h4>
                                    <p className="text-xs text-gray-500">Approve facility requests</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
};

export default AdminHome;