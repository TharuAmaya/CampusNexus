import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import {
    FaPaperPlane,
    FaPaperclip,
    FaTags,
    FaMapMarkerAlt,
    FaExclamationCircle,
    FaInfoCircle,
    FaCheckCircle,
    FaLifeRing
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8081';

const initialFormState = {
    resourceType: '',
    resourceId: '',
    category: '',
    description: '',
    priority: 'Medium',
    preferredContact: ''
};

const categoryOptions = ['Maintenance', 'Electrical', 'Plumbing', 'Furniture', 'Cleanliness', 'Security', 'IT Support', 'Other'];
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'svg', 'heic', 'heif', 'avif', 'ico', 'jfif'];

const CreateTicketmsn = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [resourceTypes, setResourceTypes] = useState([]);
    const [resourceOptions, setResourceOptions] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // --- API CALL: GET /api/resources/types ---
                // Mapped in ResourceController.
                // Fetches the distinct resource types (e.g. ROOM, EQUIPMENT) to populate the first dropdown.
                const response = await fetch(`${API_BASE_URL}/api/resources/types`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to load resource types.');
                }

                const data = await response.json();
                setResourceTypes(data);
            } catch (error) {
                setErrorMessage(error.message || 'Unable to load resource types.');
            } finally {
                setIsLoadingTypes(false);
            }
        };

        fetchTypes();
    }, []);

    useEffect(() => {
        const fetchResources = async () => {
            if (!formData.resourceType) {
                setResourceOptions([]);
                return;
            }

            try {
                setIsLoadingResources(true);
                const token = localStorage.getItem('token');
                
                // --- API CALL: GET /api/resources/names?type={type} ---
                // Mapped in ResourceController.
                // Fetches the specific resources for the selected type (cascading dropdown).
                const response = await fetch(
                    `${API_BASE_URL}/api/resources/names?type=${encodeURIComponent(formData.resourceType)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!response.ok) {
                    throw new Error('Failed to load resources for the selected type.');
                }

                const data = await response.json();
                setResourceOptions(data);
            } catch (error) {
                setResourceOptions([]);
                setErrorMessage(error.message || 'Unable to load resource names.');
            } finally {
                setIsLoadingResources(false);
            }
        };

        fetchResources();
    }, [formData.resourceType]);

    // --- VALIDATION: Email format checking ---
    const validateEmail = (email) => {
        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value,
            ...(name === 'resourceType' ? { resourceId: '' } : {})
        }));
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleAttachmentChange = (event) => {
        const newFiles = Array.from(event.target.files || []);

        // --- VALIDATION: Check if selected files are actually images ---
        const nonImageFile = newFiles.find((file) => {
            const mimeType = (file.type || '').toLowerCase();
            if (mimeType.startsWith('image/')) {
                return false;
            }

            const fileName = (file.name || '').toLowerCase();
            const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
            return !allowedImageExtensions.includes(extension);
        });

        if (nonImageFile) {
            setErrorMessage('Only image files are allowed. Please select image attachments only.');
            event.target.value = '';
            return;
        }
        
        // Combine already selected files with newly selected files
        const allFiles = [...selectedFiles, ...newFiles];

        // --- VALIDATION: Restrict max number of attachments to 3 ---
        if (allFiles.length > 3) {
            setErrorMessage('You can attach a maximum of 3 files. Please select fewer files.');
            event.target.value = '';
            return;
        }

        setSelectedFiles(allFiles);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const removeFile = (fileName) => {
        const updatedFiles = selectedFiles.filter(file => file.name !== fileName);
        setSelectedFiles(updatedFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setSelectedFiles([]);
        setResourceOptions([]);
        setErrorMessage('');
        setSuccessMessage('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // --- VALIDATION: Ensure all required fields are filled ---
        if (!formData.resourceType || !formData.resourceId || !formData.category || !formData.description || !formData.priority || !formData.preferredContact) {
            setErrorMessage('Please complete all required fields before submitting.');
            return;
        }

        // --- VALIDATION: Verify email format before submitting ---
        if (!validateEmail(formData.preferredContact)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        // --- VALIDATION: Final check to ensure max 3 files before submitting ---
        if (selectedFiles.length > 3) {
            setErrorMessage('You can attach a maximum of 3 files.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');
            const payload = new FormData();

            payload.append(
                'ticketDetails',
                new Blob([
                    JSON.stringify({
                        resourceId: Number(formData.resourceId),
                        category: formData.category,
                        description: formData.description,
                        priority: formData.priority,
                        preferredContact: formData.preferredContact
                    })
                ], { type: 'application/json' })
            );

            selectedFiles.forEach((file) => {
                payload.append('images', file);
            });

            // --- API CALL: POST /api/tickets ---
            // Creates a new ticket. Includes file uploads (multipart/form-data)
            const response = await fetch(`${API_BASE_URL}/api/tickets`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: payload
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Ticket submission failed.');
            }

            resetForm();
            setSuccessMessage('Ticket submitted successfully. The support team will review it shortly.');
        } catch (error) {
            setErrorMessage(error.message || 'A network error occurred while submitting the ticket.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="Publish Ticket">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <aside className="relative overflow-hidden rounded-2xl border border-slate-700 bg-[#18263a] p-5 md:p-6 text-white shadow-[0_40px_100px_rgba(15,23,42,0.35)]">
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[#f4511e]/10 blur-3xl" />

                    <div className="relative z-10">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#f4511e]">
                                <FaLifeRing className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-white">Ticket Submission</h2>
                            </div>
                        </div>

                        <p className="text-sm leading-7 text-white/70">
                            Use this form to report a facility or service issue. Select the resource type first, then choose the exact resource name so the ticket is linked to the right campus asset.
                        </p>

                        <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                            <div className="flex gap-3">
                                <FaCheckCircle className="mt-1 shrink-0 text-emerald-400" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-white/75">Category, description, priority, and contact details are required.</p>
                            </div>
                            <div className="flex gap-3">
                                <FaCheckCircle className="mt-1 shrink-0 text-emerald-400" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-white/75">Attach images only when needed. You can add upto 3 images.</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_32px_80px_rgba(15,23,42,0.08)]">
                        <div className="mb-8 border-b border-gray-100 pb-6">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Publish Ticket</p>
                            <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Report a Maintenance or Facility Issue</h3>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                                Fill in the issue details below.
                            </p>
                        </div>

                        {errorMessage && (
                            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                <FaCheckCircle className="mt-0.5 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">
                                        <FaTags /> Resource Type
                                    </label>
                                    <select
                                        name="resourceType"
                                        value={formData.resourceType}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoadingTypes}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    >
                                        <option value="">{isLoadingTypes ? 'Loading resource types...' : 'Choose a resource type'}</option>
                                        {resourceTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">
                                        <FaMapMarkerAlt /> Resource Name
                                    </label>
                                    <select
                                        name="resourceId"
                                        value={formData.resourceId}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.resourceType || isLoadingResources}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {formData.resourceType ? (isLoadingResources ? 'Loading resources...' : 'Choose a resource name') : 'Select a resource type first'}
                                        </option>
                                        {resourceOptions.map((resource) => (
                                            <option key={resource.resourceId} value={resource.resourceId}>
                                                {resource.name} (ID: {resource.resourceId})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    >
                                        <option value="">Choose a category</option>
                                        {categoryOptions.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    >
                                        {priorityOptions.map((priority) => (
                                            <option key={priority} value={priority}>
                                                {priority}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">
                                        <FaPaperclip /> Attachment Selection
                                    </label>
                                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleAttachmentChange}
                                            className="block w-full text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#f4511e] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-[#d84315]"
                                        />
                                        <p className="mt-3 text-xs leading-6 text-slate-500">
                                            Select up to 3 images. Only image formats are supported.
                                        </p>

                                        <div className="mt-4 space-y-2">
                                            {selectedFiles.length > 0 ? selectedFiles.map((file) => (
                                                <div key={file.name} className="flex items-center justify-between gap-2 text-sm text-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        <span className="font-medium">{file.name}</span>
                                                        <span className="text-slate-400">({Math.ceil(file.size / 1024)} KB)</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(file.name)}
                                                        className="cursor-pointer text-slate-500 hover:text-red-500 transition-colors"
                                                        title="Remove file"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-slate-400">No attachments selected.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Preferred Email Address</label>
                                    <input
                                        type="email"
                                        name="preferredContact"
                                        value={formData.preferredContact}
                                        onChange={handleChange}
                                        required
                                        placeholder="example@email.com"
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="Describe the issue, its location, and any useful context..."
                                        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium leading-7 text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5">
                                <div className="flex items-start gap-3">
                                    <FaInfoCircle className="mt-0.5 shrink-0 text-blue-500" />
                                    <div className="space-y-1 text-sm text-slate-700">
                                        <p className="font-semibold text-slate-900">Before submitting</p>
                                        <p>Make sure the chosen resource type and resource name match the issue location before submitting the ticket.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full cursor-pointer rounded-lg bg-[#f4511e] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-[#d84315] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {isSubmitting ? 'Submitting...' : <><FaPaperPlane className="inline-block align-middle" /> Submit Ticket</>}
                                </button>
                            </div>
                        </form>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default CreateTicketmsn;