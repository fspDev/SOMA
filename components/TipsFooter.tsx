import React from 'react';
import { type Protocol } from '../types';
import { getTipForToday } from '../utils/tips';
import { LightbulbIcon } from '../constants';

interface TipsFooterProps {
  protocol: Protocol;
  startDate: string;
  isInsideCard?: boolean;
}

const TipsFooter: React.FC<TipsFooterProps> = ({ protocol, startDate, isInsideCard = false }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tip = getTipForToday(todayStr, startDate, protocol);

  const containerClasses = isInsideCard
    ? "p-4 bg-theme-bubble border border-theme rounded-lg animate-fadeIn"
    : "mt-8 bg-theme-card border border-theme rounded-xl p-4 shadow-lg animate-fadeIn";

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-3">
        <LightbulbIcon className="w-5 h-5 text-[#00BFA5] flex-shrink-0" />
        <div>
            <h3 className="font-semibold text-theme-main">Consejo del Día</h3>
            <p className="text-sm text-theme-muted">{tip}</p>
        </div>
      </div>
    </div>
  );
};

export default TipsFooter;