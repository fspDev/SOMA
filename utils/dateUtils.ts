import { type Protocol, type JournalEntry, Achievement } from '../types';
import { ACHIEVEMENTS } from '../constants';

type DayStatus = 'dose' | 'rest' | 'inactive';

export const dayDiff = (date1: Date, date2: Date): number => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
};

export const getDayStatus = (dateStr: string, startDateStr: string, protocol: Protocol): DayStatus => {
  const currentDate = new Date(dateStr + 'T00:00:00');
  const startDate = new Date(startDateStr + 'T00:00:00');

  if (currentDate < startDate) {
    return 'inactive';
  }

  const diff = dayDiff(startDate, currentDate);
  const cycleLength = protocol.onDays + protocol.offDays;

  if (cycleLength <= 0) {
      return 'inactive';
  }
  
  const dayInCycle = diff % cycleLength;

  if (dayInCycle < protocol.onDays) {
    return 'dose';
  } else {
    return 'rest';
  }
};

export const calculateStreak = (journalEntries: Record<string, JournalEntry>): number => {
    if (Object.keys(journalEntries).length === 0) {
        return 0;
    }

    let streak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Check if there is an entry for today. If not, check for yesterday.
    // A streak continues if the last entry was yesterday.
    let currentDate = new Date(today);
    if (!journalEntries[todayStr]) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (journalEntries[dateStr]) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}


interface UserDataForAchievements {
    journalEntries: Record<string, JournalEntry>;
    weeklyReviews: Record<string, any>;
    intention: string;
    achievements: Record<string, boolean>;
}

export const checkAchievements = (userData: UserDataForAchievements, streak: number) => {
    const newAchievements: Achievement[] = [];
    const updatedAchievements = { ...userData.achievements };

    const checkAndAdd = (id: string, condition: boolean) => {
        if (condition && !updatedAchievements[id]) {
            const achievement = ACHIEVEMENTS.find(a => a.id === id);
            if (achievement) {
                newAchievements.push(achievement);
                updatedAchievements[id] = true;
            }
        }
    };

    // First entry
    checkAndAdd('first_entry', Object.keys(userData.journalEntries).length > 0);

    // Streaks
    checkAndAdd('one_week_streak', streak >= 7);
    checkAndAdd('one_month_streak', streak >= 30);
    
    // First review
    checkAndAdd('first_review', Object.keys(userData.weeklyReviews).length > 0);

    // Set intention
    checkAndAdd('set_intention', !!userData.intention);

    // Use 10 tags
    const allTags = new Set<string>();
    Object.values(userData.journalEntries).forEach(entry => {
        entry.tags?.forEach(tag => allTags.add(tag));
    });
    checkAndAdd('use_10_tags', allTags.size >= 10);

    return { newAchievements, updatedAchievements };
}