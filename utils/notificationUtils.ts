import { type NotificationPrefs, type Protocol, type JournalEntry } from '../types';
import { getDayStatus } from './dateUtils';

const DOSE_KEY = 'soma_dose_notif_sent';
const JOURNAL_KEY = 'soma_journal_notif_sent';

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

async function show(title: string, body: string, tag: string) {
  const icon = import.meta.env.BASE_URL + 'icon-192.png';
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, { body, icon, badge: icon, tag });
  } else {
    new Notification(title, { body, icon, tag });
  }
}

export async function testNotification() {
  await show(
    '🍄 SOMA — Notificaciones activas',
    'Las notificaciones están funcionando correctamente.',
    'soma-test'
  );
}

export async function checkAndSendNotifications(
  prefs: NotificationPrefs,
  protocol: Protocol,
  startDate: string,
  journalEntries: Record<string, JournalEntry>
) {
  if (!prefs.doseReminder && !prefs.journalReminder) return;
  if (getNotificationPermission() !== 'granted') return;

  const today = new Date().toISOString().split('T')[0];
  const [h, m] = prefs.reminderTime.split(':').map(Number);
  const now = new Date();
  const notifAt = new Date();
  notifAt.setHours(h, m, 0, 0);
  if (now < notifAt) return;

  if (prefs.doseReminder && localStorage.getItem(DOSE_KEY) !== today) {
    const status = getDayStatus(today, startDate, protocol);
    if (status === 'dose') {
      await show(
        '🍄 Día de Dosis',
        'Hoy es tu día de dosis. ¡No olvides registrarla en SOMA!',
        'dose-reminder'
      );
      localStorage.setItem(DOSE_KEY, today);
    }
  }

  if (prefs.journalReminder && localStorage.getItem(JOURNAL_KEY) !== today && !journalEntries[today]) {
    await show(
      '📓 Recordatorio de Diario',
      '¿Ya anotaste tu experiencia de hoy? Abre SOMA para registrarla.',
      'journal-reminder'
    );
    localStorage.setItem(JOURNAL_KEY, today);
  }
}
