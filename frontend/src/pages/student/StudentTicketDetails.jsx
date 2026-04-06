import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaExclamationCircle, FaInfoCircle, FaSpinner, FaTrash } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout.jsx';

const API_BASE_URL = 'http://localhost:8081';

const StudentTicketDetails = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

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

    const formatDateTime = (value) => {
        if (!value) return '-';

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleString();
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
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Resource ID</p>
                            <p className="mt-1 font-semibold text-slate-900">{ticket.resourceId || '-'}</p>
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

                        <div className="grid gap-3 md:grid-cols-2">
                            <button
                                type="button"
                                disabled
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-amber-500"
                            >
                                <FaEdit /> Update
                            </button>
                            <button
                                type="button"
                                disabled
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-rose-500"
                            >
                                <FaTrash /> Delete
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </DashboardLayout>
    );
};

export default StudentTicketDetails;
