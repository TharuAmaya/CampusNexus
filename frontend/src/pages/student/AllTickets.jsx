import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaEye, FaSpinner, FaTicketAlt } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout.jsx';

const API_BASE_URL = 'http://localhost:8081';

const AllTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchMyTickets = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/tickets/my-tickets`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || 'Failed to load your tickets.');
                }

                const data = await response.json();
                setTickets(Array.isArray(data) ? data : []);
            } catch (error) {
                setErrorMessage(error.message || 'Unable to fetch tickets.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyTickets();
    }, []);

    const formatDateTime = (value) => {
        if (!value) return '-';

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleString();
    };

    return (
        <DashboardLayout title="All Tickets">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4">
                    <div className="mt-1 rounded-lg bg-blue-50 p-3 text-blue-600">
                        <FaTicketAlt className="text-lg" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Student Dashboard</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">All Submitted Tickets</h2>
                        <p className="mt-2 text-sm text-slate-500">Click View to open a separate details page for each ticket.</p>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <FaExclamationCircle className="mt-0.5 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-slate-600">
                        <FaSpinner className="animate-spin" />
                        <span>Loading your tickets...</span>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-slate-500">
                        No submitted tickets yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Ticket ID</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Priority</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Created At</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.ticketId} className="hover:bg-gray-50/70">
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">#{ticket.ticketId}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{ticket.category || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{ticket.priority || '-'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                                                {ticket.status || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(ticket.createdAt)}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <Link
                                                to={`/student/all-tickets/${ticket.ticketId}`}
                                                className="inline-flex items-center gap-2 rounded-lg bg-[#f4511e] px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#d84315]"
                                            >
                                                <FaEye /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </DashboardLayout>
    );
};

export default AllTickets;
