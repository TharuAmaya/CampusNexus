import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaComments, FaEdit, FaExclamationCircle, FaInfoCircle, FaPaperclip, FaSpinner, FaTrash } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import DashboardLayout from '../../components/DashboardLayout.jsx';

const API_BASE_URL = 'http://localhost:8081';
const categoryOptions = ['Maintenance', 'Electrical', 'Plumbing', 'Furniture', 'Cleanliness', 'Security', 'IT Support', 'Other'];
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

const StudentTicketDetails = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [resourceDetails, setResourceDetails] = useState(null);
    const [isResourceLoading, setIsResourceLoading] = useState(false);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [resourceTypes, setResourceTypes] = useState([]);
    const [resourceOptions, setResourceOptions] = useState([]);
    const [updateFiles, setUpdateFiles] = useState([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        resourceType: '',
        resourceId: '',
        category: '',
        description: '',
        priority: 'Medium',
        preferredContact: ''
    });
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [comments, setComments] = useState([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [commentSuccess, setCommentSuccess] = useState('');
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            setCurrentUserEmail(decoded?.sub || decoded?.email || '');
        } catch {
            setCurrentUserEmail('');
        }
    }, []);

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
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
        const fetchResourceTypes = async () => {
            if (!isUpdateModalOpen) return;

            try {
                setIsLoadingTypes(true);
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/resources/types`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to load resource types.');
                }

                const data = await response.json();
                setResourceTypes(data || []);
            } catch (error) {
                setUpdateError(error.message || 'Unable to load resource types.');
            } finally {
                setIsLoadingTypes(false);
            }
        };

        fetchResourceTypes();
    }, [isUpdateModalOpen]);

    useEffect(() => {
        const fetchResourceNames = async () => {
            if (!isUpdateModalOpen || !updateForm.resourceType) {
                setResourceOptions([]);
                return;
            }

            try {
                setIsLoadingResources(true);
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `${API_BASE_URL}/api/resources/names?type=${encodeURIComponent(updateForm.resourceType)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!response.ok) {
                    throw new Error('Failed to load resources for the selected type.');
                }

                const data = await response.json();
                setResourceOptions(data || []);
            } catch (error) {
                setUpdateError(error.message || 'Unable to load resources.');
            } finally {
                setIsLoadingResources(false);
            }
        };

        fetchResourceNames();
    }, [isUpdateModalOpen, updateForm.resourceType]);

    const refreshTicketDetails = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || 'Failed to refresh ticket details.');
        }

        const data = await response.json();
        setTicket(data);
    };

    const refreshComments = async () => {
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
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setIsCommentsLoading(true);
                setCommentError('');
                await refreshComments();
            } catch (error) {
                setCommentError(error.message || 'Unable to load comments.');
            } finally {
                setIsCommentsLoading(false);
            }
        };

        if (ticketId) {
            fetchComments();
        }
    }, [ticketId]);

    const openCommentModal = () => {
        setCommentText('');
        setEditingCommentId(null);
        setCommentError('');
        setCommentSuccess('');
        setIsCommentModalOpen(true);
    };

    const openCommentEditModal = (comment) => {
        setCommentText(comment?.commentText || '');
        setEditingCommentId(comment?.commentId || null);
        setCommentError('');
        setCommentSuccess('');
        setIsCommentModalOpen(true);
    };

    const closeCommentModal = () => {
        if (isCommentSubmitting) return;
        setIsCommentModalOpen(false);
        setCommentText('');
        setEditingCommentId(null);
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();

        if (!commentText.trim()) {
            setCommentError('Please add a comment.');
            return;
        }

        try {
            setIsCommentSubmitting(true);
            setCommentError('');
            setCommentSuccess('');

            const token = localStorage.getItem('token');
            const isEditing = Boolean(editingCommentId);
            const endpoint = isEditing
                ? `${API_BASE_URL}/api/tickets/${ticketId}/comments/${editingCommentId}`
                : `${API_BASE_URL}/api/tickets/${ticketId}/comments`;
            const response = await fetch(endpoint, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ commentText: commentText.trim() })
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to save comment.`);
            }

            await refreshComments();
            setIsCommentModalOpen(false);
            setCommentText('');
            setEditingCommentId(null);
            setCommentSuccess(isEditing ? 'Comment updated successfully.' : 'Comment added successfully.');
            setTimeout(() => setCommentSuccess(''), 2500);
        } catch (error) {
            setCommentError(error.message || 'Unable to save comment.');
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            setCommentError('');
            setCommentSuccess('');

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to delete comment.`);
            }

            await refreshComments();
            setCommentSuccess('Comment deleted successfully.');
            setTimeout(() => setCommentSuccess(''), 2500);
        } catch (error) {
            setCommentError(error.message || 'Unable to delete comment.');
        }
    };

    const openUpdateModal = () => {
        setUpdateError('');
        setIsUpdateModalOpen(true);
        setUpdateFiles([]);
        setUpdateForm({
            resourceType: resourceDetails?.type || '',
            resourceId: ticket?.resourceId ? String(ticket.resourceId) : '',
            category: ticket?.category || '',
            description: ticket?.description || '',
            priority: ticket?.priority || 'Medium',
            preferredContact: ticket?.preferredContact || ''
        });
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setUpdateError('');
        setResourceOptions([]);
        setUpdateFiles([]);
    };

    const handleUpdateChange = (event) => {
        const { name, value } = event.target;
        setUpdateForm((previous) => ({
            ...previous,
            [name]: value,
            ...(name === 'resourceType' ? { resourceId: '' } : {})
        }));
    };

    const handleUpdateAttachmentChange = (event) => {
        const newFiles = Array.from(event.target.files || []);
        const allFiles = [...updateFiles, ...newFiles];

        if (allFiles.length > 3) {
            setUpdateError('You can attach a maximum of 3 files.');
            event.target.value = '';
            return;
        }

        setUpdateFiles(allFiles);
        setUpdateError('');
        event.target.value = '';
    };

    const removeUpdateFile = (indexToRemove) => {
        const updated = updateFiles.filter((_, index) => index !== indexToRemove);
        setUpdateFiles(updated);
    };

    const handleUpdateSubmit = async (event) => {
        event.preventDefault();

        if (!updateForm.resourceType || !updateForm.resourceId || !updateForm.category || !updateForm.description || !updateForm.priority || !updateForm.preferredContact) {
            setUpdateError('Please complete all required fields.');
            return;
        }

        if (updateFiles.length > 3) {
            setUpdateError('You can attach a maximum of 3 files.');
            return;
        }

        try {
            setIsUpdating(true);
            setUpdateError('');

            const token = localStorage.getItem('token');
            const payload = new FormData();

            payload.append(
                'ticketDetails',
                new Blob([
                    JSON.stringify({
                        resourceId: Number(updateForm.resourceId),
                        category: updateForm.category,
                        description: updateForm.description,
                        priority: updateForm.priority,
                        preferredContact: updateForm.preferredContact
                    })
                ], { type: 'application/json' })
            );

            updateFiles.forEach((file) => {
                payload.append('images', file);
            });

            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: payload
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Ticket update failed.');
            }

            await refreshTicketDetails();
            closeUpdateModal();
        } catch (error) {
            setUpdateError(error.message || 'Unable to update ticket.');
        } finally {
            setIsUpdating(false);
        }
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

    const openDeleteConfirmation = () => {
        setDeleteError('');
        setIsDeleteConfirmationOpen(true);
    };

    const closeDeleteConfirmation = () => {
        setIsDeleteConfirmationOpen(false);
        setDeleteError('');
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            setDeleteError('');

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Failed to delete ticket.');
            }

            closeDeleteConfirmation();
            setTimeout(() => {
                navigate('/student/all-tickets', { replace: true });
            }, 500);
        } catch (error) {
            setDeleteError(error.message || 'Unable to delete ticket.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <DashboardLayout title="Ticket Details">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Student Dashboard</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{ticket ? `Ticket #${ticket.ticketId}` : `Ticket #${ticketId}`}</h2>
                    </div>
                    <Link
                        to="/student/all-tickets"
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
                                <p className="mt-1 font-semibold text-slate-900">{ticket.status || '-'}</p>
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
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Comments</p>
                                <button
                                    type="button"
                                    onClick={openCommentModal}
                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 transition hover:bg-blue-100"
                                >
                                    <FaComments /> Add Comment
                                </button>
                            </div>

                            {commentSuccess && (
                                <div className="mt-3 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    <FaInfoCircle className="mt-0.5 shrink-0" />
                                    <span>{commentSuccess}</span>
                                </div>
                            )}

                            {commentError && (
                                <div className="mt-3 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <FaExclamationCircle className="mt-0.5 shrink-0" />
                                    <span>{commentError}</span>
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
                                    {comments.map((comment) => {
                                        const isOwnComment = currentUserEmail && comment.authorEmail === currentUserEmail;
                                        return (
                                            <div key={comment.commentId} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{comment.authorRole === 'ROLE_TECHNICIAN' ? 'Technician' : 'Student'}</p>
                                                        <p className="mt-0.5 text-sm font-semibold text-slate-900">{comment.authorName || comment.authorEmail}</p>
                                                        <p className="text-xs text-slate-500">{formatDateTime(comment.updatedAt || comment.createdAt)}</p>
                                                    </div>
                                                    {isOwnComment && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openCommentEditModal(comment)}
                                                                className="rounded-lg border border-amber-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 transition hover:bg-amber-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteComment(comment.commentId)}
                                                                className="rounded-lg border border-rose-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-100"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-800">{comment.commentText}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={openUpdateModal}
                                disabled={ticket.status !== 'OPEN'}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-300 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100"
                            >
                                <FaEdit /> Update
                            </button>
                            <button
                                type="button"
                                onClick={openDeleteConfirmation}
                                disabled={ticket.status !== 'OPEN'}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-400 bg-rose-400 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100"
                            >
                                <FaTrash /> Delete
                            </button>
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

            {isUpdateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Update Ticket</p>
                                <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Edit ticket details</h3>
                            </div>
                            <button
                                type="button"
                                onClick={closeUpdateModal}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-gray-50 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        {updateError && (
                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{updateError}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdateSubmit} className="space-y-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Resource Type</label>
                                    <select
                                        name="resourceType"
                                        value={updateForm.resourceType}
                                        onChange={handleUpdateChange}
                                        required
                                        disabled={isLoadingTypes}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    >
                                        <option value="">{isLoadingTypes ? 'Loading resource types...' : 'Choose a resource type'}</option>
                                        {resourceTypes.map((type) => (
                                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Resource Name</label>
                                    <select
                                        name="resourceId"
                                        value={updateForm.resourceId}
                                        onChange={handleUpdateChange}
                                        required
                                        disabled={!updateForm.resourceType || isLoadingResources}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {!updateForm.resourceType
                                                ? 'Select a resource type first'
                                                : (isLoadingResources ? 'Loading resources...' : 'Choose a resource name')}
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
                                        value={updateForm.category}
                                        onChange={handleUpdateChange}
                                        required
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    >
                                        <option value="">Choose a category</option>
                                        {categoryOptions.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Priority</label>
                                    <select
                                        name="priority"
                                        value={updateForm.priority}
                                        onChange={handleUpdateChange}
                                        required
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    >
                                        {priorityOptions.map((priority) => (
                                            <option key={priority} value={priority}>{priority}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Preferred Contact Details</label>
                                    <input
                                        type="text"
                                        name="preferredContact"
                                        value={updateForm.preferredContact}
                                        onChange={handleUpdateChange}
                                        required
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Description</label>
                                    <textarea
                                        name="description"
                                        value={updateForm.description}
                                        onChange={handleUpdateChange}
                                        required
                                        rows="6"
                                        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium leading-7 text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">
                                        <FaPaperclip /> Attachment Selection
                                    </label>
                                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.png,.jpg,.jpeg"
                                            onChange={handleUpdateAttachmentChange}
                                            className="block w-full text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#f4511e] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-[#d84315]"
                                        />
                                        <p className="mt-3 text-xs leading-6 text-slate-500">
                                            Select up to 3 files. Saving this form replaces previous attachments with the newly selected files.
                                        </p>

                                        {Array.isArray(ticket?.attachments) && ticket.attachments.length > 0 && (
                                            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                                Current attachments: {ticket.attachments.length}. They will be replaced when you save.
                                            </div>
                                        )}

                                        <div className="mt-4 space-y-2">
                                            {updateFiles.length > 0 ? updateFiles.map((file, index) => (
                                                <div key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-2 text-sm text-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        <span className="font-medium">{file.name}</span>
                                                        <span className="text-slate-400">({Math.ceil(file.size / 1024)} KB)</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeUpdateFile(index)}
                                                        className="text-slate-500 transition-colors hover:text-red-500"
                                                        title="Remove file"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-slate-400">No new attachments selected.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeUpdateModal}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="rounded-lg bg-[#f4511e] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#d84315] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {isUpdating ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteConfirmationOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-rose-50 p-3">
                                <FaExclamationCircle className="text-rose-600" size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Delete Ticket?</h3>
                                <p className="text-sm text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>

                        {deleteError && (
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{deleteError}</span>
                            </div>
                        )}

                        <p className="mb-6 text-sm text-slate-600">
                            Ticket <span className="font-semibold text-slate-900">#{ticketId}</span> will be permanently deleted.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteConfirmation}
                                disabled={isDeleting}
                                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Ticket'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCommentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4 border-b border-gray-100 pb-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Ticket Comments</p>
                            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                                {editingCommentId ? 'Edit Comment' : 'Add Comment'}
                            </h3>
                        </div>

                        {commentError && (
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{commentError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Comment</label>
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    rows="4"
                                    placeholder="Enter comment"
                                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium leading-7 text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeCommentModal}
                                    disabled={isCommentSubmitting}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCommentSubmitting}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {isCommentSubmitting ? 'Saving...' : (editingCommentId ? 'Save Comment' : 'Add Comment')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default StudentTicketDetails;
