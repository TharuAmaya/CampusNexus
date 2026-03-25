import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const AdminHome = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTechnicians: 0,
        totalAdmins: 0
    });
    const [loading, setLoading] = useState(true);

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

    return (
        <DashboardLayout title="Admin Dashboard Overview">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back, Admin! 👋</h1>
                <p className="text-gray-600">Here is what's happening in your Campus Nexus system today.</p>
            </div>

            {loading ? (
                <div className="text-gray-500 font-medium animate-pulse">Loading system statistics...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Card 1: Total Users */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl mr-4">
                            👥
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h3>
                        </div>
                    </div>

                    {/* Card 2: Total Students */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl mr-4">
                            🎓
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Students</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalStudents}</h3>
                        </div>
                    </div>

                    {/* Card 3: Total Technicians */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl mr-4">
                            🔧
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Technicians</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalTechnicians}</h3>
                        </div>
                    </div>

                    {/* Card 4: Total Admins */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl mr-4">
                            🛡️
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Administrators</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalAdmins}</h3>
                        </div>
                    </div>

                </div>
            )}

            {/* ඉස්සරහට අපිට මෙතන "Recent Activities" හරි "Pending Tickets" Table එකක් හරි දාන්න පුළුවන් */}
            <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 border-dashed">
                <p>System activities and charts will appear here as the system grows.</p>
            </div>

        </DashboardLayout>
    );
};

export default AdminHome;