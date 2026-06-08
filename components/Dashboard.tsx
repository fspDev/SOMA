import React, { useState, useMemo, useCallback } from 'react';
import { type Protocol, type JournalEntry, type CustomMetric } from '../types';
import Calendar from './Calendar';
import JournalModal from './JournalModal';
import EvolutionChart from './EvolutionChart';
import TipsFooter from './TipsFooter';
import { getDayStatus, dayDiff } from '../utils/dateUtils';
import { ChevronDownIcon, CheckIcon, SparklesIcon, MushroomIcon } from '../constants';

interface DashboardProps {
  protocol: Protocol;
  startDate: string;
  journalEntries: Record<string, JournalEntry>;
  customMetrics: CustomMetric[];
  intention: string;
  onSaveJournalEntry: (entry: JournalEntry) => void;
  theme?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ protocol, startDate, journalEntries, customMetrics, intention, onSaveJournalEntry, theme }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([customMetrics[0]?.id || 'mood']);
  const [isEvolutionVisible, setIsEvolutionVisible] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysEntry = journalEntries[todayStr];

  const todayStatus = useMemo(() => getDayStatus(todayStr, startDate, protocol), [todayStr, startDate, protocol]);
  const statusForModal = useMemo(() => selectedDate ? getDayStatus(selectedDate, startDate, protocol) : 'inactive', [selectedDate, startDate, protocol]);

  const handleDateSelect = useCallback((date: string) => setSelectedDate(date), []);
  const handleCloseModal = useCallback(() => setSelectedDate(null), []);

  const handleSave = useCallback((entry: JournalEntry) => {
    onSaveJournalEntry(entry);
    setSelectedDate(null);
  }, [onSaveJournalEntry]);
  
  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricId)) {
        if (prev.length === 1) return prev; // Must have at least one selected
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };

  const cycleDay = useMemo(() => {
     if (!startDate || new Date(todayStr) < new Date(startDate)) return null;
     const diff = dayDiff(new Date(startDate), new Date(todayStr));
     const cycleLength = protocol.onDays + protocol.offDays;
     if (cycleLength === 0) return null;
     return (diff % cycleLength) + 1;
  }, [todayStr, startDate, protocol]);
  
  const journalEntriesArray = useMemo(() => Object.values(journalEntries), [journalEntries]);
  
  return (
    <div className="space-y-6">
       {todayStatus === 'dose' && !todaysEntry?.doseTakenAt && (
        <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/40 rounded-xl p-4 shadow-sm flex items-start gap-3 transition-colors">
          <MushroomIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-300 flex-shrink-0 mt-0.5" />
          <div className="flex-grow">
            <h3 className="font-semibold text-cyan-900 dark:text-cyan-200">Recordatorio de Dosis</h3>
            <p className="text-sm text-cyan-700 dark:text-cyan-300/80">Hoy es un día de dosis. ¡No olvides registrarla usando el botón de abajo!</p>
          </div>
        </div>
      )}

       {intention && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 shadow-sm flex items-start gap-3 transition-colors">
          <SparklesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-300 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">Recordatorio de tu Intención</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300/80 whitespace-pre-wrap">{intention}</p>
          </div>
        </div>
      )}

      <div className="bg-theme-card border border-theme rounded-xl p-4 sm:p-6 shadow-lg space-y-6 transition-colors">
        
        {/* Top Section: Status & Journal CTA */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-theme-main">Estado de Hoy</h2>
            {todaysEntry?.doseTakenAt ? (
              <div className="flex items-center gap-2 text-green-500 font-semibold px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                <CheckIcon className="w-5 h-5" />
                <span className="text-sm">Dosis Registrada</span>
              </div>
            ) : (
              <p className="text-theme-muted">
                {todayStatus !== 'inactive' && cycleDay !== null
                    ? `Día ${cycleDay} ${todayStatus === 'dose' ? 'Dosis' : 'Descanso'}`
                    : 'Protocolo Inactivo'
                }
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
             <button
              onClick={() => handleDateSelect(todayStr)}
              className="bg-[#00BFA5] hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
             >
              {todaysEntry ? 'Editar Diario' : 'Anotar en el Diario'}
            </button>
          </div>
        </div>
        
        {/* Calendar Section */}
        <Calendar
            protocol={protocol}
            startDate={startDate}
            journalEntries={journalEntries}
            onDateSelect={handleDateSelect}
        />

        {/* Evolution Section */}
        <div className="bg-theme-bubble border border-theme rounded-xl overflow-hidden transition-colors">
            <button 
                onClick={() => setIsEvolutionVisible(!isEvolutionVisible)}
                className="w-full flex justify-between items-center p-4 animate-fadeIn"
                aria-expanded={isEvolutionVisible}
            >
              <h2 className="text-lg font-semibold text-theme-muted">Visualización de la Evolución</h2>
              <ChevronDownIcon className={`w-6 h-6 text-theme-muted transform transition-transform duration-300 ${isEvolutionVisible ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isEvolutionVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow">
                        <EvolutionChart entries={journalEntriesArray} metrics={selectedMetrics} customMetrics={customMetrics} theme={theme} />
                    </div>
                    <div className="flex-shrink-0 sm:w-40">
                        <div className="flex flex-row sm:flex-col flex-wrap gap-2">
                        {customMetrics.map((metric) => (
                          <button
                            key={metric.id}
                            onClick={() => handleMetricToggle(metric.id)}
                            className={`w-full text-left p-2.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2.5 ${
                              selectedMetrics.includes(metric.id) ? 'bg-[#00BFA5] text-white' : 'text-theme-main bg-theme-input border border-theme hover:bg-theme-card-hover'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full flex items-center justify-center border border-black/10 dark:border-white/20" style={{ backgroundColor: metric.color }}>
                              {selectedMetrics.includes(metric.id) && <CheckIcon className="w-3 h-3 text-white" />}
                            </span>
                            {metric.label}
                          </button>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Tips Section */}
        <TipsFooter protocol={protocol} startDate={startDate} isInsideCard={true} />

      </div>

      {selectedDate && <JournalModal date={selectedDate} entry={journalEntries[selectedDate]} dayStatus={statusForModal} customMetrics={customMetrics} onClose={handleCloseModal} onSave={handleSave} />}
    </div>
  );
};

export default Dashboard;