import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
    FaCalendarAlt, FaClock, FaTags, FaUsers, 
    FaInfoCircle, FaCheckCircle, FaTimesCircle, 
    FaHourglassHalf, FaQrcode, FaEdit, FaTrash, FaCheck 
} from 'react-icons/fa';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [qrToken, setQrToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    
    // Edit mode states
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState(null);

    const fetchBookingDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8081/api/bookings/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch booking details');
            
            const data = await res.json();
            setBooking(data);
            setEditForm({
                resourceId: data.resourceId,
                bookingDate: data.bookingDate,
                startTime: data.startTime,
                endTime: data.endTime,
                purpose: data.purpose,
                expectedAttendees: data.expectedAttendees
            });

            // If approved, fetch QR code
            if (data.status === 'APPROVED') {
                fetchQrToken(token);
            }
        } catch (err) {
            console.error("Error fetching booking details:", err);
            setError('Unable to load booking details.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchQrToken = async (token) => {
        try {
            const res = await fetch(`http://localhost:8081/api/bookings/${id}/qr`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQrToken(data.qrToken);
            }
        } catch (e) {
            console.error("Failed to load QR token");
        }
    };

    useEffect(() => {
        fetchBookingDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        setIsCancelling(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8081/api/bookings/${id}/cancel?cancelledBy=${booking.userId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchBookingDetails();
            } else {
                alert('Failed to cancel the booking. It may have already been processed.');
            }
        } catch (err) {
            alert('A network error occurred while cancelling.');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleSaveChanges = async () => {
        if (editForm.startTime >= editForm.endTime) {
            alert('End time must be after start time.');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8081/api/bookings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                setIsEditing(false);
                fetchBookingDetails();
            } else {
                const errData = await res.json();
                alert(`Failed to update booking: ${errData.message || 'Unknown error'}`);
            }
        } catch (err) {
            alert('A network error occurred while saving changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <FaCheckCircle className="text-emerald-500" />;
            case 'REJECTED': return <FaTimesCircle className="text-rose-500" />;
            case 'CANCELLED': return <FaTimesCircle className="text-gray-400" />;
            default: return <FaHourglassHalf className="text-amber-500 animate-pulse" />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-800 border-emerald-500/10';
            case 'REJECTED': return 'bg-rose-50 text-rose-800 border-rose-500/10';
            case 'CANCELLED': return 'bg-gray-50 text-gray-800 border-gray-500/10';
            default: return 'bg-amber-50 text-amber-800 border-amber-500/10';
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Booking Details" noPadding={true}>
                <div className="relative min-h-screen bg-gray-950 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f4511e]"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !booking) {
        return (
            <DashboardLayout title="Booking Details" noPadding={true}>
                <div className="relative min-h-screen bg-gray-950 flex items-center justify-center p-8">
                    <div className="bg-white/95 backdrop-blur-xl p-12 text-center shadow-2xl border border-white/20 max-w-lg w-full">
                        <FaInfoCircle className="text-5xl text-rose-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase tracking-widest">Access Denied</h2>
                        <p className="text-gray-600 mb-8 font-light leading-relaxed">{error || 'Booking data is unavailable.'}</p>
                        <Link to="/student/booking" className="bg-[#f4511e] hover:bg-[#d84315] text-white px-8 py-3 transition-all font-bold uppercase tracking-widest text-xs inline-block shadow-lg">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const { status, bookingCode, resourceId, resourceName, purpose, expectedAttendees, bookingDate, startTime, endTime, adminDecisionReason } = booking;

    return (
        <DashboardLayout title="Booking Details" noPadding={true}>
            <div className="relative min-h-screen font-sans overflow-hidden bg-gray-950 flex flex-col pt-32">
                
                {/* Immersive Background Image (library02.png) */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[1px] z-0 scale-105"
                    style={{ backgroundImage: "url('/library02.png')" }}
                ></div>

                {/* Dark color overlay */}
                <div className="absolute inset-0 bg-[#0a1e35]/75 z-10"></div>

                {/* Top Navigation Bar Positioning (Absolute) */}
                <div className="absolute top-0 left-0 z-30 w-full px-8 py-6 bg-black/10 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/student/booking')}
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg transition-all flex items-center gap-2 border border-white/10 group shadow-lg"
                        >
                            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                            <span className="font-bold tracking-widest text-xs uppercase">BACK</span>
                        </button>
                        
                        <div className="h-6 w-[1px] bg-white/20 ml-2"></div>
                        
                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <span className="text-white/40 cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/student/booking/new')}>New Reservation</span>
                            <span className="text-white/20">/</span>
                            <span className="text-blue-400">Booking Details</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-white/30 tracking-widest uppercase">ID: {bookingCode.substring(0, 8)}</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative z-20 w-full flex flex-col px-8 mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* LEFT: Main Details Card */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            <div className="bg-white/95 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.6)] border border-white/50 relative overflow-hidden">
                                {/* Glass Luster Accent */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-bl-full filter blur-3xl pointer-events-none opacity-50"></div>

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8 pb-8 border-b border-gray-100">
                                        <div>
                                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-tight mb-4">
                                                {resourceName || resourceId}
                                            </h3>
                                            <div className={`inline-flex items-center gap-2 px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-none border shadow-sm ${getStatusBadgeClass(status)}`}>
                                                {getStatusIcon(status)}
                                                <span>{status}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons (Only if Pending) */}
                                        {status === 'PENDING' && (
                                            <div className="flex gap-4">
                                                {!isEditing ? (
                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        className="flex items-center gap-2 bg-[#f4511e]/10 text-[#f4511e] hover:bg-[#f4511e] hover:text-white px-8 py-3 border border-[#f4511e]/20 transition-all font-bold uppercase tracking-widest text-[11px] shadow-sm transform hover:-translate-y-1 active:scale-95"
                                                    >
                                                        <FaEdit /> Modify Request
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleSaveChanges}
                                                            disabled={isSaving}
                                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 transition-all font-bold uppercase tracking-widest text-[11px] shadow-lg disabled:opacity-50"
                                                        >
                                                            {isSaving ? 'Processing...' : <><FaCheck /> Confirm Revision</>}
                                                        </button>
                                                        <button
                                                            onClick={() => setIsEditing(false)}
                                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 font-bold uppercase tracking-widest text-[11px] transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Withdraw Button (Only if Approved) */}
                                        {status === 'APPROVED' && (
                                            <button
                                                onClick={handleCancel}
                                                disabled={isCancelling}
                                                className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-8 py-3 border border-rose-100 transition-all font-bold uppercase tracking-widest text-[11px] shadow-sm transform hover:-translate-y-1 active:scale-95"
                                            >
                                                <FaTrash /> Withdraw Access
                                            </button>
                                        )}
                                    </div>

                                    {/* Formal Detail Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            {/* Date Section */}
                                            <div className="bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                                <p className="text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                                    <FaCalendarAlt /> Reservation Date
                                                </p>
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        name="bookingDate"
                                                        value={editForm.bookingDate}
                                                        onChange={handleEditChange}
                                                        required
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full bg-white text-gray-800 text-sm px-4 py-3 outline-none border border-gray-100 shadow-inner rounded-none"
                                                    />
                                                ) : (
                                                    <p className="text-2xl font-bold text-gray-800 tracking-tight">{bookingDate}</p>
                                                )}
                                            </div>

                                            {/* Attendees Section */}
                                            <div className="bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                                <p className="text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                                    <FaUsers /> Physical Presence
                                                </p>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        name="expectedAttendees"
                                                        value={editForm.expectedAttendees}
                                                        onChange={handleEditChange}
                                                        required min="1"
                                                        className="w-full bg-white text-gray-800 text-sm px-4 py-3 outline-none border border-gray-100 shadow-inner font-bold rounded-none"
                                                    />
                                                ) : (
                                                    <p className="text-2xl font-bold text-gray-800 tracking-tight">{expectedAttendees} <span className="text-gray-400 font-light text-base">Attendees</span></p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Time Selection */}
                                            <div className="bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                                <p className="text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                                    <FaClock /> Scheduled Slot
                                                </p>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <input type="time" name="startTime" value={editForm.startTime} onChange={handleEditChange} required className="w-1/2 bg-white text-gray-800 text-sm px-4 py-3 border border-gray-100 shadow-inner rounded-none" />
                                                        <span className="text-gray-400 px-1">—</span>
                                                        <input type="time" name="endTime" value={editForm.endTime} onChange={handleEditChange} required className="w-1/2 bg-white text-gray-800 text-sm px-4 py-3 border border-gray-100 shadow-inner rounded-none" />
                                                    </div>
                                                ) : (
                                                    <p className="text-2xl font-bold text-gray-800 tracking-tight uppercase">
                                                        {startTime.substring(0, 5)} <span className="text-gray-300 font-light mx-2">—</span> {endTime.substring(0, 5)}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Facility Key */}
                                            <div className="bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                                <p className="text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                                    <FaTags /> Facility Code
                                                </p>
                                                <p className="text-2xl font-bold text-gray-800 tracking-widest">{resourceId}</p>
                                            </div>
                                        </div>

                                        {/* Purpose - Full Width */}
                                        <div className="md:col-span-2 bg-gray-50/80 p-8 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300 mt-2">
                                            <p className="text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-6 flex items-center gap-2 opacity-80">
                                                <FaInfoCircle /> Statement of Purpose
                                            </p>
                                            {isEditing ? (
                                                <textarea
                                                    name="purpose"
                                                    value={editForm.purpose}
                                                    onChange={handleEditChange}
                                                    required rows="4"
                                                    className="w-full bg-white text-gray-900 text-lg px-6 py-4 outline-none border border-gray-100 shadow-inner resize-none tracking-tight font-semibold rounded-none"
                                                ></textarea>
                                            ) : (
                                                <p className="text-gray-900 leading-relaxed font-semibold tracking-tight text-lg md:text-xl">
                                                    {purpose}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: QR Code & Admin Feedback */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            
                            {/* QR Section (Only if Approved) */}
                            {status === 'APPROVED' && qrToken ? (
                                <div className="bg-[#111e2f]/85 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.6)] border border-white/10 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mt-24 -mr-24 opacity-30"></div>
                                    <FaQrcode className="text-6xl text-accent mx-auto mb-8 opacity-90" />
                                    <h4 className="text-white text-2xl font-bold tracking-widest uppercase mb-4">Access Token</h4>
                                    <p className="text-white/50 text-[11px] uppercase tracking-widest mb-12 leading-relaxed px-4 font-light">
                                        Digitally generated access credentials. Scan at the facility entry point for automated check-in.
                                    </p>
                                    
                                    <div className="bg-white p-8 inline-block rounded-none shadow-2xl group-hover:scale-105 transition-transform duration-700 delay-100">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrToken)}`}
                                            alt="Access QR Code"
                                            className="w-56 h-56"
                                        />
                                    </div>
                                    
                                    <div className="mt-12 pt-10 border-t border-white/10">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Digital Signature</p>
                                        <p className="text-[11px] font-mono text-blue-400 bg-black/40 py-4 px-6 break-all leading-relaxed tracking-widest border border-white/5 shadow-inner">
                                            {qrToken}
                                        </p>
                                    </div>
                                </div>
                            ) : status === 'PENDING' ? (
                                <div className="bg-[#111e2f]/85 backdrop-blur-2xl p-8 shadow-[0_45px_100px_rgba(0,0,0,0.5)] border border-white/10 text-center">
                                    <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <FaHourglassHalf className="text-4xl text-amber-500 animate-pulse" />
                                    </div>
                                    <h4 className="text-white text-xl font-bold tracking-widest uppercase mb-6">Under Review</h4>
                                    <p className="text-white/80 text-base md:text-lg leading-relaxed font-light tracking-tight">
                                        Your resource requisition is currently being processed by the facility administration. Secure digital access keys are provisioned upon final validation.
                                    </p>
                                </div>
                            ) : null}

                            {/* Admin Feedback Block */}
                            {adminDecisionReason && (
                                <div className={`p-10 border shadow-2xl backdrop-blur-md relative overflow-hidden ${status === 'APPROVED' ? 'bg-emerald-500/5 border-emerald-500/20' : status === 'REJECTED' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                                    <div className={`absolute top-0 left-0 w-2 h-full ${status === 'APPROVED' ? 'bg-emerald-500' : status === 'REJECTED' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                                    <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">Official Remarks</h4>
                                    <p className="text-white leading-relaxed font-light italic text-xl md:text-2xl tracking-tight">
                                        "{adminDecisionReason}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer pinned absolutely at the bottom */}
                <div className="absolute bottom-8 left-0 w-full z-20 text-center px-4">
                    <p className="text-white/40 text-[10px] tracking-widest font-bold uppercase opacity-50">
                        © 2026 CampusNexus Hub. All Rights Reserved
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BookingDetails;
