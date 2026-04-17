/**
 * CreateBooking.jsx — Student Create Booking Page
 * 
 * TYPOGRAPHY-BOOST VIVA EDITION (v11.0 - FINAL)
 * 
 * - Sidebar Boost: Increased all label and value font sizes for maximum visibility.
 * - Form Tightness: Maintained compact 1000px width.
 * - Legend & Navigation: Standardized breadcrumbs and optimized identification labels.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import Toast from '../../../components/booking/Toast';
import {
    FaCalendarCheck, FaClock, FaUsers,
    FaInfoCircle, FaMapMarkerAlt, FaCheckCircle,
    FaArrowRight, FaCalendarAlt, FaShieldAlt, FaExclamationTriangle,
    FaUserGraduate, FaIdCard, FaHistory, FaCheck, FaExclamationCircle, FaDoorOpen
} from 'react-icons/fa';

import {
    fetchAllResources,
    fetchUserProfile,
    createBooking,
    fetchAdminBookings,
} from '../../../services/bookingService';
import { bookingCache } from '../../../utils/bookingCache';

const INITIAL_FORM = {
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1,
    studentName: '',
    studentRegNumber: '',
};

export default function CreateBooking() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlResourceId = searchParams.get('resourceId');
    const errorTopRef = React.useRef(null);

    const [formData, setFormData] = useState({
        ...INITIAL_FORM,
        resourceId: urlResourceId || '',
    });
    const [touched, setTouched] = useState({});
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState(null);
    const [isResourceLocked, setIsResourceLocked] = useState(!!urlResourceId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [existingBookings, setExistingBookings] = useState([]);

    // ── Logic: Smart Mismatch (Preserved) ──────────────────────────────
    const isNameInvalid = formData.studentName.length > 0 && /[^A-Za-z\s]/.test(formData.studentName);
    
    const getRegMismatch = () => {
        const val = formData.studentRegNumber;
        if (val.length === 0) return false;
        if (val[0] !== 'I') return true;
        if (val.length > 1 && val[1] !== 'T') return true;
        if (val.length > 2) {
            const suffix = val.substring(2);
            if (/[^0-9]/.test(suffix)) return true;
        }
        return false;
    };
    const isRegInvalid = getRegMismatch();
    const isTimeInvalid = formData.startTime && formData.endTime && formData.endTime <= formData.startTime;

    // ── Helper: Accurate Time Comparison ────────────────────────────
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [hh, mm] = timeStr.split(':').map(Number);
        return (hh * 60) + mm;
    };

    const isOutsideOperationalWindow = () => {
        if (!selectedResource || !formData.startTime || !formData.endTime) return false;
        
        const start = timeToMinutes(formData.startTime);
        const end = timeToMinutes(formData.endTime);
        const open = timeToMinutes(selectedResource.availableFrom || "00:00");
        const close = timeToMinutes(selectedResource.availableTo || "23:59");

        return start < open || end > close;
    };

    const isCapacityOverflow = () => {
        if (!selectedResource || !formData.expectedAttendees) return false;
        return parseInt(formData.expectedAttendees, 10) > (selectedResource.capacity || 0);
    };

    const isTimeConflict = () => {
        if (!formData.bookingDate || !formData.startTime || !formData.endTime || existingBookings.length === 0) return false;

        const start = timeToMinutes(formData.startTime);
        const end = timeToMinutes(formData.endTime);

        return existingBookings.some(b => {
            // Only check bookings on the same date for the same resource
            // Note: existingBookings is already filtered by resourceId in the fetch
            if (b.bookingDate !== formData.bookingDate) return false;
            // Only conflicts with Active bookings
            if (b.status === 'REJECTED' || b.status === 'CANCELLED') return false;

            const bStart = timeToMinutes(b.startTime);
            const bEnd = timeToMinutes(b.endTime);

            // Interval Overlap: StartA < EndB AND EndA > StartB
            return (start < bEnd) && (end > bStart);
        });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    // ── Logic: Data Sync ────────────────────────────────────────────────
    useEffect(() => {
        if (formData.resourceId && resources.length > 0) {
            const resource = resources.find((r) => String(r.resourceId) === String(formData.resourceId));
            setSelectedResource(resource || null);
        } else {
            setSelectedResource(null);
        }
    }, [formData.resourceId, resources]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const cached = bookingCache.getResources();
        if (cached && cached.length > 0) setResources(cached);

        // Pre-fetch profile once on load for "Instant Submission"
        fetchUserProfile(token).then(({ data }) => {
            if (data) setUserProfile(data);
        });

        fetchAllResources(token).then(({ data }) => {
            if (data && Array.isArray(data) && data.length > 0) {
                setResources(data);
                bookingCache.setResources(data);
            }
        });
    }, []);

    // ── Logic: Predictive Conflict Fetch ─────────────────────────────
    useEffect(() => {
        if (!formData.resourceId) return;
        
        const token = localStorage.getItem('token');
        // Fetch all bookings for this resource to check overlaps
        fetchAdminBookings(token).then(({ data }) => {
            if (data && Array.isArray(data)) {
                const resourceOnly = data.filter(b => String(b.resourceId) === String(formData.resourceId));
                setExistingBookings(resourceOnly);
            }
        });
    }, [formData.resourceId]);

    // Sync formData if URL param changes
    useEffect(() => {
        if (urlResourceId) {
            setFormData(prev => ({ ...prev, resourceId: urlResourceId }));
            setIsResourceLocked(true);
        }
    }, [urlResourceId]);

    // ── Logic: Auto-Scroll to Error ──────────────────────────────────
    useEffect(() => {
        if (formError) {
            // Scroll to the very top of the window to keep breadcrumbs in their default view
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [formError]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'studentName') {
            // Strictly allow ONLY letters, spaces, and dots
            const filteredValue = value.replace(/[^A-Za-z\s.]/g, '');
            setFormData((prev) => ({ ...prev, [name]: filteredValue }));
        } 
        else if (name === 'studentRegNumber') {
            // Force "IT" prefix and ONLY digits after that, max 10 chars
            let val = value.toUpperCase();
            if (val.length > 2) {
                const prefix = val.substring(0, 2);
                const suffix = val.substring(2).replace(/[^0-9]/g, '');
                val = (prefix === 'IT' ? 'IT' : 'IT') + suffix;
            } else if (val.length > 0 && !'IT'.startsWith(val)) {
                val = 'IT';
            }
            if (val.length > 10) return;
            setFormData((prev) => ({ ...prev, [name]: val }));
        } 
        else if (name === 'purpose') {
            if (value.length > 150) return;
            setFormData((prev) => ({ ...prev, [name]: value }));
        } 
        else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        setFormError('');
    };

    const validate = () => {
        // Phase 1: Identity
        if (!formData.studentName || formData.studentName.length < 3) return 'Identity verification mismatch. Provide full name.';
        if (formData.studentRegNumber.length !== 10 || !formData.studentRegNumber.startsWith('IT')) return 'Invalid IT-format registration number.';
        
        // Phase 2: Environment
        if (!formData.resourceId) return 'Please select a campus facility.';
        if (!formData.bookingDate) return 'Reservation date is required.';
        if (isCapacityOverflow()) return `Capacity overflow. This venue only accommodates ${selectedResource.capacity} people.`;

        // Phase 3: Operation
        if (!formData.startTime || !formData.endTime) return 'Start and End times are mandatory.';
        if (isTimeInvalid) return 'Operational time conflict detected. Start time must be before end time.';
        if (isTimeConflict()) return 'Time conflict detected. This facility is already reserved during this period.';
        
        if (isOutsideOperationalWindow()) {
            return `Operational window mismatch. This facility is only available between ${selectedResource.availableFrom} and ${selectedResource.availableTo}.`;
        }

        if (!formData.purpose || formData.purpose.length < 5) return 'Statement of purpose is mandatory (min 5 chars).';
        if (formData.purpose.length > 150) return 'Statement of purpose exceeds the 150-character institutional limit.';
        if (!termsAccepted) return 'Certification of terms required.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setFormError(validationError); return; }

        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        
        // Use cached profile if available to save ~400ms of processing time
        const profile = userProfile || (await fetchUserProfile(token)).data;
        
        const finalPayload = {
            ...formData,
            expectedAttendees: parseInt(formData.expectedAttendees, 10),
            userId: profile?.id || profile?.userId || 'Unknown'
        };

        const { data: newBooking, error: bookingErr } = await createBooking(finalPayload, token);
        if (bookingErr) {
            setFormError(bookingErr);
            setIsSubmitting(false);
            return;
        }

        setToast({ type: 'success', message: '🚀 Requisition Confirmed. Awaiting administrative approval.' });
        setTimeout(() => navigate('/student/booking', { state: { newBookingCode: newBooking?.bookingCode } }), 1800);
    };

    return (
        <DashboardLayout title="Create Reservation" noPadding={true}>
            <div className="relative min-h-screen bg-[#0f172a] font-sans flex flex-col pt-32 pb-12 overflow-hidden">
                
                {/* ── Background Overlay ──────────────────────────── */}
                <div 
                    className="absolute inset-0 bg-cover bg-center overflow-hidden z-0 scale-105"
                    style={{ backgroundImage: "url('/library.jpg')", opacity: 0.1, filter: 'blur(5px)' }}
                />

                {/* ── Compact Top Navigation Bar (Tightened) ───────── */}
                <div className="absolute top-0 left-0 z-30 w-full px-8 py-4 bg-black/5 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link
                            to="/student/booking"
                            className="bg-[#232f3e] hover:bg-[#111e2f] text-white px-5 py-2 rounded-lg transition-all flex items-center gap-2 border border-white/5 group shadow-lg"
                        >
                            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                            <span className="font-bold tracking-widest text-xs uppercase">BACK</span>
                        </Link>
                        <div className="h-6 w-[1px] bg-white/10 ml-1" />
                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest ml-1">
                            <Link to="/student-dashboard" className="text-white/40 hover:text-white transition-colors">DASHBOARD</Link>
                            <span className="text-white/20">/</span>
                            <span className="text-blue-400">NEW RESERVATION</span>
                        </nav>
                    </div>
                </div>

                {/* ── Requisition Engine (Pixel-Tight) ────────────── */}
                <div className="relative z-10 flex items-center justify-center p-4 py-12 w-full">
                    <div className="bg-white rounded-none shadow-[0_40px_80px_rgba(0,0,0,0.6)] flex flex-col md:flex-row max-w-[1000px] w-full overflow-hidden min-h-[780px]">
                        
                        {/* ── LEFT PANE: DYNAMIC SIDEBAR (Typo-Boosted) ───── */}
                        <div className="md:w-[360px] bg-[#232f3e] p-10 text-white flex flex-col relative shrink-0 border-r border-white/5">
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="text-blue-500 text-3xl mb-10">
                                    <FaShieldAlt />
                                </div>

                                {selectedResource ? (
                                    <div className="animate-fade-in flex flex-col h-full uppercase tracking-tighter">
                                        <div className="relative mb-10 rounded-sm overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                                            {selectedResource.imageName ? (
                                                <img 
                                                    src={`http://localhost:8081/uploads/${selectedResource.imageName}`} 
                                                    alt={selectedResource.name}
                                                    className="w-full h-44 object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-44 flex items-center justify-center opacity-40"><FaMapMarkerAlt className="text-xl" /></div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-emerald-700/90 px-2 py-0.5 rounded-sm text-[8px] font-black tracking-widest border border-white/10">ACTIVE</div>
                                        </div>

                                        <h1 className="text-3xl font-black uppercase leading-[1.05] mb-2 tracking-tighter text-white">
                                            {selectedResource.name}
                                        </h1>
                                        <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.25em] mb-12">SELECTED NODE</p>

                                        <div className="h-[1px] w-full bg-white/10 mb-10" />

                                        {/* Boosted Detail Grid */}
                                        <div className="space-y-6">
                                            <div className="detail-box">
                                                <div className="detail-icon-bg shadow-lg"><FaDoorOpen /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em] mb-1">FACILITY TYPE</p>
                                                    <p className="text-[13px] font-black uppercase text-white tracking-tight">{selectedResource.resourceType || 'General'}</p>
                                                </div>
                                            </div>
                                            <div className="detail-box">
                                                <div className="detail-icon-bg shadow-lg"><FaMapMarkerAlt /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em] mb-1">LOCATION</p>
                                                    <p className="text-[13px] font-black uppercase text-white leading-tight tracking-tight">{selectedResource.location}</p>
                                                </div>
                                            </div>
                                            <div className="detail-box">
                                                <div className="detail-icon-bg shadow-lg"><FaUsers /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em] mb-1">MAX CAPACITY</p>
                                                    <p className="text-[13px] font-black uppercase text-white tracking-tight">{selectedResource.capacity} PEOPLE</p>
                                                </div>
                                            </div>
                                            <div className="detail-box">
                                                <div className="detail-icon-bg shadow-lg text-amber-500"><FaClock /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em] mb-1">OPERATIONAL HOURS</p>
                                                    <p className="text-[13px] font-black uppercase text-blue-400 tracking-tight">
                                                        {selectedResource.availableFrom || '00:00'} — {selectedResource.availableTo || '23:59'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-fade-in flex flex-col h-full">
                                        <h1 className="text-5xl font-black uppercase leading-[0.9] mb-8 tracking-tighter text-white">
                                            GUIDED <br /> SPACE <br /> ACCESS <br /> PORTAL
                                        </h1>
                                        <div className="h-[3px] w-16 bg-blue-500 mb-12" />
                                        <div className="space-y-8">
                                            {[ 'REAL-TIME ALLOCATION CHECK', 'ENCRYPTED ACCESS GENERATION', 'MANDATORY RULE ADHERENCE' ].map((text) => (
                                                <div key={text} className="flex gap-5 items-center group">
                                                    <FaCheck className="text-emerald-500 text-lg group-hover:scale-125 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-10">
                                    <div className="bg-[#111e2f] px-5 py-4 border border-white/5 w-full shadow-inner">
                                        <code className="text-blue-400 font-mono text-[11px] font-bold tracking-[0.15em] uppercase">ext. 4455 // IT TEAM</code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT PANE: COMPACT FORM ────────────────────── */}
                        <div className="flex-1 bg-white p-10 md:p-14 overflow-y-auto custom-scrollbar">
                            {/* Scroll Marker for Errors */}
                            <div ref={errorTopRef} className="h-0 w-0" />
                            
                            <header className="mb-14">
                                <h2 className="text-[36px] font-black text-gray-950 uppercase tracking-tighter leading-none mb-1">
                                    RESOURCE REQUISITION
                                </h2>
                            </header>

                            {formError && (
                                <div className="mb-10 flex items-center gap-4 bg-rose-50 border-l-4 border-rose-500 p-5 animate-shake shadow-lg">
                                    <FaExclamationTriangle className="text-rose-500 text-3xl shrink-0" />
                                    <p className="text-rose-950 text-[11px] font-black uppercase tracking-tight">{formError}</p>
                                </div>
                            )}

                            {/* ── NODE-BASED SEQUENTIAL FLOW ── */}
                            <form onSubmit={handleSubmit} className="space-y-12">
                                
                                {/* NODE 1: IDENTITY VERIFICATION */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</div>
                                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">Identity Verification</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="requisition-box">
                                            <label className="requisition-label"><FaUserGraduate /> Student Name</label>
                                            <input 
                                                type="text" name="studentName" required
                                                value={formData.studentName} onChange={handleChange} onBlur={handleBlur}
                                                className="requisition-input" placeholder="Full Name with Initials"
                                            />
                                        </div>
                                        <div className="requisition-box">
                                            <label className="requisition-label"><FaIdCard /> Registration Identifier</label>
                                            <input 
                                                type="text" name="studentRegNumber" required
                                                value={formData.studentRegNumber} onChange={handleChange} onBlur={handleBlur}
                                                className="requisition-input uppercase" placeholder="ITXXXXXXXX"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/** 
                                 * LOGIC: Section 2 Unlocks when Name and Reg are present and valid
                                 * Validating manually here for real-time reactivity
                                 */}
                                {(() => {
                                    const isIdValid = formData.studentName.length > 2 && 
                                                      formData.studentRegNumber.length === 10 && 
                                                      formData.studentRegNumber.startsWith('IT');
                                    
                                    const isEnvValid = isIdValid && formData.resourceId && formData.bookingDate && formData.expectedAttendees > 0;

                                    return (
                                        <>
                                            {/* NODE 2: ENVIRONMENT SELECTION */}
                                            <section className="relative space-y-8">
                                                {!isIdValid && (
                                                    <div 
                                                        className="absolute inset-x-0 -inset-y-4 z-20 cursor-default"
                                                        onClick={() => setFormError('Identity verification must be completed before entering environment details.')}
                                                        title="Complete Section 1 first"
                                                    />
                                                )}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</div>
                                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">Environment Details</h3>
                                                </div>
                                                
                                                <div className="requisition-box relative overflow-hidden transition-all duration-500">
                                                    <label className="requisition-label"><FaMapMarkerAlt /> SELECT CAMPUS RESOURCE</label>
                                                    
                                                    {!isResourceLocked ? (
                                                        <select 
                                                            name="resourceId" value={formData.resourceId} onChange={handleChange} required
                                                            className="requisition-input appearance-none cursor-pointer"
                                                        >
                                                            <option value="">— Select a facility  —</option>
                                                            {resources.map(res => (
                                                                <option key={res.resourceId} value={res.resourceId}>{res.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-200/50 px-5 py-4 mt-1 group relative">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                                                    <FaDoorOpen className="text-xl" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[14px] font-black text-blue-900 uppercase tracking-tight">
                                                                        {selectedResource?.name || 'Loading facility...'}
                                                                    </p>
                                                                    <p className="text-[9px] text-blue-400 font-bold uppercase tracking-tight opacity-70">Pre-selected from catalogue</p>
                                                                </div>
                                                            </div>
                                                            <Link 
                                                                to="/student/resources" 
                                                                className="text-[9px] font-black text-gray-400 hover:text-[#f4511e] underline underline-offset-4 tracking-widest uppercase transition-colors"
                                                            >
                                                                Change Venue
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="requisition-box">
                                                        <label className="requisition-label"><FaCalendarAlt /> Booking Date</label>
                                                        <input 
                                                            type="date" name="bookingDate" required
                                                            value={formData.bookingDate} onChange={handleChange}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            className="requisition-input cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="requisition-box">
                                                        <label className="requisition-label"><FaUsers /> Capacity Required</label>
                                                        <input 
                                                            type="number" name="expectedAttendees" required
                                                            value={formData.expectedAttendees} onChange={handleChange} min="1"
                                                            className="requisition-input"
                                                        />
                                                    </div>
                                                </div>
                                            </section>

                                            {/* NODE 3: OPERATIONAL SETTINGS */}
                                            <section className="relative space-y-8">
                                                {!isEnvValid && (
                                                    <div 
                                                        className="absolute inset-x-0 -inset-y-4 z-20 cursor-default"
                                                        onClick={() => setFormError('Complete Identity and Environment details before setting operational times.')}
                                                        title="Complete Section 2 first"
                                                    />
                                                )}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">3</div>
                                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">Operational Scheduling</h3>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="requisition-box">
                                                        <label className="requisition-label"><FaClock /> Check-In Time</label>
                                                        <input 
                                                            type="time" name="startTime" required
                                                            value={formData.startTime} onChange={handleChange}
                                                            className="requisition-input cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className={`requisition-box ${isTimeInvalid ? 'border-rose-500 bg-rose-50' : ''}`}>
                                                        <label className="requisition-label"><FaClock /> Check-Out Time</label>
                                                        <input 
                                                            type="time" name="endTime" required
                                                            value={formData.endTime} onChange={handleChange}
                                                            className="requisition-input cursor-pointer"
                                                        />
                                                        {isTimeInvalid && <span className="absolute -bottom-3 left-5 text-rose-500 text-[10px] font-black uppercase">Time Error</span>}
                                                    </div>
                                                </div>

                                                <div className="requisition-box">
                                                    <label className="requisition-label"><FaInfoCircle /> Statement of Purpose</label>
                                                    <textarea 
                                                        name="purpose" required rows="2" maxLength={150}
                                                        value={formData.purpose} onChange={handleChange}
                                                        placeholder="BRIEFLY STATE THE INTENDED USE..."
                                                        className="requisition-input resize-none bg-transparent"
                                                    />
                                                    <div className={`absolute top-2 right-4 text-[9px] font-black tracking-widest ${formData.purpose.length >= 130 ? 'text-rose-600 animate-pulse' : 'text-gray-300'}`}>
                                                        {formData.purpose.length} / 150
                                                    </div>
                                                </div>

                                                {/* ── PIXEL-PERFECT TERMS RESTORATION ─────────── */}
                                                <div className="bg-blue-50/40 border border-blue-100/50 p-8 rounded-sm space-y-5">
                                                    <h3 className="text-blue-900 font-bold text-[12px] uppercase tracking-widest flex items-center gap-2">
                                                        <FaShieldAlt className="text-blue-500" /> BEHAVIORAL & FACILITY TERMS
                                                    </h3>
                                                    
                                                    <div className="text-[12px] text-gray-800 font-semibold space-y-4 leading-relaxed">
                                                        <p><strong className="text-black underline underline-offset-2">Behavior Expectations:</strong> Maintain respectful, quiet, and considerate behavior inside the room and strictly use the space for study purposes only.</p>
                                                        <p><strong className="text-black underline underline-offset-2">Access Control:</strong> Do not allow other students to enter the room you have reserved.</p>
                                                        <p><strong className="text-black underline underline-offset-2">Food & Beverage:</strong> Food & beverage items are not allowed within the room except water.</p>
                                                        <p><strong className="text-black underline underline-offset-2">Responsibility and Damages:</strong> You are accountable for the room during your booking. Any damage results in a penalty.</p>
                                                    </div>

                                                    {/* Division Line */}
                                                    <div className="h-[1px] w-full bg-blue-100/80 mt-8" />
                                                    
                                                    <label className="flex items-center gap-5 mt-8 cursor-pointer group">
                                                        <input 
                                                            type="checkbox" checked={termsAccepted} 
                                                            onChange={(e) => setTermsAccepted(e.target.checked)} 
                                                            required
                                                            className="custom-checkbox shrink-0"
                                                        />
                                                        <span className={`text-[12px] font-black transition-colors ${termsAccepted ? 'text-[#f4511e]' : 'text-gray-500 group-hover:text-blue-800'}`}>
                                                            I agree to the Terms & Conditions and accept responsibility.
                                                        </span>
                                                    </label>
                                                </div>

                                                <button 
                                                    type="submit" disabled={isSubmitting}
                                                    className={`requisition-button transition-all duration-500 uppercase font-black ${isEnvValid && termsAccepted ? 'active' : ''}`}
                                                >
                                                    {isSubmitting ? <FaHistory className="animate-spin text-xl" /> : <FaCheck className="text-xl" />}
                                                    {isSubmitting ? 'PROCESSING...' : 'CONFIRM RESERVATION REQUEST'}
                                                </button>
                                            </section>
                                        </>
                                    );
                                })()}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Toast toast={toast} onClose={() => setToast(null)} />
        </DashboardLayout>
    );
}
