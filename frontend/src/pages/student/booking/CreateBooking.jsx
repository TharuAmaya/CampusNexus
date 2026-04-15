/**
 * CreateBooking.jsx — Student Create Booking Page
 *
 * Thin orchestration page.
 * API calls delegated to bookingService.
 * Inline error state replaces alert() calls.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import Toast from '../../../components/booking/Toast';
import {
    FaCalendarCheck, FaClock, FaUsers,
    FaInfoCircle, FaMapMarkerAlt, FaCheckCircle,
    FaArrowRight, FaCalendarAlt, FaShieldAlt, FaExclamationTriangle
} from 'react-icons/fa';

import {
    fetchAllResources,
    fetchUserProfile,
    createBooking,
} from '../../../services/bookingService';
import { bookingCache } from '../../../utils/bookingCache';

const INITIAL_FORM = {
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1,
};

export default function CreateBooking() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState(null);

    // ── Sync selected resource with dropdown choice ───────────────────────
    useEffect(() => {
        if (formData.resourceId && resources.length > 0) {
            const resource = resources.find((r) => String(r.resourceId) === String(formData.resourceId));
            setSelectedResource(resource || null);
        } else {
            setSelectedResource(null);
        }
    }, [formData.resourceId, resources]);

    // ── Load available resources on mount (SWR: cache first, then refresh) ─
    useEffect(() => {
        const token = localStorage.getItem('token');

        // Step 1: Show cached resources immediately (instant dropdown)
        const cached = bookingCache.getResources();
        if (cached && cached.length > 0) {
            setResources(cached);
        }

        // Step 2: Always fetch fresh in background to stay up-to-date
        fetchAllResources(token).then(({ data }) => {
            if (data && Array.isArray(data) && data.length > 0) {
                setResources(data);
                bookingCache.setResources(data); // update cache for next visit
            }
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormError(''); // clear previous error on any change
    };

    // ── Validate form before submission ──────────────────────────────────
    const validate = () => {
        if (!termsAccepted) return 'You must accept the facility regulations to proceed.';
        if (formData.startTime >= formData.endTime) return 'End time must be after start time.';
        if (
            selectedResource &&
            Number(formData.expectedAttendees) > selectedResource.capacity
        ) {
            return `Attendees (${formData.expectedAttendees}) exceeds ${selectedResource.name}'s capacity (${selectedResource.capacity}).`;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setFormError(validationError); return; }

        setIsSubmitting(true);
        setFormError('');

        const token = localStorage.getItem('token');

        // Resolve the current user's ID
        const { data: user, error: profileErr } = await fetchUserProfile(token);
        if (profileErr || !user) {
            setFormError(profileErr || 'Authentication failure. Please log in again.');
            setIsSubmitting(false);
            return;
        }

        const { data: newBooking, error: bookingErr } = await createBooking({ ...formData, userId: user.id }, token);
        if (bookingErr) {
            setFormError(bookingErr);
            setIsSubmitting(false);
            return;
        }

        // Invalidate stale cache so MyBookings re-fetches and shows the new booking immediately
        bookingCache.setBookings(null);

        setToast({ type: 'success', message: '✅ Reservation submitted successfully! Awaiting admin approval.' });
        // Navigate to MyBookings and pass the new bookingCode so it can jump to the correct page
        setTimeout(() => navigate('/student/booking', { state: { newBookingCode: newBooking.bookingCode } }), 1800);
    };

    return (
        <DashboardLayout title="Create Reservation" noPadding={true}>
            <div className="relative min-h-screen font-sans overflow-hidden bg-gray-950 flex flex-col pt-32">

                {/* ── Background ─────────────────────────────────────── */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[1px] z-0 scale-105"
                    style={{ backgroundImage: "url('/library02.png')" }}
                />
                <div className="absolute inset-0 bg-[#0a1e35]/80 z-10" />

                {/* ── Top nav ────────────────────────────────────────── */}
                <div className="absolute top-0 left-0 z-30 w-full px-8 py-6 bg-black/10 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/student/booking"
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg transition-all flex items-center gap-2 border border-white/10 group shadow-lg"
                        >
                            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                            <span className="font-bold tracking-widest text-xs uppercase">BACK</span>
                        </Link>
                        <div className="h-6 w-[1px] bg-white/20 ml-2" />
                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <span
                                className="text-white/40 cursor-pointer hover:text-white transition-colors"
                                onClick={() => navigate('/student-dashboard')}
                            >
                                DASHBOARD
                            </span>
                            <span className="text-white/20">/</span>
                            <span className="text-blue-400">New Reservation</span>
                        </nav>
                    </div>
                </div>

                {/* ── Main card ──────────────────────────────────────── */}
                <div className="relative z-20 w-full flex flex-col px-8 mx-auto max-w-5xl">
                    <div className="bg-white/95 backdrop-blur-2xl shadow-[0_45px_100px_rgba(0,0,0,0.6)] border border-white/50 relative overflow-hidden flex flex-col md:flex-row">

                        {/* Glass accent */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-bl-full filter blur-3xl pointer-events-none opacity-50 z-0" />

                        {/* ── Left info panel ─────────────────────────── */}
                        <div className="md:w-1/3 bg-[#111e2f]/90 p-10 text-white flex flex-col justify-between relative overflow-hidden border-r border-white/10 z-10">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mt-24 -mr-24 opacity-30" />

                            {selectedResource ? (
                                /* Selected resource details */
                                <div className="z-10 relative flex flex-col h-full">
                                    <div className="w-full h-40 bg-black/30 overflow-hidden relative border border-white/10 mb-6 shadow-lg">
                                        {selectedResource.imageName ? (
                                            <img
                                                src={`http://localhost:8081/uploads/${selectedResource.imageName}`}
                                                alt={selectedResource.name}
                                                className="w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/50 to-black/50">
                                                <FaMapMarkerAlt className="text-4xl text-blue-400/40 mb-2" />
                                                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30">No Image Available</span>
                                            </div>
                                        )}
                                        <div className={`absolute top-3 right-3 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md border shadow-lg ${
                                            selectedResource.status === 'ACTIVE'
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                                : 'bg-red-500/20 text-red-300 border-red-400/30'
                                        }`}>
                                            {selectedResource.status || 'AVAILABLE'}
                                        </div>
                                    </div>

                                    <h2 className="text-white text-2xl lg:text-3xl font-black tracking-tighter uppercase mb-2 leading-tight">
                                        {selectedResource.name}
                                    </h2>
                                    <p className="text-blue-400/70 text-[10px] uppercase tracking-[0.3em] font-bold mb-8">Selected Facility</p>

                                    <div className="space-y-5 pt-6 border-t border-white/10">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                                <FaShieldAlt className="text-blue-400 text-xs" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-white/35 font-bold uppercase tracking-[0.2em] mb-1">Facility Type</p>
                                                <p className="text-sm font-bold text-white/90 uppercase tracking-wide">
                                                    {selectedResource.type?.replace(/_/g, ' ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                                <FaMapMarkerAlt className="text-blue-400 text-xs" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-white/35 font-bold uppercase tracking-[0.2em] mb-1">Location</p>
                                                <p className="text-sm font-bold text-white/90 tracking-wide">{selectedResource.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                                <FaUsers className="text-blue-400 text-xs" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-white/35 font-bold uppercase tracking-[0.2em] mb-1">Max Capacity</p>
                                                <p className="text-2xl font-black text-white">
                                                    {selectedResource.capacity}{' '}
                                                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">People</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-8 border-t border-white/10">
                                        <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-4">Support Reference</p>
                                        <p className="text-[11px] font-mono text-blue-400 bg-black/40 py-2 px-4 tracking-widest border border-white/5 shadow-inner">
                                            ext. 4455 // IT TEAM
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Default decorative content */
                                <>
                                    <div className="z-10 relative">
                                        <FaShieldAlt className="text-4xl text-blue-400 mb-6 opacity-90" />
                                        <h2 className="text-white text-4xl lg:text-5xl font-black tracking-tighter uppercase mb-6 leading-tight">
                                            Secure Your Campus Space
                                        </h2>
                                        <p className="text-white/50 text-[11px] uppercase tracking-widest mb-12 leading-relaxed font-light">
                                            Systematic conflict detection for all facility requests. Process entails mandatory administrative validation.
                                        </p>
                                        <div className="space-y-6 pt-8 border-t border-white/10">
                                            {[
                                                { icon: FaCheckCircle, colour: 'text-emerald-400', text: 'Real-Time Allocation Check' },
                                                { icon: FaCheckCircle, colour: 'text-emerald-400', text: 'Encrypted Access Generation' },
                                                { icon: FaCheckCircle, colour: 'text-amber-500', text: 'Mandatory Rule Adherence' },
                                            ].map(({ icon: Icon, colour, text }) => (
                                                <div key={text} className="flex gap-4">
                                                    <Icon className={`${colour} mt-1 shrink-0`} />
                                                    <p className="text-xs font-semibold text-white/80 leading-relaxed tracking-wide uppercase">{text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="z-10 mt-12 pt-8 border-t border-white/10">
                                        <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-4">Support Reference</p>
                                        <p className="text-[11px] font-mono text-blue-400 bg-black/40 py-2 px-4 tracking-widest border border-white/5 shadow-inner">
                                            ext. 4455 // IT TEAM
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── Right: Booking form ─────────────────────── */}
                        <div className="md:w-2/3 p-10 z-10 relative">
                            <div className="flex flex-col mb-10 pb-8 border-b border-gray-100">
                                <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                                    Resource Requisition
                                </h3>
                            </div>

                            {/* Inline form error */}
                            {formError && (
                                <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-none">
                                    <FaExclamationTriangle className="text-rose-500 mt-0.5 shrink-0" />
                                    <p className="text-rose-700 text-sm font-semibold">{formError}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Resource */}
                                    <div className="md:col-span-2 bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                        <label className="block text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                            <FaMapMarkerAlt /> Select Campus Resource
                                        </label>
                                        <select
                                            name="resourceId"
                                            value={formData.resourceId}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white text-gray-900 text-lg px-4 py-3 border border-gray-100 outline-none focus:border-[#f4511e]/30 transition-all font-semibold tracking-tight shadow-inner rounded-none cursor-pointer"
                                        >
                                            <option value="">— Choose a facility —</option>
                                            {resources.map((res) => (
                                                <option key={res.resourceId} value={res.resourceId}>
                                                    {res.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date */}
                                    <div className="bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                        <label className="block text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                            <FaCalendarAlt /> Booking Date
                                        </label>
                                        <input
                                            type="date"
                                            name="bookingDate"
                                            value={formData.bookingDate}
                                            onChange={handleChange}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-white text-gray-900 text-lg px-4 py-3 border border-gray-100 outline-none transition-all font-bold tracking-tight shadow-inner rounded-none"
                                        />
                                    </div>

                                    {/* Attendees */}
                                    <div className="bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                        <label className="block text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                            <FaUsers /> Capacity Required
                                        </label>
                                        <input
                                            type="number"
                                            name="expectedAttendees"
                                            value={formData.expectedAttendees}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            className="w-full bg-white text-gray-900 text-lg px-4 py-3 border border-gray-100 outline-none transition-all font-bold tracking-tight shadow-inner rounded-none"
                                        />
                                    </div>

                                    {/* Start time */}
                                    <div className="bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                        <label className="block text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                            <FaClock /> Check-In Time
                                        </label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white text-gray-900 text-lg px-4 py-3 border border-gray-100 outline-none transition-all font-bold tracking-tight shadow-inner rounded-none uppercase"
                                        />
                                    </div>

                                    {/* End time */}
                                    <div className="bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                        <label className="block text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                            <FaClock /> Check-Out Time
                                        </label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white text-gray-900 text-lg px-4 py-3 border border-gray-100 outline-none transition-all font-bold tracking-tight shadow-inner rounded-none uppercase"
                                        />
                                    </div>

                                    {/* Purpose */}
                                    <div className="md:col-span-2 bg-gray-50/80 p-6 border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                                        <label className="block text-[10px] font-bold text-[#f4511e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                                            <FaInfoCircle /> Statement of Purpose
                                        </label>
                                        <textarea
                                            name="purpose"
                                            value={formData.purpose}
                                            onChange={handleChange}
                                            required
                                            rows="2"
                                            placeholder="Briefly state the intended use..."
                                            className="w-full bg-white text-gray-900 text-lg px-6 py-4 border border-gray-100 outline-none font-semibold tracking-tight resize-none shadow-inner rounded-none"
                                        />
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="mt-8 bg-blue-50/50 p-6 border border-blue-500/20 shadow-sm">
                                    <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FaShieldAlt className="text-blue-500" /> Behavioral & Facility Terms
                                    </h4>
                                    <div className="text-[11px] text-gray-700 leading-relaxed font-semibold mb-6 space-y-3 tracking-wide">
                                        <p><strong className="text-gray-900 underline underline-offset-2">Behavior Expectations:</strong> Maintain respectful, quiet, and considerate behavior while inside the room and strictly use the space for study purposes only.</p>
                                        <p><strong className="text-gray-900 underline underline-offset-2">Access Control:</strong> Do not allow other students to enter the room you have reserved.</p>
                                        <p><strong className="text-gray-900 underline underline-offset-2">Food & Beverage:</strong> Food & beverage items are not allowed within the room except water.</p>
                                        <p><strong className="text-gray-900 underline underline-offset-2">Responsibility and Damages:</strong> You are accountable for the room during your booking period. Any damage to the property will result in a penalty.</p>
                                    </div>
                                    <label className="flex items-start gap-4 cursor-pointer group mt-4 pt-4 border-t border-blue-500/10">
                                        <div className="relative pt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                required
                                                className="peer sr-only"
                                            />
                                            <div className="w-6 h-6 border-2 border-gray-300 bg-white peer-checked:bg-[#f4511e] peer-checked:border-[#f4511e] flex items-center justify-center transition-all">
                                                <FaCheckCircle className={`text-white text-sm transition-transform duration-200 ${termsAccepted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                                            </div>
                                        </div>
                                        <span className={`text-sm tracking-tight font-bold select-none transition-colors duration-200 pt-0.5 ${termsAccepted ? 'text-[#f4511e]' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            I agree to the Terms & Conditions and accept responsibility for the facility.
                                        </span>
                                    </label>
                                </div>

                                {/* Submit */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !termsAccepted}
                                        className={`w-full py-5 px-8 font-bold uppercase tracking-[0.2em] text-[11px] shadow-sm transition-all flex items-center justify-center gap-3 ${
                                            termsAccepted
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white transform hover:-translate-y-1 active:scale-95'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSubmitting
                                            ? 'Processing Validation...'
                                            : <><FaCalendarCheck /> Confirm Reservation Request</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ── Footer ─────────────────────────────────────────── */}
                <div className="absolute bottom-8 left-0 w-full z-20 text-center px-4">
                    <p className="text-white/40 text-[10px] tracking-widest font-bold uppercase opacity-50">
                        © 2026 CampusNexus Hub. All Rights Reserved
                    </p>
                </div>
            </div>
            <Toast toast={toast} onClose={() => setToast(null)} />
        </DashboardLayout>
    );
}
