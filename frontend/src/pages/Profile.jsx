import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import DashboardLayout from '../components/DashboardLayout';

const Profile = () => {
    // Form එකේ Data තියාගන්න State එක
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        studentOrEmpId: '',
        department: '',
        bio: '',
        avatarUrl: ''
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // 1. පිටුව Load වෙද්දිම Backend එකෙන් විස්තර ගෙනල්ලා පෙන්වීම (GET)
   useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // [TRICK] Token එක දිගහැරලා අනිවාර්ය විස්තර ටික මුලින්ම ගන්නවා!
                const decoded = jwtDecode(token);
                setFormData(prev => ({
                    ...prev,
                    email: decoded.sub || '',         // Token එකේ sub කියන්නේ Email එක
                    fullName: decoded.fullName || '', // Token එකේ තියෙන නම
                    avatarUrl: decoded.avatarUrl || '' // Token එකේ තියෙන පින්තූරය
                }));

                // ඊට පස්සේ Database එකෙන් අනිත් විස්තර ටික (Phone, Dept, Bio) ඉල්ලනවා
                const response = await fetch('http://localhost:8081/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Database එකෙන් ආපු අලුත් විස්තර ටික එකතු කරනවා
                    setFormData(prev => ({
                        ...prev,
                        fullName: data.fullName || '', // <-- මෙන්න මේක අලුතින් දාන්න
                        email: data.email || '',       // <-- මේකත් අලුතින් දාන්න
                        phoneNumber: data.phoneNumber || '',
                        studentOrEmpId: data.studentOrEmpId || '',
                        department: data.department || '',
                        bio: data.bio || ''
                    }));
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Form එකේ අකුරු ටයිප් කරද්දී State එක Update වීම
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Save බොත්තම එබුවම අලුත් විස්තර Backend එකට යැවීම (PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Saving...', type: 'info' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setMessage({ text: 'Profile updated successfully!', type: 'success' });
                // තත්පර 3කින් Message එක මකලා දානවා
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                setMessage({ text: 'Failed to update profile.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network error.', type: 'error' });
        }
    };

    if (loading) return <DashboardLayout title="My Profile"><p>Loading profile...</p></DashboardLayout>;

    return (
        <DashboardLayout title="My Profile">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Profile Header (පින්තූරය සහ නම පෙන්වන කොටස) */}
                <div className="bg-gradient-to-r from-[#1e293b] to-blue-800 px-8 py-10 text-white flex items-center gap-6">
                    {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center text-4xl font-bold shadow-lg">
                            {formData.fullName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold">{formData.fullName}</h2>
                        <p className="text-blue-200 mt-1">{formData.email}</p>
                    </div>
                </div>

                {/* Profile Form එක */}
                <form onSubmit={handleSubmit} className="p-8">
                    
                    {/* Message එක පෙන්වන තැන */}
                    {message.text && (
                        <div className={`p-4 mb-6 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                        </div>

                        {/* Email (Disabled - වෙනස් කරන්න බෑ) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Read-only)</label>
                            <input type="email" value={formData.email} disabled className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed" />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="e.g. +94 77 123 4567" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>

                        {/* Student / Emp ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Student / Employee ID</label>
                            <input type="text" name="studentOrEmpId" value={formData.studentOrEmpId} onChange={handleChange} placeholder="e.g. IT21..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>

                        {/* Department */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Department / Faculty</label>
                            <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Faculty of Computing" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>

                        {/* Bio */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Short Bio</label>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" placeholder="Tell us a little bit about yourself..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm">
                            Save Changes
                        </button>
                    </div>
                </form>

            </div>
        </DashboardLayout>
    );
};

export default Profile;