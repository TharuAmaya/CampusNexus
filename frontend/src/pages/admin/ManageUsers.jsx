import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Modals පෙන්නන්න/හංගන්න State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form වල Data තියාගන්න State
    const [formData, setFormData] = useState({ email: '', role: 'ROLE_STUDENT', department: '', studentOrEmpId: '' });
    const [editingUserId, setEditingUserId] = useState(null);

    // 1. READ: පිටුව Load වෙද්දි Users ලව ගෙනීම
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. CREATE: අලුත් User කෙනෙක් Add කිරීම
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/admin/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ email: formData.email, role: formData.role })
            });

            if (response.ok) {
                setMessage({ text: 'User added successfully!', type: 'success' });
                setShowAddModal(false);
                setFormData({ email: '', role: 'ROLE_STUDENT', department: '', studentOrEmpId: '' });
                fetchUsers(); // Table එක අලුත් කරනවා
            } else {
                setMessage({ text: 'Failed to add user. Email might exist.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network Error', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    // 3. UPDATE: User ව Edit කරන්න Modal එක Open කිරීම
    const openEditModal = (user) => {
        setEditingUserId(user.id);
        setFormData({ 
            email: user.email, 
            role: user.role, 
            department: user.department || '', 
            studentOrEmpId: user.studentOrEmpId || '' 
        });
        setShowEditModal(true);
    };

    // UPDATE: වෙනස් කරපු විස්තර Save කිරීම
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8081/api/admin/users/${editingUserId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setMessage({ text: 'User updated successfully!', type: 'success' });
                setShowEditModal(false);
                fetchUsers();
            } else {
                setMessage({ text: 'Failed to update user.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network Error', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    // 4. DELETE: User ව මකා දැමීම
    const handleDelete = async (id, email) => {
        if (window.confirm(`Are you sure you want to delete user: ${email}?`)) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8081/api/admin/users/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    setMessage({ text: 'User deleted successfully!', type: 'success' });
                    fetchUsers();
                } else {
                    setMessage({ text: 'Failed to delete user.', type: 'error' });
                }
            } catch (error) {
                setMessage({ text: 'Network Error', type: 'error' });
            }
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    return (
        <DashboardLayout title="Manage Users">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">System Users</h2>
                    <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        + Add New User
                    </button>
                </div>

                {/* Notifications */}
                {message.text && (
                    <div className={`p-4 mb-4 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-3 px-4 font-semibold text-gray-600">ID</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Name</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Email</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Role</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-6 text-gray-500">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-6 text-gray-500">No users found.</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-gray-500">#{user.id}</td>
                                        <td className="py-3 px-4 font-medium text-gray-800">{user.fullName || <span className="text-gray-400 italic">Not set</span>}</td>
                                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'ROLE_TECHNICIAN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.role ? user.role.replace('ROLE_', '') : 'STUDENT'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-800 mr-4 font-medium">Edit</button>
                                            <button onClick={() => handleDelete(user.id, user.email)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODALS (POPUPS) --- */}

            {/* 1. Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New User</h3>
                        <form onSubmit={handleAddSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="student@example.com" />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="ROLE_STUDENT">Student</option>
                                    <option value="ROLE_TECHNICIAN">Technician</option>
                                    <option value="ROLE_ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit User</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Cannot change)</label>
                                <input type="email" value={formData.email} disabled className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="ROLE_STUDENT">Student</option>
                                    <option value="ROLE_TECHNICIAN">Technician</option>
                                    <option value="ROLE_ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g. IT" />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student/Emp ID</label>
                                <input type="text" value={formData.studentOrEmpId} onChange={(e) => setFormData({...formData, studentOrEmpId: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g. IT21..." />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Update User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
};

export default ManageUsers;