import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaComments, FaEdit, FaExclamationCircle, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import DashboardLayout from '../../components/DashboardLayout.jsx';

const API_BASE_URL = 'http://localhost:8081';

const TechnicianTicketDetails = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [resourceDetails, setResourceDetails] = useState(null);
    const [isResourceLoading, setIsResourceLoading] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [isResolving, setIsResolving] = useState(false);
    const [resolveError, setResolveError] = useState('');
    const [resolveSuccess, setResolveSuccess] = useState(false);
    const [isEditingResolution, setIsEditingResolution] = useState(false);
    const [editedResolutionNotes, setEditedResolutionNotes] = useState('');
    const [isSavingResolutionEdit, setIsSavingResolutionEdit] = useState(false);
    const [isDeletingResolution, setIsDeletingResolution] = useState(false);
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

    const openResolveModal = () => {
        setResolutionNotes('');
        setResolveError('');
        setIsResolveModalOpen(true);
    };

    const closeResolveModal = () => {
        if (isResolving) return;
        setIsResolveModalOpen(false);
        setResolveError('');
    };

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

    const handleResolveSubmit = async (event) => {
        event.preventDefault();

        if (!resolutionNotes.trim()) {
            setResolveError('Please add resolution notes.');
            return;
        }

        try {
            setIsResolving(true);
            setResolveError('');
            setResolveSuccess(false);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/technician/tickets/${ticketId}/resolve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ resolutionNotes: resolutionNotes.trim() })
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to resolve ticket.`);
            }

            await refreshTicketDetails();
            setResolveSuccess(true);
            setIsResolveModalOpen(false);
            setTimeout(() => setResolveSuccess(false), 3000);
        } catch (error) {
            setResolveError(error.message || 'Unable to resolve ticket.');
        } finally {
            setIsResolving(false);
        }
    };

    const startResolutionEdit = () => {
        setResolveError('');
        setEditedResolutionNotes(resolutionNoteValue);
        setIsEditingResolution(true);
    };

    const cancelResolutionEdit = () => {
        if (isSavingResolutionEdit) return;
        setIsEditingResolution(false);
        setEditedResolutionNotes('');
        setResolveError('');
    };

    const saveResolutionEdit = async () => {
        if (!editedResolutionNotes.trim()) {
            setResolveError('Resolution note cannot be empty.');
            return;
        }

        try {
            setIsSavingResolutionEdit(true);
            setResolveError('');
            setResolveSuccess(false);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/technician/tickets/${ticketId}/resolution-note`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ resolutionNotes: editedResolutionNotes.trim() })
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to update resolution note.`);
            }

            await refreshTicketDetails();
            setIsEditingResolution(false);
            setResolveSuccess(true);
            setTimeout(() => setResolveSuccess(false), 3000);
        } catch (error) {
            setResolveError(error.message || 'Unable to update resolution note.');
        } finally {
            setIsSavingResolutionEdit(false);
        }
    };

    const deleteResolutionNote = async () => {
        try {
            setIsDeletingResolution(true);
            setResolveError('');
            setResolveSuccess(false);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/technician/tickets/${ticketId}/resolution-note`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `HTTP ${response.status}: Failed to delete resolution note.`);
            }

            await refreshTicketDetails();
            setIsEditingResolution(false);
            setResolveSuccess(true);
            setTimeout(() => setResolveSuccess(false), 3000);
        } catch (error) {
            setResolveError(error.message || 'Unable to delete resolution note.');
        } finally {
            setIsDeletingResolution(false);
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

    const resolutionNoteValue = (ticket?.resolutionNotes ?? ticket?.resolutionNote ?? '').trim();
    const hasResolutionNote = resolutionNoteValue.length > 0;

    return (
        <DashboardLayout title="Ticket Details">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Technician Dashboard</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{ticket ? `Ticket #${ticket.ticketId}` : `Ticket #${ticketId}`}</h2>
                    </div>
                    <Link
                        to="/technician/tickets"
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

                        {resolveSuccess && (
                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                <FaInfoCircle className="mt-0.5 shrink-0" />
                                <span>Resolution notes saved and ticket marked as RESOLVED.</span>
                            </div>
                        )}

                        {resolveError && (
                            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{resolveError}</span>
                            </div>
                        )}

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

                        {hasResolutionNote && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Resolution Notes</p>
                                    {!isEditingResolution && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={startResolutionEdit}
                                                disabled={isDeletingResolution}
                                                className="cursor-pointer rounded-lg border border-amber-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={deleteResolutionNote}
                                                disabled={isDeletingResolution || isSavingResolutionEdit}
                                                className="cursor-pointer rounded-lg border border-rose-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isDeletingResolution ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditingResolution ? (
                                    <div className="mt-3 space-y-3">
                                        <textarea
                                            value={editedResolutionNotes}
                                            onChange={(e) => setEditedResolutionNotes(e.target.value)}
                                            rows="4"
                                            className="w-full resize-none rounded-lg border border-amber-300 bg-white px-4 py-3 text-sm font-medium leading-7 text-slate-800 outline-none transition focus:border-amber-500"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={cancelResolutionEdit}
                                                disabled={isSavingResolutionEdit}
                                                className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={saveResolutionEdit}
                                                disabled={isSavingResolutionEdit}
                                                className="cursor-pointer rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isSavingResolutionEdit ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-1 leading-7 text-amber-900">{resolutionNoteValue}</p>
                                )}
                            </div>
                        )}

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Comments</p>
                                <button
                                    type="button"
                                    onClick={openCommentModal}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 transition hover:bg-blue-100"
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
                                                                className="cursor-pointer rounded-lg border border-amber-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 transition hover:bg-amber-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteComment(comment.commentId)}
                                                                className="cursor-pointer rounded-lg border border-rose-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-100"
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

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={openResolveModal}
                                disabled={hasResolutionNote}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FaEdit /> Add Resolution Notes
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

            {isResolveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4 border-b border-gray-100 pb-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Resolve Ticket</p>
                            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">Add Resolution Notes</h3>
                        </div>

                        {resolveError && (
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <FaExclamationCircle className="mt-0.5 shrink-0" />
                                <span>{resolveError}</span>
                            </div>
                        )}

                        <form onSubmit={handleResolveSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Resolution Note</label>
                                <textarea
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    rows="4"
                                    placeholder="Enter resolution notes"
                                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium leading-7 text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeResolveModal}
                                    disabled={isResolving}
                                    className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isResolving}
                                    className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {isResolving ? 'Saving...' : 'Save Notes & Resolve'}
                                </button>
                            </div>
                        </form>
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
                                    className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCommentSubmitting}
                                    className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
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

export default TechnicianTicketDetails;
