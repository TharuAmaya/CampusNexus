/**
 * SkeletonCard.jsx
 *
 * Animated loading placeholder shown while booking data is being fetched
 * for the first time. Uses pulse animation to indicate activity.
 */

import React from 'react';

export default function SkeletonCard() {
    return (
        <div className="bg-white/95 p-0 border border-white/50 overflow-hidden shadow-2xl animate-pulse">
            <div className="p-10 pb-6">
                <div className="flex justify-between items-start mb-10">
                    <div className="h-6 w-24 bg-gray-200 rounded-sm" />
                    <div className="h-4 w-20 bg-gray-100 rounded-sm" />
                </div>
                <div className="h-7 w-3/4 bg-gray-200 rounded-sm mb-3" />
                <div className="h-3 w-1/2 bg-gray-100 rounded-sm mb-12" />
                <div className="space-y-4">
                    <div className="h-16 bg-gray-100 rounded-sm" />
                    <div className="h-16 bg-gray-100 rounded-sm" />
                </div>
            </div>
            <div className="h-14 bg-gray-100 border-t border-gray-200" />
        </div>
    );
}
