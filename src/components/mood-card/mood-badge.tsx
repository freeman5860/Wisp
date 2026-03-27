'use client';

import { cn } from '@/lib/utils';
import { getMoodConfig } from '@/lib/constants';
import type { MoodType } from '@/types/mood';

interface MoodBadgeProps {
  mood: MoodType;
  size?: 'sm' | 'md';
  className?: string;
}

export function MoodBadge({ mood, size = 'md', className }: MoodBadgeProps) {
  const config = getMoodConfig(mood);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full backdrop-blur-sm font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
      style={{
        backgroundColor: `${config.color}20`,
        borderColor: `${config.color}40`,
        color: config.color,
        border: '1px solid',
      }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
