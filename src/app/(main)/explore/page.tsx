'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoodCard } from '@/components/mood-card/mood-card';
import { MOODS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { MoodCard as MoodCardType } from '@/types/card';
import type { MoodType } from '@/types/mood';

export default function ExplorePage() {
  const router = useRouter();
  const [cards, setCards] = useState<MoodCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MoodType | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchCards = (pageNum: number, mood: MoodType | null, reset = false) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pageNum), limit: '20' });
    if (mood) params.set('mood', mood);

    fetch(`/api/cards?${params}`)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setCards((prev) => (reset ? arr : [...prev, ...arr]));
        setHasMore(arr.length === 20);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    fetchCards(1, filter, true);
  }, [filter]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchCards(next, filter);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-light tracking-wide">探索</h1>
          <p className="text-text-secondary text-sm mt-1">看看世界各地此刻的情绪</p>
        </div>

        {/* Mood filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
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
        {cards.length === 0 && !loading ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🌙</p>
            <p className="text-text-secondary">
              {filter ? '这个心情下还没有卡片' : '还没有人发布过卡片'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <MoodCard
                  key={card.id}
                  card={card}
                  onClick={() => router.push(`/card/${card.id}`)}
                />
              ))}
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={`sk-${i}`} className="aspect-[3/4] rounded-lg" />
                ))}
            </div>

            {hasMore && !loading && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors px-6 py-2 border border-border rounded-full hover:border-border-bright"
                >
                  加载更多
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
