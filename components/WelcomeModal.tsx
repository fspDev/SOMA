import React from 'react';
import { CloseIcon, MushroomIcon, LightbulbIcon } from '../constants';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-theme-card border border-theme rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-theme flex justify-between items-center">
          <h2 className="text-xl font-bold text-theme-main flex items-center gap-2">
            <MushroomIcon className="w-6 h-6 text-[#00BFA5]" />
            ¡Bienvenido/a a SOMA!
          </h2>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-main">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4 text-theme-muted">
          <p>
            Estás a punto de empezar un viaje de autoconocimiento. SOMA está aquí para ser tu bitácora personal y ayudarte a encontrar el equilibrio entre cuerpo y conciencia.
          </p>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-theme-main">Guía de Inicio Rápido:</h3>
            <ul className="list-disc list-outside space-y-2 pl-5">
              <li>
                <strong className="text-theme-main">1. Configura tu Protocolo:</strong> Ve a <strong className="text-[#00BFA5]">Ajustes</strong> (el icono del engranaje) para elegir tu protocolo (ej. Fadiman), establecer tu nombre y tu fecha de inicio.
              </li>
              <li>
                <strong className="text-theme-main">2. Registra tu Día:</strong> Pulsa <strong className="text-[#00BFA5]">"Anotar en el Diario"</strong> para registrar tu humor, concentración y notas. La constancia es clave.
              </li>
              <li>
                <strong className="text-theme-main">3. Observa tu Evolución:</strong> El calendario y la gráfica te mostrarán tus patrones a lo largo del tiempo. ¡Descubre tus propios insights!
              </li>
            </ul>
          </div>

          <div className="p-4 bg-theme-bubble border border-theme rounded-md flex items-start gap-3">
            <LightbulbIcon className="w-6 h-5 text-[#00BFA5] flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-theme-main">Recomendaciones Clave</h4>
              <p className="text-sm">
                Define una <strong className="text-theme-main">intención</strong> clara para tu ciclo. Sé consistente con tus registros y, sobre todo, escucha las señales sutiles de tu cuerpo y mente.
              </p>
            </div>
          </div>
          
          <p className="text-xs text-center pt-2">
            Recuerda: SOMA es una herramienta de seguimiento y no constituye consejo médico.
          </p>
        </div>

        <div className="p-4 mt-auto border-t border-theme flex justify-end">
             <button onClick={onClose} className="px-6 py-2 bg-[#00BFA5] hover:opacity-90 text-white font-semibold rounded-lg transition-colors">
              ¡Entendido, a empezar!
             </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default WelcomeModal;