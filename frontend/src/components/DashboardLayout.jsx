import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * DashboardLayout — shared shell for all authenticated pages.
 * Automatically applies admin or user themed background gradients
 * based on the current route.
 */
export default function DashboardLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen text-slate-50">
      {/* Ambient background glow — changes per role */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {isAdmin ? (
          <>
            <div className="absolute left-[-10%] top-[-5%] h-80 w-80 rounded-full bg-rose-400/10 blur-3xl" />
            <div className="absolute right-[8%] top-[20%] h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-5%] h-96 w-96 rounded-full bg-blue-400/12 blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute left-[-8%] top-[10%] h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
            <div className="absolute right-[-10%] top-0 h-96 w-96 rounded-full bg-blue-500/16 blur-3xl" />
            <div className="absolute bottom-[-10%] left-[30%] h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
          </>
        )}
      </div>

      <Navbar />

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
