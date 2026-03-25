import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, ShieldCheck, QrCode } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const navItems = isAdmin 
    ? [
        { name: 'Admin Dashboard', path: '/admin/bookings', icon: LayoutDashboard },
        { name: 'QR Scanner', path: '/admin/scanner', icon: QrCode },
        { name: 'Back to User', path: '/bookings', icon: ShieldCheck },
      ]
    : [
        { name: 'My Bookings', path: '/bookings', icon: LayoutDashboard },
        { name: 'New Booking', path: '/bookings/new', icon: CalendarPlus },
        { name: 'Admin Panel', path: '/admin/bookings', icon: ShieldCheck },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-white/5 border-b border-white/10 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              CN
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Campus<span className="text-blue-400">Nexus</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 border border-white/20"></div>
            <span className="text-sm font-medium text-slate-300">User</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
