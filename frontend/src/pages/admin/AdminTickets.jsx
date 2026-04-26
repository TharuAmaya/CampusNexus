import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaEye, FaFilePdf, FaSpinner, FaTicketAlt } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DashboardLayout from '../../components/DashboardLayout.jsx';

const API_BASE_URL = 'http://localhost:8081';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    useEffect(() => {
        const fetchAllTickets = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/admin/tickets`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || 'Failed to load tickets.');
                }

                const data = await response.json();
                setTickets(Array.isArray(data) ? data : []);
            } catch (error) {
                setErrorMessage(error.message || 'Unable to fetch tickets.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllTickets();
    }, []);

    const categoryOptions = useMemo(() => {
        const uniqueCategories = Array.from(
            new Set(
                tickets
                    .map((ticket) => ticket.category)
                    .filter((category) => typeof category === 'string' && category.trim().length > 0)
            )
        );

        return uniqueCategories.sort((a, b) => a.localeCompare(b));
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        if (selectedCategory === 'ALL') {
            return tickets;
        }

        return tickets.filter((ticket) => ticket.category === selectedCategory);
    }, [tickets, selectedCategory]);

    const formatDateTime = (value) => {
        if (!value) return '-';

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleString();
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
        case 'OPEN':
            return 'bg-blue-50 text-blue-700';
        case 'IN_PROGRESS':
        case 'INPROGRESS':
            return 'bg-amber-50 text-amber-700';
        case 'RESOLVED':
            return 'bg-emerald-50 text-emerald-700';
        case 'CLOSED':
            return 'bg-slate-100 text-slate-700';
        case 'REJECTED':
            return 'bg-rose-50 text-rose-700';
        default:
            return 'bg-gray-100 text-gray-700';
        }
    };

    const getAdminEmail = () => {
        const directEmail = localStorage.getItem('email') || localStorage.getItem('userEmail');
        if (directEmail) {
            return directEmail;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            return 'Unknown';
        }

        try {
            const payloadPart = token.split('.')[1];
            if (!payloadPart) {
                return 'Unknown';
            }

            const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
            const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
            const payload = JSON.parse(atob(paddedBase64));
            return payload.email || payload.sub || 'Unknown';
        } catch {
            return 'Unknown';
        }
    };

    const handleGeneratePdf = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const generatedAt = new Date().toLocaleString();
        const adminEmail = getAdminEmail();
        const selectedCategoryLabel = selectedCategory === 'ALL' ? 'All Categories' : selectedCategory;
        const pageWidth = doc.internal.pageSize.getWidth();

        const statusCounts = filteredTickets.reduce(
            (acc, ticket) => {
                const normalizedStatus = (ticket.status || '').toUpperCase();
                acc.total += 1;

                if (normalizedStatus === 'OPEN') acc.open += 1;
                if (normalizedStatus === 'IN_PROGRESS' || normalizedStatus === 'INPROGRESS') acc.inProgress += 1;
                if (normalizedStatus === 'RESOLVED') acc.resolved += 1;
                if (normalizedStatus === 'REJECTED') acc.rejected += 1;

                return acc;
            },
            { total: 0, open: 0, inProgress: 0, resolved: 0, rejected: 0 }
        );

        doc.setFillColor(15, 23, 42);
        doc.rect(30, 20, pageWidth - 60, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text('Admin Ticket Analysis', 40, 46);

        doc.setTextColor(33, 37, 41);
        doc.setFontSize(10);
        doc.text(`Generated At: ${generatedAt}`, 40, 80);
        doc.text(`Generated By (Email): ${adminEmail}`, 40, 95);
        doc.text(`Category Filter: ${selectedCategoryLabel}`, 40, 110);

        const summaryCards = [
            { label: 'Total Tickets', value: statusCounts.total, color: [226, 232, 240] },
            { label: 'Open Tickets', value: statusCounts.open, color: [219, 234, 254] },
            { label: 'In Progress', value: statusCounts.inProgress, color: [254, 243, 199] },
            { label: 'Resolved', value: statusCounts.resolved, color: [220, 252, 231] },
            { label: 'Rejected', value: statusCounts.rejected, color: [254, 226, 226] }
        ];

        const cardsStartX = 40;
        const cardsStartY = 130;
        const cardsGap = 12;
        const cardWidth = (pageWidth - 80 - (cardsGap * 4)) / 5;
        const cardHeight = 64;

        summaryCards.forEach((card, index) => {
            const x = cardsStartX + (index * (cardWidth + cardsGap));
            doc.setFillColor(card.color[0], card.color[1], card.color[2]);
            doc.roundedRect(x, cardsStartY, cardWidth, cardHeight, 6, 6, 'F');

            doc.setFontSize(10);
            doc.setTextColor(30, 64, 72);
            doc.text(card.label, x + 12, cardsStartY + 24);

            doc.setFontSize(18);
            doc.setTextColor(17, 24, 39);
            doc.text(String(card.value), x + 12, cardsStartY + 48);
        });

        const tableRows = filteredTickets.map((ticket) => [
            ticket.ticketId ?? '-',
            ticket.category || '-',
            ticket.priority || '-',
            ticket.status || '-',
            ticket.createdByEmail || '-',
            ticket.assignedToEmail || '-',
            formatDateTime(ticket.createdAt)
        ]);

        autoTable(doc, {
            startY: 210,
            head: [[
                'Ticket ID',
                'Category',
                'Priority',
                'Status',
                'Submitted By',
                'Assigned To',
                'Created At'
            ]],
            body: tableRows,
            styles: { fontSize: 9, cellPadding: 6 },
            headStyles: { fillColor: [244, 81, 30] }
        });

        const dateTag = new Date().toISOString().slice(0, 10);
        doc.save(`admin-ticket-analysis-${dateTag}.pdf`);
    };

    return (
        <DashboardLayout title="Ticket Management">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-lg bg-blue-50 p-3 text-blue-600">
                            <FaTicketAlt className="text-lg" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4511e]">Admin Dashboard</p>
                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">All Submitted Tickets</h2>
                        </div>
                    </div>

                    <div className="w-full max-w-xs">
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4511e]">Choose Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(event) => setSelectedCategory(event.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#f4511e]/40 focus:bg-white"
                        >
                            <option value="ALL">All Categories</option>
                            {categoryOptions.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleGeneratePdf}
                        disabled={isLoading || filteredTickets.length === 0}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaFilePdf /> Generate PDF
                    </button>
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
                        <span>Loading tickets...</span>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-slate-500">
                        No tickets found for the selected category.
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
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Submitted By</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Assigned To</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Created At</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.ticketId} className="hover:bg-gray-50/70">
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">#{ticket.ticketId}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{ticket.category || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{ticket.priority || '-'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${getStatusBadgeClass(ticket.status)}`}>
                                                {ticket.status || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{ticket.createdByEmail || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{ticket.assignedToEmail || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(ticket.createdAt)}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <Link
                                                to={`/admin/tickets/${ticket.ticketId}`}
                                                className="inline-flex items-center gap-2 rounded-lg bg-[#f4511e] px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#d84315]"
                                            >
                                                <FaEye /> View More
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

export default AdminTickets;
