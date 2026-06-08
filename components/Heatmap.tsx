import React from 'react';
import { type JournalEntry } from '../types';

interface HeatmapProps {
  journalEntries: Record<string, JournalEntry>;
}

const WEEK_DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const Heatmap: React.FC<HeatmapProps> = ({ journalEntries }) => {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 1);
  startDate.setDate(startDate.getDate() + 1); // Start from exactly one year ago

  const dateRange: Date[] = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const firstDayOfWeek = startDate.getDay(); // 0 for Sunday
  const paddedDateRange = Array(firstDayOfWeek).fill(null).concat(dateRange);

  const getMoodColor = (mood: number | undefined): string => {
    if (mood === undefined || mood === null) return 'bg-theme-bubble border border-theme/20 hover:scale-105';
    const colors = [
      'bg-pink-700/80 group-hover:bg-pink-700',    // 1 (Anxiety color)
      'bg-purple-600/80 group-hover:bg-purple-600', // 2 (Creativity color)
      'bg-blue-600/80 group-hover:bg-blue-600',   // 3 (Focus color)
      'bg-[#00BFA5]/80 group-hover:bg-[#00BFA5]',   // 4 (Brand color)
      'bg-emerald-500/80 group-hover:bg-emerald-500', // 5 (Humor color)
    ];
    return colors[mood - 1] || 'bg-theme-bubble border border-theme/20 hover:scale-105';
  };

  const formatDateISO = (date: Date) => date.toISOString().split('T')[0];
  
  const monthLabels = paddedDateRange.reduce((acc, date, index) => {
    if(date && date.getDate() === 1) {
        acc.push({ month: MONTHS[date.getMonth()], weekIndex: Math.floor(index / 7) });
    }
    return acc;
  }, [] as { month: string; weekIndex: number }[]);

  return (
    <div className="space-y-4">
       <p className="text-sm text-theme-muted">
        Visualiza la consistencia y el estado de ánimo de tu último año. Cada cuadrado es un día, coloreado según tu humor registrado (1=bajo, 5=alto).
      </p>
      <div className="flex justify-end items-center gap-2 text-xs text-theme-muted">
        <span>Bajo</span>
        <div className="w-3 h-3 rounded-sm bg-pink-700/80"></div>
        <div className="w-3 h-3 rounded-sm bg-purple-600/80"></div>
        <div className="w-3 h-3 rounded-sm bg-blue-600/80"></div>
        <div className="w-3 h-3 rounded-sm bg-[#00BFA5]/80"></div>
        <div className="w-3 h-3 rounded-sm bg-emerald-500/80"></div>
        <span>Alto</span>
      </div>
      <div className="relative overflow-x-auto pb-4">
        <div className="flex absolute top-0" style={{ paddingLeft: '30px' }}>
             {monthLabels.map(({ month, weekIndex }) => (
                <div key={`${month}-${weekIndex}`} className="absolute text-xs text-theme-muted" style={{ left: `${weekIndex * 18}px` }}>
                   {month}
                </div>
            ))}
        </div>
        <div className="flex gap-1.5 mt-6">
          <div className="flex flex-col gap-1.5 w-[25px] flex-shrink-0 pt-0.5">
             {WEEK_DAYS.map((day, i) => i % 2 !== 0 ? <div key={day} className="h-3.5 text-xs text-theme-muted">{day}</div> : <div key={day} className="h-3.5"></div>)}
          </div>
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {paddedDateRange.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="w-3.5 h-3.5" />;
              }
              const dateStr = formatDateISO(date);
              const entry = journalEntries[dateStr];
              const mood = entry?.metrics?.mood;
              const color = getMoodColor(mood);
              const formattedDate = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
              
              return (
                <div key={dateStr} className="group relative">
                  <div
                    className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 ${color}`}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block p-2 text-xs bg-[#18181B] text-[#F0F0F0] rounded-md shadow-lg z-10 whitespace-nowrap border border-white/10">
                    {formattedDate}
                    <br />
                    {mood ? `Humor: ${mood}` : 'Sin entrada'}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#18181B]"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
