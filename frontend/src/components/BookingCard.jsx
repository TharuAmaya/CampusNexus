import { Link } from 'react-router-dom';

export function BookingCard({ booking, isAdmin }) {
  const isApproved = booking.status === 'APPROVED';
  const isPending = booking.status === 'PENDING';

  return (
    <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1 block">{booking.bookingCode}</span>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{booking.resourceId}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border flex items-center gap-2 ${
          isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
          isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
          'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
           {isPending && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>}
           {booking.status}
        </span>
      </div>
      <div className="space-y-2 mb-6 text-sm text-slate-400">
        <p className="flex items-center gap-2">
          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
          {booking.bookingDate}
        </p>
        <p className="flex items-center gap-2">
          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
          {booking.startTime} - {booking.endTime}
        </p>
      </div>
      <Link 
        to={isAdmin ? `/admin/bookings/${booking.bookingCode}` : `/bookings/${booking.bookingCode}`} 
        className="w-full inline-flex justify-center items-center py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all"
      >
        {isAdmin ? 'System Review' : 'View Details'}
      </Link>
    </div>
  );
}
