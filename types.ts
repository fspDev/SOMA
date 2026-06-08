import React from 'react';

export interface Protocol {
  id: string;
  name: string;
  onDays: number;
  offDays: number;
  description: string;
}

export interface CustomMetric {
  id: string;
  label: string;
  color: string;
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  metrics: Record<string, number>; // key is CustomMetric.id
  notes: string;
  doseTakenAt?: string; // ISO string for when the dose was taken
  tags?: string[];
}

export interface WeeklyReview {
  date: string; // YYYY-MM-DD
  notes: string;
}

export type View = 'dashboard' | 'settings' | 'journey';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}