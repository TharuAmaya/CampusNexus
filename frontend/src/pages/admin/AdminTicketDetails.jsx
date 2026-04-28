import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaComments, FaExclamationCircle, FaInfoCircle, FaPaperclip, FaSpinner, FaTrash, FaUserCog, FaTasks, FaBan, FaTrashAlt } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout.jsx';

const API_BASE_URL = 'http://localhost:8081';

const AdminTicketDetails = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [resourceDetails, setResourceDetails] = useState(null);
    const [isResourceLoading, setIsResourceLoading] = useState(false);
    const [technicians, setTechnicians] = useState([]);
    const [isTechniciansLoading, setIsTechniciansLoading] = useState(false);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignError, setAssignError] = useState('');
    const [assignSuccess, setAssignSuccess] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusError, setStatusError] = useState('');
    const [statusSuccess, setStatusSuccess] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectError, setRejectError] = useState('');
    const [rejectSuccess, setRejectSuccess] = useState(false);
    const [cancelRejectionSuccess, setCancelRejectionSuccess] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [comments, setComments] = useState([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState('');

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || 'Failed to load ticket details.');
                }

                const data = await response.json();
                setTicket(data);
            } catch (error) {
                setErrorMessage(error.message || 'Unable to load ticket details.');
            } finally {
                setIsLoading(false);
            }
        };

        if (ticketId) {
            fetchTicketDetails();
        }
    }, [ticketId]);

    useEffect(() => {
        const fetchResourceDetails = async () => {
            if (!ticket?.resourceId) {
                setResourceDetails(null);
                return;
            }

            try {
                setIsResourceLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/resources/${ticket.resourceId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    setResourceDetails(null);
                    return;
                }

                const data = await response.json();
                setResourceDetails(data);
            } finally {
                setIsResourceLoading(false);
            }
        };

        fetchResourceDetails();
    }, [ticket]);

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                setIsTechniciansLoading(true);
                setAssignError('');
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/admin/technicians`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to load technicians.');
                }

                const data = await response.json();
                setTechnicians(Array.isArray(data) ? data : []);
            } catch (error) {
                setAssignError(error.message || 'Unable to load technicians.');
            } finally {
                setIsTechniciansLoading(false);
            }
        };

        fetchTechnicians();
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setIsCommentsLoading(true);
                setCommentsError('');

                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/comments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || 'Failed to load comments.');
                }

                const data = await response.json();
                setComments(Array.isArray(data) ? data : []);
            } catch (error) {
                setCommentsError(error.message || 'Unable to load comments.');
            } finally {
                setIsCommentsLoading(false);
            }
        };

        if (ticketId) {
            fetchComments();
        }
    }, [ticketId]);

    const handleAssignTechnician = async () => {
        if (!selectedTechnicianId) {
            setAssignError('Please select a technician.');
            return;
        }

        try {
            setIsAssigning(true);
            setAssignError('');
            setAssignSuccess(false);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ assignedTechnicianId: Number(selectedTechnicianId) })
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to assign technician.`);
            }

            // Refresh ticket details to show updated assignedToEmail
            const ticketResponse = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (ticketResponse.ok) {
                const updatedTicket = await ticketResponse.json();
                setTicket(updatedTicket);
                setAssignSuccess(true);
                setSelectedTechnicianId('');
                // Hide success message after 3 seconds
                setTimeout(() => setAssignSuccess(false), 3000);
            } else {
                throw new Error('Failed to refresh ticket details.');
            }
        } catch (error) {
            console.error('Assignment error:', error);
            setAssignError(error.message || 'Unable to assign technician.');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedStatus) {
            setStatusError('Please select a status.');
            return;
        }

        if (selectedStatus === 'OPEN' && ticket?.status === 'CLOSED') {
            setStatusError('OPEN is not available when the current ticket status is CLOSED.');
            return;
        }

        if (selectedStatus === 'INPROGRESS' && ticket?.status !== 'OPEN') {
            setStatusError('INPROGRESS can be selected only when the current status is OPEN.');
            return;
        }

        if (selectedStatus === 'INPROGRESS' && !ticket?.assignedToEmail) {
            setStatusError('Assign a technician before setting status to INPROGRESS.');
            return;
        }

        if (selectedStatus === 'CLOSED' && !['REJECTED', 'RESOLVED'].includes(ticket?.status)) {
            setStatusError('Ticket must be REJECTED or RESOLVED before setting status to CLOSED.');
            return;
        }

        try {
            setIsUpdatingStatus(true);
            setStatusError('');
            setStatusSuccess(false);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ newStatus: selectedStatus })
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to update status.`);
            }

            const ticketResponse = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (ticketResponse.ok) {
                const updatedTicket = await ticketResponse.json();
                setTicket(updatedTicket);
                setStatusSuccess(true);
                setSelectedStatus('');
                setTimeout(() => setStatusSuccess(false), 3000);
            } else {
                throw new Error('Failed to refresh ticket details after status update.');
            }
        } catch (error) {
            setStatusError(error.message || 'Unable to update status.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const openRejectModal = () => {
        setRejectReason('');
        setRejectError('');
        setIsRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        if (isRejecting) return;
        setIsRejectModalOpen(false);
        setRejectError('');
    };

    const openDeleteModal = () => {
        setDeleteError('');
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (isDeleting) return;
        setDeleteError('');
        setIsDeleteModalOpen(false);
    };

    const handleCancelRejection = async () => {
        if (ticket?.status !== 'REJECTED') {
            return;
        }

        try {
            setStatusError('');
            setCancelRejectionSuccess(false);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}/cancel-rejection`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to cancel rejection.`);
            }

            const ticketResponse = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (ticketResponse.ok) {
                const updatedTicket = await ticketResponse.json();
                setTicket(updatedTicket);
                setSelectedStatus('');
                setCancelRejectionSuccess(true);
                setTimeout(() => setCancelRejectionSuccess(false), 3000);
            } else {
                throw new Error('Failed to refresh ticket details after cancelling rejection.');
            }
        } catch (error) {
            setStatusError(error.message || 'Unable to cancel rejection.');
        }
    };

    const handleRejectTicket = async (event) => {
        event.preventDefault();

        if (!rejectReason.trim()) {
            setRejectError('Please enter a reject reason.');
            return;
        }

        if (ticket?.status !== 'OPEN') {
            setRejectError('Reject is available only when the current ticket status is OPEN.');
            return;
        }

        try {
            setIsRejecting(true);
            setRejectError('');
            setRejectSuccess(false);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rejectionReason: rejectReason.trim() })
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to reject ticket.`);
            }

            const ticketResponse = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (ticketResponse.ok) {
                const updatedTicket = await ticketResponse.json();
                setTicket(updatedTicket);
                setRejectSuccess(true);
                setSelectedStatus('');
                setIsRejectModalOpen(false);
                setTimeout(() => setRejectSuccess(false), 3000);
            } else {
                throw new Error('Failed to refresh ticket details after rejection.');
            }
        } catch (error) {
            setRejectError(error.message || 'Unable to reject ticket.');
        } finally {
            setIsRejecting(false);
        }
    };

    const handleDeleteTicket = async () => {
        try {
            setIsDeleting(true);
            setDeleteError('');

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to delete ticket.`);
            }

            setIsDeleteModalOpen(false);
            navigate('/admin/tickets', { replace: true });
        } catch (error) {
            setDeleteError(error.message || 'Unable to delete ticket.');
        } finally {
            setIsDeleting(false);
        }
    };

    const displayStatus = (value) => {
        if (!value) return '-';
        if (value === 'IN_PROGRESS') return 'INPROGRESS';
        return value;
    };

    const formatDateTime = (value) => {
        if (!value) return '-';

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleString();
    };

    const displayStatusText = (value) => {
        if (!value) return '-';
        return value.replace(/_/g, ' ');
    };

    const displayRoleText = (value) => {
        if (!value) return 'User';
        if (value === 'ROLE_ADMIN') return 'Admin';
        if (value === 'ROLE_TECHNICIAN') return 'Technician';
        if (value === 'ROLE_STUDENT') return 'Student';
        return value.replace(/^ROLE_/, '').replace(/_/g, ' ');
    };

    return (
        <DashboardLayout title="Ticket Details">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Admin Dashboard</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{ticket ? `Ticket #${ticket.ticketId}` : `Ticket #${ticketId}`}</h2>
                    </div>
                    <Link
                        to="/admin/tickets"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-gray-50 hover:text-slate-800"
                    >
                        <FaArrowLeft /> Back to Tickets
                    </Link>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-slate-600">
                        <FaSpinner className="animate-spin" />
                        <span>Loading ticket details...</span>
                    </div>
                )}

                {errorMessage && !isLoading && (
                    <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <FaExclamationCircle className="mt-0.5 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {!isLoading && !errorMessage && ticket && (
                    <div className="space-y-4 text-sm text-slate-700">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                                <p className="mt-1 font-semibold text-slate-900">{displayStatus(ticket.status)}</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Created At</p>
                                <p className="mt-1 font-semibold text-slate-900">{formatDateTime(ticket.createdAt)}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Category</p>
                            <p className="mt-1 font-semibold text-slate-900">{ticket.category || '-'}</p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Priority</p>
                            <p className="mt-1 font-semibold text-slate-900">{ticket.priority || '-'}</p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Resource Name</p>
                            <p className="mt-1 font-semibold text-slate-900">
                                {isResourceLoading ? 'Loading...' : (resourceDetails?.name || '-')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Resource Type</p>
                            <p className="mt-1 font-semibold text-slate-900">
                                {isResourceLoading ? 'Loading...' : (resourceDetails?.type ? resourceDetails.type.replace(/_/g, ' ') : '-')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Preferred Contact</p>
                            <p className="mt-1 font-semibold text-slate-900">{ticket.preferredContact || '-'}</p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Description</p>
                            <p className="mt-1 whitespace-pre-line leading-7 text-slate-800">{ticket.description || '-'}</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Assigned To</p>
                                <p className="mt-1 font-semibold text-slate-900">{ticket.assignedToEmail || 'Unassigned'}</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Submitted By</p>
                                <p className="mt-1 font-semibold text-slate-900">{ticket.createdByEmail || '-'}</p>
                            </div>
                        </div>

                        {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Attachments</p>
                                <ul className="mt-2 space-y-2">
                                    {ticket.attachments.map((attachment) => (
                                        <li key={attachment.attachmentId} className="flex items-center gap-2 text-sm text-slate-700">
                                            <FaInfoCircle className="text-blue-500" />
                                            <span>{attachment.fileName || attachment.filePath}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {ticket.resolutionNotes && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Resolution Notes</p>
                                <p className="mt-1 leading-7 text-amber-900">{ticket.resolutionNotes}</p>
                            </div>
                        )}

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center gap-2">
                                <FaComments className="text-blue-600" />
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Comments</p>
                            </div>

                            {commentsError && (
                                <div className="mt-3 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <FaExclamationCircle className="mt-0.5 shrink-0" />
                                    <span>{commentsError}</span>
                                </div>
                            )}

                            {isCommentsLoading ? (
                                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                                    <FaSpinner className="animate-spin" />
                                    <span>Loading comments...</span>
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">No comments yet.</p>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    {comments.map((comment) => (
                                        <div key={comment.commentId} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                                    {comment.authorRole === 'ROLE_TECHNICIAN' ? 'Technician' : 'Student'}
                                                </p>
                                                <p className="mt-0.5 text-sm font-semibold text-slate-900">{comment.authorName || comment.authorEmail}</p>
                                                <p className="text-xs text-slate-500">{formatDateTime(comment.updatedAt || comment.createdAt)}</p>
                                            </div>
                                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-800">{comment.commentText}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {assignError && (
                            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{assignError}</span>
                            </div>
                        )}

                        {assignSuccess && (
                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                <FaInfoCircle className="mt-0.5 shrink-0" />
                                <span>Technician assigned successfully! Check the "Assigned To" field above.</span>
                            </div>
                        )}

                        {statusError && (
                            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{statusError}</span>
                            </div>
                        )}

                        {statusSuccess && (
                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                <FaInfoCircle className="mt-0.5 shrink-0" />
                                <span>Status updated successfully! Check the "Status" field above.</span>
                            </div>
                        )}

                        {rejectSuccess && (
                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                <FaInfoCircle className="mt-0.5 shrink-0" />
                                <span>Ticket rejected successfully! Status is now REJECTED.</span>
                            </div>
                        )}

                        {cancelRejectionSuccess && (
                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                <FaInfoCircle className="mt-0.5 shrink-0" />
                                <span>Ticket rejection cancelled. Status is now OPEN.</span>
                            </div>
                        )}

                        <div className="grid gap-3 md:grid-cols-[1fr_1fr_420px]">
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">Assign Technician</label>
                                <div className="space-y-2">
                                    <select
                                        value={selectedTechnicianId}
                                        onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                        disabled={isTechniciansLoading || isAssigning}
                                        className="w-full rounded-lg border border-blue-400 bg-blue-100/60 px-2 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                        <option value="">{isTechniciansLoading ? 'Loading...' : 'Choose a technician'}</option>
                                        {technicians.map((tech) => (
                                            <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleAssignTechnician}
                                        disabled={!selectedTechnicianId || isAssigning}
                                        className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-400 bg-blue-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-blue-800 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <FaUserCog /> {isAssigning ? 'Assigning...' : 'Assign'}
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">Update Status</label>
                                <div className="space-y-2">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full rounded-lg border border-emerald-400 bg-emerald-100/60 px-2 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-emerald-100"
                                    >
                                        <option value="">Choose a status</option>
                                        <option value="OPEN" disabled={ticket?.status === 'CLOSED'}>OPEN</option>
                                        <option
                                            value="INPROGRESS"
                                            disabled={ticket?.status !== 'OPEN' || !ticket?.assignedToEmail}
                                        >
                                            INPROGRESS
                                        </option>
                                        <option value="CLOSED" disabled={!['REJECTED', 'RESOLVED'].includes(ticket?.status)}>CLOSED</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleStatusUpdate}
                                        disabled={!selectedStatus || isUpdatingStatus}
                                        className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-400 bg-emerald-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-emerald-800 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <FaTasks /> {isUpdatingStatus ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 md:self-start">
                                <button
                                    type="button"
                                    onClick={openRejectModal}
                                    disabled={ticket?.status !== 'OPEN' || isRejecting}
                                    className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-300 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FaBan /> Reject Ticket
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelRejection}
                                    disabled={ticket?.status !== 'REJECTED'}
                                    className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-400 bg-blue-400 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FaTrashAlt /> Cancel Rejection
                                </button>
                                <button
                                    type="button"
                                    onClick={openDeleteModal}
                                    disabled={ticket.status !== 'CLOSED' || isDeleting}
                                    className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-rose-400 bg-rose-400 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FaTrashAlt /> Delete
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Status History</p>
                            {Array.isArray(ticket.statusHistory) && ticket.statusHistory.length > 0 ? (
                                <div className="mt-3 space-y-2">
                                    {ticket.statusHistory.map((historyItem, index) => (
                                        <div key={`${historyItem.changedAt || 'status'}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-slate-700">
                                            {displayStatusText(historyItem.oldStatus)} {' -> '} {displayStatusText(historyItem.newStatus)} ({displayRoleText(historyItem.changedByRole)}, {formatDateTime(historyItem.changedAt)})
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-slate-500">No status history available.</p>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4 border-b border-gray-100 pb-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Reject Ticket</p>
                            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">Provide Reject Reason</h3>
                        </div>

                        {rejectError && (
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{rejectError}</span>
                            </div>
                        )}

                        <form onSubmit={handleRejectTicket} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Reject Reason</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows="4"
                                    placeholder="Enter reason for rejecting this ticket"
                                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium leading-7 text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeRejectModal}
                                    disabled={isRejecting}
                                    className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRejecting}
                                    className="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {isRejecting ? 'Submitting...' : 'Submit Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4 border-b border-gray-100 pb-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Delete Ticket</p>
                            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">Confirm Deletion</h3>
                        </div>

                        {deleteError && (
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{deleteError}</span>
                            </div>
                        )}

                        <p className="mb-6 text-sm text-slate-600">
                            This will permanently delete ticket #{ticketId}. Admin can delete only CLOSED tickets.
                        </p>

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteTicket}
                                disabled={isDeleting}
                                className="cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminTicketDetails;
