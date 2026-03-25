import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, LayoutDashboard, Database, Clock } from 'lucide-react';
import { BookingCard } from '../components/BookingCard';
import { getMyBookings } from '../../../services/api/bookingApi';

const TEMP_USER_ID = "USER_001"; // Placeholder for Auth

export function UserBookingsDashboard() {
  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ['myBookings', TEMP_USER_ID],
    queryFn: () => getMyBookings(TEMP_USER_ID)
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">My <span className="text-blue-400">Bookings</span></h1>
          <p className="text-slate-400">Track and manage your scheduled CampusNexus resources.</p>
        </div>
        
        <Link to="/bookings/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Request Resource
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-blue-500/10 bg-blue-500/5">
          <Database className="w-8 h-8 text-blue-400 mb-3" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Bookings</p>
          <p className="text-3xl font-extrabold text-white">{bookings?.length || 0}</p>
        </div>
        <div className="glass-card p-6 border-emerald-500/10 bg-emerald-500/5">
          <Clock className="w-8 h-8 text-emerald-400 mb-3" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Next Session</p>
          <p className="text-3xl font-extrabold text-white">Active</p>
        </div>
      </div>

      {isLoading && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card h-48 animate-pulse bg-white/5" />
            ))}
         </div>
      )}

      {isError && (
         <div className="glass-card border-rose-500/20 bg-rose-500/5 p-8 text-center">
           <p className="text-rose-400 font-bold text-lg mb-2">Connection Problem</p>
           <p className="text-rose-300/60 text-sm">We couldn't reach the booking intelligence service. Please check your network.</p>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bookings?.map(b => <BookingCard key={b.id} booking={b} />)}
        {bookings?.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center glass-card">
            <LayoutDashboard className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Your itinerary is currently empty.</p>
            <Link to="/bookings/new" className="text-blue-400 hover:underline mt-2 inline-block">Start your first booking →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
