import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const API_BASE_URL = 'http://localhost:8081';

const TechnicianHome = () => {
    const [technicianName, setTechnicianName] = useState('TECHNICIAN');
    const [stats, setStats] = useState({
        totalAssigned: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchTechnicianStats = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/technician/tickets`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || 'Failed to load technician ticket counts.');
                }

                const tickets = await response.json();
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl mr-4">
                            📋
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Assigned</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalAssigned}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-2xl mr-4">
                            🛠️
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">INPROGRESS</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.inProgress}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl mr-4">
                            ✅
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">RESOLVED</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.resolved}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
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
        </DashboardLayout>
    );
};
export default TechnicianHome;