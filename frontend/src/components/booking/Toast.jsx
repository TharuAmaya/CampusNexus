/**
 * Toast.jsx — Lightweight success/error notification toast.
 *
 * Usage:
 *   const [toast, setToast] = useState(null);
 *   setToast({ type: 'success', message: 'Booking Created!' });
 *   <Toast toast={toast} onClose={() => setToast(null)} />
 *
 * Auto-dismisses after 3.5 seconds. No external dependencies.
 */

import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const STYLES = {
    success: {
        bar:  'bg-emerald-500',
        icon: <FaCheckCircle className="text-emerald-400 text-xl shrink-0" />,
        text: 'text-white',
        bg:   'bg-[#0d1f14] border border-emerald-500/40',
    },
    error: {
        bar:  'bg-rose-500',
        icon: <FaTimesCircle className="text-rose-400 text-xl shrink-0" />,
        text: 'text-white',
        bg:   'bg-[#1f0d0d] border border-rose-500/40',
    },
};

export default function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    if (!toast) return null;

    const style = STYLES[toast.type] || STYLES.success;

    return (
        <div
            className="fixed bottom-8 right-8 z-[9999] flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl max-w-sm w-full"
            style={{
                animation: 'toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
        >
            <style>{`
                @keyframes toast-in {
                    from { opacity: 0; transform: translateY(24px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
            `}</style>

            {/* Left colour bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${style.bar}`} />

            {/* Background */}
            <div className={`absolute inset-0 rounded-xl ${style.bg} opacity-95`} />

            {/* Content */}
            <div className="relative flex items-center gap-3 w-full">
                {style.icon}
                <p className={`text-sm font-bold tracking-wide leading-snug flex-1 ${style.text}`}>
                    {toast.message}
                </p>
                <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white transition-colors shrink-0 ml-2"
                    aria-label="Dismiss notification"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    );
}
