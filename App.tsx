import React, { useState, useCallback, useEffect, useRef } from 'react';
import iconPng from './icon.png';
import { type Protocol, type JournalEntry, type WeeklyReview, type View, CustomMetric, Achievement, type NotificationPrefs } from './types';
import { checkAndSendNotifications } from './utils/notificationUtils';
import { PROTOCOLS, HomeIcon, SettingsIcon, BookOpenIcon, DEFAULT_METRICS, ACHIEVEMENTS, FlameIcon } from './constants';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Journey from './components/Journey';
import Toast from './components/Toast';
import Login from './components/Login';
import WelcomeModal from './components/WelcomeModal';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { getDayStatus, dayDiff, calculateStreak, checkAchievements } from './utils/dateUtils';
import { useLocalStorage } from './hooks/useLocalStorage';

interface UserData {
  protocol: Protocol;
  startDate: string;
  journalEntries: Record<string, JournalEntry>;
  userName: string;
  intention: string;
  weeklyReviews: Record<string, WeeklyReview>;
  email: string;
  customMetrics: CustomMetric[];
  achievements: Record<string, boolean>;
}

interface AppContentProps {
  user: User;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const AppContent: React.FC<AppContentProps> = ({ user, theme, setTheme }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [view, setView] = useState<View>('dashboard');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const welcomeCheckCompletedForUser = useRef<string | null>(null);
  const [streak, setStreak] = useState(0);

  const DEFAULT_NOTIF_PREFS: NotificationPrefs = { doseReminder: false, journalReminder: false, reminderTime: '09:00' };
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(() => {
    try {
      const stored = localStorage.getItem('soma_notif_prefs');
      return stored ? JSON.parse(stored) : DEFAULT_NOTIF_PREFS;
    } catch { return DEFAULT_NOTIF_PREFS; }
  });

  const handleSaveNotificationPrefs = useCallback((prefs: NotificationPrefs) => {
    setNotificationPrefs(prefs);
    localStorage.setItem('soma_notif_prefs', JSON.stringify(prefs));
    setToastMessage('Preferencias de notificación guardadas');
  }, []);


  useEffect(() => {
    if (!user) return;
    
    setLoadingData(true);
    const docRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;

        // Data migration and initialization for new features
        if (!data.customMetrics) {
          data.customMetrics = DEFAULT_METRICS;
        }
        if (!data.achievements) {
          data.achievements = {};
        }

        // Migrate old journal entry format
        Object.keys(data.journalEntries).forEach(date => {
          const entry = data.journalEntries[date];
          if (entry.mood && !entry.metrics) { // Check for old format
            entry.metrics = {
              mood: entry.mood,
              focus: entry.focus,
              creativity: entry.creativity,
              anxiety: entry.anxiety,
            };
            delete entry.mood;
            delete entry.focus;
            delete entry.creativity;
            delete entry.anxiety;
          }
        });

        setUserData(data as UserData);

      } else {
        const initialData: UserData = {
          protocol: PROTOCOLS[0],
          startDate: new Date().toISOString().split('T')[0],
          journalEntries: {},
          userName: user.displayName || '',
          intention: '',
          weeklyReviews: {},
          email: user.email || '',
          customMetrics: DEFAULT_METRICS,
          achievements: {},
        };
        setDoc(docRef, initialData).then(() => {
          setUserData(initialData);
        }).catch(error => console.error("Error creating user document:", error));
      }
      setLoadingData(false);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setLoadingData(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!userData) return;
    checkAndSendNotifications(notificationPrefs, userData.protocol, userData.startDate, userData.journalEntries);
  }, [userData, notificationPrefs]);

  useEffect(() => {
    if (!userData) return;

    // Calculate Streak
    const currentStreak = calculateStreak(userData.journalEntries);
    setStreak(currentStreak);

    // Check for Achievements
    const { newAchievements, updatedAchievements } = checkAchievements(userData, currentStreak);
    if (newAchievements.length > 0 && user) {
        const docRef = doc(db, 'users', user.uid);
        updateDoc(docRef, { achievements: updatedAchievements })
          .then(() => {
              const achievementTitles = newAchievements.map(ach => ach.title).join(', ');
              setToastMessage(`¡Logro desbloqueado: ${achievementTitles}!`);
          });
    }

  }, [userData, user]);

