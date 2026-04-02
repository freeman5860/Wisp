'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { ProfileHeader } from '@/components/profile/profile-header';
import { MoodCard } from '@/components/mood-card/mood-card';
import { Skeleton } from '@/components/ui/skeleton';
import { MOODS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ProfileWithStats } from '@/types/profile';
import type { MoodCard as MoodCardType } from '@/types/card';
import type { MoodType } from '@/types/mood';

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileWithStats | null>(null);
  const [cards, setCards] = useState<MoodCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [filter, setFilter] = useState<MoodType | null>(null);

  useEffect(() => {
    fetch(`/api/profile/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProfile(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setCardsLoading(true);
    const url = filter
      ? `/api/profile/${id}/cards?mood=${filter}`
      : `/api/profile/${id}/cards`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setCards(Array.isArray(data) ? data : []))
      .finally(() => setCardsLoading(false));
  }, [id, filter]);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <Skeleton className="w-20 h-20 rounded-full mb-4" />
          <Skeleton className="w-32 h-6 rounded mb-2" />
          <Skeleton className="w-48 h-4 rounded" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">用户不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProfileHeader profile={profile} isOwn={false} />

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
                  ? { backgroundColor: `${m.color}20`, color: m.color, borderColor: `${m.color}40` }
                  : undefined
              }
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {cardsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary">暂无公开卡片</p>
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
