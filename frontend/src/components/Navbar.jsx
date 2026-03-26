import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRightLeft, CalendarPlus, LayoutDashboard, QrCode, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const navItems = isAdmin
    ? [
        { name: 'Admin Dashboard', path: '/admin/bookings', icon: LayoutDashboard },
        { name: 'QR Scanner', path: '/admin/scanner', icon: QrCode },
        { name: 'Back to User', path: '/bookings', icon: ArrowRightLeft },
      ]
    : [
        { name: 'My Bookings', path: '/bookings', icon: LayoutDashboard },
        { name: 'New Booking', path: '/bookings/new', icon: CalendarPlus },
        { name: 'Admin Panel', path: '/admin/bookings', icon: ShieldCheck },
      ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/35 backdrop-blur-2xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(59,130,246,0.28)]">
              CN
            </div>
            <div>
              <span className="block text-lg font-semibold tracking-[0.18em] text-white">CampusNexus</span>
              <span className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
                {isAdmin ? 'Admin Console' : 'User Workspace'}
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 md:flex">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            React 19 · Vite 7 · Tailwind v4
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100 shadow-[0_10px_30px_rgba(125,211,252,0.15)]'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 lg:self-auto">
            <div className="h-8 w-8 rounded-full border border-white/20 bg-[linear-gradient(135deg,#7dd3fc_0%,#3b82f6_45%,#5eead4_100%)]" />
            <p className="text-sm font-medium text-slate-100">{isAdmin ? 'Admin' : 'Student'}</p>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
