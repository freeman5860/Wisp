'use client';

import { MOODS } from '@/lib/constants';
import { useCreateFlowStore } from '@/stores/create-flow-store';
import { cn } from '@/lib/utils';
import type { MoodType } from '@/types/mood';

export function MoodSelector() {
  const { mood: selectedMood, setMood } = useCreateFlowStore();

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
      {MOODS.map((m) => (
        <button
          key={m.type}
          onClick={() => setMood(m.type)}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left',
            selectedMood === m.type
              ? 'border-transparent scale-[1.02]'
              : 'border-border hover:border-border-bright hover:bg-background-hover'
          )}
          style={
            selectedMood === m.type
              ? {
                  backgroundColor: `${m.color}15`,
                  borderColor: `${m.color}40`,
                  boxShadow: `0 0 20px ${m.color}15`,
                }
              : undefined
          }
        >
          <span className="text-2xl">{m.emoji}</span>
          <div>
            <p
              className={cn(
                'text-sm font-medium',
                selectedMood === m.type ? 'text-text-primary' : 'text-text-secondary'
              )}
            >
              {m.label}
            </p>
            <p className="text-xs text-text-tertiary">{m.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
