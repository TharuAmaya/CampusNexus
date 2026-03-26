import { QRCodeCanvas } from 'qrcode.react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Calendar, Clock, Hash, ShieldCheck, Info } from 'lucide-react';
import { getBooking } from '../../services/bookingApi';

export function BookingDetails() {
  const { id } = useParams();

  const { data: b, isLoading, isError } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id),
    enabled: !!id
  });

  if (isLoading) return <div className="text-center py-20 animate-pulse text-slate-400 font-bold">Synchronizing Encrypted Data...</div>;
  if (isError || !b) return <div className="text-rose-400 p-8 glass-card">Error loading secure booking details.</div>;

  const isApproved = b.status === 'APPROVED';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link to="/bookings" className="inline-flex items-center text-slate-400 hover:text-white transition-colors group">
        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" /> 
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-8">
            <div className="glass-card p-8">
               <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-bold text-blue-400 tracking-[0.2em] uppercase">Identity &amp; Ticket</span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {b.status}
                  </span>
               </div>

               <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">{b.resourceId}</h1>

               <div className="space-y-6">
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <Calendar className="w-5 h-5 text-slate-500 mt-1" />
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Schedule Date</p>
                     <p className="text-white font-medium">{b.bookingDate}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <Clock className="w-5 h-5 text-slate-500 mt-1" />
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Interval</p>
                     <p className="text-white font-medium">{b.startTime} - {b.endTime}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <Hash className="w-5 h-5 text-slate-500 mt-1" />
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">System Audit Code</p>
                     <p className="text-white font-mono">{b.bookingCode}</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Secure Verification Note
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This booking is cryptographically signed. Present your QR code to the resource entry scanner for automated check-in.
              </p>
            </div>
         </div>

         <div className="flex flex-col items-center justify-center space-y-8">
           {isApproved ? (
             <div className="glass-card p-10 text-center w-full max-w-sm group">
               <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-emerald-500/20 transition-all group-hover:scale-[1.02]">
                  <QRCodeCanvas 
                    value={b.qrToken || `fallback-${b.bookingCode}`} 
                    size={220} 
                    level="H" 
                    includeMargin={false} 
                    fgColor="#0f172a"
                  />
               </div>
               <div className="mt-8 space-y-2">
                 <p className="text-emerald-400 font-bold tracking-widest uppercase text-[10px]">Validated Access Token</p>
                 <p className="text-slate-500 text-xs">Ready for automated scanning</p>
               </div>
             </div>
           ) : (
             <div className="glass-card p-12 text-center w-full max-w-sm border-amber-500/10 bg-amber-500/5">
               <div className="p-8 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                 <Info className="w-12 h-12 text-amber-500 animate-pulse" />
               </div>
               <h3 className="text-xl font-bold text-amber-200 mb-2">Review in Progress</h3>
               <p className="text-slate-500 text-sm leading-relaxed">
                 Administrators are currently evaluating your request against campus inventory conflicts.
               </p>
             </div>
           )}
         </div>
      </div>
    </div>
  );
}
