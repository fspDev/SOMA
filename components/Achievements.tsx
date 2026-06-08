import React from 'react';
import { ACHIEVEMENTS } from '../constants';
import { Achievement } from '../types';

interface AchievementsProps {
  unlockedAchievements: Record<string, boolean>;
}

const Achievements: React.FC<AchievementsProps> = ({ unlockedAchievements }) => {
  return (
    <div className="space-y-4">
       <p className="text-sm text-theme-muted">
        Celebra tu progreso y constancia. Aquí tienes los hitos que has alcanzado en tu viaje de autodescubrimiento.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedAchievements[achievement.id];
          const Icon = achievement.icon;
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg flex items-center gap-4 transition-all duration-300 border ${
                isUnlocked ? 'bg-theme-card border-emerald-500/30 shadow-md' : 'bg-theme-bubble border-theme opacity-60'
              }`}
            >
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isUnlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-theme-main text-theme-muted border border-theme'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-bold ${isUnlocked ? 'text-theme-main' : 'text-theme-muted'}`}>{achievement.title}</h4>
                <p className={`text-sm ${isUnlocked ? 'text-emerald-500/80 font-medium' : 'text-theme-muted/60'}`}>{achievement.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;