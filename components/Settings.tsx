import React, { useState, useCallback, useEffect } from 'react';
import { type Protocol, type CustomMetric, type NotificationPrefs } from '../types';
import { PROTOCOLS, CloseIcon, PlusIcon } from '../constants';
import { getNotificationPermission, requestNotificationPermission, testNotification } from '../utils/notificationUtils';

interface SettingsProps {
  currentProtocol: Protocol;
  currentStartDate: string;
  currentUserName: string;
  currentCustomMetrics: CustomMetric[];
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onSave: (protocol: Protocol, startDate: string, userName: string, customMetrics: CustomMetric[]) => void;
  onResetData: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onShowWelcome: () => void;
  notificationPrefs: NotificationPrefs;
  onSaveNotificationPrefs: (prefs: NotificationPrefs) => void;
}

const Settings: React.FC<SettingsProps> = ({
    currentProtocol, currentStartDate, currentUserName, currentCustomMetrics,
    theme, onThemeChange,
    onSave, onResetData, onLogout, onDeleteAccount, onShowWelcome,
    notificationPrefs, onSaveNotificationPrefs,
}) => {
  const [selectedProtocolId, setSelectedProtocolId] = useState(currentProtocol.id);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [userName, setUserName] = useState(currentUserName);
  const [customOnDays, setCustomOnDays] = useState(currentProtocol.id === 'custom' ? currentProtocol.onDays : 1);
  const [customOffDays, setCustomOffDays] = useState(currentProtocol.id === 'custom' ? currentProtocol.offDays : 2);
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>(currentCustomMetrics);
  const [newMetricLabel, setNewMetricLabel] = useState('');
  const [localNotifPrefs, setLocalNotifPrefs] = useState<NotificationPrefs>(notificationPrefs);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => getNotificationPermission());

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
  }, []);

  const handleToggleNotif = (key: 'doseReminder' | 'journalReminder') => {
    setLocalNotifPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      onSaveNotificationPrefs(updated);
      return updated;
    });
  };

  const handleTimeChange = (time: string) => {
    setLocalNotifPrefs(prev => ({ ...prev, reminderTime: time }));
  };

  const handleTimeSave = () => {
    onSaveNotificationPrefs(localNotifPrefs);
  };

  const handleTestNotification = async () => {
    await testNotification();
  };

  const selectedProtocol = PROTOCOLS.find(p => p.id === selectedProtocolId) || PROTOCOLS[0];
  
  const handleSave = useCallback(() => {
    let protocolToSave = selectedProtocol;
    if (selectedProtocol.id === 'custom') {
      protocolToSave = {
        ...selectedProtocol,
        onDays: customOnDays,
        offDays: customOffDays,
      };
    }
    onSave(protocolToSave, startDate, userName, customMetrics);
  }, [onSave, selectedProtocol, startDate, userName, customOnDays, customOffDays, customMetrics]);

  const handleDeleteAccount = useCallback(() => {
    if (window.confirm('¿Estás absolutamente seguro de que quieres eliminar tu cuenta? Todos tus datos se perderán para siempre y esta acción no se puede deshacer.')) {
        onDeleteAccount();
    }
  }, [onDeleteAccount]);

  const handleAddMetric = () => {
    if (newMetricLabel.trim()) {
      const newMetric: CustomMetric = {
        id: `custom_${Date.now()}`,
        label: newMetricLabel.trim(),
        color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
      };
      setCustomMetrics(prevMetrics => [...prevMetrics, newMetric]);
      setNewMetricLabel('');
    }
  };

  const handleUpdateMetric = (id: string, newLabel: string) => {
    setCustomMetrics(prevMetrics => prevMetrics.map(m => m.id === id ? { ...m, label: newLabel } : m));
  };
  
  const handleDeleteMetric = (id: string) => {
    if(window.confirm(`¿Seguro que quieres eliminar esta métrica? No podrás verla en el gráfico ni en nuevas entradas.`)){
        setCustomMetrics(prevMetrics => prevMetrics.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 bg-theme-card rounded-xl p-6 shadow-lg border border-theme">
      <div>
        <h2 className="text-xl font-bold text-theme-main mb-6">
          Ajustes
        </h2>
        
        <div className="space-y-6">
           <div>
            <label htmlFor="user-name" className="block text-sm font-medium text-theme-main">Tu Nombre</label>
            <input 
              type="text"
              id="user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="¿Cómo te gustaría que te llamemos?"
              className="mt-1 block w-full bg-theme-input text-theme-main border border-theme rounded-md p-2 focus:ring-[#00BFA5] focus:border-[#00BFA5]"
            />
          </div>
          
          <div>
            <label htmlFor="protocol-select" className="block text-sm font-medium text-theme-main">Elige tu protocolo</label>
            <select
              id="protocol-select"
              value={selectedProtocolId}
              onChange={(e) => setSelectedProtocolId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-theme-input text-theme-main border border-theme focus:outline-none focus:ring-[#00BFA5] focus:border-[#00BFA5] sm:text-sm rounded-md"
            >
              {PROTOCOLS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-theme-muted">{selectedProtocol.description}</p>
          </div>

          {selectedProtocol.id === 'custom' && (
            <div className="p-4 bg-theme-bubble rounded-md border border-theme space-y-4">
                <h4 className="font-semibold text-theme-main">Esquema Personalizado</h4>
                <div className="flex gap-4">
                    <div>
                        <label htmlFor="on-days" className="block text-sm font-medium text-theme-main">Días de Dosis</label>
                        <input 
                            type="number" 
                            id="on-days"
                            value={customOnDays}
                            onChange={(e) => setCustomOnDays(Math.max(1, parseInt(e.target.value) || 1))}
                            className="mt-1 w-full bg-theme-input border border-theme rounded-md p-2 text-theme-main"
                            min="1"
                        />
                    </div>
                    <div>
                        <label htmlFor="off-days" className="block text-sm font-medium text-theme-main">Días de Descanso</label>
                        <input 
                            type="number" 
                            id="off-days"
                            value={customOffDays}
                            onChange={(e) => setCustomOffDays(Math.max(0, parseInt(e.target.value) || 0))}
                            className="mt-1 w-full bg-theme-input border border-theme rounded-md p-2 text-theme-main"
                            min="0"
                        />
                    </div>
                </div>
            </div>
          )}

          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-theme-main">Fecha de Inicio del Protocolo</label>
            <input 
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full bg-theme-input border border-theme rounded-md p-2 text-theme-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-main font-semibold">Tema de la app (Modo Claro/Oscuro)</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onThemeChange(t)}
                  className={`py-2.5 px-3 text-sm font-semibold rounded-md border transition-all ${
                    theme === t
                      ? 'bg-[#00BFA5] text-white border-[#00BFA5] shadow-md scale-102 flex items-center justify-center'
                      : 'bg-theme-main border-theme text-theme-main hover:bg-theme-card-hover flex items-center justify-center'
                  }`}
                >
                  {t === 'light' ? 'Claro ☀️' : t === 'dark' ? 'Oscuro 🌙' : 'Sistema 🖥️'}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-theme-muted">
              {theme === 'system' 
                ? 'SOMA usará la preferencia del sistema de tu dispositivo para cambiar el tema automáticamente.' 
                : `SOMA usará permanentemente el modo ${theme === 'light' ? 'claro' : 'oscuro'}.`}
            </p>
          </div>
        </div>
      </div>
      
      {/* Notificaciones */}
      <div className="pt-5 border-t border-theme">
        <h3 className="text-lg font-semibold text-theme-main">Notificaciones</h3>
        <p className="mt-1 text-sm text-theme-muted">
          Los recordatorios se muestran al abrir la app si ya pasó la hora configurada.
          {' '}En iPhone requiere iOS 16.4+ y tener la app agregada al inicio.
        </p>

        {/* Paso 1: permiso */}
        {notifPermission === 'denied' && (
          <div className="mt-3 p-3 bg-red-900/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400 font-medium">Notificaciones bloqueadas</p>
            <p className="text-xs text-red-400/80 mt-1">
              Entrá a la configuración de tu navegador y permitilas para este sitio.
            </p>
          </div>
        )}
        {notifPermission === 'default' && (
          <button
            onClick={handleRequestPermission}
            className="mt-3 w-full sm:w-auto px-4 py-2.5 bg-[#00BFA5] hover:opacity-90 text-white text-sm font-semibold rounded-lg"
          >
            Paso 1 — Permitir notificaciones
          </button>
        )}
        {notifPermission === 'granted' && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-[#00BFA5] font-medium">✓ Permiso concedido</span>
            <button
              onClick={handleTestNotification}
              className="px-3 py-1.5 text-xs font-semibold border border-[#00BFA5] text-[#00BFA5] rounded-lg hover:bg-[#00BFA5]/10"
            >
              Probar ahora
            </button>
          </div>
        )}

        {/* Paso 2: toggles */}
        <div className="mt-5 space-y-3">
          {([
            { key: 'doseReminder' as const, label: 'Días de dosis', desc: 'Recordatorio cuando corresponde tomar.' },
            { key: 'journalReminder' as const, label: 'Entrada en el diario', desc: 'Recordatorio si todavía no registraste el día.' },
          ]).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-3 p-3 bg-theme-bubble rounded-lg border border-theme">
              <div>
                <p className="text-sm font-medium text-theme-main">{label}</p>
                <p className="text-xs text-theme-muted">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotif(key)}
                disabled={notifPermission !== 'granted'}
                aria-label={localNotifPrefs[key] ? 'Desactivar' : 'Activar'}
                className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors focus:outline-none ${
                  localNotifPrefs[key] && notifPermission === 'granted'
                    ? 'bg-[#00BFA5]'
                    : 'bg-gray-400/40'
                } disabled:opacity-40`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    localNotifPrefs[key] && notifPermission === 'granted' ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Hora */}
        <div className="mt-4">
          <label htmlFor="notif-time" className="block text-sm font-medium text-theme-main">
            Hora del recordatorio
          </label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="time"
              id="notif-time"
              value={localNotifPrefs.reminderTime}
              onChange={e => handleTimeChange(e.target.value)}
              disabled={notifPermission !== 'granted'}
              className="bg-theme-input border border-theme rounded-md p-2 text-theme-main disabled:opacity-40"
            />
            <button
              onClick={handleTimeSave}
              disabled={notifPermission !== 'granted'}
              className="px-4 py-2 bg-[#00BFA5] hover:opacity-90 text-white text-sm font-semibold rounded-lg disabled:opacity-40"
            >
              Guardar hora
            </button>
          </div>
        </div>
      </div>

      {/* Custom Metrics Section */}
      <div className="pt-5 border-t border-theme">
        <h3 className="text-lg font-semibold text-theme-main">Personalizar Métricas</h3>
        <p className="mt-1 text-sm text-theme-muted">
            Añade, edita o elimina las métricas que quieres seguir.
        </p>
        <div className="mt-4 space-y-3">
            {customMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={metric.label}
                        onChange={(e) => handleUpdateMetric(metric.id, e.target.value)}
                        className="flex-grow bg-theme-input border border-theme rounded-md p-2 text-theme-main"
                    />
                    <button onClick={() => handleDeleteMetric(metric.id)} className="p-2 bg-red-900/10 hover:bg-red-900/25 rounded-md text-red-500 border border-red-500/10">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
            ))}
             <div className="flex items-center gap-2">
                <input 
                    type="text"
                    value={newMetricLabel}
                    onChange={(e) => setNewMetricLabel(e.target.value)}
                    placeholder="Nueva métrica (ej: Energía)"
                    className="flex-grow bg-theme-input border border-theme rounded-md p-2 text-theme-main placeholder:text-theme-muted"
                />
                <button onClick={handleAddMetric} className="p-2 bg-green-900/10 hover:bg-green-900/25 rounded-md text-green-500 border border-green-500/10">
                    <PlusIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
      </div>

      <div className="pt-5 border-t border-theme">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2 bg-[#00BFA5] hover:opacity-90 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
      
      <div className="pt-5 mt-4 border-t border-theme">
          <h3 className="text-lg font-semibold text-theme-main">Ayuda</h3>
          <p className="mt-1 text-sm text-theme-muted">
            ¿Necesitas un recordatorio sobre cómo usar la app?
          </p>
          <div className="mt-4">
              <button
                onClick={onShowWelcome}
                className="w-full sm:w-auto px-4 py-2 bg-theme-bubble hover:bg-theme-card-hover border border-theme text-theme-main font-semibold rounded-lg transition-colors"
              >
                Ver la Guía de Inicio
              </button>
          </div>
      </div>

      <div className="pt-5 mt-4 border-t border-red-500/20 dark:border-red-500/30">
          <h3 className="text-lg font-semibold text-red-400">Zona de Peligro</h3>
          <p className="mt-1 text-sm text-theme-muted">
            Estas acciones son permanentes. Por favor, ten cuidado.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onResetData}
                className="w-full sm:w-auto px-4 py-2 bg-red-900/10 hover:bg-red-900/25 text-red-400 font-semibold rounded-lg transition-colors"
              >
                Borrar todos los datos
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full sm:w-auto px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
              >
                Eliminar Cuenta
              </button>
              <button
                onClick={onLogout}
                className="w-full sm:w-auto px-4 py-2 bg-theme-bubble hover:bg-theme-card-hover border border-theme text-theme-main font-semibold rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
          </div>
      </div>
    </div>
  );
};

export default Settings;