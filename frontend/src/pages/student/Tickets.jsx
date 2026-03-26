import React from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';

const Tickets = () => {
    return (
        <DashboardLayout title="Welcome to Student Dashboard">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Tickets</h2>
            </div>
        </DashboardLayout>
    );
};

export default Tickets;