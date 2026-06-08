import React, { useState, useMemo, useCallback } from 'react';
import { type WeeklyReview, type JournalEntry } from '../types';
import { SparklesIcon, PlusIcon, GridIcon, TrophyIcon, SearchIcon } from '../constants';
import { dayDiff } from '../utils/dateUtils';
import Heatmap from './Heatmap';
import Achievements from './Achievements';

interface JourneyProps {
  intention: string;
  weeklyReviews: Record<string, WeeklyReview>;
  journalEntries: Record<string, JournalEntry>;
  unlockedAchievements: Record<string, boolean>;
  onSaveIntention: (intention: string) => void;
  onSaveWeeklyReview: (review: WeeklyReview) => void;
}

type JourneyTab = 'reviews' | 'heatmap' | 'achievements' | 'search';

const Journey: React.FC<JourneyProps> = ({ 
  intention, weeklyReviews, journalEntries, unlockedAchievements, 
  onSaveIntention, onSaveWeeklyReview 
}) => {
  const [activeTab, setActiveTab] = useState<JourneyTab>('reviews');

  return (
    <div className="space-y-6">
      <div className="bg-theme-card border border-theme rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex border-b border-theme mb-6">
            <TabButton icon={SparklesIcon} label="Revisiones" tabName="reviews" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton icon={GridIcon} label="Mapa de Calor" tabName="heatmap" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton icon={TrophyIcon} label="Logros" tabName="achievements" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton icon={SearchIcon} label="Búsqueda" tabName="search" activeTab={activeTab} onClick={setActiveTab} />
        </div>

        <div>
            {activeTab === 'reviews' && <ReviewsContent intention={intention} weeklyReviews={weeklyReviews} onSaveIntention={onSaveIntention} onSaveWeeklyReview={onSaveWeeklyReview} />}
            {activeTab === 'heatmap' && <Heatmap journalEntries={journalEntries} />}
            {activeTab === 'achievements' && <Achievements unlockedAchievements={unlockedAchievements} />}
            {activeTab === 'search' && <SearchContent journalEntries={journalEntries} weeklyReviews={weeklyReviews} />}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{icon: React.FC<any>, label: string, tabName: JourneyTab, activeTab: JourneyTab, onClick: (tab: JourneyTab) => void}> = ({icon: Icon, label, tabName, activeTab, onClick}) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 p-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === tabName ? 'border-[#00BFA5] text-[#00BFA5]' : 'border-transparent text-theme-muted hover:text-theme-main'
        }`}
    >
        <Icon className="w-5 h-5"/>
        <span>{label}</span>
    </button>
);

const ReviewsContent: React.FC<Pick<JourneyProps, 'intention' | 'weeklyReviews' | 'onSaveIntention' | 'onSaveWeeklyReview'>> = ({ intention, weeklyReviews, onSaveIntention, onSaveWeeklyReview }) => {
    const [currentIntention, setCurrentIntention] = useState(intention);
    const [isEditingIntention, setIsEditingIntention] = useState(false);
    
    const [newReviewNotes, setNewReviewNotes] = useState('');
    const [isAddingReview, setIsAddingReview] = useState(false);
  
    const reviewsArray = useMemo(() => {
      return Object.values(weeklyReviews).sort((a: WeeklyReview, b: WeeklyReview) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [weeklyReviews]);
  
    const lastReviewDate = reviewsArray.length > 0 ? new Date(reviewsArray[0].date + 'T00:00:00') : null;
    const canAddReview = !lastReviewDate || dayDiff(lastReviewDate, new Date()) >= 7;
  
    const handleSaveIntention = () => {
      onSaveIntention(currentIntention);
      setIsEditingIntention(false);
    };
  
    const handleSaveReview = () => {
      if (newReviewNotes.trim() === '') return;
      const todayStr = new Date().toISOString().split('T')[0];
      onSaveWeeklyReview({
        date: todayStr,
        notes: newReviewNotes,
      });
      setNewReviewNotes('');
      setIsAddingReview(false);
    };
    
    const formattedDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-6">
            <div className="p-4 bg-theme-bubble border border-theme rounded-lg">
                <h3 className="text-lg font-bold text-theme-main mb-2">Mi Intención</h3>
                {!isEditingIntention && intention && (
                <div>
                    <p className="text-theme-main whitespace-pre-wrap">{intention}</p>
                    <button onClick={() => setIsEditingIntention(true)} className="mt-4 text-sm font-semibold text-[#00BFA5] hover:text-opacity-80">
                    Editar
                    </button>
                </div>
                )}
                {(isEditingIntention || !intention) && (
                <div className="space-y-4">
                    <textarea value={currentIntention} onChange={(e) => setCurrentIntention(e.target.value)} rows={3} className="w-full bg-theme-input border border-theme text-theme-main rounded-md p-2 placeholder-theme outline-none" placeholder="Define una intención clara para tu viaje..." />
                    <div className="flex justify-end gap-3">
                    {intention && <button onClick={() => setIsEditingIntention(false)} className="px-4 py-2 bg-theme-bubble border border-theme text-theme-main rounded-lg">Cancelar</button>}
                    <button onClick={handleSaveIntention} className="px-4 py-2 bg-[#00BFA5] text-white font-semibold rounded-lg shadow-sm">Guardar</button>
                    </div>
                </div>
                )}
            </div>

            <div className="p-4 bg-theme-bubble border border-theme rounded-lg space-y-4">
                <h3 className="text-lg font-bold text-theme-main">Revisión Semanal</h3>
                {!isAddingReview && (
                <button onClick={() => setIsAddingReview(true)} disabled={!canAddReview} className="w-full flex items-center justify-center gap-2 py-2 bg-[#00BFA5] hover:opacity-90 text-white font-semibold rounded-lg shadow-sm disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <PlusIcon className="w-5 h-5" /> Añadir Nueva Revisión
                </button>
                )}
                {!canAddReview && !isAddingReview && <p className="text-xs text-center text-theme-muted">Podrás añadir una nueva revisión en {7 - dayDiff(lastReviewDate!, new Date())} día(s).</p>}
                {isAddingReview && (
                <div className="space-y-3">
                    <h4 className="font-semibold text-theme-main">Nueva Revisión - {formattedDate(new Date().toISOString().split('T')[0])}</h4>
                    <textarea value={newReviewNotes} onChange={(e) => setNewReviewNotes(e.target.value)} rows={5} className="w-full bg-theme-input border border-theme text-theme-main rounded-md p-2 placeholder-theme outline-none" placeholder="¿Cómo ha sido tu semana en relación a tu intención?" />
                    <div className="flex justify-end gap-3">
                    <button onClick={() => setIsAddingReview(false)} className="px-4 py-2 bg-theme-bubble border border-theme text-theme-main rounded-lg">Cancelar</button>
                    <button onClick={handleSaveReview} className="px-4 py-2 bg-[#00BFA5] text-white font-semibold rounded-lg shadow-sm">Guardar</button>
                    </div>
                </div>
                )}
                
                {reviewsArray.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-theme space-y-4 max-h-80 overflow-y-auto w-full">
                        {reviewsArray.map(review => (
                            <div key={review.date} className="p-3 bg-theme-card border border-theme rounded-md shadow-sm">
                                <p className="text-sm font-semibold text-[#00BFA5] mb-1">{formattedDate(review.date)}</p>
                                <p className="text-theme-main text-sm whitespace-pre-wrap">{review.notes}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const SearchContent: React.FC<Pick<JourneyProps, 'journalEntries' | 'weeklyReviews'>> = ({ journalEntries, weeklyReviews }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        // FIX: Explicitly type 'entry' to resolve issues with type inference.
        Object.values(journalEntries).forEach((entry: JournalEntry) => {
            entry.tags?.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    }, [journalEntries]);

    const handleTagClick = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const searchResults = useMemo(() => {
        const term = searchTerm.toLowerCase();
        // FIX: Explicitly type arrays to resolve issues with type inference in subsequent filter/sort operations.
        const entries: JournalEntry[] = Object.values(journalEntries);
        const reviews: WeeklyReview[] = Object.values(weeklyReviews);

        if (!term && selectedTags.length === 0) return { entries: [], reviews: [] };
        
        const filteredEntries = entries.filter(entry => {
            const matchesTerm = term ? entry.notes.toLowerCase().includes(term) : true;
            const matchesTags = selectedTags.length > 0 ? selectedTags.every(tag => entry.tags?.includes(tag)) : true;
            return matchesTerm && matchesTags;
        });

        const filteredReviews = reviews.filter(review => {
            if (selectedTags.length > 0) return false; // Tags only apply to journal entries
            return term ? review.notes.toLowerCase().includes(term) : true;
        });

        return { 
          entries: filteredEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
          reviews: filteredReviews.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
    }, [searchTerm, selectedTags, journalEntries, weeklyReviews]);

     const formattedDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Busca en tus notas..."
                    className="w-full bg-theme-input border border-theme text-theme-main rounded-full p-2 pl-10 placeholder-theme outline-none"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
            </div>
            
            {allTags.length > 0 && (
                <div className="p-3 bg-theme-bubble border border-theme rounded-lg">
                    <h4 className="text-sm font-semibold mb-2 text-theme-muted">Filtrar por etiquetas:</h4>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${selectedTags.includes(tag) ? 'bg-[#00BFA5] text-white border-[#00BFA5]' : 'bg-theme-main border-theme text-theme-main hover:bg-theme-card-hover'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-h-[50vh] overflow-y-auto space-y-3">
                {searchResults.entries.map(entry => (
                    <div key={entry.date} className="p-3 bg-theme-bubble border border-theme rounded-md shadow-sm">
                        <p className="font-semibold text-sm text-[#00BFA5]">{formattedDate(entry.date)} - Diario</p>
                        <p className="text-theme-main text-sm mt-1">{entry.notes}</p>
                        {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {entry.tags.map(tag => <span key={tag} className="text-xs font-semibold bg-theme-card border border-theme px-2.5 py-0.5 rounded-full text-theme-muted">{tag}</span>)}
                            </div>
                        )}
                    </div>
                ))}
                {searchResults.reviews.map(review => (
                     <div key={review.date} className="p-3 bg-theme-bubble border border-theme rounded-md shadow-sm">
                        <p className="font-semibold text-sm text-[#00BFA5]">{formattedDate(review.date)} - Revisión Semanal</p>
                        <p className="text-theme-main text-sm mt-1">{review.notes}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Journey;