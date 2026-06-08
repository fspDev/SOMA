import React, { useState, useEffect, useCallback } from 'react';
import { type JournalEntry, type CustomMetric } from '../types';
import { CloseIcon, MushroomIcon, CheckIcon, TagIcon, MoodIcon, FocusIcon, CreativityIcon, AnxietyIcon, METRIC_RATING_LABELS } from '../constants';

interface JournalModalProps {
  date: string;
  entry?: JournalEntry;
  dayStatus: 'dose' | 'rest' | 'inactive';
  customMetrics: CustomMetric[];
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
}

const metricIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  mood: MoodIcon,
  focus: FocusIcon,
  creativity: CreativityIcon,
  anxiety: AnxietyIcon,
  default: MoodIcon
};

const MetricRatingInput: React.FC<{
  metric: CustomMetric;
  value: number;
  onChange: (value: number) => void;
}> = ({ metric, value, onChange }) => {
  const Icon = metricIcons[metric.id] || metricIcons.default;
  const labels = METRIC_RATING_LABELS[metric.id] || METRIC_RATING_LABELS.default;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" style={{ color: metric.color }} />
            <label className="block text-sm font-medium text-theme-main">{metric.label}</label>
        </div>
        <span className="text-sm font-semibold text-theme-muted bg-theme-bubble px-2 py-0.5 rounded border border-theme">
            {labels[value-1]}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            style={rating <= value ? { backgroundColor: metric.color } : {}}
            className={`h-8 flex-1 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105
              ${rating <= value ? '' : 'bg-theme-bubble hover:bg-theme-card-hover'}
              ${rating === 1 ? 'rounded-l-full' : ''}
              ${rating === 5 ? 'rounded-r-full' : ''}
            `}
            aria-label={`${metric.label} - ${labels[rating - 1]}`}
          />
        ))}
      </div>
    </div>
  );
};


const JournalModal: React.FC<JournalModalProps> = ({ date, entry, dayStatus, customMetrics, onClose, onSave }) => {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [doseTakenAt, setDoseTakenAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (entry) {
      setMetrics(entry.metrics || {});
      setNotes(entry.notes);
      setDoseTakenAt(entry.doseTakenAt);
      setTags(entry.tags?.join(', ') || '');
    } else {
      // Initialize with default value of 3 for all custom metrics
      const initialMetrics: Record<string, number> = {};
      customMetrics.forEach(metric => {
          initialMetrics[metric.id] = 3;
      });
      setMetrics(initialMetrics);
      setNotes('');
      setDoseTakenAt(undefined);
      setTags('');
    }
  }, [entry, date, customMetrics]);

  const handleMetricChange = (metricId: string, value: number) => {
    setMetrics(prev => ({...prev, [metricId]: value}));
  }
  
  const handleSave = useCallback(() => {
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    onSave({
      date,
      metrics,
      notes,
      doseTakenAt,
      tags: tagsArray,
    });
  }, [onSave, date, metrics, notes, doseTakenAt, tags]);

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-theme-card border border-theme rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto transition-colors">
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-theme-muted hover:text-theme-main">
            <CloseIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-theme-main">Entrada del Diario</h2>
          <p className="text-theme-muted mb-6 capitalize">{formattedDate}</p>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            
            {dayStatus === 'dose' && (
              <div className="p-4 bg-theme-bubble border border-theme rounded-md">
                <h3 className="font-semibold text-theme-main mb-2 flex items-center gap-2"><MushroomIcon className="w-5 h-5"/>Registro de Dosis</h3>
                {doseTakenAt ? (
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-green-500 font-semibold px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                        <CheckIcon className="w-5 h-5" />
                        <span className="text-sm">Dosis Registrada</span>
                    </div>
                    <button type="button" onClick={() => setDoseTakenAt(undefined)} className="text-xs text-theme-muted hover:text-red-500">Anular</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setDoseTakenAt(new Date().toISOString())} className="w-full bg-[#00BFA5] hover:opacity-95 text-white font-semibold py-2 rounded-lg shadow">
                    Marcar como tomada
                  </button>
                )}
              </div>
            )}

            {customMetrics.map(metric => (
              <MetricRatingInput 
                key={metric.id}
                metric={metric} 
                value={metrics[metric.id] || 3} 
                onChange={(value) => handleMetricChange(metric.id, value)} 
              />
            ))}
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-theme-main">Notas</label>
              <textarea
                id="notes"
                rows={4}
                className="mt-1 block w-full bg-theme-input border border-theme rounded-md shadow-sm p-2 focus:ring-[#00BFA5] focus:border-[#00BFA5] text-theme-main placeholder-theme"
                placeholder="¿Cómo te sientes hoy? ¿Alguna idea u observación?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label htmlFor="tags" className="flex items-center gap-2 text-sm font-medium text-theme-main">
                 <TagIcon className="w-4 h-4 text-theme-muted"/>
                 Etiquetas
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1 block w-full bg-theme-input border border-theme rounded-md shadow-sm p-2 focus:ring-[#00BFA5] focus:border-[#00BFA5] text-theme-main placeholder-theme"
                placeholder="Meditación, trabajo, social..."
              />
              <p className="text-xs text-theme-muted mt-1">Separa las etiquetas con comas.</p>
            </div>
          
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-theme-bubble border border-theme hover:bg-theme-card-hover text-theme-main font-semibold rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-[#00BFA5] hover:opacity-90 text-white font-semibold rounded-lg transition-colors shadow">
                Guardar Entrada
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JournalModal;