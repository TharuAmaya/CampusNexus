import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';


const TechnicianHome = () => {
    return (
        <DashboardLayout title="Welcome to Technician Dashboard">
        <div className="container mx-auto p-10 mt-20">
            <h1 className="text-3xl font-bold text-accent">🔧 Technician Dashboard - Welcome!</h1>
            <p>You can manage facility maintenance and update maintenance logs here.</p>
        </div>
        </DashboardLayout>
    );
};
export default TechnicianHome;