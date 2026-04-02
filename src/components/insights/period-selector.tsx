'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InsightPeriod } from '@/types/insights';

interface PeriodSelectorProps {
  period: InsightPeriod;
  date: Date;
  onPeriodChange: (period: InsightPeriod) => void;
  onDateChange: (date: Date) => void;
}

const PERIODS: { value: InsightPeriod; label: string }[] = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
];

function formatPeriodLabel(date: Date, period: InsightPeriod): string {
  if (period === 'week') {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
  }
  if (period === 'year') {
    return `${date.getFullYear()} 年`;
  }
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
}

function navigate(date: Date, period: InsightPeriod, direction: number): Date {
  const d = new Date(date);
  if (period === 'week') d.setDate(d.getDate() + direction * 7);
  else if (period === 'month') d.setMonth(d.getMonth() + direction);
  else d.setFullYear(d.getFullYear() + direction);
  return d;
}

export function PeriodSelector({ period, date, onPeriodChange, onDateChange }: PeriodSelectorProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Period tabs */}
      <div className="flex gap-1 bg-background-raised rounded-md p-0.5 border border-border">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={cn(
              'px-3 py-1.5 text-xs rounded transition-colors',
              period === p.value
                ? 'bg-accent/20 text-accent'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDateChange(navigate(date, period, -1))}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-text-secondary min-w-[140px] text-center">
          {formatPeriodLabel(date, period)}
        </span>
        <button
          onClick={() => onDateChange(navigate(date, period, 1))}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
