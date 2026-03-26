import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Check, X, ChevronLeft, Calendar, Clock, Users, Info, ShieldCheck } from 'lucide-react';
import { getBookingReviewDetails, approveBooking, rejectBooking } from '../../services/bookingApi';
import { AvailabilityTimeline } from '../../components/AvailabilityTimeline';

export function BookingConflictReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: reviewData, isLoading, isError } = useQuery({
    queryKey: ['bookingReview', id],
    queryFn: () => getBookingReviewDetails(id),
    enabled: !!id
  });

  const approveMutation = useMutation({
    mutationFn: () => approveBooking(id, { approvedBy: 'Admin' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      navigate('/admin/bookings');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectBooking(id, { adminDecisionReason: 'Overlap conflict', rejectedBy: 'Admin' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      navigate('/admin/bookings');
    }
  });

  if (isLoading) return <div className="text-center py-20 animate-pulse text-slate-400">Loading review intelligence...</div>;
  if (isError || !reviewData) return <div className="text-rose-400 p-8 glass-card">Error loading booking review details.</div>;

  const { bookingDetails: b, approvedBookingsForDate, canApprove, reviewMessage } = reviewData;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Link to="/admin/bookings" className="inline-flex items-center text-slate-400 hover:text-white transition-colors group">
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </Link>
        <span className={`px-4 py-1 rounded-full text-xs font-bold border ${
          b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          {b.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <h2 className="text-3xl font-extrabold mb-8 tracking-tight">Reviewing <span className="text-blue-400">{b.bookingCode}</span></h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Requested By</label>
                    <p className="text-lg font-medium">User {b.userId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Resource ID</label>
                    <p className="text-lg font-medium">{b.resourceId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</label>
                    <p className="text-lg font-medium">{b.bookingDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Time Interval</label>
                    <p className="text-lg font-medium">{b.startTime} - {b.endTime}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
               <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Purpose of Visit</label>
               <p className="mt-2 text-slate-300 leading-relaxed italic">&quot;{b.purpose}&quot;</p>
            </div>
          </div>

          <div className="glass-card p-8">
            <AvailabilityTimeline 
              bookings={approvedBookingsForDate} 
              date={b.bookingDate} 
              selectedStart={b.startTime}
              selectedEnd={b.endTime}
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${
            canApprove 
              ? 'bg-emerald-500/10 border-emerald-500/20' 
              : 'bg-rose-500/10 border-rose-500/20'
          }`}>
            <div className="flex items-start gap-3">
              {canApprove ? (
                <Check className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <h3 className={`text-lg font-bold mb-1 ${canApprove ? 'text-emerald-200' : 'text-rose-200'}`}>
                  {canApprove ? 'Ready to Approve' : 'Action Required'}
                </h3>
                <p className={`text-sm leading-relaxed ${canApprove ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                  {reviewMessage}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Administrative Actions
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => approveMutation.mutate()}
                disabled={!canApprove || approveMutation.isPending}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-blue-500/20 px-4 py-4 rounded-xl font-bold transition-all group"
              >
                {approveMutation.isPending ? 'Processing...' : (
                  <>
                    <Check className="w-5 h-5 group-hover:scale-110 transition-transform"/> 
                    Confirm Approval
                  </>
                )}
              </button>
              
              <button 
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="w-full flex justify-center items-center gap-2 bg-white/5 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 px-4 py-4 rounded-xl font-bold transition-all group"
              >
                {rejectMutation.isPending ? 'Rejecting...' : (
                  <>
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform"/>
                    Reject Request
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-500 mt-4">
              Decisions are final and will notify the request owner immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
