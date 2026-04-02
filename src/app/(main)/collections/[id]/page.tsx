'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { CollectionHeader } from '@/components/collections/collection-header';
import { MoodCard } from '@/components/mood-card/mood-card';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import type { Collection } from '@/types/collection';
import type { MoodCard as MoodCardType } from '@/types/card';

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [cards, setCards] = useState<MoodCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [isOwn, setIsOwn] = useState(false);

  useEffect(() => {
    fetch(`/api/collections/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCollection(data);

        // Check ownership
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          setIsOwn(user?.id === data.user_id);
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setCardsLoading(true);
    fetch(`/api/collections/${id}/cards`)
      .then((res) => res.json())
      .then((data) => setCards(Array.isArray(data) ? data : []))
      .finally(() => setCardsLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="aspect-[21/9] rounded-lg mb-4" />
          <Skeleton className="w-48 h-8 rounded mb-2" />
          <Skeleton className="w-32 h-4 rounded" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">合集不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <CollectionHeader
          collection={collection}
          isOwn={isOwn}
          onDeleted={() => router.push('/collections')}
        />

        {cardsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary">合集中还没有卡片</p>
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
