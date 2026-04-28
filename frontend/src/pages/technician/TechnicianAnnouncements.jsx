import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaBullhorn } from 'react-icons/fa';

const StudentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8081/api/announcements', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAnnouncements(data);
                }
            } catch (error) {
                console.error("Error fetching announcements", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    return (
        <DashboardLayout title="Campus Announcements">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                        <FaBullhorn />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">Important Updates</h2>
                        <p className="text-blue-100 mt-1 text-lg">Stay informed with the latest news from campus administration.</p>
                    </div>
                </div>

                {/* Announcement Cards */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500 animate-pulse">Checking for updates...</div>
                ) : announcements.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border text-center text-gray-500 shadow-sm">
                        <FaBullhorn className="text-4xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-800">You're all caught up!</h3>
                        <p>There are no new announcements for you at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((ann) => (
                            <div key={ann.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{ann.title}</h3>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                                    <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">
                                        From: Administration
                                    </span>
                                    <span>{new Date(ann.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentAnnouncements;