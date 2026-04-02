'use client';

import { getMoodConfig } from '@/lib/constants';
import type { InsightSummary } from '@/types/insights';

interface InsightsSummaryProps {
  summary: InsightSummary;
}

export function InsightsSummary({ summary }: InsightsSummaryProps) {
  const topMood = summary.top_mood ? getMoodConfig(summary.top_mood) : null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-background-raised border border-border rounded-lg p-4 text-center">
        <p className="text-2xl font-medium">{summary.total_cards}</p>
        <p className="text-xs text-text-tertiary mt-1">卡片</p>
      </div>
      <div className="bg-background-raised border border-border rounded-lg p-4 text-center">
        <p className="text-2xl font-medium">
          {summary.streak_days > 0 ? `${summary.streak_days}` : '—'}
        </p>
        <p className="text-xs text-text-tertiary mt-1">连续天</p>
      </div>
      <div className="bg-background-raised border border-border rounded-lg p-4 text-center">
        {topMood ? (
          <>
            <p className="text-2xl">{topMood.emoji}</p>
            <p
              className="text-xs mt-1"
              style={{ color: topMood.color }}
            >
              {topMood.label}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl text-text-tertiary">—</p>
            <p className="text-xs text-text-tertiary mt-1">最常</p>
          </>
        )}
      </div>
    </div>
  );
}
