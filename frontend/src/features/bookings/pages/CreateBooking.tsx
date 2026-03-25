import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, FileText, CheckCircle2, AlertCircle, Info, Database } from 'lucide-react';
import { createBooking, getAllBookings } from '../../../services/api/bookingApi';
import { AvailabilityTimeline } from '../components/AvailabilityTimeline';
import type { CreateBookingRequest } from '../types';

export function CreateBooking() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateBookingRequest>({
    resourceId: '',
    userId: 'USER_001', // Mock user until Auth is ready
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    expectedAttendees: 1
  });

  // Fetch existing bookings for the selected resource and date to show in the timeline
  const { data: existingBookings = [] } = useQuery({
    queryKey: ['resourceBookings', formData.resourceId, formData.bookingDate],
    queryFn: () => getAllBookings({ resourceId: formData.resourceId, bookingDate: formData.bookingDate }),
    enabled: !!formData.resourceId && !!formData.bookingDate
  });

  const mutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => createBooking(data),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['myBookings'] });
       navigate('/bookings');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Request <span className="text-blue-400">Resource</span></h1>
          <p className="text-slate-400">Secure your space on campus with real-time availability checks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    <Database className="w-3 h-3" /> Select Resource
                  </label>
                  <select 
                    value={formData.resourceId}
                    onChange={e => setFormData({...formData, resourceId: e.target.value})}
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900">Choose a location...</option>
                    <option value="STUDY_ROOM_A" className="bg-slate-900">Study Room A (Floor 2)</option>
                    <option value="LECTURE_HALL_4" className="bg-slate-900">Lecture Hall 4 (North Wing)</option>
                    <option value="LAB_B2" className="bg-slate-900">Engineering Lab B2</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    <Users className="w-3 h-3" /> Expected Attendees
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="200"
                    value={formData.expectedAttendees}
                    onChange={e => setFormData({...formData, expectedAttendees: parseInt(e.target.value) || 1})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    <Calendar className="w-3 h-3" /> Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={formData.bookingDate}
                    onChange={e => setFormData({...formData, bookingDate: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    <Clock className="w-3 h-3" /> Start Time
                  </label>
                  <input 
                    type="time" 
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    <Clock className="w-3 h-3" /> End Time
                  </label>
                  <input 
                    type="time" 
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  <FileText className="w-3 h-3" /> Purpose of Request
                </label>
                <textarea 
                  rows={4} 
                  required
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                  placeholder="e.g. Collaborative study session for PAF assignment..." 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
              >
                {mutation.isPending ? 'Processing Request...' : (
                  <>
                    <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Complete Booking Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6">
            <AvailabilityTimeline 
              bookings={existingBookings} 
              date={formData.bookingDate} 
              selectedStart={formData.startTime}
              selectedEnd={formData.endTime}
            />
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> Booking Policy
            </h3>
            <ul className="text-xs text-slate-500 space-y-2 list-disc ml-4 leading-relaxed">
              <li>Requests are processed by administrators within 24 hours.</li>
              <li>Ensure your purpose is clearly stated for faster approval.</li>
              <li>Maximum booking duration is 4 hours per session.</li>
            </ul>
          </div>
          
          {mutation.isError && (
             <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 animate-bounce">
               <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
               <p className="text-xs text-rose-300 font-medium">Validation Error: Please check for time slot conflicts.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

