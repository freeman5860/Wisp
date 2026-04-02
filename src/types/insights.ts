import type { MoodType } from './mood';

export type InsightPeriod = 'week' | 'month' | 'year';

export interface InsightSummary {
  total_cards: number;
  streak_days: number;
  top_mood: MoodType | null;
}

export interface MoodDistribution {
  mood: MoodType;
  count: number;
}

export interface CalendarDay {
  date: string;
  mood: MoodType;
  count: number;
}

export interface TrendPoint {
  date: string;
  [mood: string]: string | number;
}

export interface InsightsData {
  summary: InsightSummary;
  distribution: MoodDistribution[];
  calendar: CalendarDay[];
  trend: TrendPoint[];
}
