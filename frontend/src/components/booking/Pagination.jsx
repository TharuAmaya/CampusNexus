/**
 * Pagination.jsx
 *
 * Generic, fully accessible pagination bar.
 * Renders page numbers with ellipsis, Prev/Next buttons,
 * and an item count summary.
 *
 * Props:
 *   total      — total number of items
 *   pageSize   — items per page
 *   current    — current 1-indexed page number
 *   onChange   — callback (page: number) => void
 */

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function buildPageNumbers(current, totalPages) {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3) pages.push('...');
    for (let p = Math.max(2, current - 1); p <= Math.min(totalPages - 1, current + 1); p++) {
        pages.push(p);
    }
    if (current < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
}

export default function Pagination({ total, pageSize, current, onChange }) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    const safePage = Math.min(current, totalPages);
    const startItem = (safePage - 1) * pageSize + 1;
    const endItem = Math.min(safePage * pageSize, total);
    const pageNumbers = buildPageNumbers(safePage, totalPages);

    const goTo = (page) => {
        if (page < 1 || page > totalPages) return;
        onChange(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
            {/* Item counter */}
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                Showing{' '}
                <span className="text-white/70">{startItem}–{endItem}</span>
                {' '}of{' '}
                <span className="text-white/70">{total}</span>
                {' '}reservations
            </p>

            {/* Controls */}
            <div className="flex items-center gap-2">
                {/* Prev */}
                <button
                    onClick={() => goTo(safePage - 1)}
                    disabled={safePage === 1}
                    aria-label="Previous page"
                    className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:-translate-x-0.5"
                >
                    <FaChevronLeft className="text-xs" />
                </button>

                {/* Page numbers */}
                {pageNumbers.map((p, i) =>
                    p === '...' ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="w-10 h-10 flex items-center justify-center text-white/30 text-sm font-bold select-none"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => goTo(p)}
                            aria-label={`Page ${p}`}
                            aria-current={p === safePage ? 'page' : undefined}
                            className={`w-10 h-10 flex items-center justify-center text-[12px] font-black uppercase tracking-widest border transition-all ${
                                p === safePage
                                    ? 'bg-[#f4511e] text-white border-[#f4511e] shadow-lg shadow-[#f4511e]/30 scale-105'
                                    : 'bg-white/10 text-white/60 border-white/10 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => goTo(safePage + 1)}
                    disabled={safePage === totalPages}
                    aria-label="Next page"
                    className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:translate-x-0.5"
                >
                    <FaChevronRight className="text-xs" />
                </button>
            </div>
        </div>
    );
}
