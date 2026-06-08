import React from 'react';
import { CloseIcon, SparklesIcon } from '../constants';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose, isLoading, error, result }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-theme-card border border-theme rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-theme flex justify-between items-center">
          <h2 className="text-lg font-bold text-theme-main flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-[#00BFA5]" />
            Análisis de IA
          </h2>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-main">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center text-theme-muted">
                <div className="w-12 h-12 border-4 border-t-[#00BFA5] border-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-semibold text-theme-main">Analizando tus datos...</p>
                <p className="text-sm">Esto puede tardar unos segundos.</p>
            </div>
          )}
          {error && (
            <div className="text-center text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-md">
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
            </div>
          )}
          {result && (
            <div 
              className="space-y-4 text-theme-main"
              dangerouslySetInnerHTML={{ __html: result }} 
            />
          )}
        </div>

        <div className="p-4 border-t border-theme flex justify-end">
             <button onClick={onClose} className="px-4 py-2 bg-[#00BFA5] hover:opacity-90 text-white font-semibold rounded-lg transition-colors">
              Cerrar
             </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;