  useEffect(() => {
    if (loadingData || !userData) {
      return;
    }

    if (welcomeCheckCompletedForUser.current === user.uid) {
      return;
    }

    if (!userData.userName) {
      setIsWelcomeModalOpen(true);
    }
    welcomeCheckCompletedForUser.current = user.uid;
  }, [loadingData, userData, user]);
  
  const handleCloseWelcomeModal = () => {
    setIsWelcomeModalOpen(false);
    if (userData && !userData.userName) {
      setView('settings');
    }
  };
  
  const handleShowWelcomeModal = () => {
    setIsWelcomeModalOpen(true);
  };

  const handleSaveSettings = useCallback(async (
    newProtocol: Protocol, 
    newStartDate: string, 
    newUserName: string, 
    newCustomMetrics: CustomMetric[]
  ) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(docRef, {
        protocol: newProtocol,
        startDate: newStartDate,
        userName: newUserName,
        customMetrics: newCustomMetrics,
      });
       if (view !== 'dashboard') {
          setView('dashboard');
       }
      setToastMessage('Ajustes guardados con éxito');
    } catch (error) {
      console.error("Error saving settings: ", error);
      setToastMessage('Error al guardar ajustes');
    }
  }, [user, view]);

  const handleSaveJournalEntry = useCallback(async (entry: JournalEntry) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    try {
      const entryToSave: any = { ...entry };
      if (entryToSave.doseTakenAt === undefined) {
        delete entryToSave.doseTakenAt;
      }
      // Ensure tags are saved as an array, even if input is empty
      entryToSave.tags = entry.tags || [];

      await updateDoc(docRef, {
        [`journalEntries.${entry.date}`]: entryToSave
      });
      setToastMessage('Entrada del diario guardada');
    } catch (error) {
      console.error("Error saving journal entry: ", error);
      setToastMessage('Error al guardar la entrada');
    }
  }, [user]);
  
  const handleSaveIntention = useCallback(async (newIntention: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(docRef, { intention: newIntention });
      setToastMessage('Intención guardada');
    } catch (error) {
      console.error("Error saving intention: ", error);
      setToastMessage('Error al guardar la intención');
    }
  }, [user]);

  const handleSaveWeeklyReview = useCallback(async (review: WeeklyReview) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(docRef, {
        [`weeklyReviews.${review.date}`]: review
      });
      setToastMessage('Revisión semanal guardada');
    } catch (error) {
      console.error("Error saving weekly review: ", error);
      setToastMessage('Error al guardar la revisión');
    }
  }, [user]);

  const handleResetData = useCallback(async () => {
    if (!user) return;
    if (window.confirm('¿Estás seguro de que quieres borrar todos los datos de tu diario y viaje? Tu nombre y protocolo se conservarán. Esta acción no se puede deshacer.')) {
        try {
          const docRef = doc(db, 'users', user.uid);
          await updateDoc(docRef, {
            startDate: new Date().toISOString().split('T')[0],
            journalEntries: {},
            intention: '',
            weeklyReviews: {},
            achievements: {},
          });
          setToastMessage('Tus datos han sido reiniciados');
        } catch (error) {
          console.error("Error resetting data: ", error);
          setToastMessage('Error al reiniciar los datos');
        }
    }
  }, [user]);

  const handleLogout = useCallback(() => {
    signOut(auth);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return;
    try {
        const docRef = doc(db, 'users', user.uid);
        await deleteDoc(docRef);
        await deleteUser(user);
        setToastMessage('Tu cuenta ha sido eliminada. Te echaremos de menos.');
    } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            setToastMessage('Por seguridad, por favor cierra sesión y vuelve a iniciarla antes de eliminar tu cuenta.');
        } else {
            console.error("Error deleting user:", error);
            setToastMessage('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
        }
    }
  }, [user]);

  const renderContent = () => {
    if (!userData) return null;

    switch (view) {
      case 'dashboard':
        return <Dashboard
          protocol={userData.protocol}
          startDate={userData.startDate}
          journalEntries={userData.journalEntries}
          onSaveJournalEntry={handleSaveJournalEntry}
          customMetrics={userData.customMetrics}
          intention={userData.intention}
          theme={theme}
        />;
      case 'journey':
        return <Journey
          intention={userData.intention}
          weeklyReviews={userData.weeklyReviews}
          journalEntries={userData.journalEntries}
          unlockedAchievements={userData.achievements}
          onSaveIntention={handleSaveIntention}
          onSaveWeeklyReview={handleSaveWeeklyReview}
        />;
      case 'settings':
        return <Settings
          currentProtocol={userData.protocol}
          currentStartDate={userData.startDate}
          currentUserName={userData.userName}
          currentCustomMetrics={userData.customMetrics}
          theme={theme}
          onThemeChange={setTheme}
          onSave={handleSaveSettings}
          onResetData={handleResetData}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          onShowWelcome={handleShowWelcomeModal}
          notificationPrefs={notificationPrefs}
          onSaveNotificationPrefs={handleSaveNotificationPrefs}
        />;
      default:
        return null;
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-theme-main flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-[#00BFA5] border-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-theme-main text-theme-main font-sans transition-colors duration-300`}>
      <div className="container mx-auto max-w-2xl p-4 sm:p-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img src={iconPng} alt="SOMA Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain"/>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#3ABDC5]">
                SOMA
              </h1>
              <p className="text-sm text-theme-muted -mt-1">equilibrio entre cuerpo y conciencia</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <nav className="flex items-center gap-1 p-1 rounded-full bg-theme-bubble border border-theme">
              <button
                onClick={() => setView('dashboard')}
                className={`p-2 rounded-full transition-colors ${view === 'dashboard' ? 'bg-[#00BFA5] text-white' : 'text-theme-main hover:bg-theme-card-hover'}`}
                aria-label="Dashboard"
              >
                <HomeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('journey')}
                className={`p-2 rounded-full transition-colors ${view === 'journey' ? 'bg-[#00BFA5] text-white' : 'text-theme-main hover:bg-theme-card-hover'}`}
                aria-label="Mi Viaje"
              >
                <BookOpenIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('settings')}
                className={`p-2 rounded-full transition-colors ${view === 'settings' ? 'bg-[#00BFA5] text-white' : 'text-theme-main hover:bg-theme-card-hover'}`}
                aria-label="Ajustes"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </header>

         {userData?.userName && (
          <div className="mb-6 bg-theme-card rounded-xl p-4 sm:p-5 border border-theme shadow-lg flex justify-between items-center transition-colors">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-theme-main">Hola, {userData.userName}!</h2>
              <p className="text-md text-theme-muted mt-1">Listo para tu registro de hoy?</p>
            </div>
            {streak > 1 && (
              <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-theme-bubble border border-theme text-emerald-500 font-bold shadow-sm" title={`${streak} días de racha`}>
                  <span className="font-bold text-xl">{streak}</span>
                  <FlameIcon className="w-6 h-6"/>
              </div>
            )}
          </div>
        )}

        <main>
          {renderContent()}
        </main>
        
        <footer className="text-center mt-8 text-sm text-theme-muted">
            <p>Hecho con propósito. Recuerda, esta es una herramienta de seguimiento, no un consejo médico.</p>
        </footer>
        <Toast message={toastMessage} onClear={() => setToastMessage('')} />
        <WelcomeModal isOpen={isWelcomeModalOpen} onClose={handleCloseWelcomeModal} />
      </div>
    </div>
  );
}


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('soma-theme', 'system');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    const applyTheme = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = theme === 'dark';
      }
      
      if (isDark) {
        root.classList.add('dark');
        if (body) body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        if (body) body.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        const isDarkNow = e.matches;
        if (isDarkNow) {
          root.classList.add('dark');
          if (body) body.classList.add('dark');
        } else {
          root.classList.remove('dark');
          if (body) body.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-main flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-[#00BFA5] border-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <AppContent user={user} theme={theme} setTheme={setTheme} />;
}

export default App;