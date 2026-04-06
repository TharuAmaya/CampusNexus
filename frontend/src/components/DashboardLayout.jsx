import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
// අලුතින් Hamburger සහ Close icons ගමු
import { FaUser, FaTicketAlt, FaUsers, FaUserPlus, FaBook, FaBell, FaTools, FaHome, FaBars, FaTimes, FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';

const DashboardLayout = ({ children, title, noPadding = false, hideBranding = false, hideHeader = false, hideSidebar = false, hideTitle = false }) => {
    const location = useLocation();
    // State එකක් හදනවා Mobile Sidebar එක open/close වෙන්න
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 1. Token එකෙන් Role එක ගන්නවා
    const token = localStorage.getItem('token');
    let userRole = 'ROLE_STUDENT'; // Default
    try {
        if (token) {
            userRole = jwtDecode(token).role;
        }
    } catch (e) {
        console.error("Token error in layout", e);
    }

    // 2. Role එක අනුව Sidebar Links (Tasks) තීරණය කරනවා
    const getSidebarLinks = () => {
        const commonLinks = [
            { name: 'Dashboard Home', path: userRole === 'ROLE_ADMIN' ? '/admin-dashboard' : userRole === 'ROLE_TECHNICIAN' ? '/technician-dashboard' : '/student-dashboard', icon: <FaHome /> },
            { name: 'Profile', path: '/profile', icon: <FaUser /> },
            { name: 'Notifications', path: '/notifications', icon: <FaBell /> }
        ];

        if (userRole === 'ROLE_ADMIN') {
            return [...commonLinks,
            { name: 'Ticket Management', path: '/admin/tickets', icon: <FaTicketAlt /> },
            { name: 'User List', path: '/admin/users', icon: <FaUsers /> }];

        } else if (userRole === 'ROLE_STUDENT') {
            return [...commonLinks,
            { name: 'Publish Ticket', path: '/student/publish-ticket', icon: <FaTicketAlt /> },
            { name: 'All Tickets', path: '/student/all-tickets', icon: <FaTicketAlt /> },
            { name: 'Resources', path: '/student/resources', icon: <FaBook /> },
            // මෙන්න අලුතින් දාපු එක:
            { name: 'View Grades', path: '/student/grades', icon: <FaGraduationCap /> },
            { name: 'Resource Booking', path: '/student/booking', icon: <FaCalendarAlt /> }];

        } else if (userRole === 'ROLE_TECHNICIAN') {
            return [...commonLinks,
            { name: 'Assigned Tickets', path: '/technician/tickets', icon: <FaTicketAlt /> },
            { name: 'Maintenance Logs', path: '/technician/logs', icon: <FaTools /> }];
        }
        return commonLinks;
    };

    const links = getSidebarLinks();

    // Sidebar Content Component (එකම කෝඩ් එක Desktop සහ Mobile දෙකටම පාවිච්චි කරන්න)
    const SidebarContent = () => (
        <>
            {!hideBranding && (
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-blue-400">Campus Portal</h2>
                </div>
            )}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {links.map((link, index) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={index}
                            to={link.path}
                            onClick={() => setIsSidebarOpen(false)} // ලින්ක් එකක් එබුවම මෙනු එක වහන්න
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{link.icon}</span>
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );

    return (
        // *විසඳුම 3 (Gap එක): pt-16 සහ h-screen අයින් කළා. h-screen වෙනුවට flex-1 දැම්මා
        <div className="flex bg-gray-50 flex-1 w-full min-h-[calc(100vh-4rem)] items-stretch">

            {/* -- DESKTOP SIDEBAR (w-64) -- */}
            {!hideSidebar && (
                <div className="w-64 bg-[#1e293b] text-white flex flex-col shadow-xl hidden md:flex">
                    <SidebarContent />
                </div>
            )}

            {/* -- MOBILE SIDEBAR (Drawer) -- */}
            {/* Overlay (පස්සෙන් එන කළු පාට පසුබිම) - එබුවම මෙනු එක වැහෙනවා */}
            {!hideSidebar && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden pt-16" // pt-16 දැම්මේ Navbar එකට යටින් එන්න
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar drawer */}
            {!hideSidebar && (
                <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1e293b] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden pt-16 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {/* Close Button */}
                    <button onClick={() => setIsSidebarOpen(false)} className="absolute top-20 right-4 p-2 text-white bg-gray-800 rounded-lg"><FaTimes /></button>
                    <SidebarContent />
                </div>
            )}


            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Title & Mobile Hamburger Button */}
                {/* Header Title & Mobile Hamburger Button */}
                {!hideHeader && (
                    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-5 flex items-center gap-4">
                        {/* *විසඳුම 1 (Mobile Sidebar): Hamburger icon එක. කුඩා තිරවල විතරයි පේන්නේ */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden text-gray-600 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
                        >
                            <FaBars className="text-xl" />
                        </button>
                        {!hideTitle && (
                            <h1 className="text-2xl font-bold text-gray-800 flex-1">{title || "Dashboard"}</h1>
                        )}
                    </header>
                )}

                {/* Main Content Content */}
                <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 ${noPadding ? '' : 'p-6 md:p-10'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;