import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const API_BASE_URL = 'http://localhost:8081';

const TechnicianHome = () => {
    const [technicianName, setTechnicianName] = useState('TECHNICIAN');
    const [stats, setStats] = useState({
        totalAssigned: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
    });
    const [chartData, setChartData] = useState({
        byStatus: [],
        byPriority: []
    });
    const [recentTickets, setRecentTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchTechnicianStats = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const token = localStorage.getItem('token');
                
                // Fetch tickets for stats cards
                // --- API CALL: GET /api/technician/tickets ---
                // Fetches assigned tickets to calculate counts and display recent items
                const ticketsResponse = await fetch(`${API_BASE_URL}/api/technician/tickets`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!ticketsResponse.ok) {
                    const message = await ticketsResponse.text();
                    throw new Error(message || 'Failed to load technician ticket counts.');
                }

                const tickets = await ticketsResponse.json();
                const list = Array.isArray(tickets) ? tickets : [];

                const counts = list.reduce((acc, ticket) => {
                    const normalized = String(ticket?.status || '').toUpperCase();

                    acc.totalAssigned += 1;
                    if (normalized === 'IN_PROGRESS' || normalized === 'INPROGRESS') {
                        acc.inProgress += 1;
                    }
                    if (normalized === 'RESOLVED') {
                        acc.resolved += 1;
                    }
                    if (normalized === 'CLOSED') {
                        acc.closed += 1;
                    }

                    return acc;
                }, {
                    totalAssigned: 0,
                    inProgress: 0,
                    resolved: 0,
                    closed: 0
                });

                setStats(counts);
                
                // Get recent 5 tickets
                const recent = list.slice(0, 5);
                setRecentTickets(recent);

                // Fetch dashboard stats for pie charts
                // --- API CALL: GET /api/technician/tickets/dashboard/stats ---
                // Gets aggregated statistics (by status, priority) for the dashboard charts
                const statsResponse = await fetch(`${API_BASE_URL}/api/technician/tickets/dashboard/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (statsResponse.ok) {
                    const dashboardStats = await statsResponse.json();
                    
                    // Prepare status data for pie chart
                    const statusData = [
                        { name: 'In Progress', value: dashboardStats.byStatus.IN_PROGRESS || 0, color: '#F59E0B' },
                        { name: 'Resolved', value: dashboardStats.byStatus.RESOLVED || 0, color: '#10B981' },
                        { name: 'Closed', value: dashboardStats.byStatus.CLOSED || 0, color: '#6B7280' }
                    ].filter(item => item.value > 0);

                    // Prepare priority data for pie chart
                    const priorityData = [
                        { name: 'High', value: dashboardStats.byPriority.HIGH || 0, color: '#EF4444' },
                        { name: 'Medium', value: dashboardStats.byPriority.MEDIUM || 0, color: '#F59E0B' },
                        { name: 'Low', value: dashboardStats.byPriority.LOW || 0, color: '#3B82F6' }
                    ].filter(item => item.value > 0);

                    setChartData({
                        byStatus: statusData,
                        byPriority: priorityData
                    });
                }
            } catch (error) {
                setErrorMessage(error.message || 'Unable to load ticket summary.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTechnicianStats();
    }, []);

    useEffect(() => {
        const fetchTechnicianProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    return;
                }

                const profile = await response.json();
                const fullName = String(profile?.fullName || '').trim();
                if (fullName) {
                    const normalizedName = fullName
                        .replace(/\s+/g, ' ')
                        .toLowerCase()
                        .split(' ')
                        .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : part)
                        .join(' ');
                    setTechnicianName(normalizedName);
                }
            } catch {
                // Keep default fallback name when profile fetch fails.
            }
        };

        fetchTechnicianProfile();
    }, []);

    return (
        <DashboardLayout title="Technician Dashboard">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Welcome {technicianName}!!</h1>
            </div>

            {isLoading ? (
                <div className="text-gray-500 font-medium animate-pulse">Loading ticket statistics...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl mr-4">
                            📋
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Assigned</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalAssigned}</h3>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm border border-amber-200 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-2xl mr-4">
                            🛠️
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">INPROGRESS</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.inProgress}</h3>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl mr-4">
                            ✅
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">RESOLVED</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.resolved}</h3>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-2xl mr-4">
                            🔒
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">CLOSED</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.closed}</h3>
                        </div>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {errorMessage}
                </div>
            )}

            {/* Pie Charts Section */}
            {!isLoading && !errorMessage && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        {/* Status Pie Chart */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm border border-orange-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Tickets by Status</h2>
                            {chartData.byStatus.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData.byStatus}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.byStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-gray-500">
                                    No ticket data available
                                </div>
                            )}
                        </div>

                        {/* Priority Pie Chart */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Tickets by Priority</h2>
                            {chartData.byPriority.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData.byPriority}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.byPriority.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-gray-500">
                                    No ticket data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Tickets Table */}
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-sm border border-cyan-200 p-6 mt-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Assigned Tickets</h2>
                        {recentTickets.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Ticket ID</th>
                                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Category</th>
                                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Priority</th>
                                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTickets.map((ticket) => (
                                            <tr key={ticket.ticketId} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-3 text-sm font-medium text-gray-900">#{ticket.ticketId}</td>
                                                <td className="p-3 text-sm text-gray-700">{ticket.category || '-'}</td>
                                                <td className="p-3 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        ticket.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                        ticket.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {ticket.priority || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                                        ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {ticket.status || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No recent tickets found
                            </div>
                        )}
                    </div>
                </>
            )}
        </DashboardLayout>
    );
};
export default TechnicianHome;