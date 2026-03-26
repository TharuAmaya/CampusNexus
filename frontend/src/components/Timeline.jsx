export function Timeline() {
  const hours = Array.from({ length: 9 }, (_, i) => i + 8); // 8 AM to 4 PM
  
  return (
    <div className="w-full mt-6 mb-8">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Availability Timeline (Today)</h3>
      <div className="relative h-12 bg-slate-900/50 rounded-xl border border-white/5 flex overflow-hidden">
        {hours.map((hour) => {
          const isBooked = hour >= 10 && hour <= 11;
          const displayHour = hour > 12 ? hour - 12 : hour;
          const amPm = hour >= 12 ? 'PM' : 'AM';
          
          return (
            <div key={hour} className="flex-1 relative border-r border-white/5 last:border-0 group">
              <div className={`absolute inset-0 transition-colors ${
                isBooked ? 'bg-rose-500/20' : 'hover:bg-indigo-500/20 cursor-pointer'
              }`}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-slate-500 font-medium z-10 pointer-events-none">
                 {displayHour}{amPm}
              </div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                 {isBooked ? 'Already Booked' : 'Available to Book'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
