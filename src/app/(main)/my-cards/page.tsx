'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoodCard } from '@/components/mood-card/mood-card';
import { MOODS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { MoodCard as MoodCardType } from '@/types/card';
import type { MoodType } from '@/types/mood';

export default function MyCardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<MoodCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MoodType | null>(null);

  useEffect(() => {
    const url = filter
      ? `/api/cards?mine=true&mood=${filter}`
      : '/api/cards?mine=true';
    fetch(url)
      .then((res) => res.json())
      .then((data) => setCards(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-light tracking-wide mb-6">我的卡片</h1>

        {/* Mood filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          <button
            onClick={() => setFilter(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors border',
              !filter
                ? 'bg-accent/20 text-accent border-accent/40'
                : 'text-text-secondary border-border hover:border-border-bright'
            )}
          >
            全部
          </button>
          {MOODS.map((m) => (
            <button
              key={m.type}
              onClick={() => setFilter(m.type)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors border',
                filter === m.type
                  ? 'border-transparent'
                  : 'text-text-secondary border-border hover:border-border-bright'
              )}
              style={
                filter === m.type
                  ? {
                      backgroundColor: `${m.color}20`,
                      color: m.color,
                      borderColor: `${m.color}40`,
                    }
                  : undefined
              }
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary">
              {filter ? '这个心情下还没有卡片' : '还没有卡片，去记录第一个瞬间吧'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <MoodCard
                key={card.id}
                card={card}
                onClick={() => router.push(`/card/${card.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
