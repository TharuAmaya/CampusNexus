import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaTicketAlt, FaCalendarCheck, FaBell, FaCheckCircle } from 'react-icons/fa';

const TechnicianNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL'); 

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8081/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                setNotifications(notifications.map(notif => 
                    notif.id === id ? { ...notif, isRead: true } : notif
                ));
            }
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === 'ALL') return true;
        return notif.type === activeTab;
    });

    return (
        <DashboardLayout title="Technician Notifications">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button onClick={() => setActiveTab('ALL')} className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'ALL' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <div className="flex items-center justify-center gap-2"><FaBell /> All Updates</div>
                    </button>
                    <button onClick={() => setActiveTab('TICKET')} className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'TICKET' ? 'text-orange-600 border-b-2 border-orange-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <div className="flex items-center justify-center gap-2"><FaTicketAlt /> Tickets</div>
                    </button>
                    <button onClick={() => setActiveTab('BOOKING')} className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'BOOKING' ? 'text-green-600 border-b-2 border-green-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <div className="flex items-center justify-center gap-2"><FaCalendarCheck /> Bookings</div>
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 animate-pulse">Loading notifications...</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"><FaBell /></div>
                            <h3 className="text-lg font-medium text-gray-800">No notifications yet</h3>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredNotifications.map((notif) => (
                                <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${notif.isRead ? 'bg-white border-gray-100 opacity-75' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
                                    <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${notif.type === 'TICKET' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                        {notif.type === 'TICKET' ? <FaTicketAlt /> : <FaCalendarCheck />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-gray-800 ${notif.isRead ? '' : 'font-semibold'}`}>{notif.message}</p>
                                        <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">{new Date(notif.createdAt).toLocaleString()}</p>
                                    </div>
                                    {!notif.isRead && (
                                        <button onClick={() => handleMarkAsRead(notif.id)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors tooltip" title="Mark as read">
                                            <FaCheckCircle className="text-xl" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TechnicianNotifications;