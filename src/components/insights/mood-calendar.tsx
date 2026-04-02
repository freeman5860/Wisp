'use client';

import { getMoodConfig } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { CalendarDay } from '@/types/insights';

interface MoodCalendarProps {
  data: CalendarDay[];
  date: Date;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export function MoodCalendar({ data, date }: MoodCalendarProps) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday = 0 offset
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const today = new Date().toISOString().split('T')[0];

  // Build lookup
  const dayMap = new Map<string, CalendarDay>();
  for (const d of data) {
    dayMap.set(d.date, d);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-text-tertiary py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = dayMap.get(dateStr);
          const isToday = dateStr === today;
          const config = entry ? getMoodConfig(entry.mood) : null;

          return (
            <div
              key={dateStr}
              className={cn(
                'aspect-square rounded-md flex flex-col items-center justify-center relative transition-colors',
                config ? 'cursor-default' : 'bg-background-hover/20',
                isToday && 'ring-1 ring-accent/50'
              )}
              style={
                config
                  ? { backgroundColor: `${config.color}30` }
                  : undefined
              }
              title={
                entry
                  ? `${config!.emoji} ${config!.label} · ${entry.count} 张`
                  : dateStr
              }
            >
              <span className={cn(
                'text-xs',
                config ? '' : 'text-text-tertiary'
              )} style={config ? { color: config.color } : undefined}>
                {day}
              </span>
              {config && (
                <span className="text-[10px] leading-none mt-0.5">
                  {config.emoji}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
