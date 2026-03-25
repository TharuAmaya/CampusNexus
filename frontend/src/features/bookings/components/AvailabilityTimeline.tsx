import type { BookingSummaryResponse } from '../types';

interface AvailabilityTimelineProps {
  bookings: BookingSummaryResponse[];
  date: string;
  selectedStart?: string;
  selectedEnd?: string;
}

export function AvailabilityTimeline({ bookings, date, selectedStart, selectedEnd }: AvailabilityTimelineProps) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 10 PM

  const getPosition = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const startHour = 7;
    return ((h - startHour) * 60 + m) / (15 * 60) * 100;
  };

  const currentSelection = selectedStart && selectedEnd ? {
    left: `${getPosition(selectedStart)}%`,
    width: `${getPosition(selectedEnd) - getPosition(selectedStart)}%`
  } : null;

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-end mb-2">
        <h3 className="text-sm font-medium text-slate-400">Live Availability: {date}</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-rose-500/40 border border-rose-500/50 rounded-sm"></div>
            <span className="text-slate-500">Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500/40 border border-blue-500/50 rounded-sm"></div>
            <span className="text-slate-500">Your Selection</span>
          </div>
        </div>
      </div>

      <div className="relative h-12 bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
        {/* Hour markers */}
        <div className="absolute inset-0 flex justify-between px-2 pt-1 pointer-events-none">
          {hours.map(h => (
            <div key={h} className="h-full border-l border-white/5 flex flex-col items-center">
              <span className="text-[10px] text-slate-600 mt-6">{h}:00</span>
            </div>
          ))}
        </div>

        {/* Occupied slots */}
        {bookings.map((b, i) => (
          <div
            key={i}
            className="absolute h-6 top-3 bg-rose-500/30 border-y border-rose-500/50 rounded-sm z-10"
            style={{
              left: `${getPosition(b.startTime)}%`,
              width: `${getPosition(b.endTime) - getPosition(b.startTime)}%`
            }}
            title={`Occupied: ${b.startTime} - ${b.endTime}`}
          />
        ))}

        {/* Current selection */}
        {currentSelection && (
          <div
            className="absolute h-10 top-1 bg-blue-500/30 border border-blue-500/50 rounded-lg z-20 transition-all duration-300"
            style={currentSelection}
          />
        )}
      </div>
    </div>
  );
}
