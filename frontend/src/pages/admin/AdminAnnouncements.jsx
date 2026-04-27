import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaBullhorn, FaTrash, FaPaperPlane, FaEdit, FaTimes } from 'react-icons/fa';

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form States
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetAudience, setTargetAudience] = useState('ALL');
    const [submitLoading, setSubmitLoading] = useState(false);
    
    // Edit State (අලුතින් එකතු කරපු කෑල්ල)
    const [editingId, setEditingId] = useState(null);

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

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // Edit Button එක එබුවම Form එක පිරවීම
    const handleEditClick = (ann) => {
        setEditingId(ann.id);
        setTitle(ann.title);
        setContent(ann.content);
        setTargetAudience(ann.targetAudience);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Form එක ගාවට උඩට යනවා
    };

    // Edit කරන එක කැන්සල් කිරීම
    const handleCancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
        setTargetAudience('ALL');
    };

    // Form Submit එක (Save සහ Update දෙකටම)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Edit කරනවද, අලුතින් දානවද කියලා බලලා URL එකයි Method එකයි තෝරනවා
            const url = editingId 
                ? `http://localhost:8081/api/announcements/${editingId}` 
                : 'http://localhost:8081/api/announcements';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ title, content, targetAudience })
            });
            
            if (response.ok) {
                handleCancelEdit(); // Form එක හිස් කරනවා
                fetchAnnouncements(); // List එක Refresh කරනවා
                alert(`Announcement ${editingId ? 'updated' : 'published'} successfully!`);
            } else {
                alert("Failed to save announcement. Please check your inputs.");
            }
        } catch (error) {
            console.error("Error saving", error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8081/api/announcements/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                setAnnouncements(announcements.filter(a => a.id !== id));
                if (editingId === id) handleCancelEdit(); // මකන එකම Edit කර කර හිටියා නම් ඒක කැන්සල් කරනවා
            }
        } catch (error) {
            console.error("Error deleting", error);
        }
    };

    return (
        <DashboardLayout title="Manage Announcements">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- PUBLISH / EDIT FORM --- */}
                <div className="lg:col-span-1">
                    <div className={`p-6 rounded-2xl shadow-sm border sticky top-6 transition-colors duration-300 ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-xl font-bold flex items-center gap-2 ${editingId ? 'text-orange-700' : 'text-gray-800'}`}>
                                {editingId ? <><FaEdit /> Edit Announcement</> : <><FaPaperPlane className="text-blue-500"/> Publish New</>}
                            </h2>
                            {editingId && (
                                <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-800 transition-colors p-1" title="Cancel Edit">
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input 
                                    type="text" required maxLength={200}
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                    placeholder="E.g., Campus Holiday"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                <select 
                                    value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="ALL">Everyone (Students & Technicians)</option>
                                    <option value="STUDENT">Students Only</option>
                                    <option value="TECHNICIAN">Technicians Only</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea 
                                    required rows="5"
                                    value={content} onChange={(e) => setContent(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                    placeholder="Write your announcement here..."
                                ></textarea>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    type="submit" disabled={submitLoading}
                                    className={`flex-1 font-bold py-3 rounded-lg transition disabled:opacity-50 text-white ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {submitLoading ? "Saving..." : editingId ? "Update Announcement" : "Publish Announcement"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- PAST ANNOUNCEMENTS LIST --- */}
                <div className="lg:col-span-2">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Past Announcements</h2>
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading...</div>
                        ) : announcements.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl border text-center text-gray-500">No announcements published yet.</div>
                        ) : (
                            announcements.map((ann) => (
                                <div key={ann.id} className={`p-6 rounded-2xl shadow-sm border flex gap-4 transition-all duration-300 ${editingId === ann.id ? 'bg-orange-50 border-orange-200 shadow-md ring-1 ring-orange-200' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                                    <div className={`mt-1 w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${editingId === ann.id ? 'bg-orange-200 text-orange-700' : 'bg-blue-50 text-blue-500'}`}>
                                        <FaBullhorn />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{ann.title}</h3>
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${ann.targetAudience === 'ALL' ? 'bg-purple-100 text-purple-700' : ann.targetAudience === 'STUDENT' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    To: {ann.targetAudience}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {/* අලුතින් දාපු Edit බොත්තම */}
                                                <button 
                                                    onClick={() => handleEditClick(ann)}
                                                    className={`p-2 rounded-lg transition ${editingId === ann.id ? 'bg-orange-200 text-orange-800' : 'text-blue-500 hover:bg-blue-50'}`}
                                                    title="Edit Announcement"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(ann.id)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                                                    title="Delete Announcement"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 mt-3 whitespace-pre-wrap">{ann.content}</p>
                                        <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-wider">
                                            Published: {new Date(ann.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default AdminAnnouncements;