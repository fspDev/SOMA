import React, { useState } from 'react';
import { type Protocol, type JournalEntry } from '../types';
import { getDayStatus } from '../utils/dateUtils';

interface CalendarProps {
  protocol: Protocol;
  startDate: string;
  journalEntries: Record<string, JournalEntry>;
  onDateSelect: (date: string) => void;
}

const WEEK_DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

const Calendar: React.FC<CalendarProps> = ({ protocol, startDate, journalEntries, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDayClasses = (dateStr: string, status: 'dose' | 'rest' | 'inactive') => {
      const entry = journalEntries[dateStr];
      let classes = 'relative w-10 h-10 mx-auto flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 font-medium ';
      
      // FIX: Access mood from the metrics object.
      const moodOpacity = entry?.metrics?.mood ? (entry.metrics.mood / 5) * 0.8 + 0.2 : 0;
      const today = new Date();
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === parseInt(dateStr.split('-')[2]);

      if (isToday) {
        classes += 'ring-2 ring-offset-2 ring-offset-theme ring-[#00BFA5] ';
      } else {
        classes += 'hover:ring-2 hover:ring-[#00BFA5]/50 ';
      }

      switch (status) {
          case 'dose':
              classes += `bg-[#00BFA5] text-white`;
              if (moodOpacity > 0) {
                classes += ` opacity-${Math.round(moodOpacity * 100)}`;
              } else {
                classes += ' opacity-30';
              }
              break;
          case 'rest':
              classes += 'border border-theme text-theme-muted hover:bg-theme-bubble';
              break;
          case 'inactive':
              classes += 'border border-theme text-theme-muted opacity-40 hover:bg-theme-bubble';
              break;
      }
      return classes;
  }

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < startingDay; i++) {
       days.push(<div key={`empty-${i}`} className="p-2 text-center"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = getDayStatus(dateStr, startDate, protocol);
      const hasJournal = !!journalEntries[dateStr];
      
      days.push(
        <div 
            key={day} 
            className="text-center p-1"
            onClick={() => onDateSelect(dateStr)}
        >
          <div className={getDayClasses(dateStr, status)}>
            <span>{day}</span>
            {hasJournal && <div className="absolute bottom-1 right-1 w-2 h-2 bg-white/50 rounded-full ring-1 ring-black/20"></div>}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
         <h3 className="text-xl font-semibold text-theme-main capitalize">
          {currentDate.toLocaleString('es-ES', { month: 'long' })} {year}
         </h3>
        <div>
          <button onClick={prevMonth} className="px-3 py-1 bg-theme-bubble text-theme-main border border-theme rounded-full hover:bg-theme-card-hover font-semibold transition-all">&lt;</button>
          <button onClick={nextMonth} className="px-3 py-1 ml-2 bg-theme-bubble text-theme-main border border-theme rounded-full hover:bg-theme-card-hover font-semibold transition-all">&gt;</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEK_DAYS.map(day => (
          <div key={day} className="text-center font-medium text-theme-muted text-sm">{day}</div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;