/**
 * BookingStatusBadge.jsx
 *
 * Reusable booking status badge used across student & admin booking pages.
 * Renders the correct colour, border, and icon for any booking status string.
 */

import React from 'react';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaHourglassHalf,
} from 'react-icons/fa';

// ── Maps ─────────────────────────────────────────────────────────────────────
const STATUS_ICON = {
    APPROVED:  <FaCheckCircle className="text-emerald-500" />,
    REJECTED:  <FaTimesCircle className="text-rose-500" />,
    CANCELLED: <FaTimesCircle className="text-gray-400" />,
};
const DEFAULT_ICON = <FaHourglassHalf className="text-amber-500 animate-pulse" />;

const STATUS_CLASS = {
    APPROVED:  'bg-emerald-50 text-emerald-800 border-emerald-200',
    REJECTED:  'bg-rose-50 text-rose-800 border-rose-200',
    CANCELLED: 'bg-gray-50 text-gray-800 border-gray-200',
};
const DEFAULT_CLASS = 'bg-amber-50 text-amber-800 border-amber-200';

/**
 * @param {{ status: string, className?: string }} props
 */
export default function BookingStatusBadge({ status, className = '' }) {
    const icon = STATUS_ICON[status] ?? DEFAULT_ICON;
    const colourClass = STATUS_CLASS[status] ?? DEFAULT_CLASS;

    return (
        <span
            className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border shadow-sm ${colourClass} ${className}`}
        >
            {icon}
            <span>{status}</span>
        </span>
    );
}
