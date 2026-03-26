import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const StudentHome = () => {
    // 1. Student ID එක තියාගන්න State එකක් හදනවා
    const [studentId, setStudentId] = useState('');

    // 2. පිටුව Load වෙද්දි Backend එකෙන් විස්තර ගේනවා
    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8081/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Database එකේ studentOrEmpId එකක් තිබුණොත් ඒක State එකට දානවා
                    setStudentId(data.studentOrEmpId || '');
                }
            } catch (error) {
                console.error("Error fetching student details", error);
            }
        };

        fetchStudentDetails();
    }, []);

    // 3. Title එක Dynamic විදිහට හදනවා
    // (ID එකක් තිබුණොත් "Student - IT23..." විදිහටත්, නැත්නම් සාමාන්‍ය විදිහටත් පෙන්වනවා)
   const dashboardTitle = studentId 
        ? `HI.. 👋 ${studentId}` 
        : "Welcome to Student Dashboard";

    return (
        <DashboardLayout title={dashboardTitle}>
            
            {/* --- ඔයාගේ Dashboard එකේ ඇතුළේ තියෙන දේවල් (Quick Actions වගේ ඒවා) මෙතනට එනවා --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <p className="text-gray-500">
                    Welcome to your portal. Use the sidebar to publish tickets or view resources.
                </p>
            </div>
            
        </DashboardLayout>
    );
};

export default StudentHome;