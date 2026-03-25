import { Filter, Search, LayoutDashboard, Database, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { BookingCard } from '../components/BookingCard';
import { getAllBookings } from '../../../services/api/bookingApi';

export function AdminBookingsDashboard() {
  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: () => getAllBookings({})
  });

  const pendingCount = bookings?.filter(b => b.status === 'PENDING').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Global <span className="text-blue-400">Inventory</span></h1>
          <p className="text-slate-400">Managing all resource requests across the CampusNexus network.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold">{bookings?.length || 0} Total</span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2 border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-200">{pendingCount} Pending</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
           <input 
             type="text" 
             placeholder="Search by code or user..." 
             className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
           />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-slate-300 transition-all font-medium">
          <Filter className="w-4 h-4" /> Advanced Filters
        </button>
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
           <p className="text-rose-400 font-bold text-lg mb-2">Synchronicity Interrupted</p>
           <p className="text-rose-300/60 text-sm">Backend API is unreachable. Please verify Spring Boot configuration.</p>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bookings?.map(b => (
          <BookingCard key={b.id} booking={b} isAdmin={true} />
        ))}
        {bookings?.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center glass-card">
            <LayoutDashboard className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No bookings currently registered in the system.</p>
          </div>
        )}
      </div>
    </div>
  );
}
