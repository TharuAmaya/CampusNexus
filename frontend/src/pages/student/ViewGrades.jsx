import React from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';

const ViewGrades = () => {
    return (
        <DashboardLayout title="View Grades">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Grades</h2>
            </div>
        </DashboardLayout>
    );
};

export default ViewGrades